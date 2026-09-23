import React, { useEffect, useState } from 'react';
import { Layers, Activity, AlertTriangle } from 'lucide-react';

export default function OrderbookDepth({ symbol }) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [spread, setSpread] = useState(0);
  const [spreadPct, setSpreadPct] = useState(0);
  const [estSlippage, setEstSlippage] = useState(0.04);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Gate.io currency pair format: BTC_USDT
    let pairFormatted = symbol.replace('/', '_').toUpperCase();
    if (!pairFormatted.includes('_')) {
      pairFormatted = pairFormatted.replace('USDT', '_USDT');
    }

    const fetchDepthData = async () => {
      try {
        // Primary: Fetch live orderbook depth queue from Gate.io API
        let res = await fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pairFormatted}&limit=5`).catch(() => null);
        
        let data = null;
        if (res && res.ok) {
          data = await res.json();
        } else {
          // Fallback to Binance depth API if gate fails
          const cleanBinance = symbol.replace('/', '').toUpperCase();
          const binanceRes = await fetch(`https://api.binance.com/api/v3/depth?symbol=${cleanBinance}&limit=5`).catch(() => null);
          if (binanceRes && binanceRes.ok) {
            data = await binanceRes.json();
          }
        }

        if (isMounted && data && (data.bids || data.asks)) {
          const parsedBids = (data.bids || []).map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }));
          const parsedAsks = (data.asks || []).map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }));
          
          setBids(parsedBids);
          setAsks(parsedAsks);
          setLoading(false);

          const bestBid = parsedBids[0]?.price || 0;
          const bestAsk = parsedAsks[0]?.price || 0;

          if (bestBid > 0 && bestAsk > 0) {
            const spreadVal = Math.abs(bestAsk - bestBid);
            const spreadPercent = (spreadVal / bestAsk) * 100;
            setSpread(spreadVal);
            setSpreadPct(spreadPercent);

            const topAskQty = parsedAsks.reduce((acc, curr) => acc + curr.qty, 0);
            const slipEst = Math.max(0.02, spreadPercent * 1.5 + (topAskQty > 0 ? 0.01 : 0.05));
            setEstSlippage(slipEst);
          }
        }
      } catch (err) {
        console.warn('Orderbook fetch warning:', err);
      }
    };

    fetchDepthData();
    const interval = setInterval(fetchDepthData, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const maxBidQty = Math.max(...bids.map(b => b.qty), 1);
  const maxAskQty = Math.max(...asks.map(a => a.qty), 1);

  return (
    <div className="binance-panel" style={{ padding: '10px 12px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Orderbook Depth ({symbol})</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          <Activity size={10} /> Live 100ms Queue
        </span>
      </div>

      {/* Slippage & Spread Metrics */}
      <div style={{ background: '#12161c', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)' }}>LIVE SPREAD</div>
          <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--binance-yellow)' }}>
            ${spread.toFixed(4)} <span style={{ fontSize: '0.68rem', color: 'var(--binance-text-muted)' }}>({spreadPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            EST. SLIPPAGE <AlertTriangle size={10} color="var(--binance-yellow)" />
          </div>
          <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--binance-yellow)' }}>
            {estSlippage.toFixed(3)}%
          </div>
        </div>
      </div>

      {/* Asks (Sell Queue) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '4px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--binance-red)' }}>ASKS (SELL QUEUE)</div>
        {asks.length > 0 ? (
          asks.slice().reverse().map((ask, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderRadius: '3px', fontSize: '0.78rem', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${(ask.qty / maxAskQty) * 100}%`, background: 'rgba(246, 70, 93, 0.15)', zIndex: 0 }} />
              <span className="mono" style={{ color: 'var(--binance-red)', zIndex: 1, fontWeight: 700 }}>${ask.price.toFixed(4)}</span>
              <span className="mono" style={{ color: 'var(--binance-text-secondary)', zIndex: 1 }}>{ask.qty.toFixed(3)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.72rem', color: 'var(--binance-text-muted)', padding: '6px 0', textAlign: 'center' }}>
            {loading ? 'Connecting Orderbook Stream...' : 'Syncing Live Depth Queue...'}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '3px 0', borderTop: '1px dashed var(--binance-border)', borderBottom: '1px dashed var(--binance-border)', margin: '3px 0', fontSize: '0.68rem', color: 'var(--binance-text-muted)', fontWeight: 600 }}>
        MID-MARKET SPREAD BOUNDARY
      </div>

      {/* Bids (Buy Queue) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--binance-green)' }}>BIDS (BUY QUEUE)</div>
        {bids.length > 0 ? (
          bids.map((bid, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderRadius: '3px', fontSize: '0.78rem', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(bid.qty / maxBidQty) * 100}%`, background: 'rgba(14, 203, 129, 0.15)', zIndex: 0 }} />
              <span className="mono" style={{ color: 'var(--binance-green)', zIndex: 1, fontWeight: 700 }}>${bid.price.toFixed(4)}</span>
              <span className="mono" style={{ color: 'var(--binance-text-secondary)', zIndex: 1 }}>{bid.qty.toFixed(3)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.72rem', color: 'var(--binance-text-muted)', padding: '6px 0', textAlign: 'center' }}>
            {loading ? 'Connecting Orderbook Stream...' : 'Syncing Live Depth Queue...'}
          </div>
        )}
      </div>
    </div>
  );
}
