import { useDummyFeed } from '@/api/env'

export type FeedItem = {
  id: string
  title: string
  userName: string
  imageUrl: string
  tags: string[]
}

const SAMPLE: FeedItem[] = [
  {
    id: 'dummy-1',
    title: 'Summer linen layers',
    userName: '@stylestudio',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    tags: ['minimal', 'neutral'],
  },
  {
    id: 'dummy-2',
    title: 'City night out',
    userName: '@urbanedit',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    tags: ['evening', 'heels'],
  },
]

/**
 * Dummy feed — see ProductandStrategy/agent_and_api_docs/mobile_app_dummy_apis.md §1.
 */
export async function getFeedDummy(): Promise<FeedItem[]> {
  await new Promise((r) => setTimeout(r, 350))
  if (!useDummyFeed()) {
    // Placeholder for future GET /api/feed when it exists
    return SAMPLE
  }
  return SAMPLE
}
