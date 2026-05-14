import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/theme/tokens'

export function PlaceholderScreen({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain, padding: spacing.lg },
  title: { fontSize: typography.titleSerif, fontWeight: '700', color: colors.textDark },
  hint: { fontSize: typography.body, color: colors.textMutedGray, marginTop: spacing.md },
})
