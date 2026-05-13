/* ───────────────────────────────────────────
   Shared API Types — mirrors faishion-web-app API
   ─────────────────────────────────────────── */

/* Auth */
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

export interface AuthMeResponse {
  user: ApiUser;
  accessToken: string;
}

/* Profile */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio?: string;
  handle?: string;
  followers?: number;
  following?: number;
  skills?: string[];
  profile?: {
    height?: number;
    weight?: number;
    bust?: number;
    waist?: number;
    hips?: number;
    unit?: "metric" | "imperial";
  };
}

/* Credits */
export interface CreditsResponse {
  credits: number;
  freeGenerationsUsed: number;
  freeGenerationsLimit: number;
}

/* User State */
export interface UserStateResponse {
  onboardingComplete: boolean;
  lastSeenAt: string;
  preferences: Record<string, unknown>;
}

/* Chat */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/* Task / Try-On */
export interface TryOnTaskRequest {
  title: string;
  scenario: string;
  garmentImageUrls: string[];
  modelImageUrl?: string;
  options?: {
    background?: string;
    pose?: string;
  };
}

export type TaskStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface TaskStatusResponse {
  id: string;
  status: TaskStatus;
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/* Upload */
export interface UploadResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
}

/* Wardrobe / SKU */
export interface WardrobeItem {
  id: number | string;
  brand: string;
  name: string;
  image: string;
  category: string;
  price?: string;
  link?: string;
  type?: "ITEM" | "STYLE";
}

export interface CrawledSku {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
  category: string;
  url: string;
}

/* Style Profile */
export interface StyleProfileResponse {
  tags: string[];
  colors: string[];
  brands: string[];
  occasions: string[];
}

/* Visual Search */
export interface VisualSearchResult {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
  similarity: number;
  url: string;
}

/* Size Recommendation */
export interface SizeRecommendation {
  brand: string;
  size: string;
  confidence: number;
  fit: "tight" | "regular" | "loose";
}

/* Telemetry */
export interface TelemetryEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

/* Referral */
export interface ReferralResponse {
  code: string;
  referrals: number;
  creditsEarned: number;
}

/* Feed */
export interface FeedItem {
  id: number;
  filter: string;
  image: string;
  user: string;
  avatar: string;
  likes: number;
  desc: string;
  tags: string[];
  userId?: string;
}

/* Mix / Gallery */
export interface MixItem {
  id: string;
  title: string;
  date: string;
  published: boolean;
  isResult: boolean;
  image?: string;
  user: { name: string; avatar: string };
  components: { id: string; image: string }[];
}

/* Skill */
export interface Skill {
  id: string;
  name: string;
  userId: string;
  author: string;
  pricingLabel: string;
  ctaLabel: string;
  avatar: string;
  tagline: string;
  followers: number;
  usedCount: number;
  rating: number;
  cover: string;
  moodboard: string[];
  portfolio: string[];
  startLabel: string;
  startPrompt: string;
  rules: string[];
}

/* Scene */
export interface Scene {
  label: string;
  slug: string;
}

/* Onboarding */
export interface OnboardingQuestion {
  id: string;
  label: string;
  prompt: string;
  explanation: string;
  voicePrompt: string;
  placeholder: string;
  suggestions: string[];
}

/* Generic API Response wrapper */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
