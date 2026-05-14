import React, { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { mobileLoginPassword, mobileLogout } from '@/api/services/auth'
import { readChatResponseLines } from '@/api/chatStreamSpike'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

export function ProfileScreen() {
  const setAuthCompleted = useAppStore((s) => s.setAuthCompleted)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [streamLog, setStreamLog] = useState('')
  const [showDev, setShowDev] = useState(false)

  const onLogin = async () => {
    setStatus(null)
    try {
      await mobileLoginPassword(email, password)
      setStatus('Logged in — Bearer tokens stored')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Login error')
    }
  }

  const onLogout = async () => {
    await mobileLogout()
    setStatus('Logged out')
    setStreamLog('')
    setAuthCompleted(false)
  }

  const onChatSpike = async () => {
    setStreamLog('')
    try {
      let acc = ''
      for await (const chunk of readChatResponseLines({
        messages: [
          {
            id: 'm-spike-1',
            role: 'user',
            parts: [{ type: 'text', text: 'Say hello in one short sentence.' }],
          },
        ],
      })) {
        acc += chunk.text
        setStreamLog(acc)
      }
    } catch (e) {
      setStreamLog(e instanceof Error ? e.message : 'Stream error')
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Me</Text>
      <Text style={styles.sub}>Account & session (Bearer only, no cookies).</Text>

      <Pressable style={styles.devToggle} onPress={() => setShowDev((v) => !v)}>
        <Text style={styles.devToggleText}>{showDev ? 'Hide' : 'Show'} developer tools</Text>
      </Pressable>

      {showDev ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Password login</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.textMutedGray}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={colors.textMutedGray}
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={() => void onLogin()}>
              <Text style={styles.btnText}>Login</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnMuted]} onPress={() => void onLogout()}>
              <Text style={styles.btnText}>Logout & reset onboarding</Text>
            </Pressable>
          </View>
          {status ? <Text style={styles.status}>{status}</Text> : null}
          <Text style={[styles.cardTitle, { marginTop: 20 }]}>Chat stream (POST /api/chat)</Text>
          <Pressable style={styles.btn} onPress={() => void onChatSpike()}>
            <Text style={styles.btnText}>Run stream spike</Text>
          </Pressable>
          {streamLog ? <Text style={styles.stream}>{streamLog}</Text> : null}
        </View>
      ) : null}

      {!showDev ? (
        <Pressable style={[styles.btn, styles.btnMuted]} onPress={() => void onLogout()}>
          <Text style={styles.btnText}>Sign out</Text>
        </Pressable>
      ) : null}
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
  sub: { marginTop: 8, fontSize: typography.small, color: colors.textMutedBrown, marginBottom: 12 },
  devToggle: { alignSelf: 'flex-start', marginBottom: 12 },
  devToggleText: { fontSize: typography.small, fontWeight: '600', color: colors.accentPurple },
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    backgroundColor: colors.cardWhite,
    padding: spacing.lg,
    marginBottom: 16,
    ...shadows.composer,
  },
  cardTitle: { fontSize: typography.bodyMd, fontWeight: '700', color: colors.textDark, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 19,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: typography.bodyMd,
    color: colors.textInk,
  },
  row: { gap: 10 },
  btn: {
    marginTop: 8,
    backgroundColor: colors.textInk,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  btnMuted: { backgroundColor: '#444' },
  btnText: { color: colors.white, fontWeight: '700', fontSize: typography.small },
  status: { marginTop: 12, fontSize: typography.small, color: colors.textBody },
  stream: { marginTop: 12, fontSize: typography.small, color: colors.textBody, lineHeight: 18 },
})
