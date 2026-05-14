import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Check, Globe, Loader2, Lock } from 'lucide-react-native'
import { OnboardingHeroCollage } from '@/components/OnboardingHeroCollage'
import {
  INSTAGRAM_SIGNAL_CARDS,
  INSTAGRAM_SYNC_ITEMS,
  ONBOARDING_VOICE_QUESTIONS,
} from '@/constants/appJsxMocks'
import { mobileLoginPassword } from '@/api/services/auth'
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens'
import { useAppStore } from '@/stores/useAppStore'

type Step = 'auth' | 'connect' | 'analyze' | 'questions'

export function OnboardingFlowScreen() {
  const setAuthCompleted = useAppStore((s) => s.setAuthCompleted)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [step, setStep] = useState<Step>('auth')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedHandle, setConnectedHandle] = useState('')
  const [analysisIndex, setAnalysisIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [draftAnswer, setDraftAnswer] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', email: '', password: '', instagram: '' })
  const [authError, setAuthError] = useState<string | null>(null)

  const currentQuestion = ONBOARDING_VOICE_QUESTIONS[questionIndex]
  const isLastQuestion = questionIndex === ONBOARDING_VOICE_QUESTIONS.length - 1

  useEffect(() => {
    if (step !== 'analyze') return
    setAnalysisIndex(0)
    const id = setInterval(() => {
      setAnalysisIndex((p) => (p >= INSTAGRAM_SIGNAL_CARDS.length - 1 ? p : p + 1))
    }, 650)
    const t = setTimeout(() => setStep('questions'), 3200)
    return () => {
      clearInterval(id)
      clearTimeout(t)
    }
  }, [step])

  const handleSkip = () => {
    setAuthCompleted(true)
  }

  const handleAuthSubmit = () => {
    setAuthError(null)
    if (mode === 'login' && form.email && form.password) {
      void (async () => {
        try {
          await mobileLoginPassword(form.email, form.password)
          setAuthCompleted(true)
        } catch (e) {
          setAuthError(e instanceof Error ? e.message : 'Login failed')
        }
      })()
      return
    }
    setConnectedHandle('')
    setStep('connect')
  }

  const handleConnectInstagram = () => {
    const fallbackHandle = (form.instagram.trim() || form.name.trim() || 'styledaily')
      .replace(/^@*/, '')
      .replace(/\s+/g, '')
      .toLowerCase()
    setIsConnecting(true)
    setTimeout(() => {
      setConnectedHandle(`@${fallbackHandle}`)
      setIsConnecting(false)
      setStep('analyze')
    }, 1300)
  }

  const submitAnswer = () => {
    const v = draftAnswer.trim()
    if (!v) return
    const next = { ...answers, [currentQuestion.id]: v }
    setAnswers(next)
    setDraftAnswer('')
    if (isLastQuestion) {
      setAuthCompleted(true)
      return
    }
    setQuestionIndex((p) => p + 1)
  }

  const isQuestions = step === 'questions'
  const activeCount = step === 'auth' ? 1 : step === 'connect' ? 2 : step === 'analyze' ? 3 : 4

  return (
    <View
      style={[
        styles.root,
        isQuestions ? styles.rootDark : styles.rootLight,
      ]}
    >
      <View style={[styles.progressBar, isQuestions ? { backgroundColor: 'rgba(255,255,255,0.1)' } : { backgroundColor: 'rgba(0,0,0,0.08)' }]} />

      <View style={styles.topRow}>
        <Pressable onPress={handleSkip}>
          <Text style={[styles.brand, isQuestions && { color: 'rgba(255,255,255,0.4)' }]}>fAIshion.AI</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                height: 6,
                borderRadius: 3,
                width: i < activeCount ? 20 : 6,
                backgroundColor:
                  i < activeCount
                    ? isQuestions
                      ? colors.white
                      : colors.textInk
                    : isQuestions
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.1)',
              }}
            />
          ))}
        </View>
      </View>

      {step === 'auth' && (
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.heroBlock}>
            <OnboardingHeroCollage />
            <Text style={[styles.serifTitle, { color: colors.textInk }]}>Connect your style graph</Text>
            <Text style={styles.subMuted}>Sign in, connect Instagram, start discovery.</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.modeSwitch}>
              {(['signup', 'login'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => {
                    setMode(m)
                    setAuthError(null)
                  }}
                  style={[styles.modeBtn, mode === m && styles.modeBtnOn]}
                >
                  <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextOn]}>
                    {m === 'signup' ? 'Sign up' : 'Log in'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {mode === 'signup' && (
              <TextInput
                value={form.name}
                onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
                placeholder="Name"
                placeholderTextColor="#b7ab9c"
                style={styles.input}
              />
            )}
            <TextInput
              value={form.email}
              onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
              placeholder="Email"
              placeholderTextColor="#b7ab9c"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={form.password}
              onChangeText={(t) => setForm((p) => ({ ...p, password: t }))}
              placeholder="Password"
              placeholderTextColor="#b7ab9c"
              secureTextEntry
              style={styles.input}
            />
            {authError ? <Text style={styles.err}>{authError}</Text> : null}
            <Pressable style={styles.primaryBtn} onPress={handleAuthSubmit}>
              <Lock size={15} color={colors.white} />
              <Text style={styles.primaryBtnText}>
                {mode === 'signup' ? 'Create account' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {step === 'connect' && (
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.heroBlock}>
            <OnboardingHeroCollage showConnectBadge />
            <Text style={[styles.serifTitle, { color: colors.textInk }]}>Connect Instagram</Text>
            <Text style={styles.subMuted}>Reads follows, posts, try-on photos, wardrobe.</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.igBox}>
              <Text style={styles.igLabel}>Instagram</Text>
              <View style={styles.igRow}>
                <Text style={{ color: '#8f7d67', fontSize: 14 }}>@</Text>
                <TextInput
                  value={form.instagram}
                  onChangeText={(t) => setForm((p) => ({ ...p, instagram: t.replace(/^@*/, '') }))}
                  placeholder="yourhandle"
                  placeholderTextColor="#b7ab9c"
                  style={styles.igInput}
                />
              </View>
            </View>
            {!connectedHandle ? (
              <Pressable
                disabled={isConnecting}
                style={[styles.primaryBtn, isConnecting && { opacity: 0.6 }]}
                onPress={handleConnectInstagram}
              >
                {isConnecting ? (
                  <Loader2 size={16} color={colors.white} />
                ) : (
                  <Globe size={16} color={colors.white} />
                )}
                <Text style={styles.primaryBtnText}>
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      )}

      {step === 'analyze' && (
        <View style={styles.analyzeWrap}>
          <View style={styles.card}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Live Sync</Text>
            </View>
            <Text style={[styles.serifTitle, { textAlign: 'center', marginTop: 16 }]}>
              Building your profile
            </Text>
            <Text style={[styles.subMuted, { textAlign: 'center', marginTop: 12 }]}>
              {analysisIndex === 0
                ? 'Reading who you follow.'
                : analysisIndex === 1
                  ? 'Reading what you post.'
                  : analysisIndex === 2
                    ? 'Saving full-body shots for try-on.'
                    : 'Pulling pieces into wardrobe.'}
            </Text>
            <View style={styles.grid}>
              {INSTAGRAM_SYNC_ITEMS.slice(0, 6).map((item, index) => (
                <View key={item.name} style={styles.gridCell}>
                  <View style={styles.gridImgWrap}>
                    <Image source={{ uri: item.image }} style={styles.gridImg} />
                    {index <= analysisIndex ? (
                      <View style={styles.checkBadge}>
                        <Check size={14} color={colors.white} />
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.signalRow}>
              {INSTAGRAM_SIGNAL_CARDS.map((card, index) => (
                <View
                  key={card.title}
                  style={[
                    styles.signalChip,
                    index <= analysisIndex ? { backgroundColor: colors.textInk } : { backgroundColor: colors.white },
                  ]}
                >
                  <Text
                    style={[
                      styles.signalChipText,
                      index <= analysisIndex ? { color: colors.white } : { color: '#8f7d67' },
                    ]}
                  >
                    {card.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {step === 'questions' && currentQuestion && (
        <View style={styles.qRoot}>
          <Text style={styles.qLabel}>{currentQuestion.label}</Text>
          <Text style={styles.qPrompt}>{currentQuestion.prompt}</Text>
          <TextInput
            value={draftAnswer}
            onChangeText={setDraftAnswer}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            style={styles.qInput}
          />
          <View style={styles.suggestRow}>
            {currentQuestion.suggestions.map((s) => (
              <Pressable key={s} style={styles.suggestChip} onPress={() => setDraftAnswer(s)}>
                <Text style={styles.suggestChipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.qSubmit} onPress={submitAnswer}>
            <Text style={styles.primaryBtnText}>{isLastQuestion ? 'Finish' : 'Next'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.lg, paddingTop: 40 },
  rootLight: { backgroundColor: colors.canvasMain },
  rootDark: { backgroundColor: colors.questionsBg },
  progressBar: {
    alignSelf: 'center',
    width: 112,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  topRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: typography.label,
    fontWeight: '700',
    letterSpacing: 4.8,
    textTransform: 'uppercase',
    color: '#8f7d67',
  },
  authScroll: { paddingBottom: 48 },
  heroBlock: { alignItems: 'center', paddingTop: 8 },
  serifTitle: {
    marginTop: 12,
    fontSize: typography.titleSerif,
    lineHeight: 36,
    fontFamily: 'PlayfairDisplay_700Bold',
    textAlign: 'center',
  },
  subMuted: { marginTop: 12, fontSize: typography.body, color: '#7a6d5d', textAlign: 'center' },
  card: {
    marginTop: 20,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.cardWarmBorder,
    backgroundColor: colors.cardWhite,
    padding: spacing.lg,
    ...shadows.cardLift,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.pillMutedBg,
    borderRadius: radii.pill,
    padding: 4,
    alignSelf: 'flex-start',
  },
  modeBtn: { borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
  modeBtnOn: { backgroundColor: colors.textInk },
  modeBtnText: { fontSize: typography.tabPill, fontWeight: '700', color: '#7a6d5d' },
  modeBtnTextOn: { color: colors.white },
  input: {
    marginTop: 12,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.bodyMd,
    color: colors.textInk,
  },
  err: { color: '#b91c1c', marginTop: 8, fontSize: typography.small },
  primaryBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 22,
    backgroundColor: colors.textInk,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: typography.body,
    fontWeight: '700',
    letterSpacing: 2.56,
    textTransform: 'uppercase',
    color: colors.white,
  },
  igBox: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    padding: 16,
  },
  igLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: '#8f7d67',
  },
  igRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  igInput: { flex: 1, fontSize: 15, color: colors.textInk },
  analyzeWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 4 },
  grid: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridCell: {
    width: '30%',
    borderRadius: 21,
    backgroundColor: '#f8f4ee',
    overflow: 'hidden',
    ...shadows.composer,
  },
  gridImgWrap: { aspectRatio: 0.82, backgroundColor: '#eee', position: 'relative' },
  gridImg: { width: '100%', height: '100%' },
  checkBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.analyzeBadgePurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalRow: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  signalChip: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8 },
  signalChipText: { fontSize: typography.label, fontWeight: '600' },
  liveBadge: {
    alignSelf: 'center',
    backgroundColor: colors.canvasMain,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  liveBadgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: '#8f7d67',
  },
  qRoot: { flex: 1, paddingTop: 24 },
  qLabel: { color: 'rgba(255,255,255,0.45)', fontSize: typography.small, fontWeight: '700' },
  qPrompt: { color: colors.white, fontSize: 22, marginTop: 12, fontWeight: '600' },
  qInput: {
    marginTop: 20,
    minHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    color: colors.white,
    fontSize: typography.bodyMd,
  },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  suggestChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestChipText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.small },
  qSubmit: {
    marginTop: 24,
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
  },
})
