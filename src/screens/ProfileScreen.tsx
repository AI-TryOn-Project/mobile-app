import React, { useState } from 'react'
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronLeft, Plus, Settings, Share2 } from 'lucide-react-native'
import { colors, radii, shadows, spacing, typography, fontFamily } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

const MOCK_PROFILE = {
  name: 'Alex Schwan',
  handle: 'alex',
  avatar: 'https://i.pravatar.cc/150?u=chic',
  posts: 3,
  followers: '1.2k',
  following: 342,
}

const WISHLIST_CATEGORIES = [
  'All',
  'Styles',
  'Tops',
  'Bottoms',
  'Dresses',
  'Shoes',
  'Bags',
  'Jewelry',
] as const

const MOCK_WISHLIST = [
  {
    id: 107,
    title: 'Satin Slip Style',
    brand: 'Night Out',
    name: 'Satin Slip Style',
    price: 'Style',
    image: 'https://img.ltwebstatic.com/v4/j/ssms/2025/12/08/98/176517802406eeaa10fc33833c369290b28242b73d_thumbnail_420x.webp',
    category: 'Styles',
    type: 'STYLE',
  },
  {
    id: 106,
    title: 'Cashmere & Denim',
    brand: 'Modern Minimal',
    name: 'Cashmere & Denim',
    price: 'Style',
    image: 'https://i.pinimg.com/736x/d0/da/e0/d0dae0f6ecdae7f438a95fcc156e0da7.jpg',
    category: 'Styles',
    type: 'STYLE',
  },
  {
    id: 105,
    title: 'Minimalist Blazer Look',
    brand: 'Chic Style',
    name: 'Minimalist Blazer Look',
    price: 'Style',
    image: 'https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg',
    category: 'Styles',
    type: 'STYLE',
  },
  {
    id: 104,
    title: null,
    brand: 'Reformation',
    name: 'Linen waistcoat',
    price: '$128',
    image: 'https://cdn.mos.cms.futurecdn.net/V2Phz4BcHo7yoDwLtXKMgQ-1600-80.jpg.webp',
    category: 'Tops',
    type: 'ITEM',
  },
  {
    id: 103,
    title: null,
    brand: 'MANGO',
    name: 'Pleated trousers',
    price: '$99',
    image: 'https://cdn.mos.cms.futurecdn.net/myGZ3oP99vpGPSukjsfGLi-1600-80.jpg.webp',
    category: 'Bottoms',
    type: 'ITEM',
  },
  {
    id: 102,
    title: null,
    brand: 'SSENSE',
    name: 'Summer tote',
    price: '$340',
    image: 'https://cdn.mos.cms.futurecdn.net/5iP9pDMJAgVMfnbkGVjWhd-1600-80.jpg.webp',
    category: 'Bags',
    type: 'ITEM',
  },
  {
    id: 101,
    title: null,
    brand: 'ZARA',
    name: 'Satin maxi dress',
    price: '$89',
    image: 'https://cdn.mos.cms.futurecdn.net/kS7tzWxXP88T2GY46gju99-1600-80.jpg.webp',
    category: 'Dresses',
    type: 'ITEM',
  },
] as const

const PROFILE_TABS = [
  { id: 'tryons', label: 'Try-ons' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'owned', label: 'Owned' },
  { id: 'published', label: 'Published' },
] as const

type ProfileTab = (typeof PROFILE_TABS)[number]['id']

