// Clinical Wellness Journal — cool lavender-white, medicinal green, Hanken Grotesk.

export const fonts = {
  serif: 'HankenGrotesk_600SemiBold',
  serifBold: 'HankenGrotesk_700Bold',
  serifRegular: 'HankenGrotesk_400Regular',
  serifItalic: 'HankenGrotesk_400Regular',
  body: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  mono: 'HankenGrotesk_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#2d5a4c',
    primaryDark: '#134235',
    primaryLight: '#a1d1bf',
    primaryMuted: 'rgba(45, 90, 76, 0.12)',

    accent: '#455367',
    accentDark: '#2e3c4f',
    accentMuted: 'rgba(69, 83, 103, 0.12)',

    background: '#f8f9ff',
    backgroundLight: '#eef4ff',
    surface: '#ffffff',
    surfaceElevated: '#e5efff',
    surfaceLight: '#dbe9ff',

    tabBar: '#ffffff',
    tabActive: '#134235',
    tabInactive: '#717975',

    text: '#0d1c2d',
    textPrimary: '#0d1c2d',
    textSecondary: '#404945',
    textMuted: '#717975',
    textDisabled: '#c0c8c3',

    success: '#2d5a4c',
    warning: '#b07d2b',
    danger: '#ba1a1a',
    info: '#455367',

    border: '#e2e8f0',
    borderLight: '#d4e4fa',
    divider: '#e2e8f0',

    white: '#ffffff',
    nearWhite: '#f8f9ff',
    saleRed: '#ba1a1a',
    saleBadge: '#ba1a1a',
    thcGreen: '#2d5a4c',
    highThc: '#134235',
    newBadge: '#2d5a4c',
    indica: '#5b7c9a',
    sativa: '#3d8b6e',
    hybrid: '#6b8f71',
    cbd: '#4a7c83',

    gold: '#a1d1bf',
    onPrimary: '#ffffff',
    onPrimaryMuted: 'rgba(255,255,255,0.75)',
    secondaryContainer: '#bcedda',
    onSecondaryContainer: '#214f41',

    overlay: 'rgba(13, 28, 45, 0.45)',
    overlayLight: 'rgba(13, 28, 45, 0.2)',
    glow: 'rgba(45, 90, 76, 0.12)',
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { xs: 2, sm: 4, md: 4, lg: 8, xl: 12, full: 999 },

  asymmetric: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  asymmetricSm: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },

  typography: {
    display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
    title: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
    heading: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 14, letterSpacing: 1.0, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: { shadowColor: '#0d1c2d', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
    medium: { shadowColor: '#0d1c2d', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2 },
    large: { shadowColor: '#0d1c2d', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4 },
  },

  animation: { fast: 150, normal: 250, slow: 400 },
  variant: 'nebula' as const,
};

export type Theme = typeof theme;
export default theme;
