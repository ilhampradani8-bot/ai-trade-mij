import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';

export default function PositionsTable({ openTrades, onSelectPair }) {
  return (
    <div className="binance-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Active Positions & Slippage</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          Max 4 Trades (Dynamic Tier Stake)
        </span>
      </div>

      <div className="table-wrapper">
        <table className="dense-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Side</th>
              <th>Stake ($)</th>
              <th>Entry Price</th>
              <th>Current Price</th>
              <th style={{ color: 'var(--binance-yellow)' }}>Slippage (%)</th>
              <th style={{ color: 'var(--binance-yellow)' }}>Est. Slippage ($)</th>
              <th>Fee ($)</th>
              <th>PnL ($ / %)</th>
            </tr>
          </thead>
          <tbody>
            {openTrades && openTrades.length > 0 ? (
              openTrades.map((trade) => {
                const pnlPositive = trade.pnl >= 0;
                return (
                  <tr 
                    key={trade.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectPair(trade.pair)}
                    title="Click to view chart for this coin"
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--binance-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }} className="mono">
                        {trade.pair} <ArrowRight size={10} />
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>ID: #{trade.id}</div>
                    </td>
                    <td>
                      <span className="badge-binance badge-green">LONG</span>
                    </td>
                    <td className="mono">${trade.stake_amount.toFixed(2)}</td>
                    <td className="mono">${trade.open_rate.toFixed(4)}</td>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--binance-yellow)' }}>${trade.current_rate.toFixed(4)}</td>
                    <td>
                      <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 700, background: 'rgba(240, 185, 11, 0.12)', padding: '2px 4px', borderRadius: '3px' }}>
                        {trade.slippage_pct > 0 ? `+${trade.slippage_pct.toFixed(3)}%` : `${trade.slippage_pct.toFixed(3)}%`}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 600 }}>
                        ${trade.slippage_usd.toFixed(3)}
                      </span>
                    </td>
                    <td className="mono" style={{ color: 'var(--binance-text-secondary)' }}>${trade.fee_usd.toFixed(3)}</td>
                    <td>
                      <div className="mono" style={{ fontWeight: 700, color: pnlPositive ? 'var(--binance-green)' : 'var(--binance-red)' }}>
                        {pnlPositive ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                      <div className="mono" style={{ fontSize: '0.68rem', color: pnlPositive ? 'var(--binance-green)' : 'var(--binance-red)' }}>
                        ({pnlPositive ? '+' : ''}{trade.pnl_pct.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--binance-text-muted)', padding: '16px' }}>
                  No active open positions. CatBoost AI scanning 30 dynamic volume pairs...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
