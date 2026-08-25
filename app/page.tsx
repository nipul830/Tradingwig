export default function Home() {
  const markets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];

  return (
    <main className="terminal">
      <aside className="watchlist">
        <h1>Tradingwig</h1>
        <p className="muted">Market Watch</p>
        {markets.map((m) => (
          <div className="market" key={m}>{m}<span>--</span></div>
        ))}
      </aside>

      <section className="workspace">
        <header className="topbar">
          <b>BTC/USDT</b>
          <span>1m 5m 15m 1H 4H 1D</span>
          <div className="theme-toggle">☀️ Day &nbsp; 🌙 Night</div>
        </header>
        <div className="chart">Chart Workspace</div>
      </section>
    </main>
  );
}
