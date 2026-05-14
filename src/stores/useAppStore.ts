import { create } from 'zustand'
import {
  DEFAULT_FILTER_TAGS,
  DEFAULT_STYLIST_REPLY,
  MOCK_FEED,
  type FeedItem,
} from '@/constants/appJsxMocks'

export type TabId = 'trending' | 'skills' | 'tryon' | 'profile' | 'wardrobe'

export type TryOnPhase = 'idle' | 'setup' | 'generating' | 'result' | 'error'

type MixEntry = { id: number; image: string }

type AppState = {
  authCompleted: boolean
  setAuthCompleted: (v: boolean) => void

  activeTab: TabId
  setActiveTab: (t: TabId) => void

  mixItems: MixEntry[]
  setMixItems: (fn: (prev: MixEntry[]) => MixEntry[]) => void

  tryOnPhase: TryOnPhase
  tryOnReadyCount: number
  setTryOnStatus: (fn: (prev: { phase: TryOnPhase; profileNotificationCount: number }) => {
    phase: TryOnPhase
    profileNotificationCount: number
  }) => void

  discoveryReply: string
  filterTags: { label: string; slug: string }[]
  setDiscoveryStylist: (reply: string, tags?: { label: string; slug: string }[]) => void

  feedData: FeedItem[]
  setFeedData: (items: FeedItem[]) => void

  showAura: boolean
  setShowAura: (v: boolean) => void

  videoStylistOpen: boolean
  setVideoStylistOpen: (v: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  authCompleted: false,
  setAuthCompleted: (v) => set({ authCompleted: v }),

  activeTab: 'trending',
  setActiveTab: (t) => set({ activeTab: t }),

  mixItems: [],
  setMixItems: (fn) => set({ mixItems: fn(get().mixItems) }),

  tryOnPhase: 'idle',
  tryOnReadyCount: 0,
  setTryOnStatus: (fn) => {
    const prev = { phase: get().tryOnPhase, profileNotificationCount: get().tryOnReadyCount }
    const next = fn(prev)
    set({ tryOnPhase: next.phase, tryOnReadyCount: next.profileNotificationCount })
  },

  discoveryReply: DEFAULT_STYLIST_REPLY,
  filterTags: [...DEFAULT_FILTER_TAGS],
  setDiscoveryStylist: (reply, tags) =>
    set({
      discoveryReply: reply,
      filterTags: tags?.length ? [...tags] : [...DEFAULT_FILTER_TAGS],
    }),

  feedData: [...MOCK_FEED],
  setFeedData: (items) => set({ feedData: items }),

  showAura: false,
  setShowAura: (v) => set({ showAura: v }),

  videoStylistOpen: false,
  setVideoStylistOpen: (v) => set({ videoStylistOpen: v }),
}))
