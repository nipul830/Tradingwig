"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
type Candle = { time: number; o: number; h: number; l: number; c: number; v: number };
type SymbolInfo = { symbol: string; name: string; binance: string; icon: string };

type Drawing = { type: "trend" | "horizontal" | "rectangle"; a: { x: number; y: number }; b: { x: number; y: number } };

const symbols: SymbolInfo[] = [
  { symbol: "BTCUSD", name: "Bitcoin / TetherUS", binance: "btcusdt", icon: "₿" },
  { symbol: "ETHUSD", name: "Ethereum / TetherUS", binance: "ethusdt", icon: "◆" },
  { symbol: "SOLUSD", name: "SOL / TetherUS", binance: "solusdt", icon: "S" },
  { symbol: "BNBUSD", name: "BNB / TetherUS", binance: "bnbusdt", icon: "B" },
  { symbol: "XRPUSD", name: "XRP / TetherUS", binance: "xrpusdt", icon: "X" },
];

const intervals: { value: Interval; label: string }[] = [
  { value: "1m", label: "1m" }, { value: "5m", label: "5m" }, { value: "15m", label: "15m" },
  { value: "1h", label: "1H" }, { value: "4h", label: "4H" }, { value: "1d", label: "1D" },
];

const DEFAULT_INTERVAL: Interval = "5m";
const MAX_CANDLES = 500;

