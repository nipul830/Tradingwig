export default function Home() {
  const markets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
  const points = [40, 55, 48, 70, 62, 85, 78, 100, 92];

  return (
    <main className="terminal">
      <aside className="watchlist">
        <h1>Tradingwig</h1>
        <p className="muted">Market Watch</p>
        {markets.map((m) => (
          <div className="market" key={m}>{m}<span>LIVE</span></div>
        ))}
      </aside>

      <section className="workspace">
        <header className="topbar">
          <b>BTC/USDT</b>
          <span>1m 5m 15m 1H 4H 1D</span>
          <div className="theme-toggle">☀️ Day &nbsp; 🌙 Night</div>
        </header>

        <div className="chart">
          <h2>BTC/USDT Chart</h2>
          <svg viewBox="0 0 500 220" width="100%" height="220">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              points={points.map((p, i) => `${i * 60},${220 - p * 1.8}`).join(' ')}
            />
          </svg>
        </div>
      </section>
    </main>
  );
}
