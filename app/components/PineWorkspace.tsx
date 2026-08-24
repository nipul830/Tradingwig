"use client";

import { useEffect, useMemo, useState } from "react";

type PineScript = { id: string; name: string; code: string; updatedAt: number };

const STORAGE_KEY = "tradingwig-pine-scripts";

const starterCode = `//@version=6
indicator("Tradingwig Signal", overlay=true)

fast = ta.ema(close, 9)
slow = ta.ema(close, 21)

buy = ta.crossover(fast, slow)
sell = ta.crossunder(fast, slow)

plot(fast, "Fast EMA")
plot(slow, "Slow EMA")
plotshape(buy, title="BUY", style=shape.labelup, text="BUY", location=location.belowbar)
plotshape(sell, title="SELL", style=shape.labeldown, text="SELL", location=location.abovebar)

alertcondition(buy, "BUY", '{"action":"BUY","symbol":"{{ticker}}","price":"{{close}}"}')
alertcondition(sell, "SELL", '{"action":"SELL","symbol":"{{ticker}}","price":"{{close}}"}')
`;

function makeScript(name = "New Signal") : PineScript {
  return { id: crypto.randomUUID(), name, code: starterCode, updatedAt: Date.now() };
}

export default function PineWorkspace() {
  const [scripts, setScripts] = useState<PineScript[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saved, setSaved] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) {
        setScripts(parsed);
        setSelectedId(parsed[0].id);
      } else {
        const first = makeScript("Tradingwig Signal");
        setScripts([first]);
        setSelectedId(first.id);
      }
    } catch {
      const first = makeScript("Tradingwig Signal");
      setScripts([first]);
      setSelectedId(first.id);
    } finally {
      setReady(true);
    }
  }, []);

  const selected = useMemo(() => scripts.find((script) => script.id === selectedId) ?? scripts[0], [scripts, selectedId]);

  useEffect(() => {
    if (!ready || !scripts.length) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  }, [scripts, ready]);

  function updateSelected(patch: Partial<PineScript>) {
    if (!selected) return;
    setSaved(false);
    setScripts((current) => current.map((script) => script.id === selected.id ? { ...script, ...patch, updatedAt: Date.now() } : script));
  }

  function save() {
    if (!selected) return;
    setScripts((current) => current.map((script) => script.id === selected.id ? { ...script, updatedAt: Date.now() } : script));
    setSaved(true);
  }

  function createScript() {
    const next = makeScript(`Signal ${scripts.length + 1}`);
    setScripts((current) => [...current, next]);
    setSelectedId(next.id);
    setSaved(true);
  }

  function deleteSelected() {
    if (!selected || scripts.length === 1) return;
    const remaining = scripts.filter((script) => script.id !== selected.id);
    setScripts(remaining);
    setSelectedId(remaining[0].id);
    setSaved(true);
  }

  return (
    <section className="pine-workspace">
      <div className="pine-toolbar">
        <div>
          <div className="pine-title">Pine Script Editor</div>
          <div className="pine-subtitle">Store and manage scripts locally. Execution happens in TradingView.</div>
        </div>
        <div className="pine-actions">
          <button className="btn" onClick={createScript}>+ New</button>
          <button className="btn" onClick={deleteSelected} disabled={!selected || scripts.length === 1}>Delete</button>
          <button className="btn primary" onClick={save} disabled={saved}>Save</button>
        </div>
      </div>

      <div className="pine-body">
        <aside className="pine-list">
          <div className="panel-title">Scripts</div>
          {scripts.map((script) => (
            <button key={script.id} className={`pine-script-item ${selected?.id === script.id ? "active" : ""}`} onClick={() => { setSelectedId(script.id); setSaved(true); }}>
              <span>{script.name || "Untitled"}</span>
              <small>{new Date(script.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
            </button>
          ))}
        </aside>

        <div className="pine-editor-area">
          {selected && <>
            <div className="pine-name-row">
              <input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} placeholder="Script name" />
              <span className={saved ? "save-state" : "save-state dirty"}>{saved ? "Saved locally" : "Unsaved changes"}</span>
            </div>
            <textarea
              className="pine-editor"
              spellCheck={false}
              value={selected.code}
              onChange={(event) => updateSelected({ code: event.target.value })}
              aria-label="Pine Script editor"
            />
            <div className="pine-footer">
              <span>Pine Script v6</span>
              <span>Tip: create an alert in TradingView and point it to the Tradingwig webhook endpoint.</span>
            </div>
          </>}
        </div>
      </div>
    </section>
  );
}
