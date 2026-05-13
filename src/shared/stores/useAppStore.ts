import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_FEED } from "@/api/mocks/feed.mock";
import { MOCK_MIX_GALLERY } from "@/api/mocks/gallery.mock";
import { MOCK_WISHLIST } from "@/api/mocks/wishlist.mock";
import { INITIAL_WARDROBE } from "@/api/mocks/wardrobe.mock";
import { DEFAULT_FILTER_TAGS } from "@/api/mocks/feed.mock";
import { PROFILE_VISIBILITY } from "@/api/mocks/users.mock";

/* ─── Types ─── */
export type TabKey = "trending" | "wardrobe" | "tryon" | "profile" | "skills";
export type TryOnPhase = "idle" | "uploading" | "generating" | "complete" | "error";

export interface TryOnStatus {
  phase: TryOnPhase;
  loadingText: string;
  profileNotificationCount: number;
  runId: string | null;
}

export interface OutfitItem {
  type: "image" | "text";
  content: string;
}

export interface Outfit {
  id: number;
  title: string;
  source: string;
  items: OutfitItem[];
  tags: { label: string; classes: string }[];
}

export interface AppState {
  /* Navigation */
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  /* Auth / Onboarding */
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;

  /* Feed */
  feed: typeof MOCK_FEED;
  setFeed: (feed: typeof MOCK_FEED) => void;

  /* Mixes / Gallery */
  mixes: typeof MOCK_MIX_GALLERY;
  setMixes: (mixes: typeof MOCK_MIX_GALLERY) => void;

  /* Wishlist */
  wishlist: typeof MOCK_WISHLIST;
  setWishlist: (w: typeof MOCK_WISHLIST) => void;

  /* Wardrobe */
  wardrobe: typeof INITIAL_WARDROBE;
  setWardrobe: (w: typeof INITIAL_WARDROBE) => void;
  wardrobeMainTab: "Owned" | "Wishlist";
  setWardrobeMainTab: (t: "Owned" | "Wishlist") => void;
  wardrobeFilter: string;
  setWardrobeFilter: (f: string) => void;
  wardrobeWishlistFilter: string;
  setWardrobeWishlistFilter: (f: string) => void;

  /* Discovery Stylist */
  discoveryReply: string;
  setDiscoveryReply: (r: string) => void;
  discoveryTags: typeof DEFAULT_FILTER_TAGS;
  setDiscoveryTags: (t: typeof DEFAULT_FILTER_TAGS) => void;

  /* Try-On */
  tryOnDraft: { title: string; scenario: string };
  setTryOnDraft: (d: { title: string; scenario: string }) => void;
  tryOnStatus: TryOnStatus;
  setTryOnStatus: (s: TryOnStatus | ((prev: TryOnStatus) => TryOnStatus)) => void;

  /* Outfits */
  outfits: Outfit[];
  setOutfits: (o: Outfit[]) => void;
  outfitUnread: number;
  setOutfitUnread: (n: number) => void;

  /* Profile */
  profileTab: "closet" | "settings" | "privacy" | "stats";
  setProfileTab: (t: AppState["profileTab"]) => void;
  mixesSubTab: "Generated" | "Saved" | "Published";
  setMixesSubTab: (t: AppState["mixesSubTab"]) => void;

  /* Followers */
  followedUsers: string[];
  toggleFollowUser: (userId: string) => void;

  /* Privacy */
  privacy: {
    wardrobe: typeof PROFILE_VISIBILITY.PUBLIC;
    wishlist: typeof PROFILE_VISIBILITY.PUBLIC;
  };
  setPrivacy: (p: AppState["privacy"]) => void;

  /* Viewing Profile */
  viewingProfileId: string | null;
  setViewingProfileId: (id: string | null) => void;

  /* Notifications */
  wardrobeNoticeCount: number;
  setWardrobeNoticeCount: (n: number) => void;

  /* Flying Image Animation */
  flyingImage: string | null;
  setFlyingImage: (img: string | null) => void;

  /* Video Stylist */
  videoStylistOpen: boolean;
  setVideoStylistOpen: (v: boolean) => void;

  /* Upload */
  wardrobeUpload: any;
  setWardrobeUpload: (u: any) => void;
}

