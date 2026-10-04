#!/usr/bin/env node
/**
 * data_watcher.js — FreqAI Dynamic WebSocket Data Keeper
 * ========================================================
 * Arsitektur:
 *   1. Fetch whitelist dinamis dari Freqtrade /api/v1/whitelist (tiap 3 menit)
 *   2. Subscribe Gate.io WebSocket kline stream untuk setiap pair aktif
 *   3. Saat candle close diterima → catat pair sebagai "fresh"
 *   4. Pair yang tidak dapat update > GAP_ALERT_MIN menit → trigger download-data
 *   5. Whitelist berubah → otomatis unsubscribe lama, subscribe baru
 *
 * Tidak ada polling file, tidak ada daftar hardcode. Semua dinamis.
 */

const WebSocket = require('ws');
const { execFile } = require('child_process');
const fs   = require('fs');
const path = require('path');
const http = require('http');

// ── Konfigurasi ──────────────────────────────────────────────────────────────
const CFG = {
  FREQTRADE_API  : 'http://127.0.0.1:8080/api/v1',
  FREQTRADE_USER : 'admin',
  FREQTRADE_PASS : 'password123',
  FREQTRADE_BIN  : '/root/ai-trade-2/.venv/bin/freqtrade',
  CONFIG_FILE    : '/root/ai-trade-2/config.json',
  LOG_FILE       : '/root/ai-trade-2/user_data/logs/data_watcher.log',

  // Gate.io WebSocket endpoint (exchange yang dipakai di config.json)
  GATE_WS        : 'wss://api.gateio.ws/ws/v4/',

  // Jika pair tidak dapat update kline selama ini → trigger download
  GAP_ALERT_MIN  : 30,

  // Seberapa sering cek whitelist dari Freqtrade API (ms)
  WHITELIST_POLL_MS : 3 * 60 * 1000,   // 3 menit

  // Seberapa sering scan pair yang stale (ms)
  SCAN_INTERVAL_MS  : 2 * 60 * 1000,   // 2 menit

  // Download params
  TIMEFRAMES     : ['5m', '15m'],
  DAYS_TO_KEEP   : 15,
  MAX_PARALLEL_DL: 3,

  // Timeframe utama yang kita monitor di WebSocket
  KLINE_TF       : '5m',
};

// ── State ────────────────────────────────────────────────────────────────────
let currentPairs   = new Set();          // Whitelist aktif saat ini
let lastCandle     = {};                 // pair → timestamp candle close terakhir
let downloading    = new Set();          // Pair yang sedang didownload
let downloadQueue  = [];
let activeWorkers  = 0;
let ws             = null;               // Gate.io WebSocket connection
let wsReady        = false;

