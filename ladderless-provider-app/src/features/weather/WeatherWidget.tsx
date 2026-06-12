/**
 * @file WeatherWidget.tsx
 * @location src/features/weather/WeatherWidget.tsx
 * @description
 * Reusable, self-contained weather display component.
 * 
 * Designed to be dropped into multiple screens with different "enabled" states.
 * 
 * - When `enabled={true}` (Clock-in + Begin Gig): actively fetches + auto-refreshes
 * - When `enabled={false}` (everywhere else): shows last cached data only
 * 
 * Uses design-tokens for all colors, spacing, and typography.
 */

import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTheme } from "@/core/theme-context";
import {
  getTheme,
  spacing,
  radii,
} from "@/core/design-tokens";
import { useWeather } from "./useWeather";
import { getWindDirectionLabel } from "./weather-api";

interface WeatherWidgetProps {
  /** When true, this instance will trigger API calls + auto-refresh */
  enabled?: boolean;
  /** Show a more compact version (useful on dense screens) */
  compact?: boolean;
}

export function WeatherWidget({ enabled = false, compact = false }: WeatherWidgetProps) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark ? "dark" : "light");

  const {
    data,
    warnings,
    lastFetched,
    isLoading,
    isStale,
    error,
    refresh,
    requestLocationAndRefresh,
    openLocationSettings,
    timeUntilRefresh,
  } = useWeather({ enabled });

  const hasPermissionError = error?.toLowerCase().includes("permission");
  const showRefreshIcon = isStale && timeUntilRefresh < 180 && !hasPermissionError; // show after ~2 minutes, but not when we need permission first

  if (!data && !isLoading && !error) {
    return null; // nothing to show yet
  }

  const hasWarnings = warnings.length > 0;
  const primaryWarning = hasWarnings ? warnings[0] : null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        borderWidth: hasWarnings ? 2 : 1,
        borderColor: hasWarnings
          ? primaryWarning?.color
          : theme.colors.border,
        marginBottom: spacing.md,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.5,
          }}
        >
          CURRENT CONDITIONS
        </Text>

        {enabled && showRefreshIcon && (
          <Pressable onPress={refresh} hitSlop={12}>
            <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
              ↻ Refresh
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main content */}
      {isLoading && !data ? (
        <View style={{ paddingVertical: spacing.md, alignItems: "center" }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : data ? (
        <View style={{ marginTop: spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.sm }}>
            <Text
              style={{
                fontSize: compact ? 28 : 36,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              {data.temperature}°
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
              }}
            >
              F
            </Text>
          </View>

          <Text
            style={{
              fontSize: 15,
              color: theme.colors.text,
              marginTop: 2,
            }}
          >
            {data.condition}
          </Text>

          <View style={{ flexDirection: "row", marginTop: spacing.sm, gap: spacing.lg }}>
            <View>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>WIND</Text>
              <Text style={{ fontSize: 16, color: theme.colors.text, fontWeight: "600" }}>
                {data.windSpeed} mph
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>GUSTS</Text>
              <Text style={{ fontSize: 16, color: theme.colors.text, fontWeight: "600" }}>
                {data.windGusts} mph {getWindDirectionLabel(data.windDirection)}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Warning banner */}
      {primaryWarning && (
        <View
          style={{
            marginTop: spacing.sm,
            backgroundColor: primaryWarning.color + "20",
            borderRadius: radii.sm,
            padding: spacing.sm,
          }}
        >
          <Text
            style={{
              color: primaryWarning.color,
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            {primaryWarning.title}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 13, marginTop: 2 }}>
            {primaryWarning.message}
          </Text>
        </View>
      )}

      {/* Footer status */}
      {lastFetched && (
        <Text
          style={{
            marginTop: spacing.sm,
            fontSize: 11,
            color: isStale ? theme.colors.warning : theme.colors.textMuted,
          }}
        >
          Updated {Math.floor((Date.now() - lastFetched.getTime()) / 60000)} min ago
          {enabled && isStale && " • Refreshing soon"}
        </Text>
      )}

      {error && (
        <View style={{ marginTop: spacing.sm }}>
          <Text style={{ color: theme.colors.danger, fontSize: 12, marginBottom: 8 }}>
            {error}
          </Text>

          {/* When location is denied, give the user the best options */}
          {error.toLowerCase().includes("denied") && enabled && (
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {/* Best action: Send user to Settings (this is what actually works after first denial) */}
              <Pressable
                onPress={openLocationSettings}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: radii.md,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
                  Open Settings
                </Text>
              </Pressable>

              {/* Secondary action — useful on first denial */}
              <Pressable
                onPress={requestLocationAndRefresh}
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderRadius: radii.md,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "600" }}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
