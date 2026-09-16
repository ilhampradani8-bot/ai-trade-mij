import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import TradingChart from './components/TradingChart';
import OrderbookDepth from './components/OrderbookDepth';
import PositionsTable from './components/PositionsTable';
import ScannerTab from './components/ScannerTab';
import AiInsightsTab from './components/AiInsightsTab';

const TOP_30_PAIRS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "DOGE/USDT",
  "XRP/USDT", "ADA/USDT", "AVAX/USDT", "LINK/USDT", "SUI/USDT",
  "NEAR/USDT", "DOT/USDT", "APT/USDT", "PEPE/USDT", "SHIB/USDT",
  "LTC/USDT", "BCH/USDT", "UNI/USDT", "FET/USDT", "RENDER/USDT",
  "INJ/USDT", "TIA/USDT", "MATIC/USDT", "STX/USDT", "OP/USDT",
  "ARB/USDT", "WIF/USDT", "FLOKI/USDT", "ATOM/USDT", "FIL/USDT"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('console'); // 'console', 'positions', 'scanner', 'insights'
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [collapsed, setCollapsed] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [balance, setBalance] = useState(200.00);
  const [totalPnl, setTotalPnl] = useState(8.45);
  const [winRate, setWinRate] = useState(68.5);

  const [openTrades, setOpenTrades] = useState([
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
  ]);

  const heldPairs = openTrades.map(t => t.pair);
  const combinedPairs = Array.from(new Set([...heldPairs, ...TOP_30_PAIRS]));

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

      {/* Main Right Full Width Content Area */}
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

        {/* Full Width Compact Metric Strip */}
        <StatCards 
          balance={balance} 
          activeTradesCount={openTrades.length} 
          maxTrades={3} 
          totalPnl={totalPnl} 
          winRate={winRate}
        />

        {/* MODULAR PAGE VIEWS (NO LONG SCROLLING) */}

        {/* PAGE 1: Grafik & Orderbook View */}
        {activeTab === 'console' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '8px' }} className="desktop-grid">
            <TradingChart symbol={selectedPair} />
            <OrderbookDepth symbol={selectedPair} />
          </div>
        )}

        {/* PAGE 2: Posisi & Slippage Table */}
        {activeTab === 'positions' && (
          <PositionsTable 
            openTrades={openTrades} 
            onSelectPair={handleSelectPairAndSwitchTab}
          />
        )}

        {/* PAGE 3: Market Scanner (30 Pairs) */}
        {activeTab === 'scanner' && (
          <ScannerTab 
            pairs={TOP_30_PAIRS} 
            onSelectPair={handleSelectPairAndSwitchTab}
          />
        )}

        {/* PAGE 4: Model AI SB3 Insights */}
        {activeTab === 'insights' && (
          <AiInsightsTab winRate={winRate} />
        )}
      </main>
    </div>
  );
}
