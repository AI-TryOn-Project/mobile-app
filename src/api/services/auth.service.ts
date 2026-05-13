/* ───────────────────────────────────────────
   Auth Service — mirrors /api/auth/* routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { AuthMeResponse } from "@/api/types";
import { MOCK_USERS } from "@/api/mocks/users.mock";

const AUTH_STORAGE_KEY = "faishion.authOnboarding";

export interface OnboardingForm {
  name: string;
  email: string;
  instagram: string;
}

export interface OnboardingAnswers {
  lifestyle?: string;
  icon?: string;
  emotionalGoal?: string;
}

export interface OnboardingProfile {
  name: string;
  email: string;
  instagramHandle: string;
  avatar: string;
  bio: string;
  answers: OnboardingAnswers;
}

export async function getAuthMe(): Promise<AuthMeResponse> {
  await mockDelay(300);
  const saved = loadAuthFromStorage();
  if (saved) {
    return {
      user: {
        id: saved.email,
        email: saved.email,
        name: saved.name,
        image: saved.avatar,
      },
      accessToken: "mock-token-" + Date.now(),
    };
  }
  // Return first mock user as guest
  const u = MOCK_USERS[0];
  return {
    user: { id: u.id, email: `${u.handle}@example.com`, name: u.name, image: u.avatar },
    accessToken: "mock-guest-token",
  };
}

export async function signInWithGoogle(): Promise<AuthMeResponse> {
  await mockDelay(600);
  const u = MOCK_USERS[0];
  return {
    user: { id: u.id, email: `${u.handle}@example.com`, name: u.name, image: u.avatar },
    accessToken: "mock-google-token",
  };
}

export async function signInWithInstagram(): Promise<AuthMeResponse> {
  await mockDelay(800);
  const u = MOCK_USERS[14]; // Anna Curates
  return {
    user: { id: u.id, email: `${u.handle}@example.com`, name: u.name, image: u.avatar },
    accessToken: "mock-instagram-token",
  };
}

export async function logout(): Promise<void> {
  await mockDelay(200);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function buildOnboardingProfile(form: OnboardingForm, answers: OnboardingAnswers): OnboardingProfile {
  const name = form.name.trim() || "Style Insider";
  const instagramHandle = (form.instagram.trim() || name.toLowerCase().replace(/\s+/g, "")).replace(/^@*/, "");
  return {
    name,
    email: form.email.trim(),
    instagramHandle: `@${instagramHandle || "styledaily"}`,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`,
    bio: `Fashion enthusiast. ${answers.lifestyle || ""}`,
    answers,
  };
}

export function saveAuthToStorage(profile: OnboardingProfile): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
}

export function loadAuthFromStorage(): OnboardingProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
