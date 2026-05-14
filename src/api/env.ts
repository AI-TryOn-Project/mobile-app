const raw = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://faishion.ai'
export const API_BASE_URL = raw.replace(/\/$/, '')

/** When true (default), feed uses in-app dummy per mobile_app_dummy_apis.md */
export function useDummyFeed(): boolean {
  return process.env.EXPO_PUBLIC_USE_DUMMY_FEED !== 'false'
}
