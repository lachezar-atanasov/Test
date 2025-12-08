export const theme = {
  colors: {
    primary: '#6B9BD2',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#E8A87C',
    success: '#7FB069',
    error: '#D77A61',
    border: '#E0E0E0',
    disabled: '#CCCCCC',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
};
