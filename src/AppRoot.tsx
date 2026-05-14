import React from 'react'
import { StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { CollapsibleNavigation } from '@/components/CollapsibleNavigation'
import { AuraExtractAndChat } from '@/components/AuraExtractAndChat'
import { VideoStylistOverlay } from '@/components/VideoStylistOverlay'
import { OnboardingFlowScreen } from '@/screens/OnboardingFlowScreen'
import { DiscoverScreen } from '@/screens/DiscoverScreen'
import { WardrobeScreen } from '@/screens/WardrobeScreen'
import { TryOnScreen } from '@/screens/TryOnScreen'
import { SkillsScreen } from '@/screens/SkillsScreen'
import { ProfileScreen } from '@/screens/ProfileScreen'
import { colors } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

function MainByTab() {
  const activeTab = useAppStore((s) => s.activeTab)
  switch (activeTab) {
    case 'trending':
      return <DiscoverScreen />
    case 'wardrobe':
      return <WardrobeScreen />
    case 'tryon':
      return <TryOnScreen />
    case 'skills':
      return <SkillsScreen />
    case 'profile':
      return <ProfileScreen />
    default:
      return <DiscoverScreen />
  }
}

export function AppRoot() {
  const authCompleted = useAppStore((s) => s.authCompleted)

  if (!authCompleted) {
    return (
      <View style={[styles.outer, styles.outerOnboarding]}>
        <StatusBar style="dark" />
        <OnboardingFlowScreen />
      </View>
    )
  }

  return (
    <View style={styles.outer}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        <MainByTab />
      </View>
      <CollapsibleNavigation />
      <AuraExtractAndChat />
      <VideoStylistOverlay />
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.canvasOuter,
  },
  outerOnboarding: {
    backgroundColor: colors.canvasMain,
  },
  inner: {
    flex: 1,
    backgroundColor: colors.canvasMain,
  },
})
