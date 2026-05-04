import { useState, useEffect, useRef } from "react";
import CategorySelector from "./CategorySelector";
import CostChart from "./CostChart";
import WiringDiagram from "./WiringDiagram";
import Viewer3D from "./Viewer3D";
import Firmware from "./Firmware";
import Chat from "./Chat";
 
const API = process.env.REACT_APP_API_URL || "https://ai-hardware-architect.onrender.com";
 
// ── Fonts injected globally ───────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);
 
const iconLink = document.createElement("link");
iconLink.rel = "stylesheet";
iconLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
document.head.appendChild(iconLink);
 
// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#fbf9f4",
  white: "#ffffff",
  surface: "#f5f3ee",
  surfaceHigh: "#eae8e3",
  border: "#E5E2DA",
  borderLight: "#F0EDE4",
  primary: "#1D1D1B",
  secondary: "#99462a",
  secondaryBg: "#F0EDE4",
  muted: "#777771",
  mutedLight: "#c7c7bf",
  serif: "'Noto Serif', serif",
  sans: "'Manrope', sans-serif",
  mono: "'JetBrains Mono', monospace",
  shadow: "0 10px 30px rgba(0,0,0,0.03)",
  shadowMd: "0 20px 50px rgba(0,0,0,0.05)",
};
 
// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: "projects",   icon: "folder_open",    label: "Projects" },
  { id: "design",     icon: "memory",         label: "Design Device" },
  { id: "history",    icon: "history",        label: "Build History" },
  { id: "chat",       icon: "psychology",     label: "AI Assistance" },
  { id: "firmware",   icon: "developer_board",label: "Firmware" },
  { id: "viewer3d",   icon: "view_in_ar",     label: "3D Viewer" },
  { id: "wiring",     icon: "schema",         label: "Wiring Diagram" },
];
 
function Sidebar({ active, setActive }) {
  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandName}>ArchAI</div>
        <div style={s.brandSub}>HARDWARE ARCHITECT</div>
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)}
            style={{ ...s.navItem, ...(active === n.id ? s.navActive : {}) }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: active === n.id ? T.primary : T.muted }}>{n.icon}</span>
            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: active === n.id ? 600 : 400, color: active === n.id ? T.primary : T.muted }}>{n.label}</span>
            {active === n.id && <div style={s.navBorder} />}
          </button>
        ))}
      </nav>
      <div style={s.sidebarFooter}>
        <button style={s.footerBtn}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span> <span>Trash</span></button>
        <button style={s.footerBtn}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span> <span>Logout</span></button>
      </div>
    </aside>
  );
}
 
// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ label }) {
  return (
    <header style={s.topbar}>
      <span style={{ fontFamily: T.sans, fontSize: 13, color: T.muted }}>ArchAI / <strong style={{ color: T.primary }}>{label}</strong></span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button style={s.iconBtn}><span className="material-symbols-outlined" style={{ fontSize: 20, color: T.muted }}>help_outline</span></button>
        <button style={s.iconBtn}><span className="material-symbols-outlined" style={{ fontSize: 20, color: T.muted }}>settings</span></button>
        <div style={s.statusDot}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /><span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>READY</span></div>
      </div>
    </header>
  );
}
 