/* ─── Store ─── */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "trending",
      setActiveTab: (tab) => set({ activeTab: tab }),

      isAuthenticated: false,
      setIsAuthenticated: (v) => set({ isAuthenticated: v }),

      feed: MOCK_FEED,
      setFeed: (feed) => set({ feed }),

      mixes: MOCK_MIX_GALLERY,
      setMixes: (mixes) => set({ mixes }),

      wishlist: MOCK_WISHLIST,
      setWishlist: (wishlist) => set({ wishlist }),

      wardrobe: INITIAL_WARDROBE,
      setWardrobe: (wardrobe) => set({ wardrobe }),
      wardrobeMainTab: "Owned",
      setWardrobeMainTab: (wardrobeMainTab) => set({ wardrobeMainTab }),
      wardrobeFilter: "All",
      setWardrobeFilter: (wardrobeFilter) => set({ wardrobeFilter }),
      wardrobeWishlistFilter: "Items",
      setWardrobeWishlistFilter: (wardrobeWishlistFilter) => set({ wardrobeWishlistFilter }),

      discoveryReply: "Tell me the occasion and I will help style it.",
      setDiscoveryReply: (discoveryReply) => set({ discoveryReply }),
      discoveryTags: DEFAULT_FILTER_TAGS,
      setDiscoveryTags: (discoveryTags) => set({ discoveryTags }),

      tryOnDraft: { title: "", scenario: "" },
      setTryOnDraft: (tryOnDraft) => set({ tryOnDraft }),
      tryOnStatus: {
        phase: "idle",
        loadingText: "",
        profileNotificationCount: 0,
        runId: null,
      },
      setTryOnStatus: (s) =>
        set((state) => ({
          tryOnStatus: typeof s === "function" ? s(state.tryOnStatus) : s,
        })),

      outfits: [
        {
          id: 1,
          title: "Cute everyday outfit",
          source: "Saved from Wardrobe",
          items: [
            { type: "image", content: "https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg" },
            { type: "image", content: "https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg" },
            { type: "image", content: "https://i.pinimg.com/736x/aa/70/62/aa70622a9ecdac7f1b54307b61a41207.jpg" },
            { type: "image", content: "https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg" },
          ],
          tags: [{ label: "CASUAL", classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }],
        },
        {
          id: 2,
          title: "Work outfit",
          source: "Saved from Wardrobe",
          items: [
            { type: "image", content: "https://i.pinimg.com/1200x/52/f6/57/52f65798fb399c2c00a8e0c46b3bf5b8.jpg" },
            { type: "image", content: "https://i.pinimg.com/1200x/80/03/27/8003277e7ed81a18ae2ce4279550ec77.jpg" },
            { type: "image", content: "https://i.pinimg.com/736x/45/d8/0e/45d80e89945ab6d354a12280e9071d7c.jpg" },
          ],
          tags: [{ label: "WORKWEAR", classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }],
        },
      ],
      setOutfits: (outfits) => set({ outfits }),
      outfitUnread: 0,
      setOutfitUnread: (outfitUnread) => set({ outfitUnread }),

      profileTab: "closet",
      setProfileTab: (profileTab) => set({ profileTab }),
      mixesSubTab: "Generated",
      setMixesSubTab: (mixesSubTab) => set({ mixesSubTab }),

      followedUsers: [],
      toggleFollowUser: (userId) =>
        set((state) => ({
          followedUsers: state.followedUsers.includes(userId)
            ? state.followedUsers.filter((id) => id !== userId)
            : [...state.followedUsers, userId],
        })),

      privacy: {
        wardrobe: PROFILE_VISIBILITY.PUBLIC,
        wishlist: PROFILE_VISIBILITY.PUBLIC,
      },
      setPrivacy: (privacy) => set({ privacy }),

      viewingProfileId: null,
      setViewingProfileId: (viewingProfileId) => set({ viewingProfileId }),

      wardrobeNoticeCount: 0,
      setWardrobeNoticeCount: (wardrobeNoticeCount) => set({ wardrobeNoticeCount }),

      flyingImage: null,
      setFlyingImage: (flyingImage) => set({ flyingImage }),

      videoStylistOpen: false,
      setVideoStylistOpen: (videoStylistOpen) => set({ videoStylistOpen }),

      wardrobeUpload: null,
      setWardrobeUpload: (wardrobeUpload) => set({ wardrobeUpload }),
    }),
    {
      name: "faishion-app-store",
      partialize: (state) => ({
        followedUsers: state.followedUsers,
        privacy: state.privacy,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
