import { useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";
import Chat from "./Chat";
import Firmware from "./Firmware";
import CostChart from "./CostChart";
import CategorySelector, { CATEGORIES } from "./CategorySelector";
import Viewer3D from "./Viewer3D";

var COLORS = ["#00e5ff","#00ff88","#ff6b6b","#ffd93d","#a78bfa","#ff9a3c","#ff6eb4","#7eb8ff"];

function ComponentCard({ c, index, selected, onSelect, onRefine }) {
  var url = "https://www.amazon.com/s?k=" + encodeURIComponent(c.search_query);
  var [refineMode, setRefineMode] = useState(false);
  var [refineText, setRefineText] = useState("");
  var [refining, setRefining] = useState(false);

  var submitRefine = function() {
    if (!refineText.trim()) return;
    setRefining(true);
    onRefine(index, refineText, function() {
      setRefining(false);
      setRefineMode(false);
      setRefineText("");
    });
  };

  return (
    <div
      className={"component-card" + (selected ? " selected" : "")}
      onClick={function() { onSelect(index); }}
    >
      <div className="comp-dot" style={{ background: COLORS[index % COLORS.length] }} />
      <div className="comp-name">{c.name}</div>
      <div className="comp-purpose">{c.purpose}</div>
      <div className="comp-footer">
        <span className="comp-price">${c.estimated_price_usd}</span>
        <a href={url} target="_blank" rel="noreferrer" className="comp-link"
          onClick={function(e) { e.stopPropagation(); }}>
          Amazon
        </a>
      </div>
      {!refineMode && (
        <button className="refine-btn"
          onClick={function(e) { e.stopPropagation(); setRefineMode(true); }}>
          Refine with AI
        </button>
      )}
      {refineMode && (
        <div className="refine-input-wrap" onClick={function(e) { e.stopPropagation(); }}>
          <input
            className="refine-input"
            placeholder="e.g. cheaper, use LiDAR..."
            value={refineText}
            onChange={function(e) { setRefineText(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") submitRefine(); }}
            autoFocus
          />
          <div className="refine-actions">
            <button className="refine-apply" onClick={submitRefine} disabled={refining}>
              {refining ? "..." : "Apply"}
            </button>
            <button className="refine-cancel"
              onClick={function() { setRefineMode(false); setRefineText(""); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  var [page, setPage] = useState("design");
  var [prompt, setPrompt] = useState("");
  var [budget, setBudget] = useState(200);
  var [result, setResult] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState(null);
  var [selectedPart, setSelectedPart] = useState(null);
  var [exploded, setExploded] = useState(false);
  var [history, setHistory] = useState([]);
  var [showHistory, setShowHistory] = useState(false);
  var [category, setCategory] = useState("general");

  var loadHistory = function() {
    fetch("http://127.0.0.1:8000/history")
      .then(function(res) { return res.json(); })
      .then(function(data) { setHistory(data); setShowHistory(true); });
  };

  var handleDesign = function() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedPart(null);
    setExploded(false);
    fetch("http://127.0.0.1:8000/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ 
        prompt: prompt, 
        budget: parseFloat(budget),
        category: category,
      }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { setResult(data); setLoading(false); })
      .catch(function() {
        setError("Failed to connect to backend.");
        setLoading(false);
      });
  };

  var handleRefine = function(index, instruction, done) {
    fetch("http://127.0.0.1:8000/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        component_index: index,
        instruction: instruction,
        current_design: Object.assign({}, result, { budget: parseFloat(budget) }),
      }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { setResult(data); if (done) done(); })
      .catch(function() { setError("Refine failed."); if (done) done(); });
  };

  var handleExport = function() {
    var doc = new jsPDF();
    var y = 20;
    doc.setFontSize(20); doc.setTextColor(0,100,200);
    doc.text(result.device_name, 20, y); y += 12;
    doc.setFontSize(11); doc.setTextColor(100,100,100);
    doc.text(result.description, 20, y, { maxWidth: 170 }); y += 18;
    doc.setFontSize(13); doc.setTextColor(0,0,0);
    doc.text("Total: $" + result.total_estimated_cost, 20, y); y += 12;
    doc.text("Components:", 20, y); y += 10;
    result.components.forEach(function(c) {
      doc.setFontSize(11); doc.setTextColor(0,0,0);
      doc.text("- " + c.name + " ($" + c.estimated_price_usd + ")", 24, y); y += 7;
      doc.setFontSize(10); doc.setTextColor(130,130,130);
      doc.text("  " + c.purpose, 24, y); y += 9;
    });
    doc.setFontSize(13); doc.setTextColor(0,0,0);
    doc.text("Wiring:", 20, y); y += 10;
    doc.setFontSize(10); doc.setTextColor(90,90,90);
    doc.text(result.wiring_summary, 20, y, { maxWidth: 170 }); y += 18;
    doc.setFontSize(13); doc.setTextColor(0,0,0);
    doc.text("Assembly:", 20, y); y += 10;
    result.assembly_steps.forEach(function(step, i) {
      doc.setFontSize(10); doc.setTextColor(90,90,90);
      doc.text((i+1) + ". " + step, 20, y, { maxWidth: 170 }); y += 9;
    });
    doc.save(result.device_name + "-plan.pdf");
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-mark">A</div>
          <div className="logo-text">AI<span>Hardware</span></div>
        </div>

        <div className="nav-section">Workspace</div>
        <button className={"nav-btn" + (page === "design" && !showHistory ? " active" : "")}
          onClick={function() { setPage("design"); setShowHistory(false); }}>
          <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="6" height="6" rx="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5"/>
          </svg>
          Design Device
        </button>
        <button className={"nav-btn" + (page === "chat" ? " active" : "")}
          onClick={function() { setPage("chat"); setShowHistory(false); }}>
          <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z"/>
          </svg>
          AI Assistant
        </button>
        <button className={"nav-btn" + (showHistory ? " active" : "")} onClick={loadHistory}>
          <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6"/>
            <path d="M8 5v3l2 2"/>
          </svg>
          Build History
        </button>

        <div className="sidebar-footer">
          v0.1 — localhost
        </div>
      </div>

      {showHistory && (
        <div className="history-panel">
          <div className="history-title">Recent Builds</div>
          {history.length === 0 && (
            <div style={{ color: "var(--text-3)", fontSize: 12, padding: "4px" }}>No builds yet</div>
          )}
          {history.map(function(d) {
            return (
              <div key={d.id} className="history-item"
                onClick={function() {
                  setResult({
                    device_name: d.device_name,
                    description: d.description,
                    components: d.components,
                    total_estimated_cost: d.total_cost,
                    within_budget: d.within_budget === "True",
                    assembly_steps: d.assembly_steps,
                    wiring_summary: d.wiring_summary,
                  });
                  setShowHistory(false);
                  setPage("design");
                }}>
                <div className="history-item-name">{d.device_name}</div>
                <div className="history-item-prompt">{d.prompt}</div>
                <div className="history-item-meta">
                  <span className="history-item-cost">${d.total_cost}</span>
                  <span className="history-item-date">{d.created_at.slice(0,10)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h2>{page === "design" ? "Device Designer" : "AI Assistant"}</h2>
            {result && page === "design" && (
              <>
                <div className="topbar-divider" />
                <span className="topbar-sub">{result.device_name}</span>
              </>
            )}
          </div>
          <div className="topbar-right">
            {result && <span className="badge badge-live">Live</span>}
            <span className="badge badge-free">Free Tier</span>
          </div>
        </div>

        {page === "chat" && (
          <div className="content chat-mode">
            <Chat />
          </div>
        )}

        {page === "design" && (
          <div className="content">
            <div className="bento-grid">

              <div className="card card-input">
                <div className="card-body">
                      <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Category</div>
                  <CategorySelector selected={category} onSelect={setCategory} />
                </div>
                  <div className="prompt-wrapper">
                    <input
                      className="prompt-input"
                      placeholder="Describe your device — e.g. AI sunglasses controlled by a ring"
                      value={prompt}
                      onChange={function(e) { setPrompt(e.target.value); }}
                      onKeyDown={function(e) { if (e.key === "Enter" && !loading && prompt) handleDesign(); }}
                    />
                    <button className="design-btn" onClick={handleDesign} disabled={loading || !prompt}>
                      {loading ? <span className="spinner" /> : "Generate"}
                    </button>
                  </div>
                  <div className="budget-row">
                    <span className="budget-label">Budget — ${budget}</span>
                    <input className="budget-slider" type="range" min="10" max="1000" value={budget}
                      onChange={function(e) { setBudget(e.target.value); }} />
                  </div>
                  {error && <p className="error-msg">{error}</p>}
                </div>
                {result && <CostChart components={result.components} totalCost={result.total_estimated_cost} budget={budget} />}
              {result && <Firmware result={result} />}
              </div>

              {result && (
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                  <div className="card-body">
                    <div className="device-header">
                      <div>
                        <div className="device-name">{result.device_name}</div>
                        <div className="device-desc">{result.description}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="budget-pill">
                          <span className="budget-pill-cost">${result.total_estimated_cost}</span>
                          <span className={"budget-pill-status " + (result.within_budget ? "within" : "over")}>
                            {result.within_budget ? "Within Budget" : "Over Budget"}
                          </span>
                        </div>
                        <button className="export-btn" onClick={handleExport}>Export PDF</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Components</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{result.components.length} parts</span>
                  </div>
                  <div className="card-body">
                    <div className="components-grid">
                      {result.components.map(function(c, i) {
                        return (
                          <ComponentCard key={i} c={c} index={i}
                            selected={selectedPart === i}
                            onSelect={setSelectedPart}
                            onRefine={handleRefine} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Wiring & Assembly</span>
                  </div>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Pin Connections</div>
                      <div className="wiring-box">{result.wiring_summary}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Assembly Steps</div>
                      <ol className="steps-list">
                        {result.assembly_steps.map(function(step, i) {
                          return <li key={i}>{step}</li>;
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              {result && (
                <button
                  className={"explode-btn" + (exploded ? " active" : "")}
                  onClick={function() { setExploded(function(e) { return !e; }); }}>
                  {exploded ? "Normal View" : "Exploded View"}
                </button>
              )}
              <Viewer3D
                components={result ? result.components : []}
                selectedIndex={selectedPart}
                onSelect={setSelectedPart}
                exploded={exploded}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;