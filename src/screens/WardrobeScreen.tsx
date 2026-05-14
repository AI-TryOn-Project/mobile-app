import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'
import { fetchMobileWardrobe } from '@/api/services/wardrobe'
import type { FashionItem } from '@/api/types'

export function WardrobeScreen() {
  const [items, setItems] = useState<FashionItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetchMobileWardrobe({ limit: 30, offset: 0 })
      setItems(res.items)
    } catch (e) {
      setItems(null)
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Wardrobe</Text>
      <Text style={styles.sub}>GET /api/mobile/wardrobe — Bearer via httpClient.</Text>
      <Pressable style={styles.btn} onPress={() => void load()} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.btnText}>Load from API</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <View style={styles.list}>
        {items?.map((it) => (
          <View key={String(it.id)} style={styles.row}>
            {it.img ? (
              <Image source={{ uri: it.img }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.brand}>{it.brand ?? '—'}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {it.name}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvasMain },
  inner: { padding: spacing.base, paddingBottom: 120 },
  title: {
    fontSize: typography.titleSerif,
    lineHeight: 38,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: colors.textInk,
  },
  sub: { marginTop: 8, fontSize: typography.small, color: colors.textMutedBrown, marginBottom: 16 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textInk,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.pill,
    minWidth: 160,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: typography.bodyMd },
  err: { color: '#b91c1c', marginTop: 12, fontSize: typography.small },
  list: { marginTop: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    backgroundColor: colors.cardWhite,
    ...shadows.composer,
  },
  thumb: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.feedCardBg },
  thumbPlaceholder: { borderWidth: 1, borderColor: colors.borderHairline },
  brand: { fontSize: typography.caption, fontWeight: '700', letterSpacing: 1.2, color: colors.textLabelBrown },
  name: { marginTop: 4, fontSize: typography.bodyMd, color: colors.textDark, fontWeight: '600' },
})
