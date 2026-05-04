import { useState } from "react";

const API = process.env.REACT_APP_API_URL || "https://ai-hardware-architect.onrender.com";

function Chat() {
  var [messages, setMessages] = useState([
    { role: "ai", text: "Hey! I am your hardware architect assistant. Ask me anything about building your device — wiring, code, components, how things work, anything." }
  ]);
  var [input, setInput] = useState("");
  var [typing, setTyping] = useState(false);

  var sendMessage = async function() {
    if (!input.trim()) return;
    var userMsg = input.trim();
    setInput("");
    setMessages(function(prev) { return [...prev, { role: "user", text: userMsg }]; });
    setTyping(true);
    try {
      var history = messages.map(function(m) {
        return { role: m.role === "ai" ? "assistant" : "user", content: m.text };
      });
      var res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });
      var data = await res.json();
      setMessages(function(prev) { return [...prev, { role: "ai", text: data.reply }]; });
    } catch {
      setMessages(function(prev) { return [...prev, { role: "ai", text: "Sorry, could not connect to backend." }]; });
    }
    setTyping(false);
  };

  var handleKey = function(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  var renderText = function(text) {
    var parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map(function(part, i) {
      if (part.startsWith("```")) {
        var code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return <pre key={i} style={{ background: "#1b1c19", color: "#d4f99d", padding: 16, borderRadius: 8, overflowX: "auto", fontSize: 13, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6, margin: "8px 0" }}>{code}</pre>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const T = { serif: "'Noto Serif', serif", sans: "'Manrope', sans-serif", border: "#E5E2DA", bg: "#fbf9f4", white: "#ffffff", primary: "#1D1D1B", muted: "#777771", surface: "#f5f3ee" };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left panel: history */}
      <div style={{ width: 280, borderRight: `1px solid ${T.border}`, background: T.surface, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20 }}>
          <button style={{ width: "100%", background: T.primary, color: T.white, border: "none", borderRadius: 8, padding: "10px 0", fontFamily: T.sans, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            + New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 1, padding: "8px 8px 4px" }}>Recent</div>
          {messages.filter(m => m.role === "user").slice(0, 5).map((m, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, fontFamily: T.sans, fontSize: 13, color: T.primary, cursor: "pointer", marginBottom: 2, background: i === 0 ? "#e4e2dd" : "transparent" }}>
              {m.text.length > 40 ? m.text.slice(0, 40) + "..." : m.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right: chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px", display: "flex", flexDirection: "column", gap: 32 }}>
          {messages.map(function(m, i) {
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "ai" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.primary }}>psychology</span>
                    <span style={{ fontFamily: T.serif, fontSize: 13, fontWeight: 700 }}>ArchAI</span>
                  </div>
                )}
                <div style={{ maxWidth: "80%", background: m.role === "user" ? T.white : T.surface, border: `1px solid ${T.border}`, borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "16px 20px", fontFamily: T.sans, fontSize: 14, lineHeight: 1.7, color: T.primary, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  {renderText(m.text)}
                </div>
              </div>
            );
          })}
          {typing && <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontStyle: "italic" }}>ArchAI is thinking...</div>}
        </div>
        <div style={{ padding: "16px 48px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 12 }}>
          <input
            style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px", fontFamily: T.sans, fontSize: 14, background: T.white, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
            placeholder="Ask about wiring, code, components..."
            value={input}
            onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={handleKey}
          />
          <button onClick={sendMessage} disabled={typing}
            style={{ background: T.primary, color: T.white, border: "none", borderRadius: 10, padding: "14px 24px", fontFamily: T.sans, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;