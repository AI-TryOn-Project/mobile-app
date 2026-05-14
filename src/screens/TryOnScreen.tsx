import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

export function TryOnScreen() {
  const tryOnPhase = useAppStore((s) => s.tryOnPhase)
  const mixItems = useAppStore((s) => s.mixItems)
  const setTryOnStatus = useAppStore((s) => s.setTryOnStatus)
  const setMixItems = useAppStore((s) => s.setMixItems)

  const startGenerate = () => {
    setTryOnStatus(() => ({ phase: 'generating', profileNotificationCount: 0 }))
    setTimeout(() => {
      setMixItems(() => [
        { id: 1, image: 'https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg' },
        { id: 2, image: 'https://i.pinimg.com/736x/d0/da/e0/d0dae0f6ecdae7f438a95fcc156e0da7.jpg' },
      ])
      setTryOnStatus(() => ({ phase: 'result', profileNotificationCount: 1 }))
    }, 1600)
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.inner}>
      <View style={styles.hero}>
        <Sparkles size={28} color={colors.textInk} strokeWidth={2} />
        <Text style={styles.title}>Try-on</Text>
        <Text style={styles.sub}>Flow shell aligned to App.jsx states (setup → generating → result).</Text>
      </View>

      {tryOnPhase === 'idle' || tryOnPhase === 'setup' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Setup</Text>
          <Text style={styles.cardBody}>Pick a base outfit and a reference look. This build uses a stub generate.</Text>
          <Pressable style={styles.primary} onPress={startGenerate}>
            <Text style={styles.primaryText}>Generate (stub)</Text>
          </Pressable>
        </View>
      ) : null}

      {tryOnPhase === 'generating' ? (
        <View style={[styles.card, styles.center]}>
          <ActivityIndicator size="large" color={colors.accentPurple} />
          <Text style={styles.cardBody}>Rendering looks…</Text>
        </View>
      ) : null}

      {tryOnPhase === 'result' && mixItems.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready</Text>
          <Text style={styles.cardBody}>{mixItems.length} preview tiles (local URLs).</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain },
  inner: { padding: spacing.base, paddingBottom: 120 },
  hero: { marginBottom: 20, alignItems: 'center' },
  title: {
    marginTop: 12,
    fontSize: typography.titleSerif,
    lineHeight: 38,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: colors.textInk,
  },
  sub: {
    marginTop: 8,
    fontSize: typography.body,
    color: colors.textMutedBrown,
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    backgroundColor: colors.cardWhite,
    padding: spacing.lg,
    ...shadows.composer,
  },
  center: { alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: typography.bodyMd, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  cardBody: { fontSize: typography.small, color: colors.textBody, lineHeight: 18 },
  primary: {
    marginTop: 16,
    alignSelf: 'stretch',
    backgroundColor: colors.textInk,
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontWeight: '700', fontSize: typography.bodyMd },
})
