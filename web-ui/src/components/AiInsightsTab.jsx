import React, { useEffect, useState } from 'react';
import { BrainCircuit, Activity, ShieldCheck, Terminal, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AiInsightsTab({ winRate }) {
  const [configData, setConfigData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const authHeader = 'Basic ' + btoa('freqtrader:SuperSecretPassword123!');
        
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
            // Logs come as array of [timestamp, unix_ts, module, level, message]
            setLogs(dataLogs.logs.reverse());
          }
        }
      } catch (err) {
        console.warn('API fetch error in AiInsightsTab:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
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
              <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 700, fontSize: '0.75rem' }}>{winRate.toFixed(1)}%</span>
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
              <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>30 Top Volume Pairs</span>
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
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Models Execution & System Logs</h3>
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
        <div className="table-wrapper" style={{ maxHeight: '320px', overflowY: 'auto' }}>
          <table className="dense-table" style={{ fontSize: '0.72rem' }}>
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Waktu (Timestamp)</th>
                <th style={{ width: '90px' }}>Level</th>
                <th style={{ width: '180px' }}>Module</th>
                <th>Pesan System / Log Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.slice(0, 50).map((log, idx) => {
                  const timestampStr = log[0];
                  const moduleName = log[2];
                  const level = log[3];
                  const message = log[4];

                  let levelColor = 'var(--binance-text-muted)';
                  let levelBadge = 'badge-yellow';
                  if (level === 'ERROR') {
                    levelColor = 'var(--binance-red)';
                    levelBadge = 'badge-red';
                  } else if (level === 'WARNING') {
                    levelColor = 'var(--binance-yellow)';
                    levelBadge = 'badge-yellow';
                  } else if (level === 'INFO') {
                    levelColor = 'var(--binance-green)';
                    levelBadge = 'badge-green';
                  }

                  return (
                    <tr key={idx}>
                      <td className="mono" style={{ color: 'var(--binance-text-muted)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                        {timestampStr}
                      </td>
                      <td>
                        <span className={`badge-binance ${levelBadge}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          {level}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: '0.68rem', color: 'var(--binance-text-secondary)', whiteSpace: 'nowrap' }}>
                        {moduleName}
                      </td>
                      <td className="mono" style={{ color: levelColor, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.68rem' }}>
                        {message}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--binance-text-muted)', padding: '16px' }}>
                    {loading ? 'Fetching system logs...' : 'No log events recorded matching filter.'}
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
