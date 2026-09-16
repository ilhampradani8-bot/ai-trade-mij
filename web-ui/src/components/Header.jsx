import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ selectedPair, setSelectedPair, pairs, heldPairs, apiConnected, collapsed, setCollapsed }) {
  return (
    <header className="binance-panel" style={{ padding: '4px 8px', marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', width: '100%' }}>
        {/* Toggle Hamburger & Dropdown Coin Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
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

          <label style={{ fontSize: '0.7rem', color: 'var(--binance-text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Chart Coin:</label>
          <select 
            value={selectedPair} 
            onChange={(e) => setSelectedPair(e.target.value)}
            className="mono"
            style={{
              background: '#12161c',
              color: 'var(--binance-yellow)',
              border: '1px solid var(--binance-yellow)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              fontSize: '0.8rem',
              width: '100%',
              maxWidth: '220px'
            }}
          >
            {pairs.map(p => {
              const isHeld = heldPairs.includes(p);
              return (
                <option key={p} value={p} style={{ background: '#181a20', color: isHeld ? '#0ecb81' : '#fff', fontWeight: isHeld ? 'bold' : 'normal' }}>
                  {p} {isHeld ? '💼 (HELD)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* REST Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--binance-text-secondary)', whiteSpace: 'nowrap' }}>
          <div className={apiConnected ? "pulse-green" : ""} style={{ width: 6, height: 6, borderRadius: '50%', background: apiConnected ? 'var(--binance-green)' : 'var(--binance-red)' }} />
          <span>{apiConnected ? "Connected" : "Offline"}</span>
        </div>
      </div>
    </header>
  );
}
