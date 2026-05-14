export type FashionItem = {
  id: string
  name: string
  brand?: string
  img: string
  skuType?: string
  [key: string]: unknown
}

export type WardrobeListResponse = {
  items: FashionItem[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