// ── Logger ───────────────────────────────────────────────────────────────────
function log(lvl, msg) {
  const ts   = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const line = `[${ts}] [${lvl}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(CFG.LOG_FILE, line + '\n'); } catch (_) {}
}
const logInfo  = m => log('INFO ', m);
const logWarn  = m => log('WARN ', m);
const logOk    = m => log('OK   ', m);
const logError = m => log('ERROR', m);

// ── HTTP helper (tanpa fetch, pakai built-in http) ───────────────────────────
function apiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CFG.FREQTRADE_USER}:${CFG.FREQTRADE_PASS}`).toString('base64');
    const opts = {
      hostname: '127.0.0.1',
      port    : 8080,
      path    : `/api/v1${endpoint}`,
      method  : 'GET',
      headers : { Authorization: `Basic ${auth}` },
    };
    const req = http.request(opts, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

// ── Ambil whitelist dinamis dari Freqtrade API ───────────────────────────────
async function fetchWhitelist() {
  try {
    const data = await apiGet('/whitelist');
    const pairs = (data.whitelist || []).filter(p => p.endsWith('/USDT'));
    return pairs;
  } catch (e) {
    logWarn(`Gagal ambil whitelist: ${e.message}`);
    return [];
  }
}

// ── Konversi pair format: BTC/USDT → BTC_USDT (untuk Gate.io WS) ─────────────
const toGateSymbol = pair => pair.replace('/', '_');

// ── Subscribe / unsubscribe kline stream Gate.io ─────────────────────────────
function wsSubscribe(pairs) {
  if (!ws || !wsReady || pairs.length === 0) return;
  const payload = {
    time    : Math.floor(Date.now() / 1000),
    channel : 'spot.candlesticks',
    event   : 'subscribe',
    payload : pairs.flatMap(p => CFG.TIMEFRAMES.map(tf => [tf, toGateSymbol(p)])),
  };
  ws.send(JSON.stringify(payload));
  logInfo(`📡 Subscribe kline: ${pairs.join(', ')}`);
}

function wsUnsubscribe(pairs) {
  if (!ws || !wsReady || pairs.length === 0) return;
  const payload = {
    time    : Math.floor(Date.now() / 1000),
    channel : 'spot.candlesticks',
    event   : 'unsubscribe',
    payload : pairs.flatMap(p => CFG.TIMEFRAMES.map(tf => [tf, toGateSymbol(p)])),
  };
  ws.send(JSON.stringify(payload));
  logInfo(`🔇 Unsubscribe kline: ${pairs.join(', ')}`);
}

// ── Bangun koneksi Gate.io WebSocket ─────────────────────────────────────────
function connectGateWS() {
  logInfo('🔌 Connecting ke Gate.io WebSocket...');
  ws = new WebSocket(CFG.GATE_WS);

  ws.on('open', () => {
    wsReady = true;
    logOk('✅ Gate.io WebSocket terhubung');
    // Subscribe semua pair yang aktif saat ini
    if (currentPairs.size > 0) {
      wsSubscribe([...currentPairs]);
    }
  });

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw);
      // Kline update dari Gate.io
      if (msg.channel === 'spot.candlesticks' && msg.event === 'update' && msg.result) {
        const r = msg.result;
        // r.n = "5m_BTC_USDT", r.t = timestamp open, r.x = true saat candle close
        const parts = (r.n || '').split('_');
        if (parts.length >= 3) {
          const tf   = parts[0];                              // "5m"
          const pair = parts.slice(1).join('/');              // "BTC/USDT"
          const isClosed = r.x === true;                     // candle sudah close

          if (tf === CFG.KLINE_TF && isClosed && currentPairs.has(pair)) {
            lastCandle[pair] = Date.now();
            // Jika pair ini sedang dalam antrian download karena dianggap stale → hapus
            downloadQueue = downloadQueue.filter(q => q.pair !== pair);
          }
        }
      }
    } catch (_) {}
  });

  ws.on('close', (code, reason) => {
    wsReady = false;
    logWarn(`⚠ Gate.io WS closed (${code}). Reconnect dalam 5s...`);
    setTimeout(connectGateWS, 5000);
  });

  ws.on('error', err => {
    wsReady = false;
    logError(`Gate.io WS error: ${err.message}`);
  });

  // Ping setiap 20 detik agar koneksi tidak timeout
  const pingInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ time: Math.floor(Date.now() / 1000), channel: 'spot.ping', event: '' }));
    } else {
      clearInterval(pingInterval);
    }
  }, 20000);
}

// ── Update whitelist & manage subscribe/unsubscribe ─────────────────────────
async function syncWhitelist() {
  const freshPairs = await fetchWhitelist();
  if (freshPairs.length === 0) return;

  const newSet  = new Set(freshPairs);
  const added   = freshPairs.filter(p => !currentPairs.has(p));
  const removed = [...currentPairs].filter(p => !newSet.has(p));

  if (added.length === 0 && removed.length === 0) return;

  logInfo(`🔄 Whitelist update: +${added.length} pair, -${removed.length} pair`);

  // Unsubscribe pair yang sudah tidak ada
  if (removed.length > 0) {
    wsUnsubscribe(removed);
    removed.forEach(p => {
      currentPairs.delete(p);
      delete lastCandle[p];
    });
  }

  // Subscribe pair baru
  if (added.length > 0) {
    added.forEach(p => {
      currentPairs.add(p);
      // Pair baru → langsung anggap perlu download
      lastCandle[p] = 0;
    });
    wsSubscribe(added);
  }
}

// ── Scan pair yang tidak dapat kline update (stale) ──────────────────────────
function scanStale() {
  const now = Date.now();
  const stale = [];

  for (const pair of currentPairs) {
    if (downloading.has(pair)) continue;
    if (downloadQueue.find(q => q.pair === pair)) continue;

    const lastMs  = lastCandle[pair] || 0;
    const ageMin  = (now - lastMs) / 60000;

    if (ageMin > CFG.GAP_ALERT_MIN) {
      stale.push({ pair, ageMin: Math.round(ageMin) });
    }
  }

  if (stale.length > 0) {
    logWarn(`⚠ ${stale.length} pair tidak ada update kline >${CFG.GAP_ALERT_MIN}m → antri download`);
    downloadQueue.push(...stale);
    spawnWorkers();
  } else {
    logInfo(`✅ Semua ${currentPairs.size} pair fresh via WebSocket`);
  }
}

