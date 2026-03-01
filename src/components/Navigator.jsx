import { useState, useRef, useEffect } from "react";
import React from "react";

const SYSTEM_PROMPT = `You are a rights navigator helping workers and tenants in Ontario, Canada understand and assert their legal rights. You are empathetic, clear, and action-oriented.

Ontario Employment Standards Act (ESA) Key Rules:
- Minimum wage: $17.20/hr (2024)
- Overtime: 1.5x pay after 44 hours/week
- Vacation pay: 4% of wages
- Meal breaks: 30 min after every 5 hours worked
- Minimum rest: 8 hours between shifts
- Public holidays: 9 per year with premium pay or substitute day

IMPORTANT:
You prepare everything, but the human decides whether to formally file.
Never contact anyone on the user's behalf.`;

const INITIAL_MESSAGE = {
  role: "assistant",
  content: `Hi. This is a private space to understand your rights as a worker in Ontario.

Nothing here is shared with anyone — not your employer, not the government — unless you decide to take action yourself.

You can:
→ Describe your situation
→ Upload a termination letter or contract for review

What’s happening?`,
};

export default function Navigator() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
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
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedMessages,
          ],
        }),
      });

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content || "Sorry, something went wrong.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
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
          content: `📄 Document Review Complete:

${data.analysis}

Remember: This is a preliminary review. You decide what to do next.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to analyze document. Please try again.",
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
        <div className="navigator__input-row">
          {/* Plus Upload Button */}
          <button
            className="navigator__icon-button"
            onClick={() => fileInputRef.current.click()}
            disabled={fileLoading}
            title="Upload PDF"
          >
            +
          </button>

          {/* Textarea (Full Width) */}
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

          {/* Send Button */}
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
        This tool prepares information using Ontario ESA rules. It does not file
        complaints or contact anyone. All decisions remain yours.
      </p>
    </div>
  );
}
