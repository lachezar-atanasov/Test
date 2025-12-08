// ===================================
// Unbond - Theme Configuration
// ===================================
// A calm, stabilizing color palette designed to be
// non-overstimulating and supportive for users in recovery.

export const colors = {
  // Base colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',

  // Primary palette - calm teal
  primary: '#6B8E9F',
  primaryDark: '#4A6B7A',
  primaryLight: '#8FB0BF',
  primaryFaded: '#E8F0F3',

  // Accent - soft coral (for gentle emphasis)
  accent: '#E8B4A0',
  accentDark: '#D49A84',
  accentLight: '#F5D5C8',

  // Text colors
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#95A5A6',
  textOnPrimary: '#FFFFFF',

  // Semantic colors
  error: '#D63031',
  errorLight: '#FFEBEE',
  warning: '#FDCB6E',
  warningLight: '#FFF8E1',
  success: '#00B894',
  successLight: '#E8F5E9',

  // Intensity scale colors (for mood/craving visualization)
  intensity: {
    1: '#81C784',
    2: '#A5D6A7',
    3: '#C5E1A5',
    4: '#E6EE9C',
    5: '#FFF59D',
    6: '#FFE082',
    7: '#FFCC80',
    8: '#FFAB91',
    9: '#EF9A9A',
    10: '#E57373',
  },

  // Border colors
  border: '#E0E0E0',
  borderLight: '#EEEEEE',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const typography = {
  heading1: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Theme object for easy importing
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export default theme;
