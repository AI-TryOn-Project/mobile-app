/**
 * Tokens extracted from mobile-app `index.html` + `App.jsx` (canonical UI).
 * Use these instead of ad-hoc hex in components.
 */
export const colors = {
  /** index.html body */
  canvasOuter: '#e8e5df',
  /** main scroll surfaces, onboarding (non-questions) */
  canvasMain: '#f5f3ef',
  cardWhite: '#ffffff',
  cardWarmBorder: '#ebe5db',
  inputBg: '#fcfaf7',
  inputBorder: '#ece4d9',
  pillMutedBg: '#f2ede6',
  textInk: '#171412',
  textBody: '#2b2723',
  textMutedBrown: '#7a6d5d',
  textLabelBrown: '#8f7d67',
  textMutedGray: '#999999',
  textDark: '#1a1a1a',
  borderLight: '#e5e5e5',
  borderHairline: '#f2f2f2',
  feedCardBg: '#e6e2d6',
  black: '#000000',
  /** Collapsible nav dark panel */
  navPanelBg: 'rgba(23,23,23,0.96)',
  navFabBg: '#141414',
  navFabBorder: 'rgba(255,255,255,0.1)',
  accentPurple: '#6c5ce7',
  accentPurpleMuted: 'rgba(108,92,231,0.18)',
  accentGreen: '#27ae60',
  accentGreenMuted: 'rgba(39,174,96,0.18)',
  /** questions step */
  questionsBg: '#000000',
  white: '#ffffff',
  toastBg: '#1a1a1a',
  analyzeBadgePurple: '#8b2cff',
} as const

export const shadows = {
  cardLift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 8,
  },
  navPanel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 22,
    elevation: 16,
  },
  navFab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 12,
  },
  composer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 13,
    elevation: 4,
  },
} as const

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  pill: 999,
  navPanel: 32,
  navItem: 19,
  fab: 999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const

export const typography = {
  micro: 8,
  tiny: 9,
  caption: 10,
  label: 11,
  small: 12,
  body: 13,
  bodyMd: 14,
  titleSerif: 34,
  sectionUpper: 10,
  tabPill: 12,
} as const

export const layout = {
  navPanelWidth: 232,
  navFabSize: 48,
  bottomNavOffset: 24,
  leftNavGutter: 16,
} as const
