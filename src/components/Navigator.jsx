import { useState, useRef, useEffect } from "react";
import React from "react";

export default function Navigator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, fileLoading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const reply = data.reply || "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error." },
      ]);
    }

    setLoading(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "📄 Document Review Complete:\n\n" + data.analysis,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to analyze document.",
        },
      ]);
    }

    setFileLoading(false);
  }

  return (
    <div className="navigator">
      <div className="navigator__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message message--${msg.role}`}>
            {msg.role === "assistant" && <div className="message__bar" />}
            <div className="message__content">{msg.content}</div>
          </div>
        ))}

        {(loading || fileLoading) && (
          <div className="message message--assistant">
            <div className="message__bar" />
            <div className="typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="navigator__input-area">
        <textarea
          className="navigator__textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Describe your situation..."
          rows={2}
        />

        <div className="navigator__actions">
          <button
            className="navigator__upload"
            onClick={() => fileInputRef.current.click()}
          >
            Review PDF
          </button>

          <button
            className={`navigator__send ${
              input.trim() && !loading ? "navigator__send--active" : ""
            }`}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            Send →
          </button>
        </div>

        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      <p className="navigator__disclaimer">
        This tool analyzes documents using Ontario ESA rules. It does not file
        complaints or contact anyone. All decisions remain yours.
      </p>
    </div>
  );
}
