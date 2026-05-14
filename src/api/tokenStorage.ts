import * as SecureStore from 'expo-secure-store'

const ACCESS_KEY = 'faishion.accessToken'
const REFRESH_KEY = 'faishion.refreshToken'

export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY)
  } catch {
    return null
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY)
  } catch {
    return null
  }
}

export async function setStoredTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, access)
  await SecureStore.setItemAsync(REFRESH_KEY, refresh)
}

export async function clearStoredTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => {})
  await SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {})
}
