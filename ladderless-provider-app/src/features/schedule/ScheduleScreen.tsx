import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

// TODO: Replace with your real provider UUID
const MY_PROVIDER_ID = 'cc79bb27-5b21-4c56-aaae-7da80d38fa9f';

// Easy to change: how many hours to shift when using the quick "Reschedule" action
const RESCHEDULE_HOURS = 2;

type Booking = {
  id: string;
  customer_name: string;
  scheduled_start: string;
  duration_minutes: number;
  status: string;
  address?: string;
  zip_code?: string;
  window_count?: number;
  estimated_price?: number;
};

export default function ScheduleScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `provider_id=eq.${MY_PROVIDER_ID}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const checkUnlock = async () => {
      const stored = await AsyncStorage.getItem('scheduleUnlocked');
      if (stored === 'true') {
        setUnlocked(true);
      }
    };
    checkUnlock();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', MY_PROVIDER_ID)
      .order('scheduled_start', { ascending: true });

    if (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleBookingPress = (booking: Booking) => {
    const start = new Date(booking.scheduled_start);
    const dateStr = start.toLocaleDateString();
    const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const end = new Date(start.getTime() + (booking.duration_minutes || 60) * 60000);
    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    Alert.alert(
      booking.customer_name || 'Booking',
      `${dateStr} ${timeStr} - ${endStr}\nStatus: ${booking.status}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reschedule +1 hr',
          onPress: () => rescheduleBooking(booking.id, 1),
        },
        {
          text: `Reschedule (+${RESCHEDULE_HOURS} hrs)`,
          onPress: () => rescheduleBooking(booking.id),
        },
        {
          text: 'Reschedule +3 hrs',
          onPress: () => rescheduleBooking(booking.id, 3),
        },
        {
          text: 'Move up 1 hr',
          onPress: () => rescheduleBooking(booking.id, -1),
        },
        {
          text: 'Mark Blocked',
          onPress: () => updateStatus(booking.id, 'blocked'),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBooking(booking.id),
        },
      ]
    );
  };

  const rescheduleBooking = async (id: string, hours: number = RESCHEDULE_HOURS) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const current = new Date(booking.scheduled_start);
    current.setHours(current.getHours() + hours);

    const { error } = await supabase
      .from('bookings')
      .update({ scheduled_start: current.toISOString() })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchBookings();
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) Alert.alert('Error', error.message);
    else fetchBookings();
  };

  const deleteBooking = async (id: string) => {
    Alert.alert('Delete Booking', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('bookings').delete().eq('id', id);
          if (error) Alert.alert('Error', error.message);
          else fetchBookings();
        },
      },
    ]);
  };

  const handleUnlock = async () => {
    if (password === 'shark') {
      setUnlocked(true);
      await AsyncStorage.setItem('scheduleUnlocked', 'true');
    } else {
      Alert.alert('Wrong password');
      setPassword('');
    }
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const start = new Date(item.scheduled_start);
    const dateStr = start.toLocaleDateString();
    const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const end = new Date(start.getTime() + (item.duration_minutes || 60) * 60000);
    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleBookingPress(item)}>
        <Text style={styles.client}>{item.customer_name || 'Customer'}</Text>
        <Text>
          {dateStr} • {timeStr} - {endStr}
        </Text>
        {item.address && <Text style={styles.address}>{item.address}</Text>}
        <Text style={styles.status}>{item.status}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!unlocked ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>Enter admin password</Text>
          <TextInput
            style={{ width: '80%', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
          />
          <TouchableOpacity style={styles.backButton} onPress={handleUnlock}>
            <Text style={styles.backText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>My Schedule</Text>

          {loading ? (
            <Text>Loading bookings...</Text>
          ) : (
            <FlatList
              style={{ flex: 1 }}
              data={bookings}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListEmptyComponent={<Text>No bookings found.</Text>}
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/clock-in')}
      >
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  client: { fontSize: 18, fontWeight: '600' },
  address: { fontSize: 14, color: '#555', marginTop: 4 },
  status: { marginTop: 8, fontStyle: 'italic', color: '#666' },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
