import React from 'react';
import { History, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function HistoryTable({ closedTrades, onSelectPair }) {
  return (
    <div className="binance-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Completed Trade History</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          Total Trades: {closedTrades ? closedTrades.length : 0}
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
              <th>Exit Price</th>
              <th>Exit Reason</th>
              <th>Duration</th>
              <th>Fee ($)</th>
              <th>Net Profit ($ / %)</th>
            </tr>
          </thead>
          <tbody>
            {closedTrades && closedTrades.length > 0 ? (
              closedTrades.map((trade, idx) => {
                const profitVal = trade.close_profit_abs ?? trade.profit_abs ?? (trade.profit_amount || 0);
                const profitPct = trade.close_profit_pct ?? trade.profit_pct ?? ((trade.close_profit || 0) * 100);
                const pnlPositive = profitVal >= 0;
                const closeReason = trade.exit_reason || trade.sell_reason || 'ROI Target';

                return (
                  <tr 
                    key={trade.trade_id || idx} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectPair(trade.pair)}
                    title="Click to view chart for this pair"
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--binance-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }} className="mono">
                        {trade.pair} <ArrowRight size={10} />
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--binance-text-muted)' }}>ID: #{trade.trade_id || trade.id || idx+1}</div>
                    </td>
                    <td>
                      <span className="badge-binance badge-green">LONG</span>
                    </td>
                    <td className="mono">${(trade.stake_amount || 50).toFixed(2)}</td>
                    <td className="mono">${(trade.open_rate || trade.open_price || 0).toFixed(4)}</td>
                    <td className="mono" style={{ fontWeight: 700 }}>${(trade.close_rate || trade.close_price || 0).toFixed(4)}</td>
                    <td>
                      <span className={`badge-binance ${pnlPositive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.62rem' }}>
                        {closeReason}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '0.7rem' }}>
                      {trade.close_date_hum || trade.dur_hours ? `${trade.dur_hours}h` : '15m'}
                    </td>
                    <td className="mono" style={{ color: 'var(--binance-text-muted)' }}>
                      ${(trade.fee_open_cost || 0.038).toFixed(3)}
                    </td>
                    <td>
                      <div className="mono" style={{ color: pnlPositive ? 'var(--binance-green)' : 'var(--binance-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pnlPositive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {pnlPositive ? `+$${profitVal.toFixed(2)} (+${profitPct.toFixed(2)}%)` : `-$${Math.abs(profitVal).toFixed(2)} (${profitPct.toFixed(2)}%)`}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--binance-text-muted)', fontSize: '0.75rem' }}>
                  No closed trades recorded yet. Bot AI is analyzing 30 dynamic volume pairs for optimal entry signals.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
