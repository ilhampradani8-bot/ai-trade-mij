import React, { useEffect, useState } from 'react';
import { Layers, Activity, AlertTriangle } from 'lucide-react';

export default function OrderbookDepth({ symbol }) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [spread, setSpread] = useState(0);
  const [spreadPct, setSpreadPct] = useState(0);
  const [estSlippage, setEstSlippage] = useState(0.04);

  useEffect(() => {
    const formattedSymbol = symbol.replace('/', '').toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${formattedSymbol}@depth5@100ms`;
    
    let ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.bids && data.asks) {
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
      } catch (err) {
        console.error("Binance WS depth error:", err);
      }
    };

    return () => {
      if (ws) {
        ws.onmessage = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            try { ws.close(); } catch(e) {}
          };
        }
      }
    };
  }, [symbol]);

  const maxBidQty = Math.max(...bids.map(b => b.qty), 1);
  const maxAskQty = Math.max(...asks.map(a => a.qty), 1);

  return (
    <div className="binance-panel" style={{ padding: '8px 10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Orderbook Queue</h3>
        </div>
        <span className="badge-binance badge-yellow" style={{ fontSize: '0.65rem' }}>
          <Activity size={10} /> 100ms Stream
        </span>
      </div>

      {/* Slippage & Spread Metrics */}
      <div style={{ background: '#12161c', padding: '6px 8px', borderRadius: '4px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)' }}>SPREAD</div>
          <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--binance-yellow)' }}>
            ${spread.toFixed(3)} <span style={{ fontSize: '0.68rem', color: 'var(--binance-text-muted)' }}>({spreadPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--binance-text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            SLIPPAGE <AlertTriangle size={10} color="var(--binance-yellow)" />
          </div>
          <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--binance-yellow)' }}>
            {estSlippage.toFixed(3)}%
          </div>
        </div>
      </div>

      {/* Asks (Sellers) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--binance-red)' }}>ASKS (SELL)</div>
        {asks.slice().reverse().map((ask, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '2px 4px', borderRadius: '2px', fontSize: '0.74rem', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${(ask.qty / maxAskQty) * 100}%`, background: 'rgba(246, 70, 93, 0.15)', zIndex: 0 }} />
            <span className="mono" style={{ color: 'var(--binance-red)', zIndex: 1, fontWeight: 600 }}>${ask.price.toFixed(2)}</span>
            <span className="mono" style={{ color: 'var(--binance-text-secondary)', zIndex: 1 }}>{ask.qty.toFixed(3)}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '2px 0', borderTop: '1px dashed var(--binance-border)', borderBottom: '1px dashed var(--binance-border)', margin: '2px 0', fontSize: '0.68rem', color: 'var(--binance-text-muted)', fontWeight: 600 }}>
        MID-MARKET
      </div>

      {/* Bids (Buyers) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--binance-green)' }}>BIDS (BUY)</div>
        {bids.map((bid, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '2px 4px', borderRadius: '2px', fontSize: '0.74rem', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(bid.qty / maxBidQty) * 100}%`, background: 'rgba(14, 203, 129, 0.15)', zIndex: 0 }} />
            <span className="mono" style={{ color: 'var(--binance-green)', zIndex: 1, fontWeight: 600 }}>${bid.price.toFixed(2)}</span>
            <span className="mono" style={{ color: 'var(--binance-text-secondary)', zIndex: 1 }}>{bid.qty.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
