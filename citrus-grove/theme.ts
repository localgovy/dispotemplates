// Citrus Grove — sunny cream, coral, citrus yellow, lime; Nunito + DM Sans.

export const fonts = {
  serif: 'Nunito_700Bold',
  serifBold: 'Nunito_800ExtraBold',
  serifRegular: 'Nunito_400Regular',
  serifItalic: 'Nunito_400Regular_Italic',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  mono: 'DMSans_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#E85D4C',
    primaryDark: '#C43D2E',
    primaryLight: '#FFB4A8',
    primaryMuted: 'rgba(232, 93, 76, 0.14)',

    accent: '#F5C518',
    accentDark: '#C9A00E',
    accentMuted: 'rgba(245, 197, 24, 0.22)',

    background: '#FFF8F0',
    backgroundLight: '#FFF3E6',
    surface: '#ffffff',
    surfaceElevated: '#FFE8D2',
    surfaceLight: '#FFF0DE',

    tabBar: '#ffffff',
    tabActive: '#C43D2E',
    tabInactive: '#9A8578',

    text: '#2A1F18',
    textPrimary: '#2A1F18',
    textSecondary: '#5C4A3D',
    textMuted: '#9A8578',
    textDisabled: '#D4C4B5',

    success: '#3CB371',
    warning: '#F5C518',
    danger: '#E85D4C',
    info: '#3CB371',

    border: '#F0DCC8',
    borderLight: '#F8E8D8',
    divider: '#F0DCC8',

    white: '#ffffff',
    nearWhite: '#FFF8F0',
    saleRed: '#E85D4C',
    saleBadge: '#E85D4C',
    thcGreen: '#3CB371',
    highThc: '#E85D4C',
    newBadge: '#3CB371',
    indica: '#9B6B9E',
    sativa: '#F5C518',
    hybrid: '#E85D4C',
    cbd: '#3CB371',

    gold: '#F5C518',
    onPrimary: '#ffffff',
    onPrimaryMuted: 'rgba(255,255,255,0.8)',
    secondaryContainer: '#FFE08A',
    onSecondaryContainer: '#5C4300',

    overlay: 'rgba(42, 31, 24, 0.4)',
    overlayLight: 'rgba(42, 31, 24, 0.18)',
    glow: 'rgba(232, 93, 76, 0.15)',
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, full: 999 },

  asymmetric: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 22,
  },
  asymmetricSm: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },

  typography: {
    display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.4 },
    title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, letterSpacing: -0.2 },
    heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, letterSpacing: 0 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: { shadowColor: '#E85D4C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
    medium: { shadowColor: '#C43D2E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 4 },
    large: { shadowColor: '#2A1F18', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 8 },
  },

  animation: { fast: 150, normal: 250, slow: 400 },
  variant: 'citrus' as const,
};

export type Theme = typeof theme;
export default theme;