export function ProfileScreen() {
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const { width: windowWidth } = useWindowDimensions()
  const [tab, setTab] = useState<ProfileTab>('wishlist')
  const [category, setCategory] =
    useState<(typeof WISHLIST_CATEGORIES)[number]>('All')

  const CARD_GAP = 12
  const GRID_PADDING_H = 8
  const cardWidth = (windowWidth - GRID_PADDING_H * 2 - CARD_GAP) / 2
  const styleCardHeight = (cardWidth * 4) / 3
  const itemImageHeight = (cardWidth * 5) / 4
  const visibleWishlist =
    category === 'All'
      ? MOCK_WISHLIST
      : category === 'Styles'
        ? MOCK_WISHLIST.filter((item) => item.type === 'STYLE')
        : MOCK_WISHLIST.filter((item) => item.category === category)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cardWhite }}
      contentContainerStyle={{ paddingBottom: 96 }}
    >
      <LinearGradient
        colors={['#f5f5f7', '#ffffff']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 288 }}
      />

      <View style={{ zIndex: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.base,
            paddingTop: 40,
            paddingBottom: spacing.sm,
          }}
        >
          <Pressable
            onPress={() => setActiveTab('trending')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.8)',
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.smallShadow,
            }}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </Pressable>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Pressable style={{ padding: spacing.sm }}>
              <Share2 size={22} color={colors.textPrimary} />
            </Pressable>
            <Pressable style={{ padding: spacing.sm }}>
              <Settings size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xl,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xl,
          }}
        >
          <View style={{ position: 'relative', width: 82, height: 82 }}>
            <View
              style={{
                width: 82,
                height: 82,
                borderRadius: 41,
                borderWidth: 2,
                borderColor: colors.white,
                overflow: 'hidden',
                backgroundColor: '#f0f0f0',
                ...shadows.mediumShadow,
              }}
            >
              <Image source={{ uri: MOCK_PROFILE.avatar }} style={{ width: '100%', height: '100%' }} />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.accentYellow,
                borderWidth: 2,
                borderColor: colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={14} strokeWidth={3} color={colors.textInk} />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: colors.textPrimary,
                lineHeight: 28,
                marginBottom: 2,
                fontFamily: fontFamily.sansBold,
              }}
            >
              {MOCK_PROFILE.name}
            </Text>
            <Text
              style={{
                fontSize: typography.small,
                color: colors.textMutedGray,
                lineHeight: 18,
                marginBottom: 12,
                fontFamily: fontFamily.sans,
              }}
            >
              @{MOCK_PROFILE.handle}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.xxl,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
          }}
        >
          {[
            { value: MOCK_PROFILE.posts, label: 'Posts' },
            { value: MOCK_PROFILE.followers, label: 'Followers' },
            { value: MOCK_PROFILE.following, label: 'Following' },
          ].map((stat) => (
            <View key={stat.label} style={{ alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  lineHeight: 27,
                  fontFamily: fontFamily.sansBold,
                }}
              >
                {stat.value}
              </Text>
              <Text
                style={{
                  fontSize: typography.small,
                  color: colors.textMutedGray,
                  lineHeight: 18,
                  fontFamily: fontFamily.sansMedium,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderHairline,
            backgroundColor: colors.white,
          }}
        >
          {PROFILE_TABS.map((item) => {
            const isActive = tab === item.id

            return (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: spacing.base,
                  position: 'relative',
                }}
              >
                <Text
                  style={{
                    fontSize: typography.bodyMd,
                    color: isActive ? colors.textPrimary : colors.textMutedGray,
                    lineHeight: 21,
                    fontFamily: isActive ? fontFamily.sansBold : fontFamily.sansMedium,
                  }}
                >
                  {item.label}
                </Text>
                {isActive ? (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 24,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: colors.accentRed,
                    }}
                  />
                ) : null}
              </Pressable>
            )
          })}
        </View>

        {tab === 'wishlist' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              backgroundColor: colors.white,
              borderBottomWidth: 1,
              borderBottomColor: '#f9f9f9',
            }}
            contentContainerStyle={{
              flexDirection: 'row',
              gap: spacing.sm,
              paddingHorizontal: spacing.base,
              paddingVertical: spacing.md,
            }}
          >
            {WISHLIST_CATEGORIES.map((item) => {
              const isActive = category === item

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={{
                    paddingHorizontal: spacing.base,
                    paddingVertical: 6,
                    borderRadius: radii.pill,
                    backgroundColor: isActive ? colors.textInk : colors.bgPillMuted,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.body,
                      fontWeight: '700',
                      color: isActive ? colors.white : colors.textMutedGray,
                      lineHeight: 19.5,
                      fontFamily: fontFamily.sansBold,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        ) : null}
      </View>

      {tab === 'wishlist' ? (
        <View
          style={{
            paddingHorizontal: spacing.sm,
            paddingTop: spacing.base,
            paddingBottom: 80,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {visibleWishlist.map((item) =>
            item.type === 'STYLE' ? (
              <View
                key={item.id}
                style={{
                  width: cardWidth,
                  height: styleCardHeight,
                  borderRadius: radii.md,
                  overflow: 'hidden',
                  backgroundColor: colors.pillMutedBg,
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                  ...shadows.smallShadow,
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: spacing.base,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.caption,
                      fontWeight: '700',
                      color: colors.white,
                      lineHeight: 15,
                      fontFamily: fontFamily.sansBold,
                    }}
                  >
                    {item.title}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View key={item.id} style={{ width: cardWidth }}>
                <View
                  style={{
                    width: cardWidth,
                    height: itemImageHeight,
                    borderRadius: radii.md,
                    overflow: 'hidden',
                    backgroundColor: colors.pillMutedBg,
                    marginBottom: spacing.sm,
                    ...shadows.smallShadow,
                  }}
                >
                  <Image
                    source={{ uri: item.image }}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
                <View style={{ paddingHorizontal: spacing.xs }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: typography.caption,
                      lineHeight: 15,
                      fontFamily: fontFamily.sansBold,
                      color: colors.textDark,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {item.brand}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: typography.small,
                      lineHeight: 18,
                      fontFamily: fontFamily.sans,
                      color: '#4a4a4a',
                      marginTop: 2,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.small,
                      lineHeight: 18,
                      fontFamily: fontFamily.sansBold,
                      color: colors.textDark,
                      marginTop: spacing.xs,
                    }}
                  >
                    {item.price}
                  </Text>
                </View>
              </View>
            ),
          )}
        </View>
      ) : (
        <View style={{ padding: 48, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: typography.bodyMd,
              color: colors.textMutedGray,
              lineHeight: 21,
              fontFamily: fontFamily.sans,
            }}
          >
            Coming soon
          </Text>
        </View>
      )}
    </ScrollView>
  )
}
