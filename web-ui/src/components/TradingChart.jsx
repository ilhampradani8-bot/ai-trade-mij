import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { LineChart, Sparkles } from 'lucide-react';

export default function TradingChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 360,
      layout: {
        background: { color: 'transparent' },
        textColor: '#848e9c',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#f0b90b', labelBackgroundColor: '#181a20' },
        horzLine: { color: '#f0b90b', labelBackgroundColor: '#181a20' },
      },
      rightPriceScale: {
        borderColor: '#2b313a',
      },
      timeScale: {
        borderColor: '#2b313a',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderVisible: false,
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });

    const now = Math.floor(Date.now() / 1000);
    const mockData = [];
    let basePrice = symbol.startsWith('BTC') ? 64320 : symbol.startsWith('ETH') ? 3495 : symbol.startsWith('SOL') ? 144 : 25;

    for (let i = 100; i >= 0; i--) {
      const time = now - i * 300;
      const change = (Math.random() - 0.48) * (basePrice * 0.005);
      const open = basePrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.002);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.002);
      
      mockData.push({ time, open, high, low, close });
      basePrice = close;
    }

    candlestickSeries.setData(mockData);

    const lastTime = mockData[mockData.length - 15].time;
    const buyTime = mockData[mockData.length - 40].time;
    
    candlestickSeries.setMarkers([
      {
        time: buyTime,
        position: 'belowBar',
        color: '#0ecb81',
        shape: 'arrowUp',
        text: 'FreqAI Buy',
      },
      {
        time: lastTime,
        position: 'aboveBar',
        color: '#f6465d',
        shape: 'arrowDown',
        text: 'FreqAI Exit',
      },
    ]);

    chart.timeScale().fitContent();
    chartInstanceRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
      }
    };
  }, [symbol]);

  return (
    <div className="binance-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LineChart size={14} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700 }}>{symbol} 5m Chart</h3>
        </div>

        <span className="badge-binance badge-yellow">
          <Sparkles size={10} /> FreqAI SB3 Signals
        </span>
      </div>

      <div ref={chartContainerRef} style={{ width: '100%', height: '360px' }} />
    </div>
  );
}
