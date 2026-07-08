export const colors = {
  // Brand
  primary: '#007AFF',
  primaryPressed: '#0063CC',

  // Semantic
  destructive: '#FF3B30',
  destructivePressed: '#CC2F26',
  success: '#34C759',
  warning: '#FF9500',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceSecondary: '#E5E5EA',

  // Borders
  border: '#C7C7CC',
  borderFocused: '#007AFF',
  borderError: '#FF3B30',

  // Text
  text: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',
  textError: '#FF3B30',
  textBrand: '#007AFF',

  // Tag chips (gallery + upload screen)
  tagBackground: '#DBEAFE',
  tagText: '#1D4ED8',

  // Skeleton shimmer
  skeleton: '#E5E5EA',

  // Overlay
  overlay: 'rgba(0,0,0,0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/**
 * Typography scale.
 * fontWeight must be a string literal to satisfy RN's StyleSheet types.
 */
export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  subheading: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

/** Button height per size. */
export const buttonHeight = { sm: 36, md: 44, lg: 52 } as const;

/** Input-specific tokens. */
export const inputTokens = {
  height: 48,
  borderWidth: 1,
  borderWidthFocused: 2,
  paddingHorizontal: spacing.md,
} as const;
