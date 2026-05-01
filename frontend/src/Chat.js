import { useState } from "react";

var SYSTEM_PROMPT = "You are an AI hardware architect assistant. You help users understand how to build their hardware devices. When asked for code, always wrap it in triple backticks with the language name. Be specific about wiring, components, and implementation details.";

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

      var res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: history }),
      });
      var data = await res.json();
      setMessages(function(prev) { return [...prev, { role: "ai", text: data.reply }]; });
    } catch {
      setMessages(function(prev) { return [...prev, { role: "ai", text: "Sorry, could not connect to backend." }]; });
    }
    setTyping(false);
  };

  var handleKey = function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  var renderText = function(text) {
    var parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map(function(part, i) {
      if (part.startsWith("```")) {
        var code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return <pre key={i}>{code}</pre>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(function(m, i) {
          return (
            <div key={i} className={"message " + m.role}>
              {renderText(m.text)}
            </div>
          );
        })}
        {typing && <div className="typing">AI is thinking...</div>}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Ask about wiring, code, components..."
          value={input}
          onChange={function(e) { setInput(e.target.value); }}
          onKeyDown={handleKey}
        />
        <button className="chat-send-btn" onClick={sendMessage} disabled={typing}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;