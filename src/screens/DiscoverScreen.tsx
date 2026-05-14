import React, { useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'
import { DEFAULT_FILTER_TAGS, MOCK_FEED, type FeedItem } from '@/constants/appJsxMocks'

const STYLIST_AVATAR =
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=80'

export function DiscoverScreen() {
  const insets = useSafeAreaInsets()
  const discoveryReply = useAppStore((s) => s.discoveryReply)
  const filterTags = useAppStore((s) => s.filterTags)
  const feedData = useAppStore((s) => s.feedData)
  const setFeedData = useAppStore((s) => s.setFeedData)
  const setDiscoveryStylist = useAppStore((s) => s.setDiscoveryStylist)

  const [activeCommunityFilter, setActiveCommunityFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isStylistCollapsed, setIsStylistCollapsed] = useState(false)

  const filteredFeed = useMemo(
    () =>
      feedData.filter(
        (item) => activeCommunityFilter === 'All' || item.filter === activeCommunityFilter
      ),
    [feedData, activeCommunityFilter]
  )

  const runStylistFeed = () => {
    const q = searchQuery.trim()
    if (!q) return
    const lower = q.toLowerCase()
    let items: FeedItem[] = [...feedData]
    let reply = `I pulled a fresh set of looks for ${q}.`
    let tags = [...DEFAULT_FILTER_TAGS]
    if (lower.includes('hawaii') || lower.includes('夏威夷')) {
      reply = 'Hawaii has a few different vibes — tap a scene to filter.'
      tags = [
        { label: 'Beach Day', slug: 'beach-day' },
        { label: 'Brunch', slug: 'brunch' },
      ]
      items = MOCK_FEED.slice(0, 4).map((it, i) => {
        if (i === 0) return { ...it, filter: 'beach-day' }
        if (i === 1) return { ...it, filter: 'brunch' }
        return it
      })
    }
    setDiscoveryStylist(reply, tags)
    setFeedData(items)
    setActiveCommunityFilter('All')
    setSearchQuery('')
    setIsStylistCollapsed(false)
  }

  const leftCol = filteredFeed.filter((_, i) => i % 2 === 0)
  const rightCol = filteredFeed.filter((_, i) => i % 2 === 1)

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 100 }]}>
      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setIsStylistCollapsed(true)}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={[styles.stickyHeader, { paddingTop: insets.top + 8 }]}>
          <View style={styles.composerOuter}>
            <View
              style={[
                styles.composer,
                isStylistCollapsed ? styles.composerCollapsed : styles.composerExpanded,
              ]}
            >
              <View style={styles.avatarRing}>
                <Image source={{ uri: STYLIST_AVATAR }} style={styles.avatarImg} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={isStylistCollapsed ? 1 : 8} style={styles.stylistText}>
                  {discoveryReply}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          <Pressable
            onPress={() => setActiveCommunityFilter('All')}
            style={[styles.tag, activeCommunityFilter === 'All' && styles.tagOn]}
          >
            <Text style={[styles.tagText, activeCommunityFilter === 'All' && styles.tagTextOn]}>All</Text>
          </Pressable>
          {filterTags.map((tag) => (
            <Pressable
              key={tag.slug}
              onPress={() => setActiveCommunityFilter(tag.slug)}
              style={[styles.tag, activeCommunityFilter === tag.slug && styles.tagOn]}
            >
              <Text
                style={[styles.tagText, activeCommunityFilter === tag.slug && styles.tagTextOn]}
              >
                {tag.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.masonry}>
          <View style={styles.col}>
            {leftCol.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </View>
          <View style={styles.col}>
            {rightCol.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.searchDock, { bottom: insets.bottom + 88 }]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Ask the stylist…"
          placeholderTextColor="#999"
          style={styles.searchInput}
          onSubmitEditing={runStylistFeed}
          returnKeyType="send"
        />
        <Pressable style={styles.sendBtn} onPress={runStylistFeed}>
          <Text style={styles.sendBtnText}>Send</Text>
        </Pressable>
      </View>
    </View>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Pressable style={styles.cardWrap}>
      <View style={styles.cardInner}>
        <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
      </View>
      <Text style={styles.cardMeta} numberOfLines={1}>
        {item.user}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain },
  stickyHeader: {
    zIndex: 30,
    backgroundColor: 'rgba(245,243,239,0.96)',
    paddingBottom: 12,
  },
  composerOuter: { paddingHorizontal: 16 },
  composer: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 12,
    ...shadows.composer,
  },
  composerExpanded: {
    alignItems: 'flex-start',
    borderRadius: 26,
    paddingVertical: 10,
  },
  composerCollapsed: {
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingVertical: 8,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
  },
  avatarImg: { width: '100%', height: '100%' },
  stylistText: {
    fontSize: typography.small,
    color: '#2b2723',
    lineHeight: 18,
  },
  tagsRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.cardWhite,
  },
  tagOn: { backgroundColor: colors.textDark, borderColor: colors.textDark },
  tagText: { fontSize: typography.small, fontWeight: '500', color: colors.textDark },
  tagTextOn: { color: colors.white, fontWeight: '700' },
  masonry: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  col: { flex: 1, gap: 16 },
  cardWrap: { marginBottom: 4 },
  cardInner: {
    borderRadius: radii.xxl,
    backgroundColor: colors.feedCardBg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImg: { width: '100%', aspectRatio: 1.15 },
  cardMeta: {
    marginTop: 6,
    fontSize: typography.caption,
    color: colors.textMutedGray,
    fontWeight: '600',
  },
  searchDock: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.bodyMd,
    color: colors.textDark,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.textDark,
  },
  sendBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.small },
})
