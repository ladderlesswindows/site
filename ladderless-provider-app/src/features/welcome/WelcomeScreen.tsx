/**
 * @file WelcomeScreen.tsx
 * @location src/features/welcome/WelcomeScreen.tsx
 * @description
 * Temporary colorful welcome splash screen for beta testing.
 * 
 * This lives under features/welcome to maintain the clean modular monolith structure.
 * It is intended to be removed or heavily redesigned after beta.
 * 
 * Duration: ~2 seconds with auto-advance (tap to skip supported).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/core/theme-context';
import { getTheme, spacing, radii } from '@/core/design-tokens';

const AUTO_ADVANCE_MS = 2000;

export default function WelcomeScreen() {
  const { isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Nice entrance fade using React Native Animated
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Auto advance after 2 seconds
    const timer = setTimeout(() => {
      navigateToClockIn();
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, []);

  const navigateToClockIn = () => {
    router.replace('/clock-in');
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={navigateToClockIn}>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: isDark ? '#0f2a5e' : '#2563eb', // Richer ocean blue
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xxl,
          },
          { opacity: fadeAnim },
        ]}
      >
        {/* Main welcome content */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.xxl,
            borderRadius: radii['3xl'],
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <Text
            style={{
              fontSize: 36, // Slightly smaller than before
              fontWeight: '800',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: -0.8,
            }}
          >
            Welcome back, Chris!
          </Text>

          <Text
            style={{
              marginTop: spacing.md,
              fontSize: 17,
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
              fontWeight: '500',
            }}
          >
            Let’s get after it today.
          </Text>
        </View>

        <Text
          style={{
            position: 'absolute',
            bottom: 70,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            letterSpacing: 0.5,
          }}
        >
          Tap anywhere to continue
        </Text>

        {/* === Animated Ocean Waves (using safe RN Animated) === */}
        <View style={styles.waveContainer}>
          <AnimatedWave delay={0} duration={3200} opacity={0.35} height={95} />
          <AnimatedWave delay={700} duration={2600} opacity={0.25} height={70} />
          <AnimatedWave delay={1400} duration={3800} opacity={0.18} height={110} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Animated wave layer using only React Native Animated (safe, no Reanimated dependency).
 * Creates a gentle rolling ocean effect.
 */
function AnimatedWave({
  delay,
  duration,
  opacity,
  height,
}: {
  delay: number;
  duration: number;
  opacity: number;
  height: number;
}) {
  const translateX = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 60,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -80,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => animate()); // loop
    };

    const timeout = setTimeout(() => {
      animate();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.wave,
        {
          height,
          backgroundColor: 'rgba(255,255,255,1)',
          opacity,
          marginTop: -height / 1.8,
          transform: [{ translateX }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: -80,
    width: '140%',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 180,
  },
});

