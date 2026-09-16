# 🤖 FreqAI Pro Trading Engine & Binance Web Dashboard

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![Freqtrade](https://img.shields.io/badge/Freqtrade-2026.8-green?logo=bitcoin)](https://www.freqtrade.io)
[![Reinforcement Learning](https://img.shields.io/badge/Stable--Baselines3-PPO%20%2F%20SAC-gold)](https://stable-baselines3.readthedocs.io)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An end-to-end automated cryptocurrency algorithmic trading system powered by **Freqtrade** and **FreqAI** with **Stable-Baselines3 Reinforcement Learning (PPO/SAC)**, accompanied by a custom-built, ultra-dense, multi-tab **Binance Pro Web UI Dashboard**.

🔗 **Live Public Demo**: [https://ai-trade.mijdigital.my](https://ai-trade.mijdigital.my)

---

## ✨ Key Features

- 🧠 **Adaptive Reinforcement Learning (Stable-Baselines3)**:
  - Employs **PPO (Proximal Policy Optimization)** and **SAC (Soft Actor-Critic)** agent models for adaptive decision making (`Buy`, `Sell`, `Hold`).
  - Feature engineering pipeline incorporating RSI, MFI, EMA Ratio, Bollinger Bands Width, and ATR Volatility across multi-timeframe candles (`5m` & `15m`).
- ⚡ **Resource Optimized (2 CPU Cores)**:
  - Constrained to max 2 CPU cores (`"max_cpu_count": 2`) for training and inference, ensuring zero system lagging and ultra-low execution latency.
- 🛡️ **Realistic Fee & Slippage Penalty Modeling**:
  - Incorporates trading fees (0.075%) and slippage penalties (0.05%) directly into the RL *Reward Function*, forcing the AI agent to execute only high-probability trades that exceed real market transaction costs.
- 📊 **Binance Live Orderbook Queue (100ms Stream)**:
  - Connects directly to Binance High-Speed WebSockets (`@depth5` 100ms stream) to visualize bid/ask orderbook depth and calculate real-time estimated execution slippage.
- 🔍 **Top 30 Market Scanner**:
  - Scans top 30 highest-volume USDT pairs (BTC, ETH, SOL, BNB, XRP, ADA, NEAR, etc.) with real-time price tracking and FreqAI signal scoring.
- 💻📱 **Binance Pro Multi-Tab & Mobile Responsive Web UI**:
  - **Desktop (PC)**: Frozen fixed left sidebar navigation with dense, compact split-pane panels.
  - **Mobile (HP)**: Binance Mobile App style sticky bottom navigation bar with smooth touch-scrolling data tables.
  - **Multi-Tab Views**: Trading Console, Active Positions & Slippage Analysis, FreqAI SB3 Insights, and Top 30 Market Scanner.

---

## 🏗️ System Architecture

```
+------------------------------------------------------------------+
|                    BINANCE PRO WEB UI DASHBOARD                  |
|  (Vite + React + TradingView Lightweight Charts + Mobile Nav)    |
+---------------------------------+--------------------------------+
                                  | REST API / 100ms WebSocket
                                  v
+------------------------------------------------------------------+
|                   FREQTRADE + FREQAI BACKEND ENGINE              |
|                                                                  |
|   [ Freqtrade Engine ] <-------> [ REST API Server (:8080) ]     |
|          |                                                       |
|          v                                                       |
|   [ FreqAI Module ]                                              |
|     - Model: Stable-Baselines3 (PPO / SAC RL Engine)             |
|     - CPU Allocation: max_cpu_count = 2                          |
|     - Features: RSI, EMA, MFI, ATR, Volatility Pipeline          |
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
# Clone and install Freqtrade with FreqAI RL modules
git clone https://github.com/freqtrade/freqtrade.git
pip install -e ./freqtrade[freqai,freqai-rl]
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### 4. Download Candle Data & Run Paper Trading Bot
```bash
# Download 15 days historical candle data for 30 pairs
freqtrade download-data --config config.json --timeframe 5m 15m --days 15

# Start FreqAI Reinforcement Learning bot in Dry-Run mode
freqtrade trade --config config.json --strategy FreqaiReinforcementStrategy --freqaimodel ReinforcementLearner --dry-run
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
├── config.json                        # Freqtrade & FreqAI configuration (30 pairs, 2 cores, REST API)
├── .env.example                       # Environment template for API keys
├── .gitignore                         # Credentials, data, and build artifacts exclusion
├── README.md                          # Project documentation
├── user_data/
│   └── strategies/
│       └── FreqaiReinforcementStrategy.py  # FreqAI SB3 Reinforcement Learning strategy
└── web-ui/                            # Custom Binance Pro Web UI Dashboard (Vite + React)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                    # Main App container & tab router
        ├── index.css                  # Binance Dark Mode CSS design system
        └── components/
            ├── Sidebar.jsx            # Desktop left frozen sidebar / Mobile bottom nav
            ├── Header.jsx             # Top bar & coin chart dropdown selector
            ├── StatCards.jsx          # Metric strip (Balance, PnL, Active Positions, Win Rate)
            ├── TradingChart.jsx       # TradingView Lightweight Candlestick Chart & Signal Markers
            ├── OrderbookDepth.jsx     # Binance 100ms WebSocket Orderbook Queue & Slippage Calculator
            ├── PositionsTable.jsx     # Active Positions Table with Slippage % & USD Columns
            ├── ScannerTab.jsx         # Top 30 Market Scanner Table
            └── AiInsightsTab.jsx      # FreqAI SB3 Model parameters & feature weights
```

---

## 🔒 Security & Privacy

- All private credentials (`.env`) and strategy rules (`AGENTS.md`) are strictly excluded from version control via `.gitignore`.
- Paper Trading (`"dry_run": true`) is enabled by default to prevent real capital exposure during testing.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
