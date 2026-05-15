import React, { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronLeft, Wand2 } from 'lucide-react-native'
import { colors, fontFamily, radii, shadows } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

type Skill = {
  id: string
  name: string
  userId: string
  author: string
  pricingLabel: string
  ctaLabel: string
  avatar: string
  tagline: string
  followers: number
  usedCount: number
  rating: number
  cover: string
  moodboard: string[]
  portfolio: string[]
  startLabel: string
  startPrompt: string
  rules: string[]
}

const MOCK_SKILLS: Skill[] = [
  {
    id: 'diana-royal',
    name: "Diana's Off-Duty Royal",
    userId: 'anna-curates',
    author: '@anna_curates',
    pricingLabel: 'Free',
    ctaLabel: 'Get skill',
    avatar: 'https://i.pravatar.cc/120?img=47',
    tagline: 'Polo + high-rise denim + loafers. 80s royal pre-paparazzi.',
    followers: 12400,
    usedCount: 3200,
    rating: 4.8,
    cover:
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/diana-princess-of-wales-serpentine-gallery-082222-2000-c9c29daf9cd84be8843eead7dae46908-xw4JrDL5nKaJoFIsrnqVisA59HVPGm.jpg',
    moodboard: [
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/diana-princess-of-wales-serpentine-gallery-082222-2000-c9c29daf9cd84be8843eead7dae46908-xw4JrDL5nKaJoFIsrnqVisA59HVPGm.jpg',
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/recreating-princess-diana-s-street-style-12-tjNnUO6II9ij1THpw2RWcywn2yFwOL.webp',
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/Bild%2B3-ourac5r0UcC7TSLWUcnCGUrxFSon5b.webp',
    ],
    portfolio: [
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/sub-buzz-1583-1701466241-1-kYjmvVRC5FOMsGLN8PAcm8dFsPUivK.webp',
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/sub-buzz-916-1701465577-1-gIStToGVxUAR4kDAbpkG12IgRx9ie0.webp',
    ],
    startLabel: "Start styling Diana's off-duty look",
    startPrompt:
      "Style me in Princess Diana's off-duty royal aesthetic: polo or tucked tops, high-rise denim or tailored bottoms, loafers or low heels, pearl jewelry, and polished 80s royal ease.",
    rules: [
      'High-waisted bottoms, tucked tops',
      'Loafers or low-heel pumps, never sneakers',
      'Pearl jewelry, never statement pieces',
    ],
  },
  {
    id: 'jennie-it-girl',
    name: "Jennie's It-Girl Codes",
    userId: 'kstyle-curates',
    author: '@kstyle_curates',
    pricingLabel: '$4.99',
    ctaLabel: 'Buy skill',
    avatar: 'https://i.pravatar.cc/120?img=12',
    tagline: 'Mini silhouettes, luxe classics, and cool-girl polish with a wink.',
    followers: 18600,
    usedCount: 4700,
    rating: 4.9,
    cover:
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%281%29-EPTlyWzhMoMz5RATLurwz6uFp5QY0H.jpeg',
    moodboard: [
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%281%29-EPTlyWzhMoMz5RATLurwz6uFp5QY0H.jpeg',
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images-NnDhbZ0oHjovM911YRlDzJxFQ2KyUB.jpeg',
    ],
    portfolio: [
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%284%29-fUo2h8d35TDYAlhUONjD8rN3LPbYaN.jpeg',
      'https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%283%29-rutowZBtk330UM7rM26vpEmhYok7TT.jpeg',
    ],
    startLabel: "Start styling Jennie's it-girl look",
    startPrompt:
      "Style me in Jennie's it-girl aesthetic with mini silhouettes, luxe classics, sharp proportions, and one playful statement detail.",
    rules: [
      'Pair a polished hero piece with one playful or flirty accent',
      'Keep proportions sharp: cropped, fitted, or leg-lengthening silhouettes',
      'Finish with luxe texture or statement accessories, never too many at once',
    ],
  },
]

type SubTab = 'discover' | 'mine'
type DetailTab = 'moodboard' | 'portfolio'

type SkillsListProps = {
  subTab: SubTab
  followed: Set<string>
  onBack: () => void
  onSelectSubTab: (tab: SubTab) => void
  onSelectSkill: (skill: Skill) => void
}

type SkillDetailViewProps = {
  skill: Skill
  isFollowed: boolean
  detailTab: DetailTab
  onSelectDetailTab: (tab: DetailTab) => void
  onToggleFollow: () => void
  onBack: () => void
  onUseSkill: () => void
}

