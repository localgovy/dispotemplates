// Azure Bloom — sky blue, periwinkle, coral; Fraunces + Plus Jakarta Sans.

export const fonts = {
  serif: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  serifRegular: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  mono: 'PlusJakartaSans_500Medium',
} as const;

export const theme = {
  fonts,
  colors: {
    primary: '#5B7CFA',
    primaryDark: '#3D5BD9',
    primaryLight: '#A8BAFF',
    primaryMuted: 'rgba(91, 124, 250, 0.14)',

    accent: '#FF7A59',
    accentDark: '#E55A3A',
    accentMuted: 'rgba(255, 122, 89, 0.16)',

    background: '#F0F6FF',
    backgroundLight: '#E4EEFF',
    surface: '#ffffff',
    surfaceElevated: '#E8F1FF',
    surfaceLight: '#D6E6FF',

    tabBar: '#ffffff',
    tabActive: '#3D5BD9',
    tabInactive: '#8A9BB8',

    text: '#1A2440',
    textPrimary: '#1A2440',
    textSecondary: '#4A5A7A',
    textMuted: '#8A9BB8',
    textDisabled: '#C5D0E0',

    success: '#3CB371',
    warning: '#F5C518',
    danger: '#FF7A59',
    info: '#7DD3FC',

    border: '#D0DCF0',
    borderLight: '#E0EAF8',
    divider: '#E0EAF8',

    white: '#ffffff',
    nearWhite: '#F0F6FF',
    saleRed: '#FF7A59',
    saleBadge: '#FF7A59',
    thcGreen: '#5B7CFA',
    highThc: '#3D5BD9',
    newBadge: '#5B7CFA',
    indica: '#9B8CFF',
    sativa: '#FF7A59',
    hybrid: '#7DD3FC',
    cbd: '#5B7CFA',

    gold: '#7DD3FC',
    onPrimary: '#ffffff',
    onPrimaryMuted: 'rgba(255,255,255,0.8)',
    secondaryContainer: '#D6E4FF',
    onSecondaryContainer: '#3D5BD9',

    overlay: 'rgba(26, 36, 64, 0.4)',
    overlayLight: 'rgba(26, 36, 64, 0.18)',
    glow: 'rgba(91, 124, 250, 0.15)',
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, full: 999 },

  asymmetric: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
  },
  asymmetricSm: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 14,
  },

  typography: {
    display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
    title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
    heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
    subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
    small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
    label: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  },

  shadows: {
    small: { shadowColor: '#5B7CFA', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
    medium: { shadowColor: '#3D5BD9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 4 },
    large: { shadowColor: '#1A2440', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 8 },
  },

  animation: { fast: 150, normal: 250, slow: 400 },
  variant: 'azure' as const,
};

export type Theme = typeof theme;
export default theme;