// ── Download pair via freqtrade download-data ─────────────────────────────────
function downloadPair(pair, ageMin) {
  return new Promise(resolve => {
    downloading.add(pair);
    const label = ageMin > 1e6 ? 'baru' : `${ageMin}m gap`;
    logInfo(`⬇  Sync ${pair} [${label}]...`);

    const args = [
      'download-data',
      '--config', CFG.CONFIG_FILE,
      '--timeframe', ...CFG.TIMEFRAMES,
      '--pairs', pair,
      '--days', String(CFG.DAYS_TO_KEEP),
    ];

    execFile(CFG.FREQTRADE_BIN, args, { timeout: 120000 }, (err) => {
      downloading.delete(pair);
      if (err) {
        logError(`✗ Gagal download ${pair}: ${err.message.slice(0, 100)}`);
      } else {
        lastCandle[pair] = Date.now(); // reset timer setelah download berhasil
        logOk(`✓ ${pair} → feather diperbarui`);
      }
      resolve();
    });
  });
}

async function runWorker() {
  while (downloadQueue.length > 0) {
    const item = downloadQueue.shift();
    if (item) await downloadPair(item.pair, item.ageMin);
  }
  activeWorkers--;
}

function spawnWorkers() {
  while (activeWorkers < CFG.MAX_PARALLEL_DL && downloadQueue.length > 0) {
    activeWorkers++;
    runWorker();
  }
}

// ── Status ringkas ────────────────────────────────────────────────────────────
function printStatus() {
  const now    = Date.now();
  const fresh  = [...currentPairs].filter(p => (now - (lastCandle[p] || 0)) / 60000 <= CFG.GAP_ALERT_MIN).length;
  const total  = currentPairs.size;
  const wsStatus = wsReady ? '🟢 ON' : '🔴 OFF';
  logInfo(`📊 WS:${wsStatus} | ${fresh}/${total} fresh | dl:${downloading.size} | q:${downloadQueue.length}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(path.dirname(CFG.LOG_FILE), { recursive: true });

  logInfo('════════════════════════════════════════════════');
  logInfo(' FreqAI Dynamic WebSocket Data Watcher — START');
  logInfo(`  Exchange WS  : Gate.io WebSocket kline stream`);
  logInfo(`  Whitelist    : dinamis dari Freqtrade API`);
  logInfo(`  Gap alert    : ${CFG.GAP_ALERT_MIN} menit tanpa kline`);
  logInfo(`  WL refresh   : setiap ${CFG.WHITELIST_POLL_MS/60000} menit`);
  logInfo('════════════════════════════════════════════════');

  // 1. Ambil whitelist awal
  const initial = await fetchWhitelist();
  if (initial.length > 0) {
    initial.forEach(p => {
      currentPairs.add(p);
      lastCandle[p] = 0; // semua dianggap perlu dicek saat startup
    });
    logInfo(`📋 Whitelist awal: ${initial.length} pair → ${initial.join(', ')}`);
  } else {
    logWarn('Freqtrade belum ready atau whitelist kosong, akan retry...');
  }

  // 2. Koneksi Gate.io WebSocket
  connectGateWS();

  // 3. Download pair yang belum ada datanya saat startup
  setTimeout(() => {
    scanStale();
  }, 3000);

  // 4. Sync whitelist tiap 3 menit
  setInterval(syncWhitelist, CFG.WHITELIST_POLL_MS);

  // 5. Scan stale tiap 2 menit
  setInterval(() => {
    printStatus();
    scanStale();
  }, CFG.SCAN_INTERVAL_MS);
}

process.on('SIGINT',  () => { logInfo('SIGINT → shutdown'); process.exit(0); });
process.on('SIGTERM', () => { logInfo('SIGTERM → shutdown'); process.exit(0); });
process.on('uncaughtException', err => logError(`Uncaught: ${err.message}`));

main().catch(e => logError(`Fatal: ${e.message}`));
