// Luminous Botanical — cream, sage, mint, gold; Playfair + Inter.

export const fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifRegular: 'PlayfairDisplay_400Regular',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'Inter_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#14422d',
    primaryDark: '#002112',
    primaryLight: '#a1d1b4',
    primaryMuted: 'rgba(20, 66, 45, 0.10)',

    accent: '#cca830',
    accentDark: '#735c00',
    accentMuted: 'rgba(204, 168, 48, 0.16)',

    background: '#faf9f7',
    backgroundLight: '#f4f3f1',
    surface: '#ffffff',
    surfaceElevated: '#efeeec',
    surfaceLight: '#e9e8e6',

    tabBar: '#ffffff',
    tabActive: '#14422d',
    tabInactive: '#717973',

    text: '#1a1c1b',
    textPrimary: '#1a1c1b',
    textSecondary: '#414943',
    textMuted: '#717973',
    textDisabled: '#c0c9c1',

    success: '#3d6751',
    warning: '#cca830',
    danger: '#ba1a1a',
    info: '#3d6751',

    border: '#e3e2e0',
    borderLight: '#c0c9c1',
    divider: '#efeeec',

    white: '#ffffff',
    nearWhite: '#faf9f7',
    saleRed: '#ba1a1a',
    saleBadge: '#ba1a1a',
    thcGreen: '#3d6751',
    highThc: '#14422d',
    newBadge: '#14422d',
    indica: '#3d6751',
    sativa: '#cca830',
    hybrid: '#6b9e7a',
    cbd: '#5a8f9a',

    gold: '#cca830',
    onPrimary: '#ffffff',
    onPrimaryMuted: 'rgba(255,255,255,0.75)',
    secondaryContainer: '#bfedd1',
    onSecondaryContainer: '#254f3a',

    overlay: 'rgba(26, 28, 27, 0.4)',
    overlayLight: 'rgba(26, 28, 27, 0.18)',
    glow: 'rgba(45, 90, 67, 0.08)',
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 999 },

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
    display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
    title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
    heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: { shadowColor: '#2d5a43', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
    medium: { shadowColor: '#2d5a43', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
    large: { shadowColor: '#2d5a43', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 6 },
  },

  animation: { fast: 150, normal: 250, slow: 400 },
  variant: 'luminous' as const,
};

export type Theme = typeof theme;
export default theme;
