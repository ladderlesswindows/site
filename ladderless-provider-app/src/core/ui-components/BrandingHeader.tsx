import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/core/theme-context';

interface BrandingHeaderProps {
  showToggle?: boolean;
}

export function BrandingHeader({ showToggle = true }: BrandingHeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  const bannerSource = isDark
    ? require('../../../assets/banner_dark.jpg')
    : require('../../../assets/banner_light.jpg');

  return (
    <View style={styles.container}>
      <Image
        source={bannerSource}
        style={styles.banner}
        resizeMode="contain"
      />

      {showToggle && (
        <Pressable
          onPress={toggleTheme}
          style={styles.toggle}
          hitSlop={12}
        >
          {isDark ? (
            <Sun size={22} color="#64748b" />
          ) : (
            <Moon size={22} color="#64748b" />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 95,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  toggle: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 6,
    zIndex: 10,
  },
});
