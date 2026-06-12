/**
 * GigTimer.tsx
 * 
 * This will eventually be the visible, persistent timer component
 * that shows the current Gig (Work) Time on screen.
 * 
 * Design goals (when built):
 * - Small, clean, always-visible element (e.g. top of screen or floating)
 * - Uses design tokens for styling
 * - Can be shown on every screen while a gig is active
 * - Clear distinction from Shift Time (which stays hidden)
 * 
 * Current status: Placeholder only.
 */

import React from 'react';
import { View, Text } from 'react-native';

interface GigTimerProps {
  // Will accept elapsed time, formatting options, etc. in the future
}

export function GigTimer(props: GigTimerProps) {
  return (
    <View>
      <Text style={{ color: 'white' }}>
        Gig: 00:00:00
      </Text>
    </View>
  );
}
