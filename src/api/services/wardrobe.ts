import { apiFetchJson } from '@/api/httpClient'
import type { WardrobeListResponse } from '@/api/types'

export async function fetchMobileWardrobe(params?: {
  limit?: number
  offset?: number
}): Promise<WardrobeListResponse> {
  const q = new URLSearchParams()
  if (params?.limit != null) q.set('limit', String(params.limit))
  if (params?.offset != null) q.set('offset', String(params.offset))
  const suffix = q.toString() ? `?${q.toString()}` : ''
  return apiFetchJson<WardrobeListResponse>(`/api/mobile/wardrobe${suffix}`)
}

export async function fetchMobileWishlist(params?: {
  limit?: number
  offset?: number
}): Promise<WardrobeListResponse> {
  const q = new URLSearchParams()
  if (params?.limit != null) q.set('limit', String(params.limit))
  if (params?.offset != null) q.set('offset', String(params.offset))
  const suffix = q.toString() ? `?${q.toString()}` : ''
  return apiFetchJson<WardrobeListResponse>(`/api/mobile/wishlist${suffix}`)
}
