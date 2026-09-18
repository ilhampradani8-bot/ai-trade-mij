import React from 'react';
import { History, ArrowRight, CheckCircle2, XCircle, Calendar, Clock } from 'lucide-react';

function formatTradeDateTime(dateStr, timestamp) {
  if (!dateStr && !timestamp) return { dayDate: '-', timeStr: '-' };
  let d;
  if (typeof dateStr === 'string' && dateStr.trim()) {
    d = new Date(dateStr.replace(' ', 'T'));
  } else if (timestamp) {
    d = new Date(timestamp);
  } else {
    return { dayDate: '-', timeStr: '-' };
  }
  
  if (isNaN(d.getTime())) return { dayDate: dateStr || '-', timeStr: '-' };

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dayName = days[d.getDay()];
  const dateNum = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return {
    dayDate: `${dayName}, ${dateNum} ${monthName} ${year}`,
    timeStr: `${hours}:${minutes}:${seconds}`
  };
}

export default function HistoryTable({ closedTrades, onSelectPair }) {
  // Sort trades descending so newest trade is always at the top
  const sortedTrades = closedTrades && closedTrades.length > 0 
    ? [...closedTrades].sort((a, b) => {
        const timeA = a.close_timestamp || a.open_timestamp || (a.trade_id || 0);
        const timeB = b.close_timestamp || b.open_timestamp || (b.trade_id || 0);
        return timeB - timeA;
      }) 
    : [];

  return (
    <div className="binance-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Completed Trade History</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          Total Trades: {sortedTrades.length}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="dense-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Side</th>
              <th style={{ color: 'var(--binance-yellow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={11} /> Hari & Tanggal
                </div>
              </th>
              <th style={{ color: 'var(--binance-yellow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> Waktu / Jam
                </div>
              </th>
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
            {sortedTrades.length > 0 ? (
              sortedTrades.map((trade, idx) => {
                const profitVal = trade.close_profit_abs ?? trade.profit_abs ?? (trade.profit_amount || 0);
                const profitPct = trade.close_profit_pct ?? trade.profit_pct ?? ((trade.close_profit || 0) * 100);
                const pnlPositive = profitVal >= 0;
                const closeReason = trade.exit_reason || trade.sell_reason || 'ROI Target';

                const closeTimeInfo = formatTradeDateTime(trade.close_date, trade.close_timestamp);
                const openTimeInfo = formatTradeDateTime(trade.open_date, trade.open_timestamp);

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
                    <td className="mono" style={{ fontSize: '0.7rem', color: 'var(--binance-text-secondary)', whiteSpace: 'nowrap' }}>
                      {closeTimeInfo.dayDate !== '-' ? closeTimeInfo.dayDate : openTimeInfo.dayDate}
                    </td>
                    <td className="mono" style={{ fontSize: '0.7rem', color: 'var(--binance-yellow)', whiteSpace: 'nowrap' }}>
                      {openTimeInfo.timeStr !== '-' && closeTimeInfo.timeStr !== '-' ? (
                        <span>{openTimeInfo.timeStr} → {closeTimeInfo.timeStr}</span>
                      ) : (
                        <span>{closeTimeInfo.timeStr !== '-' ? closeTimeInfo.timeStr : openTimeInfo.timeStr}</span>
                      )}
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
                      {trade.trade_duration ? `${Math.round(trade.trade_duration / 60)}m` : trade.close_date_hum || '15m'}
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
                <td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: 'var(--binance-text-muted)', fontSize: '0.75rem' }}>
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
