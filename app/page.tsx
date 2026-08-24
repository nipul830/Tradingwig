"use client";

import { useMemo, useState } from "react";

type ChartConfig = { symbol: string; interval: string; label: string };
type Tool = "trend" | "horizontal" | "rectangle" | "fib" | null;
type Point = { x: number; y: number };
type Drawing = { type: Exclude<Tool, null>; a: Point; b: Point };

const symbols = [
  { symbol: "BTCUSD", name: "Bitcoin / TetherUS", price: "79,146.01", change: "+1,412.01", percent: "+1.82%", positive: true, icon: "₿" },
  { symbol: "SOLUSD", name: "SOL / TetherUS", price: "96.05", change: "+0.62", percent: "+0.65%", positive: true, icon: "S" },
  { symbol: "XAUUSD", name: "Gold Spot / U.S. Dollar", price: "4,654.08", change: "+51.095", percent: "+1.11%", positive: true, icon: "Au" },
  { symbol: "ETHUSD", name: "Ethereum / TetherUS", price: "2,480.28", change: "+16.87", percent: "+0.68%", positive: true, icon: "◆" },
  { symbol: "USDCHF", name: "U.S. Dollar / Swiss Franc", price: "0.8023", change: "+0.00099", percent: "+0.12%", positive: true, icon: "$" },
  { symbol: "EURUSD", name: "Euro / U.S. Dollar", price: "1.1663", change: "−0.00135", percent: "−0.12%", positive: false, icon: "€" },
  { symbol: "AUDUSD", name: "Australian Dollar / U.S. Dollar", price: "0.7149", change: "−0.00210", percent: "−0.29%", positive: false, icon: "A$" },
];
const intervals = [
  { interval: "1", label: "1m" }, { interval: "5", label: "5m" }, { interval: "15", label: "15m" },
  { interval: "60", label: "1H" }, { interval: "240", label: "4H" }, { interval: "D", label: "1D" },
];
const defaultCharts: ChartConfig[] = [
  { symbol: "XAUUSD", interval: "5", label: "5m" }, { symbol: "XAUUSD", interval: "15", label: "15m" },
  { symbol: "XAUUSD", interval: "60", label: "1H" }, { symbol: "XAUUSD", interval: "240", label: "4H" },
];
function chartUrl(symbol: string, interval: string, index: number) {
  const params = new URLSearchParams({ frameElementId: `tradingview_widget_${index}`, symbol: `OANDA:${symbol}`, interval, hide_side_toolbar: "1", allow_symbol_change: "1", save_image: "1", toolbarbg: "#ffffff", studies: "[]", theme: "light", style: "1", timezone: "Etc/UTC", withdateranges: "1", hideideas: "1", hide_volume: "0", enable_publishing: "0", hide_top_toolbar: "0", hide_legend: "0" });
  return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
}
function DrawingOverlay({ tool, drawings, onAdd }: { tool: Tool; drawings: Drawing[]; onAdd: (d: Drawing) => void }) {
  const [start, setStart] = useState<Point | null>(null);
  const point = (e: React.PointerEvent<SVGSVGElement>) => { const r = e.currentTarget.getBoundingClientRect(); return { x: e.clientX-r.left, y: e.clientY-r.top }; };
  const down = (e: React.PointerEvent<SVGSVGElement>) => { if (!tool) return; e.currentTarget.setPointerCapture(e.pointerId); const p=point(e); if(tool==="horizontal"){onAdd({type:tool,a:p,b:{x:e.currentTarget.getBoundingClientRect().width,y:p.y}});return;} setStart(p); };
  const up = (e: React.PointerEvent<SVGSVGElement>) => { if(!tool||!start||tool==="horizontal")return; onAdd({type:tool,a:start,b:point(e)});setStart(null); };
  return <svg className={`drawing-overlay ${tool?"drawing-active":""}`} onPointerDown={down} onPointerUp={up}>{drawings.map((d,i)=>{if(d.type==="horizontal")return <line key={i} x1={0} y1={d.a.y} x2="100%" y2={d.a.y} className="drawing-line"/>;if(d.type==="rectangle")return <rect key={i} x={Math.min(d.a.x,d.b.x)} y={Math.min(d.a.y,d.b.y)} width={Math.abs(d.b.x-d.a.x)} height={Math.abs(d.b.y-d.a.y)} className="drawing-rect"/>;if(d.type==="fib"){const levels=[0,.236,.382,.5,.618,1],y1=d.a.y,y2=d.b.y;return <g key={i}>{levels.map((n,j)=><line key={j} x1={Math.min(d.a.x,d.b.x)} x2={Math.max(d.a.x,d.b.x)} y1={y1+(y2-y1)*n} y2={y1+(y2-y1)*n} className="fib-line"/>)}</g>}return <line key={i} x1={d.a.x} y1={d.a.y} x2={d.b.x} y2={d.b.y} className="drawing-line"/>})}</svg>;
}
export default function Home(){
 const [page,setPage]=useState<"watchlist"|"chart">("watchlist");const [charts,setCharts]=useState<ChartConfig[]>(defaultCharts);const [layout,setLayout]=useState(1);const [toolsOpen,setToolsOpen]=useState(false);const [layoutOpen,setLayoutOpen]=useState(false);const [tool,setTool]=useState<Tool>(null);const [drawings,setDrawings]=useState<Record<number,Drawing[]>>({});const visibleCharts=useMemo(()=>charts.slice(0,layout),[charts,layout]);
 function openSymbol(symbol:string){setCharts(c=>c.map((x,i)=>i===0?{...x,symbol}:x));setLayout(1);setPage("chart")} function setInterval(index:number,interval:string,label:string){setCharts(c=>c.map((x,i)=>i===index?{...x,interval,label}:x))} function chooseTool(next:Tool){setTool(next);setToolsOpen(false)}
 if(page==="watchlist")return <main className="mobile-app watchlist-page"><header className="watchlist-header"><button className="icon-button">•••</button><div className="tv-logo">T7</div><button className="icon-button search-icon">⌕</button></header><div className="watchlist-tabs"><button className="hamburger">☰</button><button className="list-tab active">Watchlist</button><button className="add-list">＋ Add list</button></div><section className="quotes">{symbols.map(item=><button className="quote-row" key={item.symbol} onClick={()=>openSymbol(item.symbol)}><span className={`asset-icon ${item.symbol}`}>{item.icon}</span><span className="quote-main"><strong>{item.symbol}</strong><small>{item.name}</small></span><span className="quote-values"><strong>{item.price}</strong><small className={item.positive?"up":"down"}>{item.change} {item.percent}</small></span></button>)}</section><button className="add-symbol">＋ Add Symbol</button><nav className="bottom-nav"><button className="nav-item active"><span>▤</span><b>Watchlist</b></button><button className="nav-item" onClick={()=>setPage("chart")}><span>⌁</span><b>Chart</b></button><button className="nav-item"><span>◈</span><b>Explore</b></button><button className="nav-item"><span>♧</span><b>Community</b></button><button className="nav-item"><span>☰</span><b>Menu</b></button></nav></main>;
 return <main className="mobile-app chart-page"><section className={`chart-stage layout-${layout}`}>{visibleCharts.map((chart,index)=><article className="chart-card" key={index}><iframe className="chart-frame" src={chartUrl(chart.symbol,chart.interval,index)} title={`${chart.symbol} ${chart.label} TradingView chart`} allowFullScreen/><DrawingOverlay tool={index===0?tool:null} drawings={drawings[index]||[]} onAdd={d=>setDrawings(v=>({...v,[index]:[...(v[index]||[]),d]}))}/></article>)}</section><section className="chart-controls"><div className="chart-symbol-strip"><button className="control-symbol" onClick={()=>setPage("watchlist")}>‹</button><button className="control-symbol selected">{charts[0].symbol}</button>{intervals.map(item=><button key={item.interval} className={`control-timeframe ${charts[0].interval===item.interval?"selected":""}`} onClick={()=>setInterval(0,item.interval,item.label)}>{item.label}</button>)}</div><div className="tool-row"><button className={`tool-button ${toolsOpen||tool?"active":""}`} onClick={()=>{setToolsOpen(!toolsOpen);setLayoutOpen(false)}}>✎</button><button className="tool-button">⌁</button><button className="tool-button more" onClick={()=>setTool(null)}>•••</button><button className="tool-button" onClick={()=>setDrawings({})}>↶</button></div>{toolsOpen&&<div className="tools-menu"><button onClick={()=>chooseTool("trend")}>Trend Line</button><button onClick={()=>chooseTool("horizontal")}>Horizontal Line</button><button onClick={()=>chooseTool("rectangle")}>Rectangle</button><button onClick={()=>chooseTool("fib")}>Fib Retracement</button></div>}<div className="layout-row"><button className={`layout-button ${layoutOpen?"active":""}`} onClick={()=>{setLayoutOpen(!layoutOpen);setToolsOpen(false)}}>▦ <span>Layout</span></button></div>{layoutOpen&&<div className="layout-menu">{[1,2,4].map(count=><button key={count} className={layout===count?"selected":""} onClick={()=>{setLayout(count);setLayoutOpen(false)}}>{count} Charts</button>)}</div>}</section><nav className="bottom-nav"><button className="nav-item" onClick={()=>setPage("watchlist")}><span>▤</span><b>Watchlist</b></button><button className="nav-item active"><span>⌁</span><b>Chart</b></button><button className="nav-item"><span>◈</span><b>Explore</b></button><button className="nav-item"><span>♧</span><b>Community</b></button><button className="nav-item"><span>☰</span><b>Menu</b></button></nav></main>;
}
