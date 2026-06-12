/**
 * @file ThemedText.tsx
 * @location src/core/ui-components/ThemedText.tsx
 * @description
 * Theme-aware Text primitive with semantic variants (body, label, title, muted).
 * Respects the current light/dark mode from ThemeProvider.
 * 
 * Phase 1: Foundation only. Phase 2 will systematically replace raw <Text> usage.
 */

import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/core/theme-context';
import { getSemanticColor, typography } from '@/core/design-tokens';

type TextVariant = 'body' | 'label' | 'title' | 'titleLarge' | 'muted' | 'onPrimary';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  /** Force dark mode (useful for testing or special banners) */
  forceDark?: boolean;
}

export function ThemedText({
  variant = 'body',
  forceDark,
  style,
  children,
  ...props
}: ThemedTextProps) {
  const { isDark } = useTheme();
  const effectiveDark = forceDark ?? isDark;

  const colorMap: Record<TextVariant, string> = {
    body: getSemanticColor('text', effectiveDark),
    label: getSemanticColor('textSecondary', effectiveDark),
    title: getSemanticColor('text', effectiveDark),
    titleLarge: getSemanticColor('text', effectiveDark),
    muted: getSemanticColor('textMuted', effectiveDark),
    onPrimary: getSemanticColor('textOnPrimary', effectiveDark),
  };

  const sizeMap: Record<TextVariant, number> = {
    body: typography.base,
    label: typography.sm,
    title: typography.xl,
    titleLarge: typography['3xl'],
    muted: typography.sm,
    onPrimary: typography.base,
  };

  const weightMap: Record<TextVariant, "400" | "500" | "600" | "700"> = {
    body: "400",
    label: "500",
    title: "600",
    titleLarge: "700",
    muted: "400",
    onPrimary: "600",
  };

  return (
    <Text
      style={[
        {
          color: colorMap[variant],
          fontSize: sizeMap[variant],
          fontWeight: weightMap[variant],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
