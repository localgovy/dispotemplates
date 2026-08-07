// ─────────────────────────────────────────────────────────────────────────────
// Obsidian Glow — "High-Tech Apothecary" design system
// Matte black, electric cyan glow, sharp 0px corners, EB Garamond + JetBrains Mono.
// ─────────────────────────────────────────────────────────────────────────────

export const fonts = {
  serif: 'EBGaramond_500Medium',
  serifBold: 'EBGaramond_700Bold',
  serifRegular: 'EBGaramond_400Regular',
  serifItalic: 'EBGaramond_400Regular_Italic',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'JetBrainsMono_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#00f0ff',
    primaryDark: '#006970',
    primaryLight: '#dbfcff',
    primaryMuted: 'rgba(0, 240, 255, 0.12)',

    accent: '#4b8eff',
    accentDark: '#00285c',
    accentMuted: 'rgba(75, 142, 255, 0.16)',

    background: '#0d0d0d',
    backgroundLight: '#151515',
    surface: '#151515',
    surfaceElevated: '#1a1a1a',
    surfaceLight: '#201f1f',

    tabBar: '#0e0e0e',
    tabActive: '#00363a',
    tabInactive: '#849495',

    text: '#e5e2e1',
    textPrimary: '#e5e2e1',
    textSecondary: '#b9cacb',
    textMuted: '#849495',
    textDisabled: '#3b494b',

    success: '#00dbe9',
    warning: '#adc6ff',
    danger: '#ffb4ab',
    info: '#00f0ff',

    border: 'rgba(255,255,255,0.10)',
    borderLight: 'rgba(0, 240, 255, 0.25)',
    divider: 'rgba(255,255,255,0.08)',

    white: '#ffffff',
    nearWhite: '#e5e2e1',
    saleRed: '#ffb4ab',
    saleBadge: '#93000a',
    thcGreen: '#00f0ff',
    highThc: '#00dbe9',
    newBadge: '#00f0ff',
    indica: '#adc6ff',
    sativa: '#00f0ff',
    hybrid: '#7df4ff',
    cbd: '#b9cacb',

    gold: '#00f0ff',
    onPrimary: '#00363a',
    onPrimaryMuted: 'rgba(0, 54, 58, 0.75)',
    secondaryContainer: 'rgba(0, 240, 255, 0.14)',
    onSecondaryContainer: '#dbfcff',

    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(0, 0, 0, 0.45)',

    glow: 'rgba(0, 240, 255, 0.22)',
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
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    full: 0,
  },

  asymmetric: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  asymmetricSm: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },

  typography: {
    display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
    title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
    heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
    subheading: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 16, letterSpacing: 0.4 },
    label: { fontFamily: fonts.mono, fontSize: 10, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: {
      shadowColor: '#00f0ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#00f0ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 4,
    },
    large: {
      shadowColor: '#00f0ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  variant: 'obsidian' as const,
};

export type Theme = typeof theme;
export default theme;
