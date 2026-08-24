# Tradingwig — Trading Terminal

Fresh MVP for a four-chart TradingView workspace.

## Current MVP

- 1 / 2 / 4 chart layouts
- Independent chart symbols
- TradingView chart embeds
- Signal panel UI
- Webhook panel placeholder
- Pine Script workspace placeholder
- Dark terminal UI

## Pine architecture

Pine Script execution remains in TradingView. The terminal is designed to store/manage scripts and receive TradingView webhook alerts rather than implementing a fake Pine compiler.

## Run locally

```bash
npm install
npm run dev
```