function money(v: number, symbol: string) {
  if (!Number.isFinite(v)) return "—";
  if (symbol.includes("BTC")) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (v >= 1) return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function mapInterval(i: Interval) { return i; }

async function loadHistory(symbol: string, interval: Interval): Promise<Candle[]> {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${mapInterval(interval)}&limit=${MAX_CANDLES}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Market data HTTP ${res.status}`);
  const rows = await res.json();
  return rows.map((r: any[]) => ({ time: Number(r[0]), o: Number(r[1]), h: Number(r[2]), l: Number(r[3]), c: Number(r[4]), v: Number(r[5]) }));
}

function LiveChart({ symbol, interval, onConnection }: { symbol: SymbolInfo; interval: Interval; onConnection: (ok: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const raf = useRef<number | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const drag = useRef({ active: false, x: 0, offset: 0 });
  const view = useRef({ zoom: 1, offset: 0 });
  const [candles, setCandles] = useState<Candle[]>([]);
  const [error, setError] = useState("");

  const draw = useCallback(() => {
    const canvas = canvasRef.current, parent = parentRef.current;
    if (!canvas || !parent) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = parent.clientWidth, h = parent.clientHeight;
    if (w < 20 || h < 20) return;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    const x = canvas.getContext("2d"); if (!x) return;
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    x.fillStyle = "#08131b"; x.fillRect(0, 0, w, h);
    const left = 12, right = 78, top = 92, bottom = 44, volH = Math.max(55, h * .15), chartH = Math.max(100, h - top - bottom - volH), cw = w - left - right;
    const all = candlesRef.current; if (!all.length) { x.fillStyle = "#7e919d"; x.font = "14px system-ui"; x.fillText("Connecting to live market…", 18, 34); return; }
    const count = Math.max(28, Math.min(120, Math.round(82 / view.current.zoom)));
    const maxStart = Math.max(0, all.length - count);
    const start = Math.max(0, Math.min(maxStart, Math.round(view.current.offset)));
    const visible = all.slice(start, start + count);
    const hi = Math.max(...visible.map(c => c.h)), lo = Math.min(...visible.map(c => c.l)), range = hi - lo || 1;
    const py = (v: number) => top + (hi - v) / range * chartH;
    const gap = cw / visible.length, body = Math.max(3, gap * .58);

    x.strokeStyle = "#172731"; x.lineWidth = 1;
    for (let i = 0; i <= 6; i++) { const y = top + chartH * i / 6; x.beginPath(); x.moveTo(left, y); x.lineTo(left + cw, y); x.stroke(); }
    for (let i = 0; i <= 7; i++) { const xx = left + cw * i / 7; x.beginPath(); x.moveTo(xx, top); x.lineTo(xx, top + chartH); x.stroke(); }

    let vmax = Math.max(...visible.map(c => c.v), 1);
    visible.forEach((c, i) => {
      const xx = left + i * gap + gap / 2, up = c.c >= c.o;
      const col = up ? "#08d7a1" : "#ff5266";
      x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 1.1;
      x.beginPath(); x.moveTo(xx, py(c.h)); x.lineTo(xx, py(c.l)); x.stroke();
      x.fillRect(xx - body / 2, Math.min(py(c.o), py(c.c)), body, Math.max(2, Math.abs(py(c.c) - py(c.o))));
      const vh = (c.v / vmax) * volH * .85; x.globalAlpha = .55; x.fillRect(xx - body / 2, top + chartH + volH - vh, body, vh); x.globalAlpha = 1;
    });

    x.font = "12px system-ui"; x.fillStyle = "#7e919d";
    for (let i = 0; i <= 6; i++) x.fillText(money(hi - range * i / 6, symbol.symbol), left + cw + 8, top + chartH * i / 6 + 4);
    x.font = "600 17px system-ui"; x.fillStyle = "#edf5f7"; x.fillText(symbol.symbol, 18, 28);
    x.font = "600 12px system-ui"; x.fillStyle = "#20d7a7"; x.fillText("● LIVE", 94, 28);
    x.font = "600 27px system-ui"; x.fillStyle = "#f2f6f7"; x.fillText(money(visible[visible.length - 1].c, symbol.symbol), 18, 62);
    x.font = "12px system-ui"; x.fillStyle = "#20d7a7"; x.fillText(interval, 18, 82);
    x.fillStyle = "#71858f"; x.fillText("Volume", left, top + chartH + volH + 18);
  }, [interval, symbol.symbol]);

  useEffect(() => {
    let cancelled = false;
    setError(""); onConnection(false); candlesRef.current = []; setCandles([]); view.current.offset = 0;
    loadHistory(symbol.binance, interval).then(data => {
      if (cancelled) return;
      candlesRef.current = data; setCandles(data); onConnection(true);
      const stream = `${symbol.binance}@kline_${interval}`;
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`); socket.current = ws;
      ws.onopen = () => { if (!cancelled) { onConnection(true); setError(""); } };
      ws.onmessage = e => {
        if (cancelled) return;
        try {
          const k = JSON.parse(e.data).k;
          const next: Candle = { time: Number(k.t), o: Number(k.o), h: Number(k.h), l: Number(k.l), c: Number(k.c), v: Number(k.v) };
          const arr = candlesRef.current.slice();
          const idx = arr.findIndex(c => c.time === next.time);
          if (idx >= 0) arr[idx] = next; else arr.push(next);
          candlesRef.current = arr.slice(-MAX_CANDLES); setCandles(candlesRef.current);
        } catch {}
      };
      ws.onerror = () => { if (!cancelled) { onConnection(false); setError("Live stream disconnected"); } };
      ws.onclose = () => { if (!cancelled) onConnection(false); };
    }).catch(err => { if (!cancelled) { setError(err instanceof Error ? err.message : "Market data unavailable"); onConnection(false); } });
    return () => { cancelled = true; socket.current?.close(); socket.current = null; };
  }, [symbol.binance, interval, onConnection]);

  useEffect(() => { if (raf.current !== null) cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => { raf.current = null; draw(); }); return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); }; }, [candles, draw]);
  useEffect(() => { const ro = new ResizeObserver(() => draw()); if (parentRef.current) ro.observe(parentRef.current); return () => ro.disconnect(); }, [draw]);

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => { drag.current = { active: true, x: e.clientX, offset: view.current.offset }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!drag.current.active) return; const dx = e.clientX - drag.current.x; view.current.offset = Math.max(0, Math.min(Math.max(0, candlesRef.current.length - 28), drag.current.offset - dx / 8)); draw(); };
  const up = (e: React.PointerEvent<HTMLCanvasElement>) => { drag.current.active = false; e.currentTarget.releasePointerCapture?.(e.pointerId); };

  return <div ref={parentRef} className="chart-card" style={{ position: "relative" }}>
    <canvas ref={canvasRef} className="candle-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={e => { e.preventDefault(); view.current.zoom = Math.max(.55, Math.min(2.5, view.current.zoom + (e.deltaY < 0 ? .12 : -.12))); draw(); }} />
    {error && <div style={{ position: "absolute", top: 102, left: 18, fontSize: 12, color: "#ff5266" }}>{error}</div>}
  </div>;
}

