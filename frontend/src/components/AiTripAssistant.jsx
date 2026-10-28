import { useState } from "react";
import api from "../api";

const initialMessages = [
  {
    role: "assistant",
    content:
      "Tell me your travel dates, interests, and pace. I can suggest a Jordan itinerary using the places selected in your planner.",
  },
];

export default function AiTripAssistant({ token, tripContext }) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;
    const history = messages.slice(-8);
    setMessages((items) => [...items, { role: "user", content: text }]);
    setMessage("");
    setError("");
    setSending(true);
    try {
      const { data } = await api.post(
        "/api/assistant/chat",
        { message: text, history, tripContext },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages((items) => [
        ...items,
        { role: "assistant", content: data.reply },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "The trip assistant could not respond. Try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card">
      <div className="card-header bg-transparent">
        <h2 className="h5 mb-1">Jordan trip assistant</h2>
        <p className="small text-secondary mb-0">
          Gemini itinerary suggestions · verify prices and schedules with
          official sources.
        </p>
      </div>
      <div className="chat-messages" aria-live="polite">
        {messages.map((item, index) => (
          <p
            key={`${item.role}-${index}`}
            className={`chat-message ${item.role === "user" ? "chat-user" : "chat-assistant"}`}
          >
            {item.content}
          </p>
        ))}
        {sending && (
          <p className="small text-secondary" role="status">
            Thinking through your itinerary…
          </p>
        )}
        {error && (
          <div className="alert alert-warning py-2" role="alert">
            {error}
          </div>
        )}
      </div>
      <form
        className="card-footer bg-transparent d-flex gap-2"
        onSubmit={sendMessage}
      >
        <label className="visually-hidden" htmlFor="trip-chat-input">
          Message the trip assistant
        </label>
        <input
          id="trip-chat-input"
          className="form-control"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about your Jordan trip…"
          maxLength={1200}
          disabled={sending}
        />
        <button
          className="btn btn-warning"
          type="submit"
          disabled={!message.trim() || sending}
        >
          Send
        </button>
      </form>
    </section>
  );
}
