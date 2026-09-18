import React from 'react';
import { ShieldAlert, Zap, Layers } from 'lucide-react';

export default function TierCards({ openTrades = [] }) {
  // Calculate active open slots per tier
  const top10Active = openTrades.filter(t => (t.rank || 99) <= 10).length;
  const top20Active = openTrades.filter(t => (t.rank || 99) > 10 && (t.rank || 99) <= 20).length;
  const top30Active = openTrades.filter(t => (t.rank || 99) > 20).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }} className="desktop-grid">
      {/* Tier 1: Top 1-10 */}
      <div className="binance-panel" style={{ padding: '10px 12px', borderTop: '2px solid var(--binance-yellow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--binance-yellow)' }}>TOP 1–10 MEGA CAP TIER</span>
          <span className="badge-binance badge-yellow" style={{ fontSize: '0.6rem' }}>Max 5 Slots</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>Stake Size per Posisi</div>
            <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              16.0% <span style={{ fontSize: '0.7rem', color: 'var(--binance-yellow)' }}>(~$160.00)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>Active / Max</div>
            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--binance-green)' }}>
              {top10Active} / 5 <span style={{ fontSize: '0.65rem' }}>Used</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)', marginTop: '4px' }}>
          Est. Slippage: <span className="mono" style={{ color: 'var(--binance-green)' }}>&lt; 0.005%</span> (Deep Liquidity)
        </div>
      </div>

      {/* Tier 2: Top 11-20 */}
      <div className="binance-panel" style={{ padding: '10px 12px', borderTop: '2px solid var(--binance-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--binance-blue)' }}>TOP 11–20 MID CAP TIER</span>
          <span className="badge-binance badge-green" style={{ fontSize: '0.6rem' }}>Max 8 Slots</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>Stake Size per Posisi</div>
            <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              5.5% <span style={{ fontSize: '0.7rem', color: 'var(--binance-blue)' }}>(~$55.00)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>Active / Max</div>
            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--binance-blue)' }}>
              {top20Active} / 8 <span style={{ fontSize: '0.65rem' }}>Used</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)', marginTop: '4px' }}>
          Est. Slippage: <span className="mono" style={{ color: 'var(--binance-yellow)' }}>~0.015%</span> (Live Orderbook)
        </div>
      </div>

      {/* Tier 3: Top 21-30 */}
      <div className="binance-panel" style={{ padding: '10px 12px', borderTop: '2px solid #a855f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c084fc' }}>TOP 21–30 ALTCOIN TIER</span>
          <span className="badge-binance badge-green" style={{ fontSize: '0.6rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>Max 10 Slots</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>Stake Size per Posisi</div>
            <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              3.5% <span style={{ fontSize: '0.7rem', color: '#c084fc' }}>(~$35.00)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>Active / Max</div>
            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc' }}>
              {top30Active} / 10 <span style={{ fontSize: '0.65rem' }}>Used</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)', marginTop: '4px' }}>
          Est. Slippage: <span className="mono" style={{ color: '#c084fc' }}>~0.035%</span> (Live Orderbook Queue)
        </div>
      </div>
    </div>
  );
}
