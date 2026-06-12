/**
 * @file design-tokens.ts
 * @location src/core/design-tokens.ts
 * @description
 * Professional design system tokens for Ladderless Provider App.
 * 
 * This is the single source of truth for colors, spacing, typography, radii, and shadows.
 * Supports both Light and Dark modes with semantic naming (primary, success, surface, etc.).
 * 
 * Phase 1 goal (this task): Provide a solid, modern foundation.
 * Phase 2 goal: Systematically replace all hardcoded classes across screens using these tokens.
 * 
 * Usage:
 *   import { getTheme, spacing, radii } from '@/core/design-tokens';
 *   const { colors } = getTheme(isDark);
 * 
 * For NativeWind screens we still use className strings today (many left as-is per priority).
 * Tokens are primarily consumed by:
 *   - core/ui-components (BigButton, ThemedView, NumberInput, etc.)
 *   - Native headers / StatusBar in _layout
 *   - Future: icon colors, chart theming, earnings/weather modules
 */

export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Semantic (status / action)
  success: string;
  successDark: string;
  warning: string;
  danger: string;

  // Surfaces & backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Special
  splash: string;
  header: string;
  headerTint: string;
}

const lightColors: ColorPalette = {
  // Refined professional blue (trust + construction industry)
  primary: '#1e40af',
  primaryDark: '#1e3a8a',
  primaryLight: '#3b82f6',

  success: '#059669',      // emerald-700
  successDark: '#047857',
  warning: '#d97706',      // amber-600
  danger: '#dc2626',

  background: '#f8fafc',   // slate-50
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',

  text: '#0f172a',         // slate-900
  textSecondary: '#334155',// slate-700
  textMuted: '#64748b',    // slate-500
  textOnPrimary: '#ffffff',

  splash: '#000000',
  header: '#1e40af',
  headerTint: '#ffffff',
};

const darkColors: ColorPalette = {
  primary: '#3b82f6',
  primaryDark: '#1e40af',
  primaryLight: '#60a5fa',

  success: '#10b981',
  successDark: '#059669',
  warning: '#fbbf24',
  danger: '#f87171',

  background: '#0f172a',   // slate-950
  surface: '#1e293b',      // slate-800
  surfaceElevated: '#334155',
  border: '#475569',
  borderStrong: '#64748b',

  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textOnPrimary: '#0f172a',

  splash: '#000000',
  header: '#1e3a8a',
  headerTint: '#f1f5f9',
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
} as const;

export const typography = {
  // Sizes (in pixels, for RN StyleSheet usage)
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  // Letter spacing (em units)
  tight: -0.3,
  normal: 0,
  wide: 0.5,
} as const;

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;

/**
 * Returns the complete theme object for the given mode.
 * Use this in components that need runtime JS values (icon colors, native headers, etc).
 */
export function getTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    spacing,
    radii,
    typography,
    shadows,
    isDark,
  };
}

/**
 * Convenience semantic color getter.
 * Example: const primary = getSemanticColor('primary', isDark);
 */
export function getSemanticColor(
  name: keyof ColorPalette,
  isDark: boolean
): string {
  return isDark ? darkColors[name] : lightColors[name];
}

// Type helpers for consumers
export type DesignTokens = ReturnType<typeof getTheme>;
export type AppColors = ColorPalette;
