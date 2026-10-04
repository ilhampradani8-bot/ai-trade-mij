import React, { useState, useEffect } from 'react';
import { Menu, Clock, Globe } from 'lucide-react';

function formatUptime(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0m 00s';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${String(secs).padStart(2, '0')}s`;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

export default function Header({ apiConnected, collapsed, setCollapsed, uptimeSeconds = 0 }) {
  const [wibTime, setWibTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setWibTime(new Intl.DateTimeFormat('id-ID', options).format(now) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="binance-panel" style={{ padding: '6px 10px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Toggle & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Menu"
            className="hide-on-mobile"
            style={{
              background: '#12161c',
              border: '1px solid var(--binance-border)',
              color: 'var(--binance-yellow)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px 6px',
              borderRadius: '4px'
            }}
          >
            <Menu size={16} />
          </button>
          <img src="/mij.png" alt="Logo" style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--binance-text)' }}>
            Trading Console
          </span>
        </div>

        {/* Dynamic API Status, WIB Clock & Bot Uptime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
          {/* Live WIB Clock Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#12161c', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--binance-border)' }}>
            <Globe size={12} color="var(--binance-green)" />
            <span className="mono" style={{ color: 'var(--binance-text)', fontWeight: 700, fontSize: '0.7rem' }}>
              {wibTime || 'Loading WIB...'}
            </span>
          </div>

          {/* Active Uptime Duration Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#12161c', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--binance-border)' }}>
            <Clock size={12} color="var(--binance-yellow)" />
            <span style={{ color: 'var(--binance-text-secondary)', fontSize: '0.65rem' }}>Active:</span>
            <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 700, fontSize: '0.7rem' }}>
              {formatUptime(uptimeSeconds)}
            </span>
          </div>

          {/* Connection Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className={apiConnected ? "pulse-green" : ""} style={{ width: 6, height: 6, borderRadius: '50%', background: apiConnected ? 'var(--binance-green)' : 'var(--binance-red)' }} />
            <span style={{ color: apiConnected ? 'var(--binance-green)' : 'var(--binance-red)', fontWeight: 600 }}>
              {apiConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
