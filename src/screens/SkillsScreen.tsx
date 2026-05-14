import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Wand2 } from 'lucide-react-native'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'

const CARDS = [
  { title: 'Style DNA', desc: 'Capsule palette, silhouettes, and risk tolerance.' },
  { title: 'Occasions', desc: 'Workweek, travel, date night — ranked by frequency.' },
  { title: 'Fit notes', desc: 'Shoulder drop, hem length, and layering habits.' },
]

export function SkillsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.inner}>
      <View style={styles.hero}>
        <Wand2 size={28} color={colors.textInk} strokeWidth={2} />
        <Text style={styles.title}>Skills</Text>
        <Text style={styles.sub}>Dummy cards — UI density matches App.jsx skills section placeholders.</Text>
      </View>
      {CARDS.map((c) => (
        <View key={c.title} style={styles.card}>
          <Text style={styles.cardTitle}>{c.title}</Text>
          <Text style={styles.cardBody}>{c.desc}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain },
  inner: { padding: spacing.base, paddingBottom: 120, gap: 12 },
  hero: { marginBottom: 8, alignItems: 'center' },
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
    marginBottom: 8,
  },
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    backgroundColor: colors.cardWhite,
    padding: spacing.lg,
    ...shadows.composer,
  },
  cardTitle: { fontSize: typography.bodyMd, fontWeight: '700', color: colors.textDark, marginBottom: 6 },
  cardBody: { fontSize: typography.small, color: colors.textBody, lineHeight: 18 },
})
