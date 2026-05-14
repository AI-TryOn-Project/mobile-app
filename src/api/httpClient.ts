import { API_BASE_URL } from '@/api/env'
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
} from '@/api/tokenStorage'

type Json = Record<string, unknown> | unknown[]

async function tryRefreshOnce(): Promise<boolean> {
  const refresh = await getStoredRefreshToken()
  if (!refresh) return false
  const res = await fetch(`${API_BASE_URL}/api/mobile/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  })
  if (!res.ok) {
    await clearStoredTokens()
    return false
  }
  const data = (await res.json()) as {
    accessToken: string
    refreshToken: string
  }
  if (!data.accessToken || !data.refreshToken) return false
  await setStoredTokens(data.accessToken, data.refreshToken)
  return true
}

export type ApiFetchOptions = RequestInit & {
  /** Skip Authorization header (e.g. login, refresh) */
  skipAuth?: boolean
}

/**
 * JSON fetch against faishion.ai with Bearer access token + one refresh retry on 401.
 */
export async function apiFetch(path: string, init: ApiFetchOptions = {}): Promise<Response> {
  const { skipAuth, headers, ...rest } = init
  const h = new Headers(headers)

  if (!skipAuth) {
    const access = await getStoredAccessToken()
    if (access) {
      h.set('Authorization', `Bearer ${access}`)
    }
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: h })

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshOnce()
    if (refreshed) {
      const retryHeaders = new Headers(headers)
      const newAccess = await getStoredAccessToken()
      if (newAccess) retryHeaders.set('Authorization', `Bearer ${newAccess}`)
      res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: retryHeaders })
    }
  }

  return res
}

export async function apiFetchJson<T extends Json>(path: string, init: ApiFetchOptions = {}): Promise<T> {
  const res = await apiFetch(path, init)
  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error?: unknown }).error)
        : `HTTP ${res.status}`
    throw new Error(msg)
  }
  return body as T
}
