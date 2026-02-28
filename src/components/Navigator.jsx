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

Ontario Residential Tenancies Act (RTA) Key Rules:
- 24 hours written notice required before landlord entry
- Maximum rent increase: 2.5% annually (2024 guideline)
- Landlords must maintain units in good repair
- Illegal to change locks without tenant consent
- Eviction requires proper N-notices and LTB hearing

Your job:
1. Identify what type of issue the user has (employment or tenant)
2. Ask for specific details needed to assess their situation
3. Calculate what they are owed if applicable
4. Explain their options from lowest to highest escalation
5. Help draft demand letters if requested
6. ALWAYS clarify: you prepare everything, but the human decides whether to formally file

Keep responses concise and action-oriented. Use plain language. Always cite the specific law (ESA section or RTA provision).

IMPORTANT: Never contact anyone on the user's behalf. Never file anything. Your role ends at preparation , the human decides when and if to escalate.`;

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    'Hi. This is a private space to understand your rights as a worker or tenant in Ontario.\n\nNothing here is shared with anyone , not your employer, not your landlord, not the government , unless you decide to take action yourself.\n\nTell me what\'s going on. You can start with something like:\n\n→ "I think I\'ve been underpaid"\n→ "My landlord won\'t fix my heat"\n→ "I was fired and don\'t know if it was legal"\n\nWhat\'s happening?',
};

export default function Navigator() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("API failed");
      }

      const data = await response.json();
      console.log(data);
      const reply =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text ||
        "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    }

    setLoading(false);
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

        {loading && (
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
        <button
          className={`navigator__send ${input.trim() && !loading ? "navigator__send--active" : ""}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send →
        </button>
      </div>

      <p className="navigator__disclaimer">
        This tool does not file complaints or contact anyone on your behalf. All
        decisions are yours.
      </p>
    </div>
  );
}
