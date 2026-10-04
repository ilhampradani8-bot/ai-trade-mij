# 🤖 FreqAI Pro Trading Engine & Binance Web Dashboard

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![Freqtrade](https://img.shields.io/badge/Freqtrade-2026.8-green?logo=bitcoin)](https://www.freqtrade.io)
[![FreqAI Model](https://img.shields.io/badge/FreqAI-LightGBMRegressor-gold)](https://lightgbm.readthedocs.io)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An end-to-end automated cryptocurrency algorithmic trading system powered by **Freqtrade** and **FreqAI** with **LightGBMRegressor**, accompanied by a custom-built, ultra-dense, multi-tab **Binance Pro Web UI Dashboard**.

🔗 **Live Public Demo**: [https://ai-trade.mijdigital.my](https://ai-trade.mijdigital.my)

---

## ✨ Key Features

- 🧠 **Adaptive FreqAI Machine Learning Pipeline (`LightGBMRegressor`)**:
  - Strategy: [`AggressiveFreqaiStrategy`](user_data/strategies/AggressiveFreqaiStrategy.py) combining quantitative indicators with LightGBM target predictions.
  - Fast retraining cycle (`live_retrain_hours: 2`, `expiration_hours: 12`) to stay adaptive to shifting market dynamics.
  - Scans 140+ technical indicators (RSI, MACD, Bollinger Bands, ATR Volatility, Volume, shifted multi-timeframes).
- ⚡ **Dynamic Market Scanner & Pair Selection**:
  - Automatically filters and ranks top volume USDT pairs on Gate.io Spot market every 60 seconds (`refresh_period: 60`).
  - Active dynamic whitelist capped at 8 pairs for lightweight execution, fast model retraining (~5 min), and high data density.
  - SOCKS5 proxy integration (`127.0.0.1:1080`) ensuring 100% stable execution without regional geo-blocking issues.
- 🕒 **Live WIB Real-Time Clock & Localized Timestamps**:
  - Live **WIB (Waktu Indonesia Barat / UTC+7)** clock badge updating every second on the top header.
  - All trade open/close timestamps and AI log events formatted in WIB (`Asia/Jakarta`).
- 🛡️ **Risk & Execution Control**:
  - `max_open_trades: 8` (allows concurrent trades across all dynamic pairs up to available balance) with `$1000 USDT` dry-run wallet.
  - Strict blacklist filtering out stablecoins (USDC, FDUSD, DAI, TUSD, BUSD) and leveraged tokens (/UP, /DOWN, /BEAR, /BULL, 3L, 3S).
- 💻📱 **Binance Pro Multi-Tab & Mobile Responsive Web UI**:
  - **Desktop (PC)**: Split-pane high data density layout with dark mode palette (`#0B0E11`, `#181A20`, `#0ECB81`, `#F6465D`).
  - **Mobile (HP)**: Binance Mobile App style sticky bottom navigation bar with touch-friendly controls.
  - **Multi-Tab Views**: Trading Console (Chart + Signal + Bot Controls), Active Positions & Slippage Analysis, FreqAI Model Metrics, and Market Scanner.

---

## 🏗️ System Architecture

```
+------------------------------------------------------------------+
|                    BINANCE PRO WEB UI DASHBOARD                  |
|  (Vite + React + TradingView Lightweight Charts + WIB Clock)     |
+---------------------------------+--------------------------------+
                                  | REST API / WebSocket Stream
                                  v
+------------------------------------------------------------------+
|                   FREQTRADE + FREQAI BACKEND ENGINE              |
|                                                                  |
|   [ Freqtrade Engine ] <-------> [ REST API Server (:8080) ]     |
|          | (Gate.io SOCKS5 Proxy)                                |
|          v                                                       |
|   [ FreqAI Module ]                                              |
|     - Model: LightGBMRegressor                                   |
|     - Strategy: AggressiveFreqaiStrategy                         |
|     - Pairlist: Dynamic VolumePairList (Top 8 Pairs, 60s)        |
|     - Features: RSI, MACD, BB, ATR, Volatility Pipeline          |
+------------------------------------------------------------------+
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Linux OS (Ubuntu 22.04 / 24.04 recommended)
- Python 3.12+
- Node.js 18+ & npm
- C Compiler (`build-essential`) & TA-Lib C Library

### 1. Clone Repository & Setup Virtual Environment
```bash
git clone https://github.com/ilhampradani8-bot/ai-trade-mij.git
cd ai-trade-mij

# Create Python Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
```

### 2. Install Dependencies & Strategy
```bash
# Clone and install Freqtrade with FreqAI modules
git clone https://github.com/freqtrade/freqtrade.git
pip install -e ./freqtrade[freqai]
pip install lightgbm
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### 4. Download Candle Data & Run Paper Trading Bot
```bash
# Download 15 days historical candle data for dynamic pairs
freqtrade download-data --config config.json --timeframe 5m 15m --days 15

# Start FreqAI LightGBM bot in Dry-Run mode
./run_bot.sh
# or manually:
freqtrade trade --config config.json --strategy AggressiveFreqaiStrategy --freqaimodel LightGBMRegressor --dry-run
```

### 5. Build & Serve Web UI Dashboard
```bash
cd web-ui
npm install
npm run build
```

---

## 📁 Repository Structure

```
├── config.json                        # Freqtrade & FreqAI configuration (Gate.io, LightGBM, 8 pairs, REST API)
├── run_bot.sh                         # Start script for AggressiveFreqaiStrategy + LightGBMRegressor
├── .env.example                       # Environment template for API keys
├── .gitignore                         # Credentials, data, and build artifacts exclusion
├── README.md                          # Project documentation
├── user_data/
│   └── strategies/
│       └── AggressiveFreqaiStrategy.py # FreqAI LightGBM Strategy
└── web-ui/                            # Custom Binance Pro Web UI Dashboard (Vite + React)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                    # Main App container & tab router
        ├── index.css                  # Binance Dark Mode CSS design system
        └── components/
            ├── Sidebar.jsx            # Desktop left sidebar / Mobile bottom nav
            ├── Header.jsx             # Top bar & coin chart dropdown selector
            ├── StatCards.jsx          # Metric strip (Balance, PnL, Active Positions, Win Rate)
            ├── TradingChart.jsx       # TradingView Lightweight Candlestick Chart & Signal Markers
            ├── OrderbookDepth.jsx     # Orderbook Queue & Slippage Calculator
            ├── PositionsTable.jsx     # Active Positions Table with Slippage % & USD Columns
            ├── ScannerTab.jsx         # Market Scanner Table
            └── AiInsightsTab.jsx      # FreqAI LightGBM Model parameters & metrics
```

---

## 🔒 Security & Privacy

- All private credentials (`.env`) and strategy rules (`AGENTS.md`) are strictly excluded from version control via `.gitignore`.
- Paper Trading (`"dry_run": true`) is enabled by default to prevent real capital exposure during testing.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
