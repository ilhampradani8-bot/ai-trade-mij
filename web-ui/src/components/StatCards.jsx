import React from 'react';
import { Activity, ShieldCheck, Database } from 'lucide-react';

export default function StatCards({ balance, activeTradesCount, maxTrades, totalPnl, winRate, openTrades = [] }) {
  const pnlPositive = totalPnl >= 0;

  // Calculate active open slots per tier
  const top10Active = openTrades.filter(t => (t.rank || 99) <= 10).length;
  const top20Active = openTrades.filter(t => (t.rank || 99) > 10 && (t.rank || 99) <= 20).length;
  const top30Active = openTrades.filter(t => (t.rank || 99) > 20).length;

  return (
    <div style={{
      width: '100%',
      marginBottom: '8px',
      boxSizing: 'border-box'
    }}>
      {/* Apple iTunes Classic LCD Track Display Bar (Full-Width) */}
      <div style={{
        background: '#090b0e',
        border: '1px solid #252a33',
        borderRadius: '5px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Left iTunes Player Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(10, 132, 255, 0.15)',
            border: '1px solid #0a84ff',
            borderRadius: '4px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Activity size={14} color="#0a84ff" />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0a84ff', letterSpacing: '0.5px' }}>
              FREQAI ENGINE
            </span>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--itunes-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Strategy Status
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--itunes-text)' }}>
              Aggressive (1:4 Risk-Reward)
            </div>
          </div>
        </div>

        {/* Center iTunes Classic LCD Screen Display */}
        <div style={{
          background: '#14181f',
          border: '1px solid #2c323f',
          borderRadius: '4px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
        }}>
          {/* LCD Item 1: Balance */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--itunes-text-secondary)', fontWeight: 600 }}>ACCOUNT BALANCE</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
              ${balance.toFixed(2)} <span style={{ fontSize: '0.65rem', color: 'var(--itunes-text-muted)' }}>USDT</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#2c323f' }} />

          {/* LCD Item 2: Active Positions */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--itunes-text-secondary)', fontWeight: 600 }}>OPEN POSITIONS</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--itunes-blue)' }}>
              {activeTradesCount} / {maxTrades} <span style={{ fontSize: '0.65rem', color: 'var(--itunes-text-muted)' }}>Trades</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#2c323f' }} />

          {/* LCD Item 3: Realized PnL */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--itunes-text-secondary)', fontWeight: 600 }}>REALIZED PNL</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: pnlPositive ? 'var(--itunes-green)' : 'var(--itunes-red)' }}>
              {pnlPositive ? '+' : ''}${totalPnl.toFixed(2)} <span style={{ fontSize: '0.65rem' }}>({pnlPositive ? '+' : ''}{((totalPnl / 200) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#2c323f' }} />

          {/* LCD Item 4: Win Rate */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--itunes-text-secondary)', fontWeight: 600 }}>WIN RATE</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--itunes-yellow)' }}>
              {winRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Right iTunes Tier Liquidity & Slippage Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--itunes-text-secondary)', textTransform: 'uppercase' }}>
              Tier Stake Liquidity
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--itunes-text-secondary)' }}>
              T1: <strong style={{ color: 'var(--itunes-yellow)' }}>${160} ({top10Active}/5)</strong> | T2: <strong style={{ color: 'var(--itunes-blue)' }}>${55} ({top20Active}/8)</strong> | T3: <strong style={{ color: '#c084fc' }}>${35} ({top30Active}/10)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

