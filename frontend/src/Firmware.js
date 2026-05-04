import { useState } from "react";

const API = process.env.REACT_APP_API_URL || "https://ai-hardware-architect.onrender.com";
const T = { serif: "'Noto Serif', serif", sans: "'Manrope', sans-serif", mono: "'JetBrains Mono', monospace", border: "#E5E2DA", primary: "#1D1D1B", secondary: "#99462a", muted: "#777771", surface: "#f5f3ee", white: "#ffffff" };

function Firmware({ result }) {
  var [code, setCode] = useState(null);
  var [loading, setLoading] = useState(false);
  var [copied, setCopied] = useState(false);
  var [filename, setFilename] = useState("");

  var generate = function() {
    setLoading(true); setCode(null);
    fetch(`${API}/firmware`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ design: result }),
    }).then(r => r.json()).then(data => { setCode(data.code); setFilename(data.filename); setLoading(false); }).catch(() => setLoading(false));
  };

  var download = function() {
    var blob = new Blob([code], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  var copy = function() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) return null;

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.primary }}>Firmware Generator</span>
        <div style={{ display: "flex", gap: 8 }}>
          {code && <>
            <button onClick={copy} style={btn2}>{copied ? "Copied!" : "Copy"}</button>
            <button onClick={download} style={btn2}>Download .ino</button>
          </>}
          <button onClick={generate} disabled={loading} style={{ ...btn1, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Generating..." : code ? "Regenerate" : "⚡ Generate Firmware"}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!code && !loading && (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#ccc" }}>developer_board</span>
          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.muted, marginTop: 12 }}>Arduino Firmware</div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: "#aaa", marginTop: 6 }}>
            Generate complete Arduino code with pin definitions and working logic for all {result.components?.length} components.
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: "48px 24px", textAlign: "center", fontFamily: T.sans, fontSize: 13, color: T.muted }}>
          Writing firmware for {result.device_name}...
        </div>
      )}

      {/* Code */}
      {code && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", background: "#1a1a1a", borderBottom: "1px solid #333" }}>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.secondary }}>{filename}</span>
            <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, border: "1px solid #333", padding: "2px 8px", borderRadius: 3 }}>ARDUINO / C++</span>
          </div>
          <div style={{ display: "flex", background: "#111" }}>
            <div style={{ padding: "20px 16px", color: "#444", fontFamily: T.mono, fontSize: 13, lineHeight: 1.7, textAlign: "right", userSelect: "none", borderRight: "1px solid #222", minWidth: 48 }}>
              {code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre style={{ flex: 1, padding: 20, color: "#d4f99d", fontFamily: T.mono, fontSize: 13, lineHeight: 1.7, overflowX: "auto", maxHeight: 480, overflowY: "auto", margin: 0, whiteSpace: "pre" }}>{code}</pre>
          </div>
        </>
      )}
    </div>
  );
}

const btn1 = { background: "#1D1D1B", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btn2 = { background: "transparent", color: "#1D1D1B", border: "1px solid #E5E2DA", borderRadius: 8, padding: "8px 14px", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" };

export default Firmware;