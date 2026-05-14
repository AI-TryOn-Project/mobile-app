import { API_BASE_URL } from '@/api/env'
import { clearStoredTokens, getStoredRefreshToken, setStoredTokens } from '@/api/tokenStorage'

export type MobileUser = {
  id: string
  email: string
  name: string
  image: string | null
}

export type LoginSuccess = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: MobileUser | null
}

export async function mobileLoginPassword(email: string, password: string): Promise<LoginSuccess> {
  const res = await fetch(`${API_BASE_URL}/api/mobile/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grantType: 'password', email: email.trim(), password }),
  })
  const data = (await res.json().catch(() => ({}))) as LoginSuccess & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || `Login failed (${res.status})`)
  }
  if (!data.accessToken || !data.refreshToken) {
    throw new Error('Invalid login response')
  }
  await setStoredTokens(data.accessToken, data.refreshToken)
  return data
}

export async function mobileLogout(): Promise<void> {
  const refresh = await getStoredRefreshToken()
  if (refresh) {
    await fetch(`${API_BASE_URL}/api/mobile/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    }).catch(() => {})
  }
  await clearStoredTokens()
}
