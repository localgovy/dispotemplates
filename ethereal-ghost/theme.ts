// ─────────────────────────────────────────────────────────────────────────────
// Ethereal Ghost — "Vapor-Luxury" design system
// Monochrome void, glass layers, Montserrat only, full pill / XL soft radii.
// ─────────────────────────────────────────────────────────────────────────────

export const fonts = {
  serif: 'Montserrat_700Bold',
  serifBold: 'Montserrat_700Bold',
  serifRegular: 'Montserrat_400Regular',
  serifItalic: 'Montserrat_400Regular_Italic',
  body: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  mono: 'Montserrat_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#ffffff',
    primaryDark: '#e2e2e2',
    primaryLight: '#ffffff',
    primaryMuted: 'rgba(255, 255, 255, 0.12)',

    accent: '#c6c6c7',
    accentDark: '#8e9192',
    accentMuted: 'rgba(255, 255, 255, 0.08)',

    background: '#121212',
    backgroundLight: '#1c1b1b',
    surface: 'rgba(255,255,255,0.06)',
    surfaceElevated: 'rgba(255,255,255,0.10)',
    surfaceLight: '#2a2a2a',

    tabBar: 'rgba(18, 18, 18, 0.85)',
    tabActive: '#ffffff',
    tabInactive: '#8e9192',

    text: '#e5e2e1',
    textPrimary: '#ffffff',
    textSecondary: '#c4c7c8',
    textMuted: '#8e9192',
    textDisabled: '#444748',

    success: '#c7c6c6',
    warning: '#e2e2e2',
    danger: '#ffb4ab',
    info: '#ffffff',

    border: 'rgba(255,255,255,0.15)',
    borderLight: 'rgba(255,255,255,0.22)',
    divider: 'rgba(255,255,255,0.05)',

    white: '#ffffff',
    nearWhite: '#e5e2e1',
    saleRed: '#ffb4ab',
    saleBadge: 'rgba(255,255,255,0.18)',
    thcGreen: '#c6c6c7',
    highThc: '#ffffff',
    newBadge: '#ffffff',
    indica: '#ffffff',
    sativa: '#c7c6c6',
    hybrid: '#e2e2e2',
    cbd: '#8e9192',

    gold: '#ffffff',
    onPrimary: '#2f3131',
    onPrimaryMuted: 'rgba(47, 49, 49, 0.7)',
    secondaryContainer: 'rgba(255,255,255,0.14)',
    onSecondaryContainer: '#ffffff',

    overlay: 'rgba(18, 18, 18, 0.8)',
    overlayLight: 'rgba(18, 18, 18, 0.5)',

    glow: 'rgba(255, 255, 255, 0.08)',
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
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    full: 999,
  },

  asymmetric: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
  },
  asymmetricSm: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },

  typography: {
    display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
    title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
    heading: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 27, letterSpacing: 0.4 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 14, letterSpacing: 2.0, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 1,
    },
    medium: {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 2,
    },
    large: {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 28,
      elevation: 4,
    },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  variant: 'ghost' as const,
};

export type Theme = typeof theme;
export default theme;
