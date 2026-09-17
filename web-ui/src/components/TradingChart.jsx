import React, { useEffect, useRef } from 'react';
import { LineChart, Activity } from 'lucide-react';

export default function TradingChart({ symbol }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean container before embedding new widget
    containerRef.current.innerHTML = '';

    const formattedSymbol = symbol.replace('/', '').toUpperCase();
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${formattedSymbol}`,
      interval: "5",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#0B0E11",
      gridColor: "rgba(43, 49, 58, 0.4)",
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com"
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="binance-panel" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LineChart size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700 }}>{symbol} Live 5m Chart</h3>
        </div>

        <span className="badge-binance badge-green">
          <Activity size={10} /> Live Exchange Stream
        </span>
      </div>

      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '360px', flex: 1, borderRadius: '4px', overflow: 'hidden' }} 
      />
    </div>
  );
}
