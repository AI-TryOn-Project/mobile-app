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
    id: 1,
    title: 'Satin Slip Style',
    image: 'https://cdn.mos.cms.futurecdn.net/kS7tzWxXP88T2GY46gju99-1600-80.jpg.webp',
  },
  {
    id: 2,
    title: 'Cashmere & Denim',
    image: 'https://cdn.mos.cms.futurecdn.net/5iP9pDMJAgVMfnbkGVjWhd-1600-80.jpg.webp',
  },
  {
    id: 3,
    title: null,
    image: 'https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg',
  },
  {
    id: 4,
    title: null,
    image: 'https://i.pinimg.com/736x/66/e9/47/66e9479e255e594de1f29fe1c3c27067.jpg',
  },
  {
    id: 5,
    title: null,
    image: 'https://i.pinimg.com/736x/98/8c/44/988c44232d4e09159f3820c238e3586c.jpg',
  },
  {
    id: 6,
    title: null,
    image: 'https://i.pinimg.com/1200x/75/5a/98/755a98d93f917608e6eb73c2a77e7481.jpg',
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
  const { width } = useWindowDimensions()
  const [tab, setTab] = useState<ProfileTab>('wishlist')
  const [category, setCategory] =
    useState<(typeof WISHLIST_CATEGORIES)[number]>('All')

  const cardWidth = (width - spacing.base * 2 - spacing.md) / 2

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cardWhite }}
      contentContainerStyle={{ paddingBottom: 100 }}
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
              ...shadows.composer,
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
                ...shadows.composer,
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
                lineHeight: 26,
                fontFamily: fontFamily.sansBold,
              }}
            >
              {MOCK_PROFILE.name}
            </Text>
            <Text
              style={{
                fontSize: typography.small,
                color: colors.textMutedGray,
                marginTop: 2,
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
                  fontFamily: fontFamily.sansBold,
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: typography.small, color: colors.textMutedGray, marginTop: 2 }}>
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
            style={{ backgroundColor: colors.white }}
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
            paddingHorizontal: spacing.base,
            paddingTop: spacing.base,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {MOCK_WISHLIST.map((item) => (
            <View
              key={item.id}
              style={{
                width: cardWidth,
                aspectRatio: 3 / 4,
                borderRadius: radii.md,
                overflow: 'hidden',
                backgroundColor: colors.pillMutedBg,
              }}
            >
              <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
              {item.title ? (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.bodyMd,
                      fontWeight: '700',
                      color: colors.white,
                    }}
                  >
                    {item.title}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <View style={{ padding: 48, alignItems: 'center' }}>
          <Text style={{ fontSize: typography.bodyMd, color: colors.textMutedGray }}>Coming soon</Text>
        </View>
      )}
    </ScrollView>
  )
}
