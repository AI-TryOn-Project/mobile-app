import { API_BASE_URL } from '@/api/env'
import { getStoredAccessToken } from '@/api/tokenStorage'

export type ChatStreamChunk = { text: string }

/**
 * Spike: consume `POST /api/chat` as a byte stream in React Native (no EventSource).
 *
 * - Uses `Authorization: Bearer` when tokens exist (same as web cookie session for user-bound tools).
 * - The server returns the Vercel AI SDK UI stream; this reader concatenates **text** parts naively for debugging.
 * - Production clients should use the AI SDK protocol parser (`@ai-sdk/ui-utils` / `readDataStream`) once bundled for RN.
 */
export async function* readChatResponseLines(
  body: unknown
): AsyncGenerator<ChatStreamChunk, void, unknown> {
  const access = await getStoredAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (access) headers.Authorization = `Bearer ${access}`

  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Chat request failed: ${res.status} ${errText.slice(0, 200)}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const lines = part.split('\n')
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const raw = line.slice(5).trim()
        if (raw === '[DONE]') continue
        try {
          const json = JSON.parse(raw) as { type?: string; delta?: string; textDelta?: string }
          const piece = json.textDelta || json.delta
          if (typeof piece === 'string' && piece.length > 0) {
            yield { text: piece }
          }
        } catch {
          // ignore non-JSON stream lines
        }
      }
    }
  }
}
