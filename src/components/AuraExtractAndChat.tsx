import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { readChatResponseLines } from '@/api/chatStreamSpike'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

export function AuraExtractAndChat() {
  const insets = useSafeAreaInsets()
  const showAura = useAppStore((s) => s.showAura)
  const setShowAura = useAppStore((s) => s.setShowAura)
  const [input, setInput] = useState('')
  const [log, setLog] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setBusy(true)
    setLog('')
    try {
      let acc = ''
      for await (const chunk of readChatResponseLines({
        messages: [
          {
            id: 'aura-1',
            role: 'user',
            parts: [{ type: 'text', text }],
          },
        ],
      })) {
        acc += chunk.text
        setLog(acc)
      }
    } catch (e) {
      setLog(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setBusy(false)
      setInput('')
    }
  }

  return (
    <Modal
      visible={showAura}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAura(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setShowAura(false)} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}
      >
        <View style={styles.handleRow}>
          <Text style={styles.title}>Aura</Text>
          <Pressable onPress={() => setShowAura(false)} hitSlop={12}>
            <X size={22} color={colors.textDark} />
          </Pressable>
        </View>
        <Text style={styles.sub}>Stylist chat — POST /api/chat with Bearer token.</Text>
        <ScrollView style={styles.logScroll} contentContainerStyle={styles.logInner}>
          <Text style={styles.logText}>{log || (busy ? '…' : ' ')}</Text>
        </ScrollView>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Aura…"
            placeholderTextColor={colors.textMutedGray}
            onSubmitEditing={() => void send()}
            returnKeyType="send"
            editable={!busy}
          />
          <Pressable style={[styles.send, busy && { opacity: 0.6 }]} onPress={() => void send()} disabled={busy}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '78%',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    backgroundColor: colors.canvasMain,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardLift,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: typography.bodyMd,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDark,
  },
  sub: { fontSize: typography.small, color: colors.textMutedGray, marginBottom: 12 },
  logScroll: { flexGrow: 0, maxHeight: 280, marginBottom: 8 },
  logInner: { paddingVertical: 8 },
  logText: { fontSize: typography.bodyMd, color: colors.textBody, lineHeight: 20 },
  composer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.bodyMd,
    color: colors.textDark,
  },
  send: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.textInk,
  },
  sendText: { color: colors.white, fontWeight: '700', fontSize: typography.small },
})
