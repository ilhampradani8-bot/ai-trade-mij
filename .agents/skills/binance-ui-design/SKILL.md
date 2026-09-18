---
name: binance-ui-design
description: >-
  Standardized guidelines and CSS color system for building a dense, high-frequency,
  100% real-time Binance Pro style trading console interface.
---

# Binance Pro Dense Multi-Tab Interface Design System

This skill defines the exact design tokens, component standards, typography, and density rules for creating authentic **Binance Pro Trading Console** web interfaces.

---

## 0. Fundamental Rule: 100% Live Dynamic Data (Zero Static Mocking)
- **100% Dynamic & Live**: Every price, ticker, orderbook queue, balance, position, slippage metric, win rate, and log **MUST be connected to live real-time API endpoints** (`/api/v1/*` or exchange REST/WS streams).
- **No Mock / Static Fallbacks**: Never use hardcoded arrays, fallback static numbers, or mock data. If an API is offline, display clean loading / reconnecting states instead of static fake numbers.

---

## 1. Color Palette Tokens (Binance Pro Dark Theme)

| Token Name | Hex Code | Purpose / Application |
| :--- | :--- | :--- |
| `--binance-bg` | `#0B0E11` | Main background of the entire app viewport |
| `--binance-card` | `#181A20` | Panels, cards, sidebars, and table bodies |
| `--binance-header` | `#2B313A` | Table headers, pane titlebars, section dividers |
| `--binance-border` | `#2B313A` | Subtle 1px borders dividing panels and grid rows |
| `--binance-green` | `#0ECB81` | Buy buttons, profit numbers (+PnL), bullish indicators |
| `--binance-red` | `#F6465D` | Sell buttons, loss numbers (-PnL), bearish indicators |
| `--binance-yellow` | `#F0B90B` | Binance Gold accents, active tab borders, highlights |
| `--binance-blue` | `#1E88E5` | Info badges, order type indicators |
| `--binance-text` | `#EAECEF` | Primary text, active labels, high-visibility numbers |
| `--binance-text-muted` | `#848E9C` | Secondary labels, table column headers, metadata |

---

## 2. Typography & Information Density
- **Font Stack**: System UI or Inter (`'Inter', system-ui, sans-serif`).
- **Monospaced Data**: Use Monospace font stack (`'Roboto Mono', 'SF Mono', Consolas, monospace`) for all prices, quantities, PnL percentages, timestamps, and orderbook rates to maintain column alignment.
- **Padding & Margins**: Minimize whitespace (4px to 8px padding inside table cells and panel headers) to maximize data visible per screen height.

---

## 3. Key UI Components Structure

### A. Compact Header & Stat Strip
- Displays simulation wallet balance ($USDT), active open position slots (e.g. 4 max trades), total realized PnL, and live FreqAI model win rate in a horizontal split bar.

### B. Dense Multi-Tab Navigation
- **Trading Console**: Active positions grid & Orderbook Queue real-time depth.
- **Positions & Slippage**: Detailed table with **Slippage (%)** and **Est. Slippage ($)** columns.
- **Trade History**: Execution log of all completed trades with buy/sell rates and net profit.
- **Top 30 Market Scanner**: Real-time ticker list sorted by 24h quote volume.
- **AI Model Insights**: Model hyperparameter specs & feature importance metrics.

### C. Orderbook Depth Queue
- High-contrast green (Bids) and red (Asks) rows with subtle background volume depth bars (`rgba(14, 203, 129, 0.15)` for bids, `rgba(246, 70, 93, 0.15)` for asks).

---

## 4. Mobile & Desktop Responsiveness
- **Desktop (PC)**: High-density multi-column grid layout where key metrics are visible without scrolling.
- **Mobile (HP)**: Sticky bottom navigation bar with compact touch-friendly targets and 1-column responsive layout.
