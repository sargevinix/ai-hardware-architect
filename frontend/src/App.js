import { useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";
import Chat from "./Chat";
import Viewer3D from "./Viewer3D";

function ComponentCard({ c, index, selected, onSelect }) {
  var url = "https://www.amazon.com/s?k=" + encodeURIComponent(c.search_query);
  return (
    <div
      className={"component-card" + (selected ? " selected" : "")}
      onClick={function() { onSelect(index); }}
    >
      <div className="comp-name">{c.name}</div>
      <div className="comp-purpose">{c.purpose}</div>
      <div className="comp-price">${c.estimated_price_usd}</div>
      <a href={url} target="_blank" rel="noreferrer" className="comp-link">
        Find on Amazon
      </a>
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

  var handleDesign = function() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedPart(null);
    fetch("http://127.0.0.1:8000/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, budget: parseFloat(budget) }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { setResult(data); setLoading(false); })
      .catch(function() {
        setError("Failed to connect to backend. Make sure it is running.");
        setLoading(false);
      });
  };

  var handleExport = function() {
    var doc = new jsPDF();
    var y = 20;
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 200);
    doc.text(result.device_name, 20, y); y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(result.description, 20, y, { maxWidth: 170 }); y += 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Cost: $" + result.total_estimated_cost, 20, y); y += 15;
    doc.text("Components:", 20, y); y += 10;
    result.components.forEach(function(c) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("- " + c.name + " ($" + c.estimated_price_usd + ")", 25, y); y += 7;
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("  " + c.purpose, 25, y); y += 10;
    });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Wiring:", 20, y); y += 10;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(result.wiring_summary, 20, y, { maxWidth: 170 }); y += 20;
    doc.text("Assembly Steps:", 20, y); y += 10;
    result.assembly_steps.forEach(function(step, i) {
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text((i + 1) + ". " + step, 20, y, { maxWidth: 170 }); y += 10;
    });
    doc.save(result.device_name + "-plan.pdf");
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">AI<span>Hardware</span></div>
        <button className={"nav-btn" + (page === "design" ? " active" : "")} onClick={function() { setPage("design"); }}>
          Design Device
        </button>
        <button className={"nav-btn" + (page === "chat" ? " active" : "")} onClick={function() { setPage("chat"); }}>
          Chat with AI
        </button>
        <div className="sidebar-footer">Built by you. Powered by AI.</div>
      </div>

      <div className="main">
        <div className="topbar">
          <h2>{page === "design" ? "Device Designer" : "AI Assistant"}</h2>
          <span className="topbar-badge">Free Tier</span>
        </div>

        {page === "chat" && (
          <div className="content chat-mode">
            <Chat />
          </div>
        )}

        {page === "design" && (
          <div className="content">
            <div className="design-panel">
              <div className="input-card">
                <h3>Describe your device</h3>
                <input
                  className="prompt-input"
                  placeholder="e.g. AI sunglasses controlled by a ring"
                  value={prompt}
                  onChange={function(e) { setPrompt(e.target.value); }}
                />
                <div className="budget-row">
                  <span className="budget-label">Budget: ${budget}</span>
                  <input
                    className="budget-slider"
                    type="range"
                    min="10"
                    max="1000"
                    value={budget}
                    onChange={function(e) { setBudget(e.target.value); }}
                  />
                </div>
                <button
                  className="design-btn"
                  onClick={handleDesign}
                  disabled={loading || !prompt}
                >
                  {loading ? "Designing your device..." : "Design My Device"}
                </button>
                {error && <p className="error-msg">{error}</p>}
              </div>

              {result && (
                <div className="result-card">
                  <div className="result-header">
                    <div>
                      <div className="device-name">{result.device_name}</div>
                      <div className="device-desc">{result.description}</div>
                    </div>
                    <button className="export-btn" onClick={handleExport}>Download PDF</button>
                  </div>

                  <div className="budget-bar">
                    <span>${result.total_estimated_cost} of ${budget} used</span>
                    <span className={result.within_budget ? "within" : "over"}>
                      {result.within_budget ? "Within Budget" : "Over Budget"}
                    </span>
                  </div>

                  <div className="section-title">Components — click to highlight in 3D</div>
                  <div className="components-grid">
                    {result.components.map(function(c, i) {
                      return (
                        <ComponentCard
                          key={i}
                          c={c}
                          index={i}
                          selected={selectedPart === i}
                          onSelect={setSelectedPart}
                        />
                      );
                    })}
                  </div>

                  <div className="section-title">Wiring Summary</div>
                  <div className="wiring-box">{result.wiring_summary}</div>

                  <div className="section-title">Assembly Steps</div>
                  <ol className="steps-list">
                    {result.assembly_steps.map(function(step, i) {
                      return <li key={i}>{step}</li>;
                    })}
                  </ol>
                </div>
              )}
            </div>

            <Viewer3D
              components={result ? result.components : []}
              selectedIndex={selectedPart}
              onSelect={setSelectedPart}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;