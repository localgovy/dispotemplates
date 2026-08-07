// ─────────────────────────────────────────────────────────────────────────────
// Amber Reserve — "Tactile / Modern Skeuomorphic" design system
// Mahogany lounge, honey-amber CTAs, Libre Caslon + Source Serif + Inter.
// ─────────────────────────────────────────────────────────────────────────────

export const fonts = {
  serif: 'LibreCaslonText_700Bold',
  serifBold: 'LibreCaslonText_700Bold',
  serifRegular: 'LibreCaslonText_400Regular',
  serifItalic: 'LibreCaslonText_400Regular_Italic',
  body: 'SourceSerif4_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'Inter_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#ffbf00',
    primaryDark: '#6d5000',
    primaryLight: '#ffe2ab',
    primaryMuted: 'rgba(255, 191, 0, 0.14)',

    accent: '#fbbc00',
    accentDark: '#5c4300',
    accentMuted: 'rgba(251, 188, 0, 0.16)',

    background: '#131411',
    backgroundLight: '#1c1c19',
    surface: '#20201d',
    surfaceElevated: '#2a2a27',
    surfaceLight: '#353532',

    tabBar: '#0e0e0c',
    tabActive: '#261a00',
    tabInactive: '#9c8f78',

    text: '#e5e2dd',
    textPrimary: '#e5e2dd',
    textSecondary: '#d4c5ab',
    textMuted: '#9c8f78',
    textDisabled: '#504532',

    success: '#6ee591',
    warning: '#fbbc00',
    danger: '#ffb4ab',
    info: '#ddc0ba',

    border: '#504532',
    borderLight: 'rgba(255, 191, 0, 0.12)',
    divider: 'rgba(255, 191, 0, 0.10)',

    white: '#ffffff',
    nearWhite: '#e5e2dd',
    saleRed: '#ffb4ab',
    saleBadge: '#93000a',
    thcGreen: '#fbbc00',
    highThc: '#ffbf00',
    newBadge: '#ffbf00',
    indica: '#ddc0ba',
    sativa: '#f3bea0',
    hybrid: '#ffe2ab',
    cbd: '#d4c5ab',

    gold: '#ffbf00',
    onPrimary: '#402d00',
    onPrimaryMuted: 'rgba(64, 45, 0, 0.7)',
    secondaryContainer: '#56423d',
    onSecondaryContainer: '#fadcd5',

    overlay: 'rgba(14, 14, 12, 0.72)',
    overlayLight: 'rgba(14, 14, 12, 0.4)',

    glow: 'rgba(255, 191, 0, 0.18)',
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
    md: 4,
    lg: 8,
    xl: 8,
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
    display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
    title: { fontFamily: fonts.serifBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
    heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
    subheading: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 28,
      elevation: 10,
    },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  variant: 'amber' as const,
};

export type Theme = typeof theme;
export default theme;