// ── DESIGN DEVICE PAGE ────────────────────────────────────────────────────────
function DesignPage({ onResult }) {
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState(100);
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [extraConstraints, setExtraConstraints] = useState("");
 
  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt + (extraConstraints ? "\n" + extraConstraints : ""), budget, category }),
      });
      const data = await res.json();
      onResult(data);
    } catch (e) { alert("Backend error. Is Render running?"); }
    setLoading(false);
  }
 
  return (
    <div style={s.page}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={s.displayXl}>Dream it, Design it, bring to real life.</h1>
        <p style={s.bodyLg}>Architect complex hardware systems with natural language. From PCB layout to component sourcing, our AI handles the technical depth so you can focus on the vision.</p>
      </div>
 
      {/* Main prompt bar */}
      <div style={s.promptCard}>
        <textarea
          style={s.promptArea}
          placeholder="Describe your device, e.g. a wearable heart rate monitor with bluetooth..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <div style={s.promptBar}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span className="material-symbols-outlined" style={{ color: T.muted, fontSize: 20, cursor: "pointer" }}>attachment</span>
            <span className="material-symbols-outlined" style={{ color: T.muted, fontSize: 20, cursor: "pointer" }}>code</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>Budget $</span>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}
                style={{ width: 70, border: `1px solid ${T.border}`, borderRadius: 4, padding: "4px 8px", fontFamily: T.sans, fontSize: 12, background: T.white }} />
            </div>
          </div>
          <button onClick={generate} disabled={loading} style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Generating..." : "Generate Draft →"}
          </button>
        </div>
      </div>
 
      {/* Quick pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 48 }}>
        {["Optimize for Power", "Max Performance", "Custom Constraints"].map(p => (
          <button key={p} style={s.pill}>{p}</button>
        ))}
      </div>
 
      {/* Category selector + extra constraints grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <h2 style={s.headlineMd}>Custom Design</h2>
            <span style={s.badge}>Beta V2</span>
          </div>
          <label style={s.label}>Category</label>
          <div style={{ marginBottom: 16 }}><CategorySelector selected={category} onSelect={setCategory} /></div>
          <label style={s.label}>Additional Constraints</label>
          <textarea style={{ ...s.promptArea, minHeight: 100, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}
            placeholder="Specify voltage ranges, MCU preferences, or form factor limits..."
            value={extraConstraints}
            onChange={e => setExtraConstraints(e.target.value)} />
          <button onClick={generate} disabled={loading} style={{ ...s.btnPrimary, width: "100%", marginTop: 12, textAlign: "center" }}>
            Generate Architecture
          </button>
        </div>
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="material-symbols-outlined" style={{ color: T.secondary }}>grid_view</span>
            <h2 style={s.headlineMd}>Component Library</h2>
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, lineHeight: 1.7, flex: 1 }}>
            Access our curated library of over 1.2M validated hardware components with real-time stock and pricing data from major distributors.
          </p>
          <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <a href="https://www.digikey.com" target="_blank" rel="noreferrer" style={{ fontFamily: T.sans, fontSize: 13, color: T.secondary, fontWeight: 600, textDecoration: "none" }}>
              Browse Components ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ── RESULTS PAGE ──────────────────────────────────────────────────────────────
function ResultPage({ result, onBack, onNewDesign }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [exploded, setExploded] = useState(false);
  const [refineIdx, setRefineIdx] = useState(null);
  const [refineText, setRefineText] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [design, setDesign] = useState(result);
 
  async function refine() {
    if (!refineText.trim()) return;
    setRefineLoading(true);
    try {
      const res = await fetch(`${API}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component_index: refineIdx, instruction: refineText, current_design: design }),
      });
      const data = await res.json();
      setDesign(data);
      setRefineIdx(null);
      setRefineText("");
    } catch {}
    setRefineLoading(false);
  }
 
  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...s.headlineLg, marginBottom: 4 }}>{design.device_name}</h1>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted }}>{design.description}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onBack} style={s.btnSecondary}>← Back</button>
          <button onClick={onNewDesign} style={s.btnPrimary}>New Design</button>
        </div>
      </div>
 
      {/* Budget badge */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <span style={{ ...s.badge, background: design.within_budget === "True" ? "#dcfce7" : "#fee2e2", color: design.within_budget === "True" ? "#166534" : "#991b1b" }}>
          {design.within_budget === "True" ? "WITHIN BUDGET" : "OVER BUDGET"}
        </span>
        <span style={{ ...s.badge, background: T.surfaceHigh, color: T.primary }}>${design.total_estimated_cost} of ${result.budget || "?"}</span>
        <span style={{ ...s.badge, background: T.surfaceHigh, color: T.primary }}>{design.components?.length} components</span>
      </div>
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
 
          {/* Components table */}
          <div style={s.card}>
            <h2 style={{ ...s.headlineMd, marginBottom: 20 }}>Components</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  {["Component", "Purpose", "Price", ""].map(h => (
                    <th key={h} style={{ textAlign: h === "Price" ? "right" : "left", fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 1, paddingBottom: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {design.components?.map((c, i) => (
                  <>
                    <tr key={i} onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
                      style={{ borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer", background: selectedIndex === i ? T.surface : "transparent" }}>
                      <td style={{ padding: "12px 0", fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.primary }}>{c.name}</td>
                      <td style={{ padding: "12px 8px", fontFamily: T.sans, fontSize: 13, color: T.muted, fontStyle: "italic" }}>{c.purpose}</td>
                      <td style={{ padding: "12px 0", fontFamily: T.mono, fontSize: 13, color: T.primary, textAlign: "right" }}>${c.estimated_price_usd}</td>
                      <td style={{ padding: "12px 0 12px 12px" }}>
                        <button onClick={e => { e.stopPropagation(); setRefineIdx(refineIdx === i ? null : i); }}
                          style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 4, padding: "3px 8px", fontFamily: T.sans, fontSize: 11, cursor: "pointer", color: T.muted }}>
                          Refine
                        </button>
                      </td>
                    </tr>
                    {refineIdx === i && (
                      <tr key={`refine-${i}`}>
                        <td colSpan={4} style={{ padding: "8px 0 16px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input value={refineText} onChange={e => setRefineText(e.target.value)}
                              placeholder="e.g. find cheaper alternative, use ESP32 instead..."
                              style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 12px", fontFamily: T.sans, fontSize: 13 }} />
                            <button onClick={refine} disabled={refineLoading} style={s.btnPrimary}>{refineLoading ? "..." : "Apply"}</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* Assembly steps */}
          {design.assembly_steps?.length > 0 && (
            <div style={s.card}>
              <h2 style={{ ...s.headlineMd, marginBottom: 16 }}>Assembly Steps</h2>
              {design.assembly_steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.primary, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.sans, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, lineHeight: 1.6, margin: 0 }}>{step}</p>
                </div>
              ))}
            </div>
          )}
 
          {/* Cost chart */}
          <CostChart components={design.components || []} totalCost={design.total_estimated_cost} budget={result.budget || design.total_estimated_cost} />
 
          {/* Wiring diagram */}
          <WiringDiagram components={design.components || []} />
 
          {/* Firmware */}
          <Firmware result={design} />
        </div>
 
        {/* Right column: 3D viewer */}
        <div>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setExploded(!exploded)} style={s.btnSecondary}>{exploded ? "Normal View" : "Exploded View"}</button>
          </div>
          <Viewer3D components={design.components || []} selectedIndex={selectedIndex} onSelect={setSelectedIndex} exploded={exploded} />
        </div>
      </div>
    </div>
  );
}
 
// ── PROJECTS PAGE ─────────────────────────────────────────────────────────────
function ProjectsPage({ onOpen }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetch(`${API}/history`).then(r => r.json()).then(d => { setHistory(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
 
  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <h1 style={s.headlineLg}>Projects</h1>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, marginTop: 4 }}>Your saved hardware designs</p>
        </div>
        <button style={s.btnPrimary}>+ New Project</button>
      </div>
 
      {loading ? <p style={{ fontFamily: T.sans, color: T.muted }}>Loading...</p> : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.muted }}>No projects yet. Design your first device.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {history.map((d, i) => (
            <div key={i} style={s.projectCard}>
              <div style={s.projectImgPlaceholder}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: T.mutedLight }}>memory</span>
                <span style={{ ...s.badge, position: "absolute", top: 12, left: 12, background: T.secondaryBg, color: T.secondary }}>{d.components?.length > 0 ? "COMPUTING" : "GENERAL"}</span>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 600, color: T.primary, marginBottom: 8 }}>{d.device_name}</h3>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>grid_view</span>{d.components?.length || 0} Components
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 600, color: "#2D6A4F" }}>${d.total_cost}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                    <button onClick={() => onOpen(d)} style={s.btnPrimary}>Open</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
// ── BUILD HISTORY PAGE ────────────────────────────────────────────────────────
function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);
 
  useEffect(() => {
    fetch(`${API}/history`).then(r => r.json()).then(setHistory).catch(() => {});
  }, []);
 
  return (
    <div style={s.page}>
      <h1 style={s.displayXl}>Build History</h1>
      <p style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, marginBottom: 48 }}>Every device you have architected.</p>
 
      <div style={{ position: "relative", paddingLeft: 32 }}>
        {/* timeline line */}
        <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 1, background: T.border }} />
 
        {history.map((d, i) => (
          <div key={i} style={{ position: "relative", marginBottom: 32 }}>
            <div style={{ position: "absolute", left: -28, top: 20, width: 10, height: 10, borderRadius: "50%", background: T.primary, border: `3px solid ${T.white}`, boxShadow: T.shadow }} />
            <div style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: expanded === i ? 24 : 0 }}>
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, marginBottom: 4 }}>
                    {new Date(d.created_at).toLocaleString()}
                  </div>
                  <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T.primary, marginBottom: 4 }}>{d.device_name}</h3>
                  <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, maxWidth: 500, lineHeight: 1.6 }}>{d.description}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ ...s.badge, background: d.within_budget === "True" ? "#dcfce7" : "#fee2e2", color: d.within_budget === "True" ? "#166534" : "#991b1b" }}>
                    {d.within_budget === "True" ? "WITHIN BUDGET" : "OVER BUDGET"}
                  </span>
                  <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.primary, marginTop: 8 }}>${d.total_cost} / ${d.budget}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted }}>{d.components?.length} Components</div>
                </div>
              </div>
 
              {expanded === i && d.components?.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", borderTop: `1px solid ${T.borderLight}`, paddingTop: 16 }}>
                  <thead>
                    <tr>
                      {["Component", "Purpose", "Price"].map(h => (
                        <th key={h} style={{ textAlign: h === "Price" ? "right" : "left", fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, padding: "12px 0", borderBottom: `1px solid ${T.borderLight}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.components.map((c, j) => (
                      <tr key={j} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                        <td style={{ padding: "10px 0", fontFamily: T.sans, fontSize: 13, fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: "10px 8px", fontFamily: T.sans, fontSize: 13, color: T.muted, fontStyle: "italic" }}>{c.purpose}</td>
                        <td style={{ padding: "10px 0", fontFamily: T.mono, fontSize: 13, textAlign: "right" }}>${c.estimated_price_usd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
 
              <button onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 12, color: T.muted, marginTop: expanded === i ? 16 : 8, display: "flex", alignItems: "center", gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{expanded === i ? "expand_less" : "expand_more"}</span>
                {expanded === i ? "Collapse" : "Click to expand details"}
              </button>
            </div>
          </div>
        ))}
 
        {history.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: T.sans, color: T.muted }}>No builds yet.</div>
        )}
      </div>
    </div>
  );
}
 
// ── VIEWER 3D PAGE ────────────────────────────────────────────────────────────
function ViewerPage({ result }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [exploded, setExploded] = useState(false);
 
  if (!result) return (
    <div style={{ ...s.page, textAlign: "center", paddingTop: 80 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.muted }}>view_in_ar</span>
      <h2 style={{ ...s.headlineMd, marginTop: 16 }}>3D Board Viewer</h2>
      <p style={{ fontFamily: T.sans, color: T.muted, marginTop: 8 }}>Design a device first to see the 3D board visualization.</p>
    </div>
  );
 
  return (
    <div style={s.page}>
      <h1 style={s.headlineLg}>3D Board Viewer</h1>
      <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, marginBottom: 24 }}>Interactive hardware visualization — drag to rotate · scroll to zoom</p>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ ...s.card, flex: 1, padding: 0, overflow: "hidden" }}>
          <Viewer3D components={result.components || []} selectedIndex={selectedIndex} onSelect={setSelectedIndex} exploded={exploded} />
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
            <button onClick={() => setExploded(!exploded)} style={s.btnSecondary}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>layers</span> {exploded ? "Normal View" : "Exploded View"}
            </button>
            <button onClick={() => setSelectedIndex(null)} style={s.btnSecondary}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>center_focus_strong</span> Reset
            </button>
          </div>
        </div>
        <div style={{ width: 280 }}>
          <div style={s.card}>
            <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: T.muted, background: T.surface, padding: "3px 8px", borderRadius: 4 }}>
              {selectedIndex !== null ? "Component" : "Microcontroller"}
            </span>
            {selectedIndex !== null && result.components[selectedIndex] ? (
              <>
                <h3 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 600, color: T.primary, margin: "12px 0 6px" }}>{result.components[selectedIndex].name}</h3>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>{result.components[selectedIndex].purpose}</p>
                <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Unit Price</span>
                  <span style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.secondary }}>${result.components[selectedIndex].estimated_price_usd}</span>
                </div>
              </>
            ) : (
              <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, marginTop: 12, fontStyle: "italic" }}>Click a component to inspect it</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ── WIRING PAGE ───────────────────────────────────────────────────────────────
function WiringPage({ result }) {
  if (!result) return (
    <div style={{ ...s.page, textAlign: "center", paddingTop: 80 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.muted }}>schema</span>
      <h2 style={{ ...s.headlineMd, marginTop: 16 }}>Wiring Diagram</h2>
      <p style={{ fontFamily: T.sans, color: T.muted, marginTop: 8 }}>Design a device first to see the wiring diagram.</p>
    </div>
  );
 
  return (
    <div style={s.page}>
      <h1 style={s.headlineLg}>Wiring Diagram</h1>
      <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, marginBottom: 24 }}>Visual connection map for your components</p>
      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, background: T.primary, color: T.white, padding: "3px 10px", borderRadius: 99, textTransform: "uppercase", letterSpacing: 1 }}>Live Schema</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btnSecondary}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span> Export SVG</button>
            <button style={s.btnSecondary}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span> Export PNG</button>
          </div>
        </div>
        <WiringDiagram components={result.components || []} />
      </div>
    </div>
  );
}
 
// ── FIRMWARE PAGE ─────────────────────────────────────────────────────────────
function FirmwarePage({ result }) {
  if (!result) return (
    <div style={{ ...s.page, textAlign: "center", paddingTop: 80 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.muted }}>developer_board</span>
      <h2 style={{ ...s.headlineMd, marginTop: 16 }}>Firmware Generator</h2>
      <p style={{ fontFamily: T.sans, color: T.muted, marginTop: 8 }}>Design a device first to generate firmware.</p>
    </div>
  );
 
  return (
    <div style={s.page}>
      <h1 style={s.headlineLg}>Firmware Generator</h1>
      <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, marginBottom: 32 }}>Generate Arduino-ready code for your hardware design.</p>
      <div style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ padding: 12, background: T.surface, borderRadius: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: T.secondary }}>memory</span>
          </div>
          <div>
            <h3 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 600, color: T.primary }}>{result.device_name}</h3>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>{result.components?.length} Components</span>
              <span style={{ ...s.badge, background: T.secondaryBg, color: T.secondary }}>ARDUINO</span>
            </div>
          </div>
        </div>
      </div>
      <Firmware result={result} />
    </div>
  );
}
 
// ── CHAT PAGE ─────────────────────────────────────────────────────────────────
function ChatPage() {
  return (
    <div style={{ ...s.page, padding: 0, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 40px 16px", borderBottom: `1px solid ${T.border}` }}>
        <h1 style={s.headlineLg}>AI Assistance</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted }}>Your hardware architect AI assistant</p>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Chat />
      </div>
    </div>
  );
}
 
// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("design");
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
 
  function handleResult(data) {
    setResult(data);
    setShowResult(true);
    setTab("design");
  }
 
  function handleOpenProject(project) {
    const fakeResult = {
      ...project,
      components: project.components || [],
      total_estimated_cost: project.total_cost,
      within_budget: project.within_budget,
      budget: project.budget,
    };
    setResult(fakeResult);
    setShowResult(true);
    setTab("design");
  }
 
  const PAGE_LABEL = { design: "Design Device", projects: "Projects", history: "Build History", chat: "AI Assistance", firmware: "Firmware", viewer3d: "3D Viewer", wiring: "Wiring Diagram" };
 
  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: T.sans }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; }
        textarea, input { outline: none; }
        textarea:focus, input:focus { border-color: ${T.primary} !important; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.mutedLight}; border-radius: 99px; }
      `}</style>
 
      <Sidebar active={tab} setActive={(t) => { setTab(t); if (t === "design") {} }} />
 
      <div style={{ marginLeft: 260, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar label={PAGE_LABEL[tab]} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {tab === "design" && !showResult && <DesignPage onResult={handleResult} />}
          {tab === "design" && showResult && <ResultPage result={result} onBack={() => setShowResult(false)} onNewDesign={() => { setShowResult(false); setResult(null); }} />}
          {tab === "projects" && <ProjectsPage onOpen={handleOpenProject} />}
          {tab === "history" && <HistoryPage />}
          {tab === "chat" && <ChatPage />}
          {tab === "firmware" && <FirmwarePage result={result} />}
          {tab === "viewer3d" && <ViewerPage result={result} />}
          {tab === "wiring" && <WiringPage result={result} />}
        </main>
      </div>
    </div>
  );
}
 
// ── Shared styles ─────────────────────────────────────────────────────────────
const s = {
  sidebar: { width: 260, height: "100vh", background: "#FDFCFB", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "20px 0 40px rgba(0,0,0,0.02)", position: "fixed", left: 0, top: 0, zIndex: 40 },
  brand: { padding: "32px 24px 24px" },
  brandName: { fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.primary, letterSpacing: "-0.5px" },
  brandSub: { fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginTop: 3 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", position: "relative", transition: "background 0.15s" },
  navActive: { background: T.secondaryBg },
  navBorder: { position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: T.primary },
  sidebarFooter: { padding: "16px", borderTop: `1px solid ${T.border}` },
  footerBtn: { display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "8px 12px", width: "100%", fontFamily: T.sans, fontSize: 13, color: T.muted },
  topbar: { height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(253,252,251,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, flexShrink: 0, position: "sticky", top: 0, zIndex: 30 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" },
  statusDot: { display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: T.surface, borderRadius: 99 },
  page: { padding: "40px 48px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  displayXl: { fontFamily: T.serif, fontSize: 48, fontWeight: 500, color: T.primary, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 16 },
  headlineLg: { fontFamily: T.serif, fontSize: 32, fontWeight: 500, color: T.primary, lineHeight: 1.3, letterSpacing: "-0.01em" },
  headlineMd: { fontFamily: T.serif, fontSize: 22, fontWeight: 500, color: T.primary },
  bodyLg: { fontFamily: T.sans, fontSize: 16, color: T.muted, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" },
  card: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, boxShadow: T.shadow },
  projectCard: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow, transition: "box-shadow 0.2s" },
  projectImgPlaceholder: { height: 180, background: T.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  promptCard: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadowMd, overflow: "hidden", marginBottom: 24 },
  promptArea: { width: "100%", minHeight: 160, padding: "24px", fontFamily: T.sans, fontSize: 16, color: T.primary, border: "none", resize: "none", background: "transparent", lineHeight: 1.6 },
  promptBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: T.surface, borderTop: `1px solid ${T.borderLight}` },
  btnPrimary: { background: T.primary, color: T.white, border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: T.sans, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.15s" },
  btnSecondary: { background: "transparent", color: T.primary, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", fontFamily: T.sans, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  pill: { padding: "8px 20px", borderRadius: 99, border: `1px solid ${T.border}`, background: T.secondaryBg, fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.muted, cursor: "pointer" },
  badge: { fontFamily: T.sans, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, padding: "3px 10px", borderRadius: 99, background: T.secondaryBg, color: T.secondary },
  label: { fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 },
};
 