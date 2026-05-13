/* ───────────────────────────────────────────
   Chat Service — mirrors /api/chat routes
   ─────────────────────────────────────────── */

import { mockDelay, createChatStream } from "@/api/client";
import type { ChatSession, ChatMessage } from "@/api/types";

const sessions: ChatSession[] = [
  {
    id: "session_1",
    title: "Style Advice",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "What should I wear to a summer wedding?",
        createdAt: new Date().toISOString(),
      },
      {
        id: "m2",
        role: "assistant",
        content: "For a summer wedding, I'd recommend a light linen suit or a floral midi dress. Keep the colors pastel or neutral, and don't forget comfortable block heels!",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getChatSessions(): Promise<ChatSession[]> {
  await mockDelay(300);
  return sessions;
}

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  await mockDelay(200);
  return sessions.find((s) => s.id === sessionId) || null;
}

export async function createChatSession(title: string): Promise<ChatSession> {
  await mockDelay(400);
  const session: ChatSession = {
    id: `session_${Date.now()}`,
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export async function sendChatMessage(
  sessionId: string,
  content: string,
  images?: string[]
): Promise<ChatMessage> {
  await mockDelay(600);
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error("Session not found");

  const userMsg: ChatMessage = {
    id: `m_${Date.now()}`,
    role: "user",
    content,
    images,
    createdAt: new Date().toISOString(),
  };
  session.messages.push(userMsg);

  // Simulate assistant response
  const assistantMsg: ChatMessage = {
    id: `m_${Date.now() + 1}`,
    role: "assistant",
    content: `I'd love to help with "${content}"! Based on your style profile, I think something elegant and comfortable would work perfectly.`,
    createdAt: new Date().toISOString(),
  };
  session.messages.push(assistantMsg);
  session.updatedAt = new Date().toISOString();

  return assistantMsg;
}

export function streamChatMessage(sessionId: string, content: string): EventSource {
  return createChatStream(`/chat/sessions/${sessionId}/stream`, { content });
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await mockDelay(200);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx >= 0) sessions.splice(idx, 1);
}
