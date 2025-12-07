import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// Define custom colors
export const colors = {
  // Primary - Trustworthy Blue/Teal
  primary: '#1E88E5',
  primaryLight: '#6AB7FF',
  primaryDark: '#005CB2',
  primaryContainer: '#D1E4FF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#001D36',

  // Secondary - Teal accent
  secondary: '#26A69A',
  secondaryLight: '#64D8CB',
  secondaryDark: '#00766C',
  secondaryContainer: '#CCE8E4',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#002021',

  // Error/Danger - For overdue bills
  error: '#D32F2F',
  errorLight: '#FF6659',
  errorDark: '#9A0007',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',

  // Warning - For upcoming dues
  warning: '#FFA000',
  warningLight: '#FFD149',
  warningDark: '#C67100',
  warningContainer: '#FFECC2',
  onWarning: '#000000',

  // Success - For paid bills
  success: '#388E3C',
  successLight: '#6ABF69',
  successDark: '#00600F',
  successContainer: '#D4EED6',
  onSuccess: '#FFFFFF',
  onSuccessContainer: '#002204',

  // Neutral
  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#E7E8EC',
  onBackground: '#1A1C1E',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#44474E',
  outline: '#74777F',
  outlineVariant: '#C4C6CF',

  // Dark mode variants
  dark: {
    background: '#1A1C1E',
    surface: '#121316',
    surfaceVariant: '#44474E',
    onBackground: '#E3E2E6',
    onSurface: '#E3E2E6',
    onSurfaceVariant: '#C4C6CF',
  },

  // Category colors
  categoryColors: {
    electricity: '#FFC107', // Yellow
    heating: '#FF5722', // Deep Orange
    water: '#2196F3', // Blue
    internet: '#9C27B0', // Purple
    phone: '#4CAF50', // Green
    rent: '#795548', // Brown
    subscriptions: '#E91E63', // Pink
    taxes: '#607607', // Blue Grey
    insurance: '#00BCD4', // Cyan
    other: '#9E9E9E', // Grey
  },
};

// Font configuration
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    onPrimary: colors.onPrimary,
    onPrimaryContainer: colors.onPrimaryContainer,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryContainer,
    onSecondary: colors.onSecondary,
    onSecondaryContainer: colors.onSecondaryContainer,
    error: colors.error,
    errorContainer: colors.errorContainer,
    onError: colors.onError,
    onErrorContainer: colors.onErrorContainer,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onBackground: colors.onBackground,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primaryDark,
    onPrimary: colors.primary,
    onPrimaryContainer: colors.primaryLight,
    secondary: colors.secondaryLight,
    secondaryContainer: colors.secondaryDark,
    onSecondary: colors.secondary,
    onSecondaryContainer: colors.secondaryLight,
    error: colors.errorLight,
    errorContainer: colors.errorDark,
    onError: colors.error,
    onErrorContainer: colors.errorLight,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceVariant: colors.dark.surfaceVariant,
    onBackground: colors.dark.onBackground,
    onSurface: colors.dark.onSurface,
    onSurfaceVariant: colors.dark.onSurfaceVariant,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

export type AppTheme = typeof lightTheme;
