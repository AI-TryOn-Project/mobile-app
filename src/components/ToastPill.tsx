import { StyleSheet, Text, View } from 'react-native'
import { colors, fontFamily, shadows } from '@/theme/tokens'

type Props = { message: string | null; top: number }

export function ToastPill({ message, top }: Props) {
  if (message == null) return null

  return (
    <View pointerEvents="none" style={[styles.wrap, { top }]}>
      <View style={styles.pill}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    backgroundColor: colors.toastBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    ...shadows.mediumShadow,
  },
  text: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
  },
})
