/* ───────────────────────────────────────────
   Wardrobe Service — mirrors /api/wardrobe & /api/crawled-sku routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { WardrobeItem, CrawledSku } from "@/api/types";
import { INITIAL_WARDROBE } from "@/api/mocks/wardrobe.mock";
import { MOCK_WISHLIST } from "@/api/mocks/wishlist.mock";
import { WEDDING_ITEMS, LINEN_SKIRT_ITEMS } from "@/api/mocks/shop.mock";

let wardrobe = [...INITIAL_WARDROBE];
let wishlist = [...MOCK_WISHLIST];

export async function getWardrobe(): Promise<WardrobeItem[]> {
  await mockDelay(300);
  return wardrobe;
}

export async function getWishlist(): Promise<WardrobeItem[]> {
  await mockDelay(300);
  return wishlist;
}

export async function addToWardrobe(item: Omit<WardrobeItem, "id">): Promise<WardrobeItem> {
  await mockDelay(400);
  const newItem = { ...item, id: Date.now() };
  wardrobe = [...wardrobe, newItem];
  return newItem;
}

export async function addToWishlist(item: Omit<WardrobeItem, "id">): Promise<WardrobeItem> {
  await mockDelay(400);
  const newItem = { ...item, id: Date.now() };
  wishlist = [...wishlist, newItem];
  return newItem;
}

export async function removeFromWardrobe(id: number | string): Promise<void> {
  await mockDelay(300);
  wardrobe = wardrobe.filter((i) => i.id !== id);
}

export async function removeFromWishlist(id: number | string): Promise<void> {
  await mockDelay(300);
  wishlist = wishlist.filter((i) => i.id !== id);
}

export async function getShopItems(category?: string): Promise<CrawledSku[]> {
  await mockDelay(400);
  const all = [...WEDDING_ITEMS, ...LINEN_SKIRT_ITEMS] as CrawledSku[];
  if (category && category !== "All") {
    return all.filter((i) => i.category === category);
  }
  return all;
}

export async function uploadWardrobeImage(file: File): Promise<{ url: string }> {
  await mockDelay(1500);
  // Mock: return a blob URL
  return { url: URL.createObjectURL(file) };
}
