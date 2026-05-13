/* ───────────────────────────────────────────
   Profile Service — mirrors /api/profile routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { UserProfile, StyleProfileResponse, CreditsResponse, UserStateResponse } from "@/api/types";
import { MOCK_USERS } from "@/api/mocks/users.mock";

export async function getProfile(userId?: string): Promise<UserProfile> {
  await mockDelay(300);
  const mock = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
  return {
    id: mock.id,
    name: mock.name,
    email: `${mock.handle}@example.com`,
    image: mock.avatar,
    bio: mock.bio,
    handle: mock.handle,
    followers: mock.followers,
    following: mock.following,
    skills: mock.skills,
    profile: {
      height: 170,
      weight: 60,
      bust: 86,
      waist: 68,
      hips: 94,
      unit: "metric",
    },
  };
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  await mockDelay(400);
  const current = await getProfile();
  return { ...current, ...updates };
}

export async function getStyleProfile(userId?: string): Promise<StyleProfileResponse> {
  await mockDelay(300);
  const mock = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
  return {
    tags: mock.skills || ["minimalist", "chic"],
    colors: ["neutral", "beige", "black", "white"],
    brands: ["ZARA", "MANGO", "Reformation"],
    occasions: ["casual", "work", "evening"],
  };
}

export async function getCredits(): Promise<CreditsResponse> {
  await mockDelay(200);
  return {
    credits: 12,
    freeGenerationsUsed: 3,
    freeGenerationsLimit: 5,
  };
}

export async function getUserState(): Promise<UserStateResponse> {
  await mockDelay(200);
  return {
    onboardingComplete: true,
    lastSeenAt: new Date().toISOString(),
    preferences: {},
  };
}

export async function updateUserState(updates: Partial<UserStateResponse>): Promise<UserStateResponse> {
  await mockDelay(200);
  const current = await getUserState();
  return { ...current, ...updates };
}
