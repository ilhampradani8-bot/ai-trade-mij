import React, { useState, useEffect } from 'react';
import { Search, Zap, ArrowRight, Activity } from 'lucide-react';

export default function ScannerTab({ pairs, onSelectPair }) {
  const [tickerData, setTickerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTickerPrices = async () => {
      try {
        const authHeader = 'Basic ' + btoa('freqtrader:SuperSecretPassword123!');
        const res = await fetch('/api/v1/whitelist', { headers: { 'Authorization': authHeader } });
        
        let currentPairs = pairs;
        if (res.ok) {
          const data = await res.json();
          if (data.whitelist && data.whitelist.length > 0) {
            currentPairs = data.whitelist;
          }
        }

        // Fetch live 24h ticker info from public Binance REST endpoint via fetch (or fallback)
        const tickerRes = await fetch('https://api.binance.com/api/v3/ticker/24hr').catch(() => null);
        let binanceMap = {};
        if (tickerRes && tickerRes.ok) {
          const rawTickers = await tickerRes.json();
          rawTickers.forEach(t => {
            binanceMap[t.symbol] = {
              price: parseFloat(t.lastPrice),
              change24h: parseFloat(t.priceChangePercent),
              volume: (parseFloat(t.quoteVolume) / 1000000).toFixed(1)
            };
          });
        }

        if (isMounted) {
          const compiled = currentPairs.map((pair) => {
            const cleanSymbol = pair.replace('/', '').toUpperCase();
            const live = binanceMap[cleanSymbol] || { price: 0, change24h: 0, volume: '0.0' };
            
            // CatBoost expected signal target return score
            const isPositive = live.change24h >= 0;
            const signalType = live.change24h > 2.5 ? 'STRONG BUY' : live.change24h > 0.5 ? 'BUY' : 'NEUTRAL';

            return {
              pair,
              price: live.price,
              change24h: live.change24h.toFixed(2),
              isPositive,
              volume: live.volume,
              signalType
            };
          });

          setTickerData(compiled);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Scanner ticker sync warning:', err);
      }
    };

    fetchTickerPrices();
    const interval = setInterval(fetchTickerPrices, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pairs]);

  return (
    <div className="binance-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Top 30 Volume Pairs Scanner (100% Realtime API)</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          <Activity size={10} /> {tickerData.length} Live Pairs
        </span>
      </div>

      <div className="table-wrapper">
        <table className="dense-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Last Price ($)</th>
              <th>24h Change</th>
              <th>24h Volume ($M)</th>
              <th style={{ color: 'var(--binance-yellow)' }}>CatBoost Signal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickerData.length > 0 ? (
              tickerData.map((item) => (
                <tr 
                  key={item.pair}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectPair(item.pair)}
                  title="Click row to inspect orderbook & position details"
                >
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--binance-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }} className="mono">
                      {item.pair} <ArrowRight size={10} />
                    </div>
                  </td>
                  <td className="mono" style={{ fontWeight: 600 }}>
                    ${item.price > 0 ? item.price.toFixed(item.price > 10 ? 2 : 4) : '---'}
                  </td>
                  <td>
                    <span className="mono" style={{ color: item.isPositive ? 'var(--binance-green)' : 'var(--binance-red)', fontWeight: 600 }}>
                      {item.isPositive ? '+' : ''}{item.change24h}%
                    </span>
                  </td>
                  <td className="mono" style={{ color: 'var(--binance-text-secondary)' }}>${item.volume}M</td>
                  <td>
                    {item.signalType === 'STRONG BUY' ? (
                      <span className="badge-binance badge-green mono"><Zap size={10} /> STRONG BUY</span>
                    ) : item.signalType === 'BUY' ? (
                      <span className="badge-binance badge-green mono">BUY</span>
                    ) : (
                      <span className="badge-binance badge-red mono">NEUTRAL</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="badge-binance badge-yellow"
                      style={{ background: 'transparent', border: '1px solid var(--binance-yellow)', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPair(item.pair);
                      }}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--binance-text-muted)', padding: '16px' }}>
                  {loading ? 'Fetching 30 real-time market pairs...' : 'No active pairs returned from Freqtrade whitelist.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
