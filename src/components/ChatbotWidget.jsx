import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatbotWidget.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const starterPrompts = [
  "How do I find resources for my department?",
  "What can I upload to the platform?",
  "How do I reset my password?",
];

const createAssistantMessage = (content) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role: "assistant",
  content,
});

const createUserMessage = (content) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role: "user",
  content,
});

const getFriendlyErrorMessage = (response, data) => {
  const errorCode = data?.code;

  if (response.status === 429 || errorCode === "RESOURCE_EXHAUSTED") {
    return "The assistant is a little busy right now. Please try again in a moment.";
  }

  if (response.status === 401 || errorCode === "API_KEY_INVALID") {
    return "The assistant is temporarily unavailable right now. Please try again later.";
  }

  if (response.status === 503) {
    return "The assistant is not ready yet. Please try again shortly.";
  }

  if (response.status >= 500) {
    return "Something went wrong on our side. Please try again in a bit.";
  }

  return "I couldn't get a response just now. Please try again.";
};

const getErrorMessageFromResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return {
      data,
      message: response.ok
        ? data?.message || "The chatbot could not respond."
        : getFriendlyErrorMessage(response, data),
    };
  }

  await response.text();
  return {
    data: null,
    message: getFriendlyErrorMessage(response, null),
  };
};

const renderFormattedLine = (line, messageId, lineIndex) => {
  const matches = [...line.matchAll(/\*\*(.+?)\*\*/g)];

  if (!matches.length) {
    return line;
  }

  const parts = [];
  let lastIndex = 0;

  matches.forEach((match, matchIndex) => {
    const [fullMatch, boldText] = match;
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      parts.push(line.slice(lastIndex, startIndex));
    }

    parts.push(
      <strong key={`${messageId}-${lineIndex}-${matchIndex}`}>
        {boldText}
      </strong>
    );

    lastIndex = startIndex + fullMatch.length;
  });

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
};

const renderMessageContent = (message) => {
  const lines = message.content.split("\n");

  return lines.map((line, index) => {
    if (!line.trim()) {
      return <div key={`${message.id}-${index}`} className="chatbot-message__spacer" />;
    }

    return (
      <p key={`${message.id}-${index}`} className="chatbot-message__line">
        {renderFormattedLine(line, message.id, index)}
      </p>
    );
  });
};

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef(null);
  const [messages, setMessages] = useState([
    createAssistantMessage(
      "Hi, I am the Resource Hub assistant. Ask me about finding materials, uploads, or using the platform."
    ),
  ]);

  const conversationPayload = useMemo(() => {
    return messages.map(({ role, content }) => ({ role, content }));
  }, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  const sendMessage = async (rawMessage) => {
    const trimmedMessage = rawMessage.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage = createUserMessage(trimmedMessage);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...conversationPayload, { role: "user", content: trimmedMessage }],
        }),
      });

      const { data, message } = await getErrorMessageFromResponse(response);

      if (!response.ok || !data?.success || !data?.reply) {
        throw new Error(message);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createAssistantMessage(data.reply),
      ]);
    } catch (requestError) {
      setError(requestError.message || "The chatbot could not respond.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
      >
        <span className="chatbot-launcher__icon">AI</span>
        <span className="chatbot-launcher__label">
          {isOpen ? "Close assistant" : "Ask assistant"}
        </span>
      </button>

      {isOpen && (
        <section className="chatbot-panel" id="chatbot-panel" aria-label="AI assistant">
          <div className="chatbot-panel__header">
            <div>
              <p className="chatbot-panel__eyebrow">AI support</p>
              <h2>Resource Hub Assistant</h2>
            </div>
            <button
              type="button"
              className="chatbot-panel__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              x
            </button>
          </div>

          <div className="chatbot-panel__prompts">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="chatbot-prompt"
                onClick={() => sendMessage(prompt)}
                disabled={isSending}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={`chatbot-message chatbot-message--${message.role}`}
              >
                {renderMessageContent(message)}
              </article>
            ))}

            {isSending && (
              <article className="chatbot-message chatbot-message--assistant chatbot-message--typing">
                <p>Thinking...</p>
              </article>
            )}
          </div>

          {error && <p className="chatbot-error">{error}</p>}

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about resources, uploads, or using the platform..."
              rows={3}
              disabled={isSending}
            />
            <button type="submit" disabled={isSending || !input.trim()}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default ChatbotWidget;
