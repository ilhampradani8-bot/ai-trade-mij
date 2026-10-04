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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
      {/* iTunes Full-Width Engine & Feature Engineering Metrics Table */}
      <div className="binance-panel" style={{ padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <BrainCircuit size={16} color="var(--itunes-yellow)" />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>FreqAI Engine Configuration &amp; Feature Pipeline</h3>
        </div>

        <div className="table-wrapper">
          <table className="dense-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Model Class</th>
                <th>Model Identifier</th>
                <th>Training Window</th>
                <th>Max Positions</th>
                <th>Realized Win Rate</th>
                <th>Feature Timeframes</th>
                <th>Correlations</th>
                <th>Target Horizon</th>
                <th>API Sync</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono" style={{ fontWeight: 700, color: 'var(--itunes-yellow)' }}>{modelName}</td>
                <td className="mono">{identifier}</td>
                <td className="mono">{trainPeriod} Days Candles</td>
                <td><span className="badge-binance badge-green">{maxTrades} Slots</span></td>
                <td className="mono" style={{ color: 'var(--itunes-yellow)', fontWeight: 700 }}>{(Number(winRate) || 0).toFixed(1)}%</td>
                <td className="mono" style={{ color: 'var(--itunes-yellow)' }}>5m, 15m</td>
                <td className="mono">BTC/USDT, ETH/USDT</td>
                <td className="mono">12 Candles (1h)</td>
                <td><span className="mono" style={{ color: 'var(--itunes-green)', fontWeight: 600 }}>100% Live REST</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Panel: AI Execution & System Logs Table (Full Width) */}
      <div className="binance-panel" style={{ padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="var(--itunes-yellow)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Process &amp; Model Execution Logs (Live Stream)</h3>
          </div>
          
          {/* Level Filter Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'ERROR', 'WARNING', 'INFO'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  background: filterLevel === lvl ? 'var(--itunes-yellow)' : '#14161b',
                  color: filterLevel === lvl ? '#000' : 'var(--itunes-text-secondary)',
                  border: '1px solid var(--itunes-border)',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
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
        <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto', width: '100%' }}>
          <table className="dense-table" style={{ fontSize: '0.72rem', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Timestamp</th>
                <th style={{ width: '90px' }}>Level</th>
                <th style={{ width: '180px' }}>AI Module</th>
                <th>AI Execution &amp; Prediction Logs</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.slice(0, 80).map((log, idx) => {
                  const timestampStr = log[0];
                  const moduleName = log[2];
                  const level = log[3];
                  const message = log[4];
                  const isLatest = idx === 0;

                  let levelColor = 'var(--itunes-text-muted)';
                  let levelBadge = 'badge-yellow';
                  if (level === 'ERROR') {
                    levelColor = 'var(--itunes-red)';
                    levelBadge = 'badge-red';
                  } else if (level === 'WARNING') {
                    levelColor = 'var(--itunes-yellow)';
                    levelBadge = 'badge-yellow';
                  } else if (level === 'INFO') {
                    levelColor = isLatest ? '#ffffff' : 'var(--itunes-green)';
                    levelBadge = 'badge-green';
                  }

                  const rowStyle = isLatest ? {
                    background: 'rgba(255, 214, 10, 0.12)',
                    borderLeft: '4px solid var(--itunes-yellow)',
                    fontWeight: 600
                  } : {};

                  return (
                    <tr key={idx} style={rowStyle}>
                      <td className="mono" style={{ color: isLatest ? 'var(--itunes-yellow)' : 'var(--itunes-text-secondary)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
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
                      <td className="mono" style={{ fontSize: '0.68rem', color: isLatest ? 'var(--itunes-yellow)' : 'var(--itunes-text-secondary)', whiteSpace: 'nowrap' }}>
                        {moduleName}
                      </td>
                      <td className="mono" style={{ color: isLatest ? 'var(--itunes-yellow)' : levelColor, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.68rem' }}>
                        {message}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--itunes-text-muted)', padding: '20px' }}>
                    {loading ? 'Fetching AI process logs...' : 'No AI process logs matching the selected filter level.'}
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
