import React, { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {
  Compass,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  Sparkles,
  User,
  Wand2,
  PlayCircle,
} from 'lucide-react-native'
import { colors, layout, radii, shadows, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

export function CollapsibleNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const mixItems = useAppStore((s) => s.mixItems)
  const setVideoStylistOpen = useAppStore((s) => s.setVideoStylistOpen)
  const setShowAura = useAppStore((s) => s.setShowAura)
  const tryOnPhase = useAppStore((s) => s.tryOnPhase)
  const tryOnReadyCount = useAppStore((s) => s.tryOnReadyCount)
  const setTryOnStatus = useAppStore((s) => s.setTryOnStatus)

  const isTryOnRunning = tryOnPhase === 'generating'
  const navActive = activeTab === 'wardrobe' ? 'profile' : activeTab

  const openTryOnGeneratedNotice = () => {
    setTryOnStatus(() => ({ phase: 'idle', profileNotificationCount: 0 }))
    setActiveTab('profile')
    setIsOpen(false)
  }

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (!result.canceled && result.assets?.length) {
      setShowAura(true)
    }
    setIsOpen(false)
  }

  const navItems = [
    { id: 'trending' as const, label: 'Discover', Icon: Compass },
    { id: 'skills' as const, label: 'Skills', Icon: Wand2 },
    {
      id: 'tryon' as const,
      label: 'Try-on',
      count: mixItems.length,
      highlighted: mixItems.length > 0,
      Icon: Sparkles,
    },
    {
      id: 'profile' as const,
      label: 'Me',
      count: tryOnReadyCount,
      notification: tryOnReadyCount > 0,
      Icon: User,
    },
  ]

  const renderPanel = () => (
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>Tools</Text>
      <Pressable
        style={({ pressed }) => [styles.toolRow, pressed && { opacity: 0.85 }]}
        onPress={() => {
          setShowAura(true)
          setIsOpen(false)
        }}
      >
        <View style={styles.toolIconWrap}>
          <MessageCircle size={19} color="rgba(255,255,255,0.92)" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.toolTitle}>Aura chat</Text>
          <Text style={styles.toolDesc} numberOfLines={1}>
            Ask the stylist (Bearer /api/chat)
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.toolRow, pressed && { opacity: 0.85 }]}
        onPress={() => void pickImage()}
      >
        <View style={styles.toolIconWrap}>
          <ImageIcon size={19} color="rgba(255,255,255,0.92)" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.toolTitle}>Upload image</Text>
          <Text style={styles.toolDesc} numberOfLines={1}>
            Find similar pieces from photos
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.toolRow, pressed && { opacity: 0.85 }]}
        onPress={() => {
          setVideoStylistOpen(true)
          setIsOpen(false)
        }}
      >
        <View style={styles.toolIconWrap}>
          <PlayCircle size={19} color="rgba(255,255,255,0.92)" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.toolTitle}>Stylist Call</Text>
          <Text style={styles.toolDesc} numberOfLines={1}>
            Live fit check and detail advice
          </Text>
        </View>
      </Pressable>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Navigate</Text>

      {navItems.map((item) => {
        const active = navActive === item.id
        const isTry = item.id === 'tryon'
        const notif = 'notification' in item && item.notification
        const highlighted = 'highlighted' in item && item.highlighted
        const Icon = item.Icon
        const stroke = active ? 2.6 : 2.2
        let rowBg = 'transparent'
        let textCol = 'rgba(255,255,255,0.84)'
        if (active) {
          if (isTry) rowBg = colors.accentPurple
          else if (item.id === 'profile' && notif) rowBg = colors.accentGreen
          else rowBg = 'rgba(255,255,255,0.08)'
          textCol = colors.white
        } else if (highlighted) {
          rowBg = colors.accentPurpleMuted
          textCol = '#cfc4ff'
        } else if (notif) {
          rowBg = colors.accentGreenMuted
          textCol = '#9be2b5'
        }
        return (
          <View key={item.id} style={styles.navRow}>
            <Pressable
              style={({ pressed }) => [
                styles.navBtn,
                { backgroundColor: rowBg },
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => {
                if (item.id === 'profile' && item.count > 0) {
                  openTryOnGeneratedNotice()
                  return
                }
                setActiveTab(item.id)
                if (item.id === 'tryon') {
                  setTryOnStatus(() => ({ phase: 'setup', profileNotificationCount: tryOnReadyCount }))
                }
                setIsOpen(false)
              }}
            >
              <Icon
                size={22}
                color={notif ? '#9be2b5' : highlighted ? '#cfc4ff' : 'rgba(255,255,255,0.88)'}
                strokeWidth={stroke}
              />
              <Text style={[styles.navLabel, { color: textCol }]}>{item.label}</Text>
              {isTry && item.count > 0 && activeTab !== 'tryon' ? (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{item.count}</Text>
                </View>
              ) : null}
            </Pressable>
            {item.id === 'profile' && item.count > 0 ? (
              <Pressable style={styles.sideCount} onPress={openTryOnGeneratedNotice}>
                <Text style={styles.sideCountText}>{item.count}</Text>
              </Pressable>
            ) : null}
          </View>
        )
      })}
    </View>
  )

  const showFabBadge =
    isTryOnRunning ||
    tryOnReadyCount > 0 ||
    (mixItems.length > 0 && activeTab !== 'tryon')

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)} />
          <View style={styles.modalPanelAnchor}>{renderPanel()}</View>
        </View>
      </Modal>

      <View pointerEvents="box-none" style={styles.anchor}>
        <View style={styles.fabOnly}>
          <Pressable
            onPress={() => setIsOpen((o) => !o)}
            style={({ pressed }) => [
              styles.fab,
              isOpen && styles.fabOpen,
              pressed && { opacity: 0.95 },
            ]}
          >
            <Plus size={18} color={colors.white} strokeWidth={2.5} />
            {showFabBadge ? (
              <View
                style={[
                  styles.fabBadge,
                  isTryOnRunning && { backgroundColor: colors.accentPurple },
                  !isTryOnRunning && tryOnReadyCount > 0 && { backgroundColor: colors.accentGreen },
                  !isTryOnRunning &&
                    tryOnReadyCount === 0 &&
                    mixItems.length > 0 &&
                    activeTab !== 'tryon' && { backgroundColor: colors.accentPurple },
                ]}
              >
                {isTryOnRunning ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.fabBadgeText}>
                    {tryOnReadyCount > 0 ? tryOnReadyCount : mixItems.length}
                  </Text>
                )}
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  modalPanelAnchor: {
    position: 'absolute',
    bottom: layout.bottomNavOffset + layout.navFabSize + 12,
    left: layout.leftNavGutter,
  },
  anchor: {
    position: 'absolute',
    bottom: layout.bottomNavOffset,
    left: layout.leftNavGutter,
    zIndex: 50,
  },
  fabOnly: { alignItems: 'flex-start' },
  panel: {
    width: layout.navPanelWidth,
    borderRadius: layout.navPanelWidth / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.navPanelBg,
    padding: 12,
    ...shadows.navPanel,
  },
  sectionLabel: {
    marginBottom: 8,
    paddingHorizontal: 8,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 3.08,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.navItem,
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: { fontSize: typography.bodyMd, fontWeight: '600', color: 'rgba(255,255,255,0.92)' },
  toolDesc: { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  divider: {
    marginVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 19,
    minWidth: 0,
  },
  navLabel: { flex: 1, fontSize: typography.bodyMd, fontWeight: '600', letterSpacing: 0.14 },
  countPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.accentPurple,
  },
  countPillText: { fontSize: 11, fontWeight: '700', color: colors.white },
  sideCount: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.navFab,
  },
  sideCountText: { fontSize: 11, fontWeight: '700', color: colors.white },
  fab: {
    width: layout.navFabSize,
    height: layout.navFabSize,
    borderRadius: layout.navFabSize / 2,
    borderWidth: 1,
    borderColor: colors.navFabBorder,
    backgroundColor: colors.navFabBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.navFab,
  },
  fabOpen: { backgroundColor: '#1b1b1b', transform: [{ rotate: '45deg' }] },
  fabBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white },
})