function SkillCard({
  skill,
  isFollowed,
  cardWidth,
  coverHeight,
  onPress,
}: {
  skill: Skill
  isFollowed: boolean
  cardWidth: number
  coverHeight: number
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { width: cardWidth }]}>
      <View style={[styles.cover, { width: cardWidth, height: coverHeight }]}>
        <Image source={{ uri: skill.cover }} resizeMode="cover" style={styles.imageFill} />
        {isFollowed ? (
          <View style={[styles.badge, styles.addedBadge]}>
            <Text style={styles.addedBadgeText}>ADDED</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.priceBadge]}>
            <Text style={styles.priceBadgeText}>{skill.pricingLabel}</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{skill.rating}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {skill.name}
        </Text>
      </View>
    </Pressable>
  )
}

function SkillsList({ subTab, followed, onBack, onSelectSubTab, onSelectSkill }: SkillsListProps) {
  const { width: vw } = useWindowDimensions()
  const cardWidth = Math.floor((vw - 16 * 2 - 12) / 2)
  const coverHeight = Math.round((cardWidth * 4) / 3)
  const visibleSkills = subTab === 'discover' ? MOCK_SKILLS : MOCK_SKILLS.filter((skill) => followed.has(skill.id))

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.listContent}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.circleButton}>
          <ChevronLeft size={20} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Skills</Text>
      </View>
      <Text style={styles.headerSubtitle}>Borrow a stylist&apos;s eye for your closet.</Text>

      <View style={styles.segmentedTrack}>
        {[
          { id: 'discover' as const, label: 'Discover' },
          { id: 'mine' as const, label: `My Skills${followed.size > 0 ? ` · ${followed.size}` : ''}` },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => onSelectSubTab(tab.id)}
            style={[styles.segmentedOption, subTab === tab.id && styles.segmentedOptionActive]}
          >
            <Text style={[styles.segmentedText, subTab === tab.id ? styles.segmentedTextActive : styles.segmentedTextInactive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {visibleSkills.length === 0 ? (
        <View style={styles.emptyState}>
          <Wand2 size={32} color={colors.borderLight} />
          <Text style={styles.emptyTitle}>No skills yet</Text>
          <Text style={styles.emptyBody}>Add a skill from Discover to keep it in your toolkit.</Text>
          <Pressable onPress={() => onSelectSubTab('discover')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Explore Skills</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.grid}>
          {visibleSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isFollowed={followed.has(skill.id)}
              cardWidth={cardWidth}
              coverHeight={coverHeight}
              onPress={() => onSelectSkill(skill)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function SkillDetailView({
  skill,
  isFollowed,
  detailTab,
  onSelectDetailTab,
  onToggleFollow,
  onBack,
  onUseSkill,
}: SkillDetailViewProps) {
  const { width: vw } = useWindowDimensions()
  const tileWidth = Math.floor((vw - 16 * 2 - 8) / 2)
  const tileHeight = Math.round((tileWidth * 4) / 3)
  const images = detailTab === 'moodboard' ? skill.moodboard : skill.portfolio

  return (
    <View style={styles.detailRoot}>
      <View style={styles.detailHeader}>
        <Pressable onPress={onBack} style={styles.circleButton}>
          <ChevronLeft size={20} color={colors.textDark} />
        </Pressable>
        <Pressable
          onPress={onToggleFollow}
          style={[styles.actionButton, isFollowed ? styles.actionButtonAdded : styles.actionButtonPrimary]}
        >
          <Text style={[styles.actionButtonText, isFollowed ? styles.actionButtonTextAdded : styles.actionButtonTextPrimary]}>
            {isFollowed ? 'Added' : skill.pricingLabel === 'Free' ? 'Get free' : `Buy ${skill.pricingLabel}`}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.detailContent}>
        <Pressable style={styles.authorRow}>
          <View style={styles.avatar}>
            <Image source={{ uri: skill.avatar }} resizeMode="cover" style={styles.imageFill} />
          </View>
          <Text style={styles.authorHandle}>{skill.author}</Text>
        </Pressable>

        <Text style={styles.detailName}>{skill.name}</Text>
        <Text style={styles.detailTagline}>{skill.tagline}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.statPrice}>{skill.pricingLabel}</Text>
          <Text style={styles.statText}>★ {skill.rating}</Text>
          <Text style={styles.statText}>{skill.followers.toLocaleString()} added</Text>
          <Text style={styles.statText}>{skill.usedCount.toLocaleString()} styled</Text>
        </View>

        <View style={styles.detailSegmentedTrack}>
          {[
            { id: 'moodboard' as const, label: 'Moodboard' },
            { id: 'portfolio' as const, label: 'Portfolio' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => onSelectDetailTab(tab.id)}
              style={[styles.segmentedOption, detailTab === tab.id && styles.segmentedOptionActive]}
            >
              <Text
                style={[
                  styles.segmentedText,
                  detailTab === tab.id ? styles.segmentedTextActive : styles.segmentedTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.detailGrid}>
          {images.map((src, index) => (
            <View key={`${detailTab}-${index}`} style={[styles.detailTile, { width: tileWidth, height: tileHeight }]}>
              <Image source={{ uri: src }} resizeMode="cover" style={styles.imageFill} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.ctaWrapper}>
        <LinearGradient colors={['rgba(245,243,239,0)', colors.canvasMain]} style={styles.ctaFade} />
        <Pressable onPress={onUseSkill} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>{skill.startLabel || 'Start styling this vibe'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export function SkillsScreen() {
  const setActiveTab = useAppStore((state) => state.setActiveTab)
  const [subTab, setSubTab] = useState<SubTab>('discover')
  const [followed, setFollowed] = useState<Set<string>>(() => new Set(['diana-royal']))
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('moodboard')

  const toggleFollow = (id: string) => {
    setFollowed((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (selectedSkill) {
    return (
      <SkillDetailView
        skill={selectedSkill}
        isFollowed={followed.has(selectedSkill.id)}
        detailTab={detailTab}
        onSelectDetailTab={setDetailTab}
        onToggleFollow={() => toggleFollow(selectedSkill.id)}
        onBack={() => setSelectedSkill(null)}
        onUseSkill={() => {
          if (!followed.has(selectedSkill.id)) {
            toggleFollow(selectedSkill.id)
          }
          setSelectedSkill(null)
          setActiveTab('trending')
        }}
      />
    )
  }

  return (
    <SkillsList
      subTab={subTab}
      followed={followed}
      onBack={() => setActiveTab('trending')}
      onSelectSubTab={setSubTab}
      onSelectSkill={(skill) => {
        setDetailTab('moodboard')
        setSelectedSkill(skill)
      }}
    />
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain },
  listContent: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circleButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.cardWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 35,
    fontFamily: fontFamily.sansBold,
    color: colors.textInk,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontFamily.sans,
    color: colors.textNeutral500,
  },
  segmentedTrack: {
    marginTop: 20,
    padding: 4,
    flexDirection: 'row',
    gap: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.pillTrackBg,
  },
  detailSegmentedTrack: {
    marginTop: 24,
    padding: 4,
    flexDirection: 'row',
    gap: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.pillTrackBg,
  },
  segmentedOption: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedOptionActive: {
    backgroundColor: colors.cardWhite,
    ...shadows.smallShadow,
  },
  segmentedText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontFamily.sansSemiBold,
  },
  segmentedTextActive: { color: colors.textInk },
  segmentedTextInactive: { color: colors.textNeutral500 },
  grid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: colors.cardWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cover: {
    overflow: 'hidden',
    backgroundColor: colors.borderHairline,
  },
  imageFill: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addedBadge: {
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  addedBadgeText: {
    fontSize: 10,
    lineHeight: 15,
    fontFamily: fontFamily.sansBold,
    color: colors.accentPurple,
    letterSpacing: 1.2,
  },
  priceBadge: {
    left: 12,
    bottom: 12,
    backgroundColor: colors.overlayWhite92,
  },
  priceBadgeText: {
    fontSize: 10,
    lineHeight: 15,
    fontFamily: fontFamily.sansBold,
    color: colors.textBody,
    letterSpacing: 1.2,
  },
  ratingBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.overlayDark55,
  },
  ratingStar: {
    fontSize: 11,
    lineHeight: 17,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.accentYellow,
  },
  ratingText: {
    fontSize: 11,
    lineHeight: 17,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.white,
  },
  cardBody: { paddingHorizontal: 14, paddingVertical: 10 },
  cardTitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.textInk,
  },
  emptyState: { marginTop: 48, alignItems: 'center' },
  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.textNeutral700,
  },
  emptyBody: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.sans,
    color: colors.textNeutral500,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.accentPurple,
  },
  emptyButtonText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.sansBold,
    color: colors.white,
  },
  detailRoot: { flex: 1, backgroundColor: colors.canvasMain },
  detailHeader: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  actionButtonAdded: { backgroundColor: colors.borderLight },
  actionButtonPrimary: { backgroundColor: colors.accentPurple },
  actionButtonText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.sansBold,
  },
  actionButtonTextAdded: { color: colors.textNeutral700 },
  actionButtonTextPrimary: { color: colors.white },
  detailContent: { paddingHorizontal: 16, paddingBottom: 120 },
  authorRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.borderLight,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.smallShadow,
  },
  authorHandle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.textNeutral700,
  },
  detailName: {
    fontSize: 26,
    lineHeight: 33,
    fontFamily: fontFamily.sansBold,
    color: colors.textInk,
  },
  detailTagline: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.sans,
    color: colors.textNeutral600,
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  statPrice: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.textNeutral700,
  },
  statText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.sans,
    color: colors.textNeutral500,
  },
  detailGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTile: {
    overflow: 'hidden',
    borderRadius: radii.md,
    backgroundColor: colors.borderLight,
  },
  ctaWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ctaFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -32,
    height: 32,
  },
  ctaButton: {
    width: '100%',
    borderRadius: radii.pill,
    paddingVertical: 16,
    backgroundColor: colors.accentPurple,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fontFamily.sansBold,
    color: colors.white,
    textAlign: 'center',
  },
})
