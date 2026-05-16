import React, { useCallback, useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Mic, Send } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fontFamily, layout, radii, shadows, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'
import { type FeedItem, type ShopItem } from '@/constants/appJsxMocks'
import { PostDetailsOverlay } from '@/components/PostDetailsOverlay'

const STYLIST_AVATAR =
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=80'

export function DiscoverScreen() {
  const insets = useSafeAreaInsets()
  const { width: vw } = useWindowDimensions()
  const discoveryReply = useAppStore((s) => s.discoveryReply)
  const filterTags = useAppStore((s) => s.filterTags)
  const feedData = useAppStore((s) => s.feedData)

  const [activeCommunityFilter, setActiveCommunityFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isStylistCollapsed, setIsStylistCollapsed] = useState(false)
  const [selectedPost, setSelectedPost] = useState<FeedItem | null>(null)
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(() => new Set())
  const [mixedPostIds, setMixedPostIds] = useState<Set<number>>(() => new Set())
  const [mixedItemIds, setMixedItemIds] = useState<Set<string>>(() => new Set())
  const [wishlistItemIds, setWishlistItemIds] = useState<Set<string>>(() => new Set())

  const togglePostId = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) => {
      setter((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    []
  )

  const toggleItemId = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
      setter((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    []
  )

  const isWishlisted = useCallback(
    (baseId: string) => wishlistItemIds.has(baseId),
    [wishlistItemIds]
  )

  const onToggleWishlist = useCallback((item: ShopItem) => {
    setWishlistItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(item.baseId)) next.delete(item.baseId)
      else next.add(item.baseId)
      return next
    })
  }, [])

  const filteredFeed = useMemo(
    () =>
      feedData.filter(
        (item) => activeCommunityFilter === 'All' || item.filter === activeCommunityFilter
      ),
    [feedData, activeCommunityFilter]
  )

  const paddingH = 16
  const gap = 12
  const cardW = (vw - paddingH * 2 - gap) / 2
  const cols = useMemo(() => {
    const nextCols: { items: FeedItem[]; h: number }[] = [
      { items: [], h: 0 },
      { items: [], h: 0 },
    ]
    for (const item of filteredFeed) {
      const target = nextCols[0].h <= nextCols[1].h ? nextCols[0] : nextCols[1]
      target.items.push(item)
      const cardH = cardW / item.aspectRatio
      target.h += cardH + 16
    }
    return nextCols
  }, [cardW, filteredFeed])

  const hasTypedInput = searchQuery.trim().length > 0

  const handleComposerPress = () => {
    if (!hasTypedInput) return
    setSearchQuery('')
  }

  const bottomDockClearance = insets.bottom + layout.bottomNavOffset + layout.navFabSize + 24

  return (
    <View style={styles.root}>
      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setIsStylistCollapsed(true)}
        contentContainerStyle={{ paddingBottom: bottomDockClearance }}
      >
        <BlurView
          intensity={90}
          tint="light"
          style={[styles.stickyHeader, { paddingTop: Math.max(insets.top + 8, 48) }]}
        >
          <View pointerEvents="none" style={styles.stickyHeaderWash} />
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
        </BlurView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          <Pressable
            onPress={() => setActiveCommunityFilter('All')}
            style={[styles.tag, activeCommunityFilter === 'All' && styles.tagOn]}
          >
            <Text
              style={[
                styles.tagText,
                styles.allTagText,
                activeCommunityFilter === 'All' && styles.tagTextOn,
              ]}
            >
              All
            </Text>
          </Pressable>
          {filterTags.map((tag) => (
            <Pressable
              key={tag.slug}
              onPress={() => setActiveCommunityFilter(tag.slug)}
              style={[styles.tag, styles.secondaryTag, activeCommunityFilter === tag.slug && styles.tagOn]}
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
          {cols.map((col, index) => (
            <View key={index} style={styles.col}>
              {col.items.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  cardW={cardW}
                  onPress={() => setSelectedPost(item)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.searchDock, { bottom: insets.bottom + layout.bottomNavOffset }]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Ask the stylist..."
          placeholderTextColor={colors.textMutedGray}
          style={styles.searchInput}
          onSubmitEditing={handleComposerPress}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.iconButton, hasTypedInput ? styles.iconButtonSend : styles.iconButtonMic]}
          onPress={handleComposerPress}
        >
          {hasTypedInput ? (
            <Send size={14} color={colors.white} />
          ) : (
            <Mic size={14} color={colors.textDark} />
          )}
        </Pressable>
      </View>

      <PostDetailsOverlay
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        isSavedPost={selectedPost != null && savedPostIds.has(selectedPost.id)}
        onToggleSavePost={() =>
          selectedPost && togglePostId(setSavedPostIds, selectedPost.id)
        }
        isPostMixed={selectedPost != null && mixedPostIds.has(selectedPost.id)}
        onTogglePostMix={() =>
          selectedPost && togglePostId(setMixedPostIds, selectedPost.id)
        }
        mixedItemIds={mixedItemIds}
        onToggleItemMix={(id) => toggleItemId(setMixedItemIds, id)}
        isWishlisted={isWishlisted}
        onToggleWishlist={onToggleWishlist}
      />
    </View>
  )
}

function FeedCard({
  item,
  cardW,
  onPress,
}: {
  item: FeedItem
  cardW: number
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cardWrap,
        {
          width: cardW,
          height: cardW / item.aspectRatio,
          borderRadius: radii.xxl,
          overflow: 'hidden',
        },
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain },
  stickyHeader: {
    zIndex: 30,
    backgroundColor: 'rgba(245,243,239,0.92)',
    paddingBottom: 12,
    overflow: 'hidden',
  },
  stickyHeaderWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245,243,239,0.72)',
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
    borderRadius: 25,
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
    ...shadows.smallShadow,
  },
  avatarImg: { width: '100%', height: '100%' },
  stylistText: {
    fontFamily: fontFamily.sans,
    fontSize: typography.small,
    lineHeight: 20,
    color: colors.textBody,
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
  secondaryTag: { paddingHorizontal: 16 },
  tagOn: { backgroundColor: colors.textDark, borderColor: 'transparent' },
  tagText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: typography.small,
    lineHeight: 18,
    color: colors.textDark,
  },
  allTagText: { fontFamily: fontFamily.sansBold },
  tagTextOn: { fontFamily: fontFamily.sansBold, color: colors.white },
  masonry: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  col: { flex: 1 },
  cardWrap: {
    marginBottom: 16,
    backgroundColor: colors.feedCardBg,
    ...shadows.smallShadow,
  },
  cardImg: { width: '100%', height: '100%' },
  searchDock: {
    position: 'absolute',
    left: layout.leftNavGutter + layout.navFabSize + 12,
    right: 16,
    height: layout.navFabSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    borderRadius: layout.navFabSize / 2,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 14,
    ...shadows.composer,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 0,
    fontFamily: fontFamily.sans,
    fontSize: typography.small,
    lineHeight: 18,
    color: colors.textBody,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonMic: { backgroundColor: colors.bgPillMuted },
  iconButtonSend: { backgroundColor: colors.black },
})
