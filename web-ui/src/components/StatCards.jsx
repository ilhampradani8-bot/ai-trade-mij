import React from 'react';

export default function StatCards({ balance, activeTradesCount, maxTrades, totalPnl, winRate }) {
  const pnlPositive = totalPnl >= 0;

  return (
    <div className="binance-panel stat-strip" style={{ marginBottom: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '6px 12px' }}>
      {/* Simulation Balance */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)', fontWeight: 600 }}>SIMULATION BALANCE</span>
        <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
          ${balance.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--binance-text-muted)' }}>USDT</span>
        </div>
      </div>

      {/* Active Positions */}
      <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--binance-border)', paddingLeft: '8px' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)', fontWeight: 600 }}>ACTIVE POSITIONS</span>
        <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--binance-blue)' }}>
          {activeTradesCount} / {maxTrades} <span style={{ fontSize: '0.7rem', color: 'var(--binance-text-muted)' }}>Trades</span>
        </div>
      </div>

      {/* Total PnL */}
      <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--binance-border)', paddingLeft: '8px' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)', fontWeight: 600 }}>TOTAL PNL</span>
        <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: pnlPositive ? 'var(--binance-green)' : 'var(--binance-red)' }}>
          {pnlPositive ? '+' : ''}${totalPnl.toFixed(2)} <span style={{ fontSize: '0.7rem' }}>({pnlPositive ? '+' : ''}{((totalPnl / 200) * 100).toFixed(1)}%)</span>
        </div>
      </div>

      {/* Win Rate SB3 */}
      <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--binance-border)', paddingLeft: '8px' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)', fontWeight: 600 }}>SB3 WIN RATE</span>
        <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--binance-yellow)' }}>
          {winRate.toFixed(1)}% <span style={{ fontSize: '0.7rem', color: 'var(--binance-text-muted)' }}>PPO Agent</span>
        </div>
      </div>
    </div>
  );
}
