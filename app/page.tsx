export default function Home() {
  return (
    <main className="terminal">
      <header className="topbar">
        <h1>Tradingwig</h1>
        <span>Market Terminal</span>
      </header>
      <section className="workspace">
        <aside className="watchlist">
          <h2>Watchlist</h2>
          {['BTC/USD','ETH/USD','SOL/USD','XAU/USD'].map((x)=>(
            <div className="asset" key={x}>{x}<b>--</b></div>
          ))}
        </aside>
        <div className="chart">
          <div className="chart-title">BTC/USD Chart</div>
          <div className="empty-chart">Chart Workspace</div>
        </div>
      </section>
    </main>
  );
}
