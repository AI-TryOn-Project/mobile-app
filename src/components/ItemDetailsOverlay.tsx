import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { ArrowLeft, Heart, ShoppingCart, Sparkles } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MOCK_SHOP_ITEMS, type ShopItem } from '@/constants/appJsxMocks'
import { ToastPill } from '@/components/ToastPill'
import { colors, fontFamily, shadows } from '@/theme/tokens'

type Props = {
  initialItem: ShopItem | null
  onClose: () => void
  isWishlisted: (baseId: string) => boolean
  onToggleWishlist: (item: ShopItem) => void
}

type SimilarItemCardProps = {
  item: ShopItem
  cardW: number
  onPress: () => void
}

export function ItemDetailsOverlay({
  initialItem,
  onClose,
  isWishlisted,
  onToggleWishlist,
}: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [history, setHistory] = useState<ShopItem[]>(initialItem ? [initialItem] : [])
  const scrollRef = useRef<ScrollView>(null)
  const [toast, setToast] = useState<string | null>(null)
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
    if (initialItem) setHistory([initialItem])
    else {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast(null)
    }
  }, [initialItem])

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [history])

  if (initialItem == null) return null

  const activeHistory = history[0]?.id === initialItem.id ? history : [initialItem]
  const currentItem = activeHistory[activeHistory.length - 1] ?? initialItem
  const similarItems = MOCK_SHOP_ITEMS.filter((i) => i.baseId !== currentItem.baseId).slice(0, 6)
  const cardW = (windowWidth - 24 * 2 - 12) / 2
  const isWish = isWishlisted(currentItem.baseId)

  const handleBack = () => {
    if (activeHistory.length > 1) setHistory((h) => h.slice(0, -1))
    else onClose()
  }

  const handleShopNow = () => {
    const searchTerm = `${currentItem.brand} ${currentItem.name}`.trim()
    const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
      searchTerm || "women's fashion"
    )}`

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      void Linking.openURL(url)
    }

    showToast('Opening retailer site')
  }

  return (
    <View style={styles.overlayRoot}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Item Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ToastPill message={toast} top={Math.max(insets.top + 8, 48) + 76} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 80 + Math.max(insets.bottom, 0) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: windowHeight * 0.6 }]}>
          <Image source={{ uri: currentItem.image }} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              {currentItem.brand ? <Text style={styles.brand}>{currentItem.brand}</Text> : null}
              <Text style={styles.itemName}>{currentItem.name}</Text>
              {currentItem.price ? <Text style={styles.price}>{currentItem.price}</Text> : null}
            </View>

            <Pressable
              onPress={() => {
                const willAdd = !isWishlisted(currentItem.baseId)
                showToast(willAdd ? 'Saved to Wishlist' : 'Removed from Wishlist')
                onToggleWishlist(currentItem)
              }}
              style={styles.heartButton}
            >
              <Heart
                size={24}
                color={isWish ? colors.accentHeartRed : colors.textDark}
                fill={isWish ? colors.accentHeartRed : 'none'}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={handleShopNow}
            style={styles.shopNowButton}
          >
            <ShoppingCart size={16} color={colors.white} />
            <Text style={styles.shopNowText}>SHOP NOW</Text>
          </Pressable>

          <View style={styles.moreLikeThis}>
            <View style={styles.moreLikeThisTitleRow}>
              <Sparkles size={18} color={colors.textDark} />
              <Text style={styles.moreLikeThisTitle}>More like this</Text>
            </View>

            <View style={styles.similarGrid}>
              {similarItems.map((item) => (
                <SimilarItemCard
                  key={item.baseId}
                  item={item}
                  cardW={cardW}
                  onPress={() => setHistory((h) => [...h, item])}
                />
              ))}
            </View>

            <View style={styles.loader}>
              <ActivityIndicator size="small" color={colors.textMutedGray} />
              <Text style={styles.loaderText}>Refining your style</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function SimilarItemCard({ item, cardW, onPress }: SimilarItemCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.similarCard, { width: cardW }]}>
      <View style={[styles.similarImageFrame, { width: cardW, height: (cardW * 5) / 4 }]}>
        <Image source={{ uri: item.image }} style={styles.similarImage} resizeMode="cover" />
      </View>
      <Text style={styles.similarBrand}>{item.brand}</Text>
      <Text numberOfLines={1} style={styles.similarName}>
        {item.name}
      </Text>
      {item.price ? <Text style={styles.similarPrice}>{item.price}</Text> : null}
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
    zIndex: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,229,229,0.5)',
    backgroundColor: 'rgba(245,243,239,0.8)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    ...shadows.backFab,
  },
  headerTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 18,
    lineHeight: 23,
    color: colors.textDark,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  hero: {
    width: '100%',
    backgroundColor: colors.feedCardBg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.smallShadow,
  },
  heroImage: { width: '100%', height: '100%' },
  body: {
    padding: 24,
    gap: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  titleBlock: { flex: 1 },
  brand: {
    fontFamily: fontFamily.serif,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0.75,
    color: colors.textDark,
  },
  itemName: {
    fontFamily: fontFamily.sansItalic,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.5,
    color: colors.textItemNameMuted,
  },
  price: {
    marginTop: 12,
    fontFamily: fontFamily.sansBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textDark,
  },
  heartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.smallShadow,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: colors.black,
    ...shadows.shopCta,
  },
  shopNowText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  moreLikeThis: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 24,
  },
  moreLikeThisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  moreLikeThisTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 20,
    lineHeight: 25,
    color: colors.textDark,
  },
  similarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 24,
    paddingBottom: 24,
  },
  similarCard: {
    flexDirection: 'column',
    gap: 6,
  },
  similarImageFrame: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.feedCardBg,
    overflow: 'hidden',
  },
  similarImage: { width: '100%', height: '100%' },
  similarBrand: {
    fontFamily: fontFamily.sansBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: -0.25,
    textTransform: 'uppercase',
    color: colors.textMutedGray,
  },
  similarName: {
    fontFamily: fontFamily.sansBold,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textDark,
  },
  similarPrice: {
    marginTop: 2,
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDark,
  },
  loader: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMutedGray,
  },
})
