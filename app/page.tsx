"use client";

import { useMemo, useState } from "react";

const initialCharts = [
  { symbol: "XAUUSD", interval: "5", label: "5m" },
  { symbol: "XAUUSD", interval: "15", label: "15m" },
  { symbol: "XAUUSD", interval: "60", label: "1H" },
  { symbol: "XAUUSD", interval: "240", label: "4H" },
];

function chartUrl(symbol: string, interval: string) {
  const query = new URLSearchParams({
    symbol: `OANDA:${symbol}`,
    interval,
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    locale: "en",
    withdateranges: "true",
    hide_side_toolbar: "false",
    allow_symbol_change: "true",
    save_image: "false",
    hideideas: "1",
  });
  return `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(`OANDA:${symbol}`)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=%230b0e12&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1`;
}

export default function Home() {
  const [charts, setCharts] = useState(initialCharts);
  const [layout, setLayout] = useState(4);
  const [tab, setTab] = useState("Signals");

  const visibleCharts = useMemo(() => charts.slice(0, layout), [charts, layout]);

  function updateSymbol(index: number, symbol: string) {
    setCharts((current) => current.map((chart, i) => (i === index ? { ...chart, symbol } : chart)));
  }

  return (
    <main className="terminal">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">TW</span><span>Tradingwig</span></div>
        <div className="top-actions">
          <span className="status"><span className="dot" /> Webhook ready</span>
          <button className="btn" onClick={() => setTab("Webhooks")}>Webhook</button>
          <button className="btn" onClick={() => setTab("Pine Scripts")}>Pine Scripts</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="panel-title">Watchlist</div>
          {["XAUUSD", "BTCUSD", "EURUSD", "NAS100", "US30"].map((symbol, index) => (
            <button key={symbol} className={`watch ${index === 0 ? "active" : ""}`} onClick={() => updateSymbol(0, symbol)}>
              <span>{symbol}</span><small>{index === 0 ? "Gold" : ""}</small>
            </button>
          ))}
          <div className="panel-title" style={{ marginTop: 24 }}>Workspace</div>
          <button className="watch" onClick={() => setTab("Pine Scripts")}>Pine Scripts <small>→</small></button>
          <button className="watch" onClick={() => setTab("Webhooks")}>Webhooks <small>→</small></button>
          <button className="watch" onClick={() => setTab("Logs")}>Logs <small>→</small></button>
        </aside>

        <section className="center">
          <div className="toolbar">
            <span className="layout-label">Layout</span>
            {[1, 2, 4].map((count) => (
              <button key={count} className={`layout-btn ${layout === count ? "active" : ""}`} onClick={() => setLayout(count)} aria-label={`${count} chart layout`}>
                {count === 1 ? "□" : count === 2 ? "▥" : "⊞"}
              </button>
            ))}
            <div className="spacer" />
            <button className="btn" onClick={() => setTab("Settings")}>Settings</button>
          </div>

          <div className="charts">
            {visibleCharts.map((chart, index) => (
              <article className="chart-card" key={index}>
                <div className="chart-head">
                  <span className="chart-symbol">{chart.symbol}</span>
                  <span className="chart-time">{chart.label}</span>
                  <span className="chart-actions">TradingView</span>
                </div>
                <iframe
                  className="chart-frame"
                  src={chartUrl(chart.symbol, chart.interval)}
                  title={`${chart.symbol} ${chart.label} TradingView chart`}
                  allowFullScreen
                />
              </article>
            ))}
          </div>
        </section>

        <aside className="rightbar">
          <div className="panel-title">{tab}</div>
          {tab === "Signals" && <>
            <div className="signal"><div className="signal-row"><span className="signal-buy">BUY</span><span className="muted">20:42:16</span></div><div className="signal-row"><span>XAUUSD</span><span className="muted">3375.20</span></div></div>
            <div className="signal"><div className="signal-row"><span className="signal-sell">SELL</span><span className="muted">20:31:04</span></div><div className="signal-row"><span>XAUUSD</span><span className="muted">3368.40</span></div></div>
            <div className="signal"><div className="signal-row"><span className="signal-buy">BUY</span><span className="muted">20:14:22</span></div><div className="signal-row"><span>BTCUSD</span><span className="muted">116240</span></div></div>
          </>}
          {tab === "Webhooks" && <div className="signal"><div className="muted">Endpoint</div><div style={{ marginTop: 7, wordBreak: "break-all" }}>https://your-domain/api/webhook/tradingview</div><div className="muted" style={{ marginTop: 12 }}>Secret validation: enabled</div></div>}
          {tab === "Pine Scripts" && <div className="signal"><div style={{ fontWeight: 700 }}>Pine Script workspace</div><div className="muted" style={{ marginTop: 7 }}>Scripts will be stored here. Execution remains in TradingView.</div></div>}
          {tab === "Logs" && <div className="signal"><div className="signal-row"><span>Webhook received</span><span className="muted">✓</span></div><div className="signal-row" style={{ marginTop: 9 }}><span>Validation</span><span className="muted">✓</span></div></div>}
          {tab === "Settings" && <div className="signal"><div style={{ fontWeight: 700 }}>Workspace settings</div><div className="muted" style={{ marginTop: 7 }}>Chart layout persistence and symbol sync will be added next.</div></div>}
        </aside>
      </section>

      <footer className="bottom">
        <button className="btn" onClick={() => setTab("Signals")}>Signals</button>
        <button className="btn" onClick={() => setTab("Webhooks")}>Webhooks</button>
        <button className="btn" onClick={() => setTab("Pine Scripts")}>Pine Scripts</button>
        <button className="btn" onClick={() => setTab("Logs")}>Logs</button>
        <span className="spacer" />
        <span>Tradingwig MVP • TradingView integration</span>
      </footer>
    </main>
  );
}
