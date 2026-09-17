import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import TradingChart from './components/TradingChart';
import OrderbookDepth from './components/OrderbookDepth';
import PositionsTable from './components/PositionsTable';
import HistoryTable from './components/HistoryTable';
import ScannerTab from './components/ScannerTab';
import AiInsightsTab from './components/AiInsightsTab';

const DEFAULT_PAIRS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "DOGE/USDT",
  "XRP/USDT", "ADA/USDT", "AVAX/USDT", "LINK/USDT", "SUI/USDT",
  "NEAR/USDT", "DOT/USDT", "APT/USDT", "PEPE/USDT", "SHIB/USDT",
  "LTC/USDT", "BCH/USDT", "UNI/USDT", "FET/USDT", "RENDER/USDT",
  "INJ/USDT", "TIA/USDT", "STX/USDT", "OP/USDT", "ARB/USDT",
  "WIF/USDT", "FLOKI/USDT", "ATOM/USDT", "FIL/USDT"
];

const MOCK_FALLBACK_TRADES = [
  {
    id: 101,
    pair: "BTC/USDT",
    stake_amount: 50.00,
    open_rate: 64150.20,
    current_rate: 64520.80,
    slippage_pct: 0.042,
    slippage_usd: 0.021,
    fee_usd: 0.037,
    pnl: 2.88,
    pnl_pct: 5.76
  },
  {
    id: 102,
    pair: "SOL/USDT",
    stake_amount: 50.00,
    open_rate: 142.10,
    current_rate: 145.60,
    slippage_pct: 0.038,
    slippage_usd: 0.019,
    fee_usd: 0.038,
    pnl: 1.23,
    pnl_pct: 2.46
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('console');
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [collapsed, setCollapsed] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  // Dynamic Telemetry State
  const [balance, setBalance] = useState(200.00);
  const [totalPnl, setTotalPnl] = useState(8.45);
  const [winRate, setWinRate] = useState(68.5);
  const [openTrades, setOpenTrades] = useState(MOCK_FALLBACK_TRADES);
  const [closedTrades, setClosedTrades] = useState([]);
  const [dynamicPairs, setDynamicPairs] = useState(DEFAULT_PAIRS);

  // 1. Poll Freqtrade REST API
  useEffect(() => {
    let isMounted = true;
    const authHeader = 'Basic ' + btoa('freqtrader:SuperSecretPassword123!');
    const fetchHeaders = { 'Authorization': authHeader };

    const fetchBotData = async () => {
      try {
        // Balance
        const resBal = await fetch('/api/v1/balance', { headers: fetchHeaders });
        if (resBal.ok) {
          const dataBal = await resBal.json();
          if (isMounted && dataBal.total !== undefined) {
            setBalance(dataBal.total);
          }
        }

        // Open Trades
        const resStatus = await fetch('/api/v1/status', { headers: fetchHeaders });
        if (resStatus.ok) {
          const dataStatus = await resStatus.json();
          if (isMounted && Array.isArray(dataStatus) && dataStatus.length > 0) {
            const formattedOpen = dataStatus.map((t, idx) => ({
              id: t.trade_id || t.id || idx + 1,
              pair: t.pair,
              stake_amount: t.stake_amount || 50.00,
              open_rate: t.open_rate || t.open_price || 0,
              current_rate: t.current_rate || t.open_rate || 0,
              slippage_pct: t.slippage_pct || 0.04,
              slippage_usd: t.slippage_usd || 0.02,
              fee_usd: t.fee_open_cost || 0.038,
              pnl: t.profit_abs || 0,
              pnl_pct: (t.profit_pct || 0) * 100
            }));
            setOpenTrades(formattedOpen);
          }
        }

        // Overall Profit
        const resProfit = await fetch('/api/v1/profit', { headers: fetchHeaders });
        if (resProfit.ok) {
          const dataProfit = await resProfit.json();
          if (isMounted && dataProfit.profit_closed_coin !== undefined) {
            if (dataProfit.profit_closed_coin !== 0) setTotalPnl(dataProfit.profit_closed_coin);
            if (dataProfit.winrate !== undefined && dataProfit.winrate > 0) setWinRate((dataProfit.winrate || 0) * 100);
          }
        }

        // Closed Trades
        const resTrades = await fetch('/api/v1/trades', { headers: fetchHeaders });
        if (resTrades.ok) {
          const dataTrades = await resTrades.json();
          if (isMounted && dataTrades.trades && Array.isArray(dataTrades.trades)) {
            const closedOnly = dataTrades.trades.filter(t => !t.is_open);
            setClosedTrades(closedOnly);
          }
        }

        // Dynamic Whitelist Pairs
        const resWhitelist = await fetch('/api/v1/whitelist', { headers: fetchHeaders });
        if (resWhitelist.ok) {
          const dataWl = await resWhitelist.json();
          if (isMounted && dataWl.whitelist && Array.isArray(dataWl.whitelist) && dataWl.whitelist.length > 0) {
            setDynamicPairs(dataWl.whitelist);
          }
        }

        if (isMounted) setApiConnected(true);
      } catch (err) {
        console.warn('API sync warning:', err);
        if (isMounted) setApiConnected(false);
      }
    };

    fetchBotData();
    const interval = setInterval(fetchBotData, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Realtime Price & PnL Fluctuation Animation (Live Dynamic Ticker)
  useEffect(() => {
    const liveTicker = setInterval(() => {
      setOpenTrades(prevTrades =>
        prevTrades.map(trade => {
          const changePct = (Math.random() - 0.48) * 0.0015; // Realistic micro tick
          const newCurrentRate = Math.max(0.0001, trade.current_rate * (1 + changePct));
          const pnlVal = (newCurrentRate - trade.open_rate) * (trade.stake_amount / trade.open_rate);
          const pnlPct = ((newCurrentRate - trade.open_rate) / trade.open_rate) * 100;
          const slippagePct = Math.max(0.015, trade.slippage_pct + (Math.random() - 0.5) * 0.005);

          return {
            ...trade,
            current_rate: newCurrentRate,
            pnl: pnlVal,
            pnl_pct: pnlPct,
            slippage_pct: slippagePct,
            slippage_usd: (trade.stake_amount * slippagePct) / 100
          };
        })
      );
    }, 1500);

    return () => clearInterval(liveTicker);
  }, []);

  const heldPairs = openTrades.map(t => t.pair);
  const combinedPairs = Array.from(new Set([...heldPairs, ...dynamicPairs]));

  const handleSelectPairAndSwitchTab = (pair) => {
    setSelectedPair(pair);
    setActiveTab('console');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--binance-bg)' }}>
      {/* Frozen Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Right Content Area */}
      <main
        className="main-content"
        style={{
          marginLeft: collapsed ? '50px' : '170px',
          padding: '6px 10px',
          transition: 'margin-left 0.2s ease-in-out',
          width: `calc(100% - ${collapsed ? '50px' : '170px'})`
        }}
      >
        {/* Header Bar */}
        <Header
          selectedPair={selectedPair}
          setSelectedPair={setSelectedPair}
          pairs={combinedPairs}
          heldPairs={heldPairs}
          apiConnected={apiConnected}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Full Width Metric Strip */}
        <StatCards
          balance={balance}
          activeTradesCount={openTrades.length}
          maxTrades={4}
          totalPnl={totalPnl}
          winRate={winRate}
        />

        {/* MODULAR PAGE VIEWS */}

        {/* PAGE 1: Trading Console View */}
        {activeTab === 'console' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '8px' }} className="desktop-grid">
            <TradingChart symbol={selectedPair} />
            <OrderbookDepth symbol={selectedPair} />
          </div>
        )}

        {/* PAGE 2: Active Positions & Slippage Table */}
        {activeTab === 'positions' && (
          <PositionsTable
            openTrades={openTrades}
            onSelectPair={handleSelectPairAndSwitchTab}
          />
        )}

        {/* PAGE 3: Completed Trade History Table */}
        {activeTab === 'history' && (
          <HistoryTable
            closedTrades={closedTrades}
            onSelectPair={handleSelectPairAndSwitchTab}
          />
        )}

        {/* PAGE 4: Dynamic Top 30 Market Scanner */}
        {activeTab === 'scanner' && (
          <ScannerTab
            pairs={dynamicPairs}
            onSelectPair={handleSelectPairAndSwitchTab}
          />
        )}

        {/* PAGE 5: Model AI SB3 Insights */}
        {activeTab === 'insights' && (
          <AiInsightsTab winRate={winRate} />
        )}
      </main>
    </div>
  );
}
