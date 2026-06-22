import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <Text style={styles.subtitle}>Coming soon — jobs booked on the website will appear here.</Text>
      <TouchableOpacity style={styles.back} onPress={() => router.replace('/clock-in')}>
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 40 },
  back: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
});
