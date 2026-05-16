import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bookmark, Check, Plus, X } from 'lucide-react-native'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { getPostBreakdown, type FeedItem, type ShopItem } from '@/constants/appJsxMocks'
import { ItemDetailsOverlay } from '@/components/ItemDetailsOverlay'
import { ToastPill } from '@/components/ToastPill'
import { colors, fontFamily, shadows } from '@/theme/tokens'

type Props = {
  post: FeedItem | null
  onClose: () => void
  isSavedPost: boolean
  onToggleSavePost: () => void
  isPostMixed: boolean
  onTogglePostMix: () => void
  mixedItemIds: Set<string>
  onToggleItemMix: (itemId: string) => void
  isWishlisted: (baseId: string) => boolean
  onToggleWishlist: (item: ShopItem) => void
}

type ShopItemCardProps = {
  item: ShopItem
  cardW: number
  isMixed: boolean
  onToggleItemMixWithToast: (itemId: string) => void
  onOpenItem: (item: ShopItem) => void
}

export function PostDetailsOverlay({
  post,
  onClose,
  isSavedPost,
  onToggleSavePost,
  isPostMixed,
  onTogglePostMix,
  mixedItemIds,
  onToggleItemMix,
  isWishlisted,
  onToggleWishlist,
}: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [toast, setToast] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    if (post == null) {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast(null)
      setSelectedItem(null)
    }
  }, [post])

  const onToggleItemMixWithToast = useCallback(
    (id: string) => {
      const willAdd = !mixedItemIds.has(id)
      showToast(willAdd ? 'Items added to Try-on' : 'Removed from Try-on')
      onToggleItemMix(id)
    },
    [mixedItemIds, onToggleItemMix, showToast]
  )

  if (post == null) return null

  const heroHeight = Math.min(windowHeight * 0.6, windowWidth / post.aspectRatio)
  const containerWidth = windowWidth - 24 * 2
  const gridGap = 16
  const cardW = (containerWidth - gridGap) / 2
  const breakdown = getPostBreakdown(post)

  return (
    <View style={styles.overlayRoot}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
          <View style={styles.headerLeft}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.textDark} />
            </Pressable>

            <Pressable disabled style={styles.authorButton}>
              <Image source={{ uri: post.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.userName}>{post.user}</Text>
                <Text style={styles.postAge}>10d ago</Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <X size={24} color={colors.textMutedGray} />
          </Pressable>
        </View>

        <ToastPill message={toast} top={Math.max(insets.top + 8, 48) + 76} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 80 + Math.max(insets.bottom, 0) }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, { height: heroHeight }]}>
            {/* Native Image cannot exactly reproduce archive object-position: top. */}
            {/* TODO: skill_outfit variant deferred */}
            <Image source={{ uri: post.image }} style={styles.heroImage} resizeMode="cover" />
          </View>

          <View style={styles.body}>
            <View style={styles.shopHeader}>
              <Text style={styles.shopTitle}>Shop the look</Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={onToggleSavePost}
                  hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                  style={styles.bookmarkButton}
                >
                  <Bookmark
                    size={24}
                    color={isSavedPost ? colors.textDark : colors.textMutedGray}
                    fill={isSavedPost ? colors.textDark : 'none'}
                  />
                </Pressable>

                <Pressable
                  onPress={() => {
                    showToast(isPostMixed ? 'Removed from Try-on' : 'Items added to Try-on')
                    onTogglePostMix()
                  }}
                  style={[
                    styles.tryOnButton,
                    isPostMixed ? styles.tryOnButtonActive : styles.tryOnButtonDefault,
                  ]}
                >
                  {isPostMixed ? <Check size={14} color={colors.accentPurple} /> : null}
                  <Text
                    style={[
                      styles.tryOnText,
                      isPostMixed ? styles.tryOnTextActive : styles.tryOnTextDefault,
                    ]}
                  >
                    {isPostMixed ? 'Added' : '+Try-on'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.grid}>
              {breakdown.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  cardW={cardW}
                  isMixed={mixedItemIds.has(item.id)}
                  onToggleItemMixWithToast={onToggleItemMixWithToast}
                  onOpenItem={setSelectedItem}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <ItemDetailsOverlay
        initialItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        isWishlisted={isWishlisted}
        onToggleWishlist={onToggleWishlist}
      />
    </View>
  )
}

function ShopItemCard({
  item,
  cardW,
  isMixed,
  onToggleItemMixWithToast,
  onOpenItem,
}: ShopItemCardProps) {
  const imageW = cardW - 16

  return (
    <Pressable onPress={() => onOpenItem(item)} style={[styles.shopCard, { width: cardW }]}>
      <View style={[styles.shopImageFrame, { width: imageW, height: (imageW * 5) / 4 }]}>
        <Image source={{ uri: item.image }} style={styles.shopImage} resizeMode="cover" />
        <Pressable
          onPress={() => onToggleItemMixWithToast(item.id)}
          style={[
            styles.itemToggle,
            isMixed ? styles.itemToggleActive : styles.itemToggleDefault,
          ]}
        >
          {isMixed ? (
            <Check size={14} color={colors.accentPurple} />
          ) : (
            <Plus size={14} color={colors.textDark} />
          )}
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.canvasMain,
    zIndex: 50,
  },
  safeArea: { flex: 1, backgroundColor: colors.canvasMain },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.canvasMain,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    ...shadows.backFab,
  },
  authorButton: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  userName: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDark,
  },
  postAge: {
    fontFamily: fontFamily.sansBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMutedGray,
  },
  scroll: { flex: 1 },
  hero: { width: '100%', backgroundColor: colors.feedCardBg },
  heroImage: { width: '100%', height: '100%' },
  body: { padding: 24, paddingBottom: 8 },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  shopTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 20,
    lineHeight: 25,
    color: colors.textDark,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookmarkButton: { padding: 8 },
  tryOnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...shadows.mediumShadow,
  },
  tryOnButtonDefault: { backgroundColor: colors.black },
  tryOnButtonActive: { backgroundColor: colors.accentPurpleSoft },
  tryOnText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tryOnTextDefault: { color: colors.white },
  tryOnTextActive: { color: colors.accentPurple },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  shopCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 8,
    gap: 8,
    ...shadows.smallShadow,
  },
  shopImageFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.feedCardBg,
    position: 'relative',
  },
  shopImage: { width: '100%', height: '100%' },
  itemToggle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...shadows.smallShadow,
  },
  itemToggleDefault: { backgroundColor: colors.overlayWhite92 },
  itemToggleActive: { backgroundColor: colors.accentPurpleSoft },
})
