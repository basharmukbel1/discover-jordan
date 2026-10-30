import { useState } from "react";
import api from "../api";

const initialMessages = [
  {
    role: "assistant",
    content:
      "Tell me your travel dates, interests, and pace. I can suggest a Jordan itinerary using the places selected in your planner.",
  },
];
const suggestedPrompts = [
  "Build a 3-day Petra and Wadi Rum itinerary",
  "Suggest easy hikes for a first-time visitor",
  "Help me plan a Jordan trip on a budget",
];

export default function AiTripAssistant({ token, tripContext }) {
  const [messages, setMessages] = useState(() => [...initialMessages]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [retryMessage, setRetryMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendText = async (text, appendMessage = true) => {
    if (!text || sending) return;
    const history = messages.slice(-8);
    if (appendMessage) {
      setMessages((items) => [...items, { role: "user", content: text }]);
      setMessage("");
    }
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
      setRetryMessage("");
    } catch (requestError) {
      setRetryMessage(text);
      setError(
        requestError.response?.data?.message ||
          "The trip assistant could not respond. Try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (text) void sendText(text);
  };

  const clearConversation = () => {
    setMessages([...initialMessages]);
    setError("");
    setRetryMessage("");
  };

  return (
    <section className="card">
      <div className="card-header bg-transparent d-flex justify-content-between align-items-start gap-3">
        <div>
          <h2 className="h5 mb-1">Jordan trip assistant</h2>
          <p className="small text-secondary mb-0">
            Get a tailored itinerary from Gemini. Verify prices and schedules
            with official sources.
          </p>
        </div>
        <button
          className="btn btn-sm btn-outline-secondary flex-shrink-0"
          type="button"
          onClick={clearConversation}
          disabled={sending || messages.length === initialMessages.length}
        >
          New chat
        </button>
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
          <div className="alert alert-warning py-2 mb-0" role="alert">
            <p className="mb-2">{error}</p>
            {retryMessage && (
              <button
                type="button"
                className="btn btn-sm btn-outline-dark"
                onClick={() => void sendText(retryMessage, false)}
                disabled={sending}
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
      {messages.length === initialMessages.length && (
        <div className="d-flex flex-wrap gap-2 px-3 pb-3">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => void sendText(prompt)}
              disabled={sending}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
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
          aria-describedby="trip-chat-help"
        />
        <button
          className="btn btn-warning"
          type="submit"
          disabled={!message.trim() || sending}
        >
          Send
        </button>
      </form>
      <p id="trip-chat-help" className="visually-hidden">
        You can send a message up to 1200 characters.
      </p>
    </section>
  );
}
