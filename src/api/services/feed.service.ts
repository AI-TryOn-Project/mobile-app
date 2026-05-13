/* ───────────────────────────────────────────
   Feed Service — mirrors /api/feed routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { FeedItem } from "@/api/types";
import { MOCK_FEED, HAWAII_FEED, NEW_YORK_FEED, DEFAULT_FILTER_TAGS } from "@/api/mocks/feed.mock";

export interface FeedFilters {
  tag?: string;
  location?: string;
  userId?: string;
}

export async function getFeed(filters?: FeedFilters): Promise<FeedItem[]> {
  await mockDelay(400);
  let feed = [...MOCK_FEED];

  if (filters?.location === "hawaii") {
    feed = [...HAWAII_FEED];
  } else if (filters?.location === "newyork") {
    feed = [...NEW_YORK_FEED];
  }

  if (filters?.tag && filters.tag !== "all") {
    feed = feed.filter((item) => item.tags.includes(filters.tag!));
  }

  if (filters?.userId) {
    feed = feed.filter((item) => item.userId === filters.userId);
  }

  return feed;
}

export async function getFeedTags(): Promise<typeof DEFAULT_FILTER_TAGS> {
  await mockDelay(200);
  return DEFAULT_FILTER_TAGS;
}

export async function likeFeedItem(itemId: number): Promise<{ likes: number }> {
  await mockDelay(200);
  const item = MOCK_FEED.find((i) => i.id === itemId);
  if (item) item.likes += 1;
  return { likes: item?.likes || 0 };
}

export async function searchFeed(query: string): Promise<FeedItem[]> {
  await mockDelay(500);
  const q = query.toLowerCase();
  return MOCK_FEED.filter(
    (item) =>
      item.desc.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
  );
}
