// ─────────────────────────────────────────────────────────────────────────────
// Emerald Crypt — "Genetic Archive / Lab Vault" design system
// Neon matrix green, Space Grotesk, sharp technical chrome, batch framing.
// ─────────────────────────────────────────────────────────────────────────────

export const fonts = {
  serif: 'SpaceGrotesk_700Bold',
  serifBold: 'SpaceGrotesk_700Bold',
  serifRegular: 'SpaceGrotesk_400Regular',
  serifItalic: 'SpaceGrotesk_400Regular',
  body: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
  mono: 'SpaceGrotesk_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#50c878',
    primaryDark: '#005025',
    primaryLight: '#6ee591',
    primaryMuted: 'rgba(80, 200, 120, 0.14)',

    accent: '#95e400',
    accentDark: '#3d6200',
    accentMuted: 'rgba(149, 228, 0, 0.16)',

    background: '#131313',
    backgroundLight: '#1c1b1b',
    surface: '#20201f',
    surfaceElevated: '#2a2a2a',
    surfaceLight: '#353535',

    tabBar: '#0e0e0e',
    tabActive: '#003919',
    tabInactive: '#879487',

    text: '#e5e2e1',
    textPrimary: '#e5e2e1',
    textSecondary: '#bdcabc',
    textMuted: '#879487',
    textDisabled: '#3e4a3f',

    success: '#6ee591',
    warning: '#bcff5f',
    danger: '#ffb4ab',
    info: '#50c878',

    border: 'rgba(80, 200, 120, 0.22)',
    borderLight: 'rgba(110, 229, 145, 0.35)',
    divider: 'rgba(255,255,255,0.08)',

    white: '#ffffff',
    nearWhite: '#e5e2e1',
    saleRed: '#ffb4ab',
    saleBadge: '#003919',
    thcGreen: '#bcff5f',
    highThc: '#95e400',
    newBadge: '#50c878',
    indica: '#6ee591',
    sativa: '#bcff5f',
    hybrid: '#83fba5',
    cbd: '#a7b6a2',

    gold: '#95e400',
    onPrimary: '#00210c',
    onPrimaryMuted: 'rgba(0, 33, 12, 0.75)',
    secondaryContainer: 'rgba(80, 200, 120, 0.18)',
    onSecondaryContainer: '#83fba5',

    overlay: 'rgba(0, 0, 0, 0.82)',
    overlayLight: 'rgba(0, 0, 0, 0.48)',

    glow: 'rgba(80, 200, 120, 0.22)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
    full: 999,
  },

  asymmetric: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
  asymmetricSm: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },

  typography: {
    display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 38, letterSpacing: -1.0 },
    title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 30, letterSpacing: -0.6 },
    heading: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
    small: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 16, letterSpacing: 0.6 },
    label: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 14, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: {
      shadowColor: '#50c878',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#50c878',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 10,
    },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  variant: 'emerald' as const,
};

export type Theme = typeof theme;
export default theme;
