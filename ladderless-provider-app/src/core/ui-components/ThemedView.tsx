/**
 * @file ThemedView.tsx
 * @location src/core/ui-components/ThemedView.tsx
 * @description
 * Theme-aware View primitive that automatically applies background surface color.
 * 
 * Use this as the foundation for cards, screens, and containers in Phase 2 dark mode work.
 * Accepts all normal View props + optional `variant` for elevated surfaces.
 * 
 * Currently lightly used (Phase 1 priority = structure + tokens foundation).
 */

import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/core/theme-context';
import { getSemanticColor } from '@/core/design-tokens';

interface ThemedViewProps extends ViewProps {
  /** Surface variant — 'default' uses background, 'elevated' uses surfaceElevated */
  variant?: 'default' | 'elevated' | 'surface';
  /** Force a specific mode (rarely needed) */
  forceDark?: boolean;
}

export function ThemedView({
  variant = 'default',
  forceDark,
  style,
  ...props
}: ThemedViewProps) {
  const { isDark } = useTheme();
  const effectiveDark = forceDark ?? isDark;

  const backgroundColor =
    variant === 'elevated'
      ? getSemanticColor('surfaceElevated', effectiveDark)
      : variant === 'surface'
        ? getSemanticColor('surface', effectiveDark)
        : getSemanticColor('background', effectiveDark);

  return (
    <View
      style={[{ backgroundColor }, style]}
      {...props}
    />
  );
}
