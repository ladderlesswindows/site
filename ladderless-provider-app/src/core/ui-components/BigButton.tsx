import React from "react";
import { Pressable, Text, View, ActivityIndicator, PressableProps } from "react-native";
import { cn } from "@/core/utils/cn";
// Tokens imported for future full theming (Phase 2). Currently lightly used.

/**
 * @file BigButton.tsx
 * @location src/core/ui-components/BigButton.tsx
 * @description
 * Primary action button used throughout the app.
 * Glove-friendly (large tap targets), multiple visual variants.
 * 
 * Phase 1: Uses design tokens for icon/activity indicator colors.
 * Phase 2: Full variant theming + dark variants via tokens.
 */

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";
type Size = "lg" | "xl";

interface BigButtonProps extends Omit<PressableProps, "children"> {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function BigButton({
  children,
  variant = "primary",
  size = "lg",
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  className,
  ...props
}: BigButtonProps & { className?: string }) {
  const base = "flex-row items-center justify-center rounded-3xl active:opacity-90";

  const sizes = {
    lg: "min-h-[56px] px-8 py-4",
    xl: "min-h-[68px] px-10 py-5",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-blue-600 active:bg-blue-700",
    secondary: "bg-white border-2 border-slate-300 active:bg-slate-100",
    success: "bg-emerald-600 active:bg-emerald-700",
    danger: "bg-red-600 active:bg-red-700",
    ghost: "bg-transparent border-2 border-slate-300 active:bg-slate-100",
  };

  const textColors: Record<Variant, string> = {
    primary: "text-white",
    secondary: "text-slate-800",
    success: "text-white",
    danger: "text-white",
    ghost: "text-slate-800",
  };

  const textSizes = {
    lg: "text-xl",
    xl: "text-2xl",
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? "#1e2937" : "#fff"} />
      ) : (
        <View className="flex-row items-center gap-3">
          {icon}
          <Text
            className={cn(
              "font-semibold tracking-wide text-center",
              textColors[variant],
              textSizes[size]
            )}
          >
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
