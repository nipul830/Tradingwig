"use client";

import { useMemo, useState } from "react";

type ChartConfig = { symbol: string; interval: string; label: string };

const symbols = [
  { symbol: "BTCUSD", name: "Bitcoin / U.S. Dollar", price: "79,146.01", change: "+1,412.01", percent: "+1.82%", positive: true, icon: "₿" },
  { symbol: "SOLUSD", name: "SOL / U.S. Dollar", price: "96.05", change: "+0.62", percent: "+0.65%", positive: true, icon: "S" },
  { symbol: "XAUUSD", name: "Gold Spot / U.S. Dollar", price: "4,654.08", change: "+51.095", percent: "+1.11%", positive: true, icon: "Au" },
  { symbol: "ETHUSD", name: "Ethereum / U.S. Dollar", price: "2,480.28", change: "+16.87", percent: "+0.68%", positive: true, icon: "◆" },
  { symbol: "USDCHF", name: "U.S. Dollar / Swiss Franc", price: "0.8023", change: "+0.00099", percent: "+0.12%", positive: true, icon: "$" },
  { symbol: "EURUSD", name: "Euro / U.S. Dollar", price: "1.1663", change: "−0.00135", percent: "−0.12%", positive: false, icon: "€" },
  { symbol: "AUDUSD", name: "Australian Dollar / U.S. Dollar", price: "0.7149", change: "−0.00210", percent: "−0.29%", positive: false, icon: "A$" },
];

const intervals = [
  { interval: "1", label: "1m" },
  { interval: "5", label: "5m" },
  { interval: "15", label: "15m" },
  { interval: "60", label: "1H" },
  { interval: "240", label: "4H" },
  { interval: "D", label: "1D" },
];

const defaultCharts: ChartConfig[] = [
  { symbol: "XAUUSD", interval: "5", label: "5m" },
  { symbol: "XAUUSD", interval: "15", label: "15m" },
  { symbol: "XAUUSD", interval: "60", label: "1H" },
  { symbol: "XAUUSD", interval: "240", label: "4H" },
];

function chartUrl(symbol: string, interval: string, index: number) {
  const params = new URLSearchParams({
    frameElementId: `tradingview_widget_${index}`,
    symbol: `OANDA:${symbol}`,
    interval,
    hide_side_toolbar: "0",
    allow_symbol_change: "1",
    save_image: "1",
    toolbarbg: "#ffffff",
    studies: "[]",
    theme: "light",
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
  const [page, setPage] = useState<"watchlist" | "chart">("watchlist");
  const [charts, setCharts] = useState<ChartConfig[]>(defaultCharts);
  const [layout, setLayout] = useState(1);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);

  const visibleCharts = useMemo(() => charts.slice(0, layout), [charts, layout]);

  function openSymbol(symbol: string) {
    setCharts((current) => current.map((chart, i) => (i === 0 ? { ...chart, symbol } : chart)));
    setLayout(1);
    setPage("chart");
  }

  function setInterval(index: number, interval: string, label: string) {
    setCharts((current) => current.map((chart, i) => (i === index ? { ...chart, interval, label } : chart)));
  }

  if (page === "watchlist") {
    return (
      <main className="mobile-app watchlist-page">
        <header className="watchlist-header">
          <button className="icon-button" aria-label="Menu">•••</button>
          <div className="tv-logo">T7</div>
          <button className="icon-button search-icon" aria-label="Search">⌕</button>
        </header>
        <div className="watchlist-tabs">
          <button className="hamburger" aria-label="Open menu">☰</button>
          <button className="list-tab active">Watchlist</button>
          <button className="add-list">＋ Add list</button>
        </div>
        <section className="quotes">
          {symbols.map((item) => (
            <button className="quote-row" key={item.symbol} onClick={() => openSymbol(item.symbol)}>
              <span className={`asset-icon ${item.symbol}`}>{item.icon}</span>
              <span className="quote-main">
                <strong>{item.symbol}</strong>
                <small>{item.name}</small>
              </span>
              <span className="quote-values">
                <strong>{item.price}</strong>
                <small className={item.positive ? "up" : "down"}>{item.change} {item.percent}</small>
              </span>
            </button>
          ))}
        </section>
        <button className="add-symbol">＋ Add Symbol</button>
        <nav className="bottom-nav">
          <button className="nav-item active"><span>▤</span><b>Watchlist</b></button>
          <button className="nav-item" onClick={() => setPage("chart")}><span>⌁</span><b>Chart</b></button>
          <button className="nav-item"><span>◈</span><b>Explore</b></button>
          <button className="nav-item"><span>♧</span><b>Community</b></button>
          <button className="nav-item"><span>☰</span><b>Menu</b></button>
        </nav>
      </main>
    );
  }

  return (
    <main className="mobile-app chart-page">
      <section className={`chart-stage layout-${layout}`}>
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
      </section>

      <section className="chart-controls">
        <div className="chart-symbol-strip">
          <button className="control-symbol" onClick={() => setPage("watchlist")}>‹</button>
          <button className="control-symbol selected">{charts[0].symbol}</button>
          {intervals.map((item) => (
            <button
              key={item.interval}
              className={`control-timeframe ${charts[0].interval === item.interval ? "selected" : ""}`}
              onClick={() => setInterval(0, item.interval, item.label)}
            >{item.label}</button>
          ))}
        </div>
        <div className="tool-row">
          <button className={`tool-button ${toolsOpen ? "active" : ""}`} onClick={() => { setToolsOpen(!toolsOpen); setLayoutOpen(false); }} aria-label="Drawing tools">✎</button>
          <button className="tool-button" aria-label="Magnet">⌁</button>
          <button className="tool-button more" aria-label="More tools">•••</button>
          <button className="tool-button" aria-label="Undo">↶</button>
          <div className="tool-spacer" />
          <button className={`layout-button ${layoutOpen ? "active" : ""}`} onClick={() => { setLayoutOpen(!layoutOpen); setToolsOpen(false); }} aria-label="Chart layout">▦</button>
        </div>
        {toolsOpen && (
          <div className="tools-menu">
            <button>Trend Line</button><button>Horizontal Line</button><button>Rectangle</button><button>Fib Retracement</button>
          </div>
        )}
        {layoutOpen && (
          <div className="layout-menu">
            {[1, 2, 4].map((count) => <button key={count} className={layout === count ? "selected" : ""} onClick={() => { setLayout(count); setLayoutOpen(false); }}>{count} Chart{count > 1 ? "s" : ""}</button>)}
          </div>
        )}
      </section>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => setPage("watchlist")}><span>▤</span><b>Watchlist</b></button>
        <button className="nav-item active"><span>⌁</span><b>Chart</b></button>
        <button className="nav-item"><span>◈</span><b>Explore</b></button>
        <button className="nav-item"><span>♧</span><b>Community</b></button>
        <button className="nav-item"><span>☰</span><b>Menu</b></button>
      </nav>
    </main>
  );
}
