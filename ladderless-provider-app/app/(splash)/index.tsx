import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Pressable,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const [showHint, setShowHint] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateToHome = (skipped = false) => {
    // Clear any pending auto-advance timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Fade out then navigate
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      // Go to the temporary colorful welcome splash (beta only)
      router.replace('/welcome');
    });
  };

  useEffect(() => {
    // Show "tap to skip" hint after 1 second
    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 1000);

    // Auto-advance after 3 seconds
    timeoutRef.current = setTimeout(() => {
      navigateToHome();
    }, 3000);

    return () => {
      clearTimeout(hintTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTap = () => {
    navigateToHome(true);
  };

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <StatusBar style="light" hidden />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/LL.jpg')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {showHint && (
          <Text style={styles.hint}>Tap anywhere to continue</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48, // gives breathing room so left/right aren't cut off
  },
  image: {
    width: '78%',      // a bit smaller + centered
    height: '78%',
    maxWidth: 520,
    maxHeight: 720,
  },
  hint: {
    position: 'absolute',
    bottom: 60,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
