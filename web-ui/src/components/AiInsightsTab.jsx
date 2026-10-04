import React, { useEffect, useState } from 'react';
import { BrainCircuit, Activity, ShieldCheck, Terminal, AlertTriangle, CheckCircle } from 'lucide-react';

// Filter only AI Process & FreqAI engine logs (filtering out HTTP/web server noise)
function isAiProcessLog(log) {
  if (!log || log.length < 5) return false;
  const moduleName = String(log[2] || '').toLowerCase();
  const message = String(log[4] || '').toLowerCase();

  // Exclude web server & HTTP polling noise
  if (moduleName.includes('uvicorn') || message.includes('http/1.1') || message.includes('/api/v1/')) {
    return false;
  }

  // AI & FreqAI trading process modules and keywords
  const isAiModule = moduleName.includes('freqai') || 
                     moduleName.includes('datasieve') || 
                     moduleName.includes('strategy') || 
                     moduleName.includes('catboost') ||
                     moduleName.includes('persistence') ||
                     moduleName.includes('worker') ||
                     moduleName.includes('freqtradebot');

  const isAiMessage = message.includes('freqai') || 
                      message.includes('model') || 
                      message.includes('train') || 
                      message.includes('predict') || 
                      message.includes('feature') || 
                      message.includes('trade') || 
                      message.includes('limit_buy') || 
                      message.includes('limit_sell') || 
                      message.includes('fulfilled') || 
                      message.includes('queue') || 
                      message.includes('signal');

  return isAiModule || isAiMessage;
}

export default function AiInsightsTab({ winRate = 0 }) {
  const [configData, setConfigData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const authHeader = 'Basic ' + btoa('admin:Password123!');
        
        // 1. Fetch Config
        const resConfig = await fetch('/api/v1/show_config', { headers: { 'Authorization': authHeader } });
        if (resConfig.ok) {
          const data = await resConfig.json();
          if (isMounted) setConfigData(data);
        }

        // 2. Fetch Logs
        const resLogs = await fetch('/api/v1/logs', { headers: { 'Authorization': authHeader } });
        if (resLogs.ok) {
          const dataLogs = await resLogs.json();
          if (isMounted && dataLogs.logs) {
            // Filter strictly for AI Process logs & sort NEWEST at the TOP
            const aiOnlyLogs = dataLogs.logs.filter(isAiProcessLog);
            // Sort by timestamp descending (newest log at index 0)
            aiOnlyLogs.sort((a, b) => (b[1] || 0) - (a[1] || 0));
            setLogs(aiOnlyLogs);
          }
        }
      } catch (err) {
        console.warn('API fetch error in AiInsightsTab:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const freqaiInfo = configData?.freqai || {};
  const modelName = freqaiInfo.freqaimodel || 'CatBoostRegressor';
  const identifier = freqaiInfo.identifier || 'freqai_catboost';
  const trainPeriod = freqaiInfo.train_period_days || 15;
  const maxTrades = configData?.max_open_trades || 12;

  // Filter logs based on level filter
  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'ALL') return true;
    return log[3] === filterLevel;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Grid: Model Specs & Feature Engineering Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="desktop-grid">
        {/* Dynamic FreqAI Model Specs */}
        <div className="binance-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BrainCircuit size={18} color="var(--binance-yellow)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>FreqAI Engine Live Configuration</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Model Class</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--binance-yellow)', fontSize: '0.75rem' }}>{modelName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Model Identifier</span>
              <span className="mono" style={{ fontWeight: 600, fontSize: '0.75rem' }}>{identifier}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Training Window</span>
              <span className="mono" style={{ fontSize: '0.75rem' }}>{trainPeriod} Days Historical Candles</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Max Open Positions</span>
              <span className="badge-binance badge-green" style={{ fontSize: '0.65rem' }}>{maxTrades} Concurrent Slots</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Realized Win Rate</span>
              <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 700, fontSize: '0.75rem' }}>{(Number(winRate) || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Live Feature Timeframes & Signals Info */}
        <div className="binance-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={18} color="var(--binance-yellow)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Active Feature Engineering Pipeline</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Included Timeframes</span>
              <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 600, fontSize: '0.75rem' }}>5m, 15m</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Correlation Benchmarks</span>
              <span className="mono" style={{ fontSize: '0.75rem' }}>BTC/USDT, ETH/USDT</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Target Horizon</span>
              <span className="mono" style={{ fontSize: '0.75rem' }}>12 Candles (1 Hour Ahead)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>Scanner Engine</span>
              <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>30 Top Volume Pairs (60s Refresh)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#12161c', borderRadius: '4px' }}>
              <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.75rem' }}>API Sync</span>
              <span className="mono" style={{ color: 'var(--binance-green)', fontWeight: 600, fontSize: '0.75rem' }}>100% Live REST Stream</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: AI Execution & System Error Logs Table */}
      <div className="binance-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="var(--binance-yellow)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Process & Model Execution Logs (Live)</h3>
          </div>
          
          {/* Level Filter Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'ERROR', 'WARNING', 'INFO'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  background: filterLevel === lvl ? 'var(--binance-yellow)' : '#12161c',
                  color: filterLevel === lvl ? '#000' : 'var(--binance-text-muted)',
                  border: '1px solid var(--binance-border)',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          <table className="dense-table" style={{ fontSize: '0.72rem' }}>
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Waktu (Timestamp)</th>
                <th style={{ width: '90px' }}>Level</th>
                <th style={{ width: '180px' }}>Module AI</th>
                <th>Detail Proses AI / AI Execution Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.slice(0, 60).map((log, idx) => {
                  const timestampStr = log[0];
                  const moduleName = log[2];
                  const level = log[3];
                  const message = log[4];
                  const isLatest = idx === 0; // Topmost row is newest log

                  let levelColor = 'var(--binance-text-muted)';
                  let levelBadge = 'badge-yellow';
                  if (level === 'ERROR') {
                    levelColor = 'var(--binance-red)';
                    levelBadge = 'badge-red';
                  } else if (level === 'WARNING') {
                    levelColor = 'var(--binance-yellow)';
                    levelBadge = 'badge-yellow';
                  } else if (level === 'INFO') {
                    levelColor = isLatest ? '#ffffff' : 'var(--binance-green)';
                    levelBadge = 'badge-green';
                  }

                  // Distinct styling for the NEWEST log (top row)
                  const rowStyle = isLatest ? {
                    background: 'rgba(240, 185, 11, 0.12)',
                    borderLeft: '4px solid var(--binance-yellow)',
                    fontWeight: 600
                  } : {};

                  return (
                    <tr key={idx} style={rowStyle}>
                      <td className="mono" style={{ color: isLatest ? 'var(--binance-yellow)' : 'var(--binance-text-muted)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isLatest && (
                            <span className="badge-binance badge-yellow" style={{ fontSize: '0.55rem', padding: '0px 4px', fontWeight: 800 }}>
                              LATEST
                            </span>
                          )}
                          <span>{timestampStr}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-binance ${levelBadge}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          {level}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: '0.68rem', color: isLatest ? 'var(--binance-yellow)' : 'var(--binance-text-secondary)', whiteSpace: 'nowrap' }}>
                        {moduleName}
                      </td>
                      <td className="mono" style={{ color: isLatest ? '#F0B90B' : levelColor, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.68rem' }}>
                        {message}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--binance-text-muted)', padding: '16px' }}>
                    {loading ? 'Fetching AI process logs...' : 'Tidak ada log proses AI yang sesuai dengan filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
