import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import { ONBOARDING_HERO_IMAGES } from '@/constants/appJsxMocks'
import { colors, radii, shadows } from '@/theme/tokens'

type Props = { showConnectBadge?: boolean }

export function OnboardingHeroCollage({ showConnectBadge = false }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={[styles.tile, styles.t0]}>
        <Image source={{ uri: ONBOARDING_HERO_IMAGES[0] }} style={styles.img} />
      </View>
      <View style={[styles.tile, styles.t1]}>
        <Image source={{ uri: ONBOARDING_HERO_IMAGES[1] }} style={styles.img} />
      </View>
      <View style={[styles.tile, styles.t2]}>
        <Image source={{ uri: ONBOARDING_HERO_IMAGES[2] }} style={styles.img} />
      </View>
      <View style={[styles.tile, styles.t3]}>
        <Image source={{ uri: ONBOARDING_HERO_IMAGES[3] }} style={styles.img} />
      </View>
      <View style={[styles.tile, styles.t4]}>
        <Image source={{ uri: ONBOARDING_HERO_IMAGES[4] }} style={styles.img} />
      </View>
      {showConnectBadge ? (
        <View style={styles.badge}>
          <View style={styles.igCircle}>
            <Text style={styles.igText}>IG</Text>
          </View>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <View style={styles.sparkleCircle}>
            <Sparkles size={16} color={colors.white} />
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: 290,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -90,
    marginTop: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ece6dc',
    opacity: 0.9,
  },
  tile: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.cardWarmBorder,
  },
  img: { width: '100%', height: '100%' },
  t0: {
    left: 12,
    top: 76,
    width: 78,
    height: 112,
    borderRadius: radii.lg,
    ...shadows.navPanel,
  },
  t1: {
    left: 68,
    top: 48,
    width: 96,
    height: 138,
    borderRadius: 28,
    ...shadows.navPanel,
  },
  t2: {
    left: '50%',
    top: '50%',
    marginLeft: -62,
    marginTop: -88,
    width: 124,
    height: 176,
    borderRadius: radii.xxl,
    ...shadows.cardLift,
  },
  t3: {
    right: 62,
    top: 70,
    width: 92,
    height: 130,
    borderRadius: 28,
    ...shadows.navPanel,
  },
  t4: {
    right: 12,
    top: 98,
    width: 72,
    height: 104,
    borderRadius: 23,
    ...shadows.navPanel,
  },
  badge: {
    position: 'absolute',
    left: '50%',
    top: 20,
    marginLeft: -110,
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  igCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff5e62',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 6, opacity: 0.4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.black },
  sparkleCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
