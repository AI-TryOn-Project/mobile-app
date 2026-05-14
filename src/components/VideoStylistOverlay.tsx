import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { colors, radii, spacing, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

export function VideoStylistOverlay() {
  const insets = useSafeAreaInsets()
  const open = useAppStore((s) => s.videoStylistOpen)
  const setOpen = useAppStore((s) => s.setVideoStylistOpen)

  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
      <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>Stylist Call</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <X size={22} color={colors.textDark} />
            </Pressable>
          </View>
          <Text style={styles.body}>
            Live video stylist is not wired in this build. Close to return to the app shell (pixel shell matches
            App.jsx overlay placeholder).
          </Text>
          <Pressable style={styles.btn} onPress={() => setOpen(false)}>
            <Text style={styles.btnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.55)',
    paddingHorizontal: spacing.base,
    justifyContent: 'center',
  },
  card: {
    borderRadius: radii.xxl,
    backgroundColor: colors.cardWhite,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: typography.bodyMd, fontWeight: '700', color: colors.textDark },
  body: { fontSize: typography.small, color: colors.textMutedGray, lineHeight: 18, marginBottom: 16 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textInk,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: typography.small },
})
