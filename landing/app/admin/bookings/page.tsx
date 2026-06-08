'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import { PROVIDER_ID } from '@/lib/bookingConstants';

type Booking = {
  id: string;
  customer_name: string;
  scheduled_start: string;
  duration_minutes: number;
  status: string;
  address?: string;
  zip_code?: string;
};

export default function AdminBookings() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');

  const fetchBookings = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', PROVIDER_ID)
      .order('scheduled_start', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      alert('Error loading bookings: ' + error.message);
    } else {
      const calendarEvents = (data || []).map((b: Booking) => {
        const start = new Date(b.scheduled_start);
        const end = new Date(start.getTime() + (b.duration_minutes || 60) * 60000);
        return {
          id: b.id,
          title: b.status === 'blocked' ? 'Blocked' : 'Booked',
          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: {
            status: b.status,
            address: b.address,
            zip_code: b.zip_code,
          },
          backgroundColor:
            b.status === 'confirmed'
              ? '#10b981'
              : b.status === 'blocked'
              ? '#6b7280'
              : '#3b82f6',
        };
      });
      setEvents(calendarEvents);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (localStorage.getItem('adminUnlocked') === 'true') {
      setUnlocked(true);
    }
    fetchBookings();

    let channel: any;
    if (supabase) {
      channel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => fetchBookings()
        )
        .subscribe();
    }

    return () => {
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'shark') {
      setUnlocked(true);
      localStorage.setItem('adminUnlocked', 'true');
    } else {
      alert('Wrong password');
      setPassword('');
    }
  };

  const handleEventDrop = async (info: any) => {
    if (!supabase) return;
    const { event } = info;
    const newStart = new Date(event.start);

    const { error } = await supabase
      .from('bookings')
      .update({ scheduled_start: newStart.toISOString() })
      .eq('id', event.id);

    if (error) {
      alert('Failed to move booking: ' + error.message);
      info.revert();
    } else {
      console.log('✅ Booking moved successfully');
    }
  };

  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps;
    const start = new Date(info.event.start);
    const end = new Date(info.event.end);
    const time = `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

    alert(
      `Time: ${time}\n` +
      `Status: ${props.status}\n` +
      `Address: ${props.address || 'N/A'} (${props.zip_code || ''})`
    );
  };

  const handleNuclearClean = async () => {
    const confirmation = prompt(
      '⚠️ NUCLEAR CLEAN\n\nThis will DELETE ALL rows from bookings and providers tables.\nYou will also receive the SQL to drop RLS policies.\n\nType NUCLEAR to confirm:'
    );
    if (confirmation !== 'NUCLEAR') {
      alert('Nuclear clean cancelled.');
      return;
    }

    try {
      const res = await fetch('/api/admin/nuclear-clean', {
        method: 'POST',
      });
      const result = await res.json();

      if (result.success) {
        alert(result.message + '\n\n--- COPY THIS SQL AND RUN IT IN SUPABASE SQL EDITOR ---\n\n' + result.rlsDropSQL);
        fetchBookings(); // refresh (will be empty)
      } else {
        alert('Nuclear clean failed: ' + result.error);
      }
    } catch (e) {
      alert('Nuclear clean request failed.');
    }
  };

  const handleSelect = async (selectInfo: any) => {
    if (!supabase) {
      alert(
        'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to the repo-root .env.local, then restart npm run dev.'
      );
      return;
    }

    const date = selectInfo.startStr.split('T')[0];
    const scheduled_start = `${date}T09:00:00`;
    const duration_minutes = 480; // entire day

    // Insert as 'tentative' first to satisfy RLS, then update to 'confirmed'
    const { data, error: insertError } = await supabase.from('bookings').insert({
      provider_id: PROVIDER_ID,
      customer_name: 'John and Deb',
      scheduled_start,
      duration_minutes,
      status: 'tentative',
      address: '121 34th Ave, Capitola, CA',
      zip_code: '95010',
    }).select().single();

    if (insertError || !data) {
      alert('Failed to book the day: ' + (insertError?.message || 'Unknown error'));
      return;
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', data.id);

    if (updateError) {
      alert('Failed to confirm booking: ' + updateError.message);
      return;
    }

    // Send email notification
    try {
      await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'John and Deb',
          date,
          address: '121 34th Ave, Capitola, CA',
        }),
      });
    } catch (e) {
      console.error('Failed to send email', e);
    }

    fetchBookings();
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <Link href="/" className="text-xs text-neutral-500 hover:underline mb-3 inline-block">← Back to Home</Link>

      {!unlocked ? (
        <div className="max-w-xs mx-auto mt-20">
          <form onSubmit={handleUnlock} className="space-y-4">
            <p className="text-center text-sm text-neutral-600">Enter admin password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded-xl text-center"
              placeholder="Password"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 text-white rounded-2xl text-sm font-medium active:bg-black"
            >
              Unlock
            </button>
          </form>
          <p className="text-[10px] text-center text-neutral-400 mt-4">Password is case sensitive</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Schedule • Drag &amp; Drop</h1>
              <p className="text-sm text-neutral-500">Same data as your provider app. Changes sync in real time.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
              <button
                onClick={handleNuclearClean}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                title="DANGER: Deletes ALL bookings + providers data and gives you RLS drop SQL"
              >
                Nuclear Clean
              </button>
            </div>
          </div>

          {loading && <div className="mb-4 text-sm text-neutral-500">Loading calendar...</div>}

          <div className="bg-cream rounded-2xl shadow p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              editable={true}
              droppable={true}
              selectable={true}
              select={handleSelect}
              events={events}
              eventDrop={handleEventDrop}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="21:00:00"
              nowIndicator={true}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
              }}
            />
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            Drag events to reschedule. Click for details. Uses the same Supabase data as the customer 30s booking flow and your provider app.
          </p>
        </>
      )}
    </div>
  );
}
