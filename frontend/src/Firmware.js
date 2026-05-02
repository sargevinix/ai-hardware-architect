import { useState } from "react";

function Firmware({ result }) {
  var [code, setCode] = useState(null);
  var [loading, setLoading] = useState(false);
  var [copied, setCopied] = useState(false);
  var [filename, setFilename] = useState("");

  var generate = function() {
    setLoading(true);
    setCode(null);
    fetch("http://127.0.0.1:8000/firmware", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ design: result }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setCode(data.code);
        setFilename(data.filename);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  };

  var download = function() {
    var blob = new Blob([code], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  var copy = function() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  };

  if (!result) return null;

  return (
    <div className="card" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
      <div className="card-header">
        <span className="card-title">Firmware Generator</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {code && (
            <>
              <button onClick={copy} style={styles.actionBtn}>
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button onClick={download} style={styles.downloadBtn}>
                Download .ino
              </button>
            </>
          )}
          <button onClick={generate} disabled={loading} style={loading ? styles.genBtnDisabled : styles.genBtn}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spinner" />
                Generating...
              </span>
            ) : code ? "Regenerate" : "Generate Firmware"}
          </button>
        </div>
      </div>

      {!code && !loading && (
        <div className="card-body">
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <div style={styles.emptyTitle}>Arduino Firmware</div>
            <div style={styles.emptyDesc}>
              Generate complete Arduino code with pin definitions,
              initialization, and working logic for all {result.components.length} components.
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card-body">
          <div style={styles.empty}>
            <span className="spinner" />
            <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 12 }}>
              Writing firmware for {result.device_name}...
            </div>
          </div>
        </div>
      )}

      {code && (
        <div style={styles.codeWrap}>
          <div style={styles.codeBar}>
            <span style={styles.codeLang}>Arduino / C++</span>
            <span style={styles.codeFile}>{filename}</span>
          </div>
          <pre style={styles.code}>{code}</pre>
        </div>
      )}
    </div>
  );
}

var styles = {
  genBtn: {
    padding: "6px 14px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #00e5ff, #00ff88)",
    color: "#000", fontSize: 11, fontWeight: 700,
    cursor: "pointer", fontFamily: "Inter, sans-serif",
    letterSpacing: "0.3px",
  },
  genBtnDisabled: {
    padding: "6px 14px", borderRadius: 8, border: "none",
    background: "var(--bg-3)", color: "var(--text-3)",
    fontSize: 11, fontWeight: 700, cursor: "not-allowed",
    fontFamily: "Inter, sans-serif",
  },
  actionBtn: {
    padding: "6px 12px", borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent", color: "var(--text-2)",
    fontSize: 11, fontWeight: 600, cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  downloadBtn: {
    padding: "6px 12px", borderRadius: 8,
    border: "1px solid rgba(0,255,136,0.3)",
    background: "rgba(0,255,136,0.08)", color: "#00ff88",
    fontSize: 11, fontWeight: 600, cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "32px 20px", textAlign: "center",
  },
  emptyIcon: {
    width: 48, height: 48, borderRadius: 12,
    background: "var(--bg-2)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--text-3)", marginBottom: 12,
  },
  emptyTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 },
  emptyDesc: { fontSize: 12, color: "var(--text-3)", maxWidth: 360, lineHeight: 1.6 },
  codeWrap: { borderTop: "1px solid var(--border)" },
  codeBar: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "8px 16px",
    background: "var(--bg-0)", borderBottom: "1px solid var(--border)",
  },
  codeLang: { fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px" },
  codeFile: { fontSize: 11, color: "#6366f1", fontFamily: "monospace" },
  code: {
    padding: "16px", margin: 0,
    background: "var(--bg-0)", color: "#a5b4fc",
    fontSize: 12, lineHeight: 1.7,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    overflowX: "auto", maxHeight: 480,
    overflowY: "auto", whiteSpace: "pre",
  },
};

export default Firmware;