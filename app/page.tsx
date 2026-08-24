"use client";

import { useEffect, useMemo, useState } from "react";
import PineWorkspace from "./components/PineWorkspace";

type ChartConfig = { symbol: string; interval: string; label: string };

const defaultCharts: ChartConfig[] = [
  { symbol: "XAUUSD", interval: "5", label: "5m" },
  { symbol: "XAUUSD", interval: "15", label: "15m" },
  { symbol: "XAUUSD", interval: "60", label: "1H" },
  { symbol: "XAUUSD", interval: "240", label: "4H" },
];

const watchlist = ["XAUUSD", "BTCUSD", "EURUSD", "NAS100", "US30"];

function chartUrl(symbol: string, interval: string, index: number) {
  const params = new URLSearchParams({
    frameElementId: `tradingview_widget_${index}`,
    symbol: `OANDA:${symbol}`,
    interval,
    hide_side_toolbar: "0",
    allow_symbol_change: "1",
    save_image: "1",
    toolbarbg: "#131722",
    studies: "[]",
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    withdateranges: "1",
    hideideas: "1",
    hide_volume: "0",
    enable_publishing: "0",
    hide_top_toolbar: "0",
    hide_legend: "0",
  });
  return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
}

export default function Home() {
  const [charts, setCharts] = useState<ChartConfig[]>(defaultCharts);
  const [layout, setLayout] = useState(1);
  const [tab, setTab] = useState("Signals");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tradingwig-workspace-v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.charts) && parsed.charts.length >= 4) setCharts(parsed.charts);
        if ([1, 2, 4].includes(parsed.layout)) setLayout(parsed.layout);
      }
    } catch {
      // Keep clean defaults when saved workspace data is invalid.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("tradingwig-workspace-v2", JSON.stringify({ charts, layout }));
  }, [charts, layout, ready]);

  const visibleCharts = useMemo(() => charts.slice(0, layout), [charts, layout]);

  function updateSymbol(index: number, symbol: string) {
    const clean = symbol.toUpperCase().replace(/[^A-Z0-9._-]/g, "");
    setCharts((current) => current.map((chart, i) => (i === index ? { ...chart, symbol: clean } : chart)));
  }

  return (
    <main className="terminal">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">TW</span><span>Tradingwig</span></div>
        <div className="top-actions">
          <span className="status"><span className="dot" /> Market open</span>
          <button className="top-link" onClick={() => setTab("Webhooks")}>Webhooks</button>
          <button className="top-link" onClick={() => setTab("Pine Scripts")}>Pine</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="panel-title">Watchlist</div>
          {watchlist.map((symbol) => (
            <button
              key={symbol}
              className={`watch ${charts[0]?.symbol === symbol ? "active" : ""}`}
              onClick={() => {
                updateSymbol(0, symbol);
                setTab("Signals");
                setLayout(1);
              }}
            >
              <span>{symbol}</span>
            </button>
          ))}
        </aside>

        <section className="center">
          {tab === "Pine Scripts" ? (
            <PineWorkspace />
          ) : (
            <>
              <div className="toolbar">
                <div className="toolbar-group">
                  <span className="toolbar-label">Charts</span>
                  {[1, 2, 4].map((count) => (
                    <button
                      key={count}
                      className={`layout-btn ${layout === count ? "active" : ""}`}
                      onClick={() => setLayout(count)}
                      aria-label={`${count} chart layout`}
                    >
                      {count === 1 ? "1" : count === 2 ? "2" : "4"}
                    </button>
                  ))}
                </div>
                <div className="toolbar-spacer" />
                <button className="toolbar-link" onClick={() => setTab("Signals")}>Signals</button>
                <button className="toolbar-link" onClick={() => setTab("Logs")}>Logs</button>
                <button className="toolbar-link" onClick={() => setTab("Settings")}>Settings</button>
              </div>

              <div className={`charts layout-${layout}`}>
                {visibleCharts.map((chart, index) => (
                  <article className="chart-card" key={index}>
                    <iframe
                      className="chart-frame"
                      src={chartUrl(chart.symbol || "XAUUSD", chart.interval, index)}
                      title={`${chart.symbol} ${chart.label} TradingView chart`}
                      allowFullScreen
                    />
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className={`rightbar ${tab === "Signals" ? "signals-panel" : ""}`}>
          <div className="panel-title">{tab}</div>
          {tab === "Signals" && <>
            <div className="signal"><div className="signal-row"><span className="signal-buy">BUY</span><span className="muted">20:42</span></div><div className="signal-row"><span>XAUUSD</span><span className="muted">3375.20</span></div></div>
            <div className="signal"><div className="signal-row"><span className="signal-sell">SELL</span><span className="muted">20:31</span></div><div className="signal-row"><span>XAUUSD</span><span className="muted">3368.40</span></div></div>
          </>}
          {tab === "Webhooks" && <div className="signal"><div className="muted">TradingView endpoint</div><div className="endpoint">/api/webhook/tradingview</div></div>}
          {tab === "Logs" && <div className="signal"><div className="signal-row"><span>Webhook received</span><span className="muted">✓</span></div></div>}
          {tab === "Settings" && <div className="signal"><div className="signal-row"><span>Workspace</span><span className="muted">Saved</span></div></div>}
        </aside>
      </section>

      <footer className="bottom">
        <span>Tradingwig</span>
        <span className="bottom-separator">•</span>
        <span>TradingView charts</span>
        <span className="toolbar-spacer" />
        <span>UTC</span>
      </footer>
    </main>
  );
}
