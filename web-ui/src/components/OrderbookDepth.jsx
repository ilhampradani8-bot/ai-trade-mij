import React, { useEffect, useState } from 'react';
import { Layers, Activity, AlertTriangle } from 'lucide-react';

export default function OrderbookDepth({ symbol }) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [spread, setSpread] = useState(0);
  const [spreadPct, setSpreadPct] = useState(0);
  const [estSlippage, setEstSlippage] = useState(0.04);

  useEffect(() => {
    let isMounted = true;
    const cleanSymbol = symbol.replace('/', '').toUpperCase();

    const fetchDepthData = async () => {
      try {
        // Fetch depth data from public Binance API proxy or REST fallback
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${cleanSymbol}&limit=5`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (isMounted && data.bids && data.asks) {
            const parsedBids = data.bids.map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }));
            const parsedAsks = data.asks.map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }));
            
            setBids(parsedBids);
            setAsks(parsedAsks);

            const bestBid = parsedBids[0]?.price || 0;
            const bestAsk = parsedAsks[0]?.price || 0;

            if (bestBid > 0 && bestAsk > 0) {
              const spreadVal = bestAsk - bestBid;
              const spreadPercent = (spreadVal / bestAsk) * 100;
              setSpread(spreadVal);
              setSpreadPct(spreadPercent);

              const topAskQty = parsedAsks.reduce((acc, curr) => acc + curr.qty, 0);
              const slipEst = Math.max(0.02, spreadPercent * 1.5 + (topAskQty > 0 ? 0.01 : 0.05));
              setEstSlippage(slipEst);
            }
          }
        }
      } catch (err) {
        // Silent fallback for network/geo restrictions
      }
    };

    fetchDepthData();
    const interval = setInterval(fetchDepthData, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const maxBidQty = Math.max(...bids.map(b => b.qty), 1);
  const maxAskQty = Math.max(...asks.map(a => a.qty), 1);

  return (
    <div className="binance-panel" style={{ padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Orderbook Queue & Slippage</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.68rem' }}>
          <Activity size={10} /> Live Realtime API
        </span>
      </div>

      {/* Slippage & Spread Metrics */}
      <div style={{ background: '#12161c', padding: '8px 12px', borderRadius: '4px', marginBottom: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--binance-text-secondary)' }}>LIVE SPREAD</div>
          <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--binance-yellow)' }}>
            ${spread.toFixed(3)} <span style={{ fontSize: '0.7rem', color: 'var(--binance-text-muted)' }}>({spreadPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--binance-text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            EST. SLIPPAGE <AlertTriangle size={10} color="var(--binance-yellow)" />
          </div>
          <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--binance-yellow)' }}>
            {estSlippage.toFixed(3)}%
          </div>
        </div>
      </div>

      {/* Asks (Sellers) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--binance-red)' }}>ASKS (SELL QUEUE)</div>
        {asks.length > 0 ? (
          asks.slice().reverse().map((ask, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '3px', fontSize: '0.8rem', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${(ask.qty / maxAskQty) * 100}%`, background: 'rgba(246, 70, 93, 0.15)', zIndex: 0 }} />
              <span className="mono" style={{ color: 'var(--binance-red)', zIndex: 1, fontWeight: 600 }}>${ask.price.toFixed(2)}</span>
              <span className="mono" style={{ color: 'var(--binance-text-secondary)', zIndex: 1 }}>{ask.qty.toFixed(3)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--binance-text-muted)', padding: '8px 0', textAlign: 'center' }}>Syncing Orderbook Queue...</div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '4px 0', borderTop: '1px dashed var(--binance-border)', borderBottom: '1px dashed var(--binance-border)', margin: '4px 0', fontSize: '0.72rem', color: 'var(--binance-text-muted)', fontWeight: 600 }}>
        MID-MARKET SPREAD BOUNDARY
      </div>

      {/* Bids (Buyers) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--binance-green)' }}>BIDS (BUY QUEUE)</div>
        {bids.length > 0 ? (
          bids.map((bid, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '3px', fontSize: '0.8rem', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(bid.qty / maxBidQty) * 100}%`, background: 'rgba(14, 203, 129, 0.15)', zIndex: 0 }} />
              <span className="mono" style={{ color: 'var(--binance-green)', zIndex: 1, fontWeight: 600 }}>${bid.price.toFixed(2)}</span>
              <span className="mono" style={{ color: 'var(--binance-text-secondary)', zIndex: 1 }}>{bid.qty.toFixed(3)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--binance-text-muted)', padding: '8px 0', textAlign: 'center' }}>Syncing Orderbook Queue...</div>
        )}
      </div>
    </div>
  );
}
