/* ───────────────────────────────────────────
   Upload Service — mirrors /api/upload/* routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { UploadResponse } from "@/api/types";

export async function uploadUserImage(file: File): Promise<UploadResponse> {
  await mockDelay(1200);
  return {
    id: `img_${Date.now()}`,
    url: URL.createObjectURL(file),
  };
}

export async function uploadImageFromUrl(imageUrl: string): Promise<UploadResponse> {
  await mockDelay(800);
  return {
    id: `img_url_${Date.now()}`,
    url: imageUrl,
  };
}

export async function uploadWardrobeImage(file: File): Promise<UploadResponse> {
  await mockDelay(1500);
  return {
    id: `wardrobe_${Date.now()}`,
    url: URL.createObjectURL(file),
    thumbnailUrl: URL.createObjectURL(file),
  };
}

export async function uploadImageBlob(blob: Blob): Promise<UploadResponse> {
  await mockDelay(1000);
  return {
    id: `blob_${Date.now()}`,
    url: URL.createObjectURL(blob),
  };
}

export async function uploadVideo(file: File): Promise<UploadResponse> {
  await mockDelay(2000);
  return {
    id: `video_${Date.now()}`,
    url: URL.createObjectURL(file),
  };
}

export async function getUserImage(imageId: string): Promise<{ url: string; id: string }> {
  await mockDelay(200);
  return { id: imageId, url: `https://picsum.photos/seed/${imageId}/400/600` };
}
