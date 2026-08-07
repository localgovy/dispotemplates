// ─────────────────────────────────────────────────────────────────────────────
// Rose Noir — "Nocturnal Luxury" design system
// Pitch black, crimson + rose-gold, EB Garamond + Inter, soft refined radii.
// ─────────────────────────────────────────────────────────────────────────────

export const fonts = {
  serif: 'EBGaramond_400Regular',
  serifBold: 'EBGaramond_700Bold',
  serifRegular: 'EBGaramond_400Regular',
  serifItalic: 'EBGaramond_400Regular_Italic',
  body: 'Inter_300Light',
  medium: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'Inter_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#880808',
    primaryDark: '#410001',
    primaryLight: '#ffb4a9',
    primaryMuted: 'rgba(136, 8, 8, 0.18)',

    accent: '#B76E79',
    accentDark: '#733641',
    accentMuted: 'rgba(183, 110, 121, 0.18)',

    background: '#0a0a0a',
    backgroundLight: '#131313',
    surface: '#1a1a1a',
    surfaceElevated: '#201f1f',
    surfaceLight: '#2a2a2a',

    tabBar: 'rgba(10, 10, 10, 0.92)',
    tabActive: '#ffb4a9',
    tabInactive: '#a98985',

    text: '#e5e2e1',
    textPrimary: '#e5e2e1',
    textSecondary: '#e2bfba',
    textMuted: '#a98985',
    textDisabled: '#5a413d',

    success: '#c8c6c5',
    warning: '#ffb2bc',
    danger: '#ffb4ab',
    info: '#B76E79',

    border: 'rgba(183, 110, 121, 0.15)',
    borderLight: 'rgba(183, 110, 121, 0.28)',
    divider: 'rgba(255,255,255,0.06)',

    white: '#ffffff',
    nearWhite: '#e5e2e1',
    saleRed: '#ff8f81',
    saleBadge: '#880808',
    thcGreen: '#B76E79',
    highThc: '#ffb4a9',
    newBadge: '#880808',
    indica: '#ffb2bc',
    sativa: '#ffb4a9',
    hybrid: '#e2bfba',
    cbd: '#c8c6c5',

    gold: '#B76E79',
    onPrimary: '#ffdad5',
    onPrimaryMuted: 'rgba(255, 218, 213, 0.75)',
    secondaryContainer: 'rgba(136, 8, 8, 0.28)',
    onSecondaryContainer: '#ffb4a9',

    overlay: 'rgba(10, 10, 10, 0.85)',
    overlayLight: 'rgba(10, 10, 10, 0.5)',

    glow: 'rgba(136, 8, 8, 0.28)',
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },

  asymmetric: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  asymmetricSm: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
  },

  typography: {
    display: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
    title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
    heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 14, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: {
      shadowColor: '#880808',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#880808',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      shadowRadius: 28,
      elevation: 10,
    },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  variant: 'rose' as const,
};

export type Theme = typeof theme;
export default theme;
