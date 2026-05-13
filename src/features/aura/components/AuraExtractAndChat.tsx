import React, { useState, useRef, useEffect } from "react";
import { SubView } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/useAppStore";
import { sendChatMessage, getChatSessions, createChatSession } from "@/api/services/chat.service";
import { EXTRACTED_DATA_MOCK } from "@/api/mocks/extracted.mock";
import type { ChatSession, ChatMessage } from "@/api/types";

export const AuraExtractAndChat: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showExtract, setShowExtract] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    const data = await getChatSessions();
    setSessions(data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    setIsTyping(true);

    if (!activeSession) {
      const session = await createChatSession("New Chat");
      setActiveSession(session);
      const response = await sendChatMessage(session.id, content);
      setMessages([...session.messages, response]);
      setIsTyping(false);
      loadSessions();
      return;
    }

    const response = await sendChatMessage(activeSession.id, content);
    setMessages((prev) => [...prev, response]);
    setIsTyping(false);
  };

  if (showExtract) {
    return (
      <SubView title="Extracted Items" onBack={() => setShowExtract(false)}>
        <div className="p-4 space-y-4">
          <p className="text-sm text-neutral-600">{EXTRACTED_DATA_MOCK.scene}</p>
          {EXTRACTED_DATA_MOCK.items.map((item) => (
            <div key={item.id} className="bg-neutral-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">{item.name}</h3>
                <span className="text-xs text-neutral-500">{item.category}</span>
              </div>
              <p className="text-xs text-neutral-500">{item.matchesCount} matches found</p>
              <div className="grid grid-cols-2 gap-2">
                {item.matchData.map((match) => (
                  <div key={match.id} className="space-y-1">
                    <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      <img src={match.image} alt={match.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-neutral-700 truncate">{match.brand}</p>
                    <p className="text-[10px] text-neutral-500">${match.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SubView>
    );
  }

  if (showChat) {
    return (
      <SubView
        title={activeSession?.title || "AI Stylist"}
        onBack={() => {
          setShowChat(false);
          setActiveSession(null);
          setMessages([]);
        }}
      >
        <div className="flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeSession ? (
              <div className="space-y-2">
                <p className="text-sm text-neutral-500 text-center">Select a session or start a new chat</p>
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={async () => {
                      setActiveSession(session);
                      setMessages(session.messages);
                    }}
                    className="w-full text-left p-3 bg-neutral-50 rounded-xl"
                  >
                    <p className="text-sm font-medium text-neutral-900">{session.title}</p>
                    <p className="text-xs text-neutral-500">
                      {session.messages.length} messages
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.images?.map((img, i) => (
                      <img key={i} src={img} alt="" className="mt-2 rounded-lg max-w-full" />
                    ))}
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-neutral-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about styles, outfits..."
                className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-neutral-900 text-white rounded-full disabled:opacity-50"
              >
                <SendIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </SubView>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-6">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
          <SparklesIcon size={32} className="text-neutral-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">AI Stylist</h2>
          <p className="text-sm text-neutral-500">
            Chat with your personal AI stylist for outfit recommendations
          </p>
        </div>
        <div className="w-full space-y-2">
          <button
            onClick={() => setShowChat(true)}
            className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
          >
            Start Chat
          </button>
          <button
            onClick={() => setShowExtract(true)}
            className="w-full py-3.5 bg-neutral-100 text-neutral-900 rounded-xl text-sm font-semibold"
          >
            View Extracted Items
          </button>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
  </svg>
);

const SendIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