function Watchlist({ active, onOpen }: { active: SymbolInfo; onOpen: (s: SymbolInfo) => void }) {
  const [quotes, setQuotes] = useState<Record<string, { price: number; change: number; pct: number }>>({});
  useEffect(() => {
    const streams = symbols.map(s => `${s.binance}@ticker`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = e => { try { const d = JSON.parse(e.data).data; const price = Number(d.c), open = Number(d.o); setQuotes(q => ({ ...q, [d.s.toLowerCase()]: { price, change: price - open, pct: ((price - open) / open) * 100 } })); } catch {} };
    return () => ws.close();
  }, []);
  return <section className="quotes">{symbols.map(item => { const q = quotes[item.binance]; const pct = q?.pct ?? 0; return <button className="quote-row" key={item.symbol} onClick={() => onOpen(item)}>
    <span className={`asset-icon ${item.symbol}`}>{item.icon}</span><span className="quote-main"><strong>{item.symbol}</strong><small>{item.name}</small></span>
    <span className="quote-values"><strong>{q ? money(q.price, item.symbol) : "…"}</strong><small className={pct >= 0 ? "up" : "down"}>{q ? `${q.change >= 0 ? "+" : ""}${money(q.change, item.symbol)} ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : "LIVE"}</small></span>
  </button>; })}</section>;
}

export default function Home() {
  const [page, setPage] = useState<"watchlist" | "chart">("watchlist");
  const [active, setActive] = useState<SymbolInfo>(symbols[0]);
  const [interval, setInterval] = useState<Interval>(DEFAULT_INTERVAL);
  const [connected, setConnected] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [layout, setLayout] = useState(1);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const onConnection = useCallback((ok: boolean) => setConnected(ok), []);
  const open = (s: SymbolInfo) => { setActive(s); setPage("chart"); setLayout(1); };
  const charts = useMemo(() => Array.from({ length: layout }, (_, i) => ({ ...active, interval: intervals[Math.min(i + intervals.findIndex(x => x.value === interval), intervals.length - 1)].value })), [active, interval, layout]);

  if (page === "watchlist") return <main className="mobile-app watchlist-page">
    <header className="watchlist-header"><button className="icon-button">•••</button><div className="tv-logo">T7</div><button className="icon-button search-icon">⌕</button></header>
    <div className="watchlist-tabs"><button className="hamburger">☰</button><button className="list-tab active">Live Market</button><button className="add-list">● {connected ? "Connected" : "Connecting"}</button></div>
    <Watchlist active={active} onOpen={open} /><button className="add-symbol">＋ Add Symbol</button>
    <nav className="bottom-nav"><button className="nav-item active"><span>▤</span><b>Watchlist</b></button><button className="nav-item" onClick={() => setPage("chart")}><span>⌁</span><b>Chart</b></button><button className="nav-item"><span>◈</span><b>Explore</b></button><button className="nav-item"><span>♧</span><b>Community</b></button><button className="nav-item"><span>☰</span><b>Menu</b></button></nav>
  </main>;

  return <main className="mobile-app chart-page">
    <section className={`chart-stage layout-${layout}`}>{charts.map((c, i) => <LiveChart key={`${c.binance}-${c.interval}-${i}`} symbol={c} interval={c.interval as Interval} onConnection={onConnection} />)}</section>
    <section className="chart-controls">
      <div className="tool-row">
        <button className={`tool-button ${toolsOpen ? "active" : ""}`} onClick={() => { setToolsOpen(!toolsOpen); setLayoutOpen(false); }}>✎</button>
        <button className="tool-button more" onClick={() => setDrawings([])}>↶</button>
      </div>
      {toolsOpen && <div className="tools-menu"><button onClick={() => setToolsOpen(false)}>Trend Line</button><button onClick={() => setToolsOpen(false)}>Horizontal Line</button><button onClick={() => setToolsOpen(false)}>Rectangle</button></div>}
      <div className="interval-row">{intervals.map(i => <button key={i.value} className={interval === i.value ? "selected" : ""} onClick={() => setInterval(i.value)}>{i.label}</button>)}</div>
      <div className="layout-row"><button className={`layout-button ${layoutOpen ? "active" : ""}`} onClick={() => { setLayoutOpen(!layoutOpen); setToolsOpen(false); }}>▦ <span>Layout</span></button></div>
      {layoutOpen && <div className="layout-menu">{[1, 2, 4].map(n => <button key={n} className={layout === n ? "selected" : ""} onClick={() => { setLayout(n); setLayoutOpen(false); }}>{n} Charts</button>)}</div>}
    </section>
    <nav className="bottom-nav"><button className="nav-item" onClick={() => setPage("watchlist")}><span>▤</span><b>Watchlist</b></button><button className="nav-item active"><span>⌁</span><b>Chart</b></button><button className="nav-item"><span>◈</span><b>Explore</b></button><button className="nav-item"><span>♧</span><b>Community</b></button><button className="nav-item"><span>☰</span><b>Menu</b></button></nav>
  </main>;
}
