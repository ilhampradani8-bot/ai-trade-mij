import React from 'react';
import { Search, Zap, ArrowRight } from 'lucide-react';

export default function ScannerTab({ pairs, onSelectPair }) {
  const mockScannerData = pairs.map((pair, idx) => {
    const basePrice = pair.startsWith('BTC') ? 64320.5 : pair.startsWith('ETH') ? 3495.2 : pair.startsWith('SOL') ? 144.8 : 12.5 + (idx * 0.8);
    const change24h = ((idx % 3 === 0 ? 1 : -1) * (1.2 + (idx * 0.35))).toFixed(2);
    const isPositive = parseFloat(change24h) >= 0;
    const aiScore = (0.65 + ((idx % 7) * 0.05)).toFixed(2);
    const volume = (15.4 + idx * 3.2).toFixed(1);

    return {
      pair,
      price: basePrice,
      change24h,
      isPositive,
      aiScore,
      volume
    };
  });

  return (
    <div className="binance-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Top 30 Market Scanner (Click Row for Chart)</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          30 Pairs • 5m/15m
        </span>
      </div>

      <div className="table-wrapper">
        <table className="dense-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Last Price ($)</th>
              <th>24h Change</th>
              <th>Volume ($M)</th>
              <th style={{ color: 'var(--binance-yellow)' }}>AI Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockScannerData.map((item) => (
              <tr 
                key={item.pair}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectPair(item.pair)}
                title="Click to view chart for this coin"
              >
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--binance-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }} className="mono">
                    {item.pair} <ArrowRight size={10} />
                  </div>
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>${item.price.toFixed(item.price > 10 ? 2 : 4)}</td>
                <td>
                  <span className="mono" style={{ color: item.isPositive ? 'var(--binance-green)' : 'var(--binance-red)', fontWeight: 600 }}>
                    {item.isPositive ? '+' : ''}{item.change24h}%
                  </span>
                </td>
                <td className="mono" style={{ color: 'var(--binance-text-secondary)' }}>${item.volume}M</td>
                <td>
                  <span className="badge-binance badge-yellow mono">
                    <Zap size={10} /> {(parseFloat(item.aiScore) * 100).toFixed(0)}%
                  </span>
                </td>
                <td>
                  {parseFloat(item.aiScore) > 0.80 ? (
                    <span className="badge-binance badge-green">STRONG BUY</span>
                  ) : parseFloat(item.aiScore) > 0.70 ? (
                    <span className="badge-binance badge-green">BUY</span>
                  ) : (
                    <span className="badge-binance badge-red">NEUTRAL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
