/* ───────────────────────────────────────────
   Unified API Client
   Swapping mock ↔ real backend = changing BASE_URL
   ─────────────────────────────────────────── */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 400; // ms — simulate network latency

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}

/* Mock helper — adds realistic delay */
export function mockDelay(ms = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Event source for streaming chat (mock or real) */
export function createChatStream(path: string, body: unknown): EventSource {
  const url = `${BASE_URL}${path}`;
  // For mock mode we simulate SSE via a custom EventSource-like object
  // In real mode this connects to the actual SSE endpoint
  if (BASE_URL === "/api" && import.meta.env.DEV) {
    return new MockEventSource(url, body);
  }
  return new EventSource(url);
}

/* Minimal mock EventSource for dev */
class MockEventSource extends EventTarget {
  public readyState = 0;
  public url: string;
  private body: unknown;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, body: unknown) {
    super();
    this.url = url;
    this.body = body;
    this.timer = setTimeout(() => {
      this.readyState = 1;
      this.dispatchEvent(new Event("open"));
      this.simulateStream();
    }, 200);
  }

  private simulateStream() {
    const messages = [
      { data: JSON.stringify({ chunk: "I'd love to help you style that! " }) },
      { data: JSON.stringify({ chunk: "Based on your wardrobe, I think a " }) },
      { data: JSON.stringify({ chunk: "neutral palette with structured pieces " }) },
      { data: JSON.stringify({ chunk: "would work beautifully." }) },
      { data: JSON.stringify({ done: true }) },
    ];
    let i = 0;
    const sendNext = () => {
      if (i >= messages.length) {
        this.close();
        return;
      }
      const msg = messages[i++];
      this.dispatchEvent(new MessageEvent("message", { data: msg.data }));
      this.timer = setTimeout(sendNext, 300);
    };
    sendNext();
  }

  close() {
    this.readyState = 2;
    if (this.timer) clearTimeout(this.timer);
    this.dispatchEvent(new Event("close"));
  }
}
