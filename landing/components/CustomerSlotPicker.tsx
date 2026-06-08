"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  AVAILABLE_TIMES,
  buildSelectedSlot,
  fetchBookedSlotKeys,
  getAvailableDates,
} from '@/lib/bookingSlots';

type CustomerSlotPickerProps = {
  disabled?: boolean;
  onSlotChange?: (slot: string | null) => void;
  onNotesChange?: (notes: { arrivalNotes: string; goalsChoice: string }) => void;
};

export function CustomerSlotPicker({
  disabled = false,
  onSlotChange,
  onNotesChange,
}: CustomerSlotPickerProps) {
  const availableDates = useMemo(() => getAvailableDates(), []);
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [arrivalNotes, setArrivalNotes] = useState('');
  const [goalsChoice, setGoalsChoice] = useState('');

  const selectedSlot =
    selectedDate && selectedTime ? buildSelectedSlot(selectedDate, selectedTime) : null;

  useEffect(() => {
    onSlotChange?.(selectedSlot);
  }, [selectedSlot, onSlotChange]);

  useEffect(() => {
    onNotesChange?.({ arrivalNotes, goalsChoice });
  }, [arrivalNotes, goalsChoice, onNotesChange]);

  useEffect(() => {
    let cancelled = false;
    setLoadingAvailability(true);
    fetchBookedSlotKeys().then((set) => {
      if (!cancelled) {
        setBookedSet(set);
        setLoadingAvailability(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isBooked = (date: string, time: string) => bookedSet.has(buildSelectedSlot(date, time));

  return (
    <div className={`space-y-3 pt-3 border-t border-neutral-200 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <div className="text-sm font-medium mb-1">Choose your time slot</div>
        <p className="text-[10px] text-neutral-500">
          Live availability from Supabase — 15-minute hold while you finish. (FullCalendar is admin-only.)
        </p>
      </div>

      <div>
        <div className="text-xs text-neutral-500 mb-1">Available dates</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {availableDates.map((date) => {
            const d = new Date(date + 'T00:00:00');
            const label = d.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            return (
              <button
                key={date}
                type="button"
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
                className={`px-3 py-1 text-xs rounded-full border flex-shrink-0 whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                    : 'bg-white border-neutral-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs text-neutral-500 mb-1">
          Times for{' '}
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
          {loadingAvailability && ' (loading…)'}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_TIMES.map((time) => {
            const booked = isBooked(selectedDate, time);
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                type="button"
                disabled={booked}
                onClick={() => setSelectedTime(time)}
                className={`py-2 text-sm rounded-2xl border transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : booked
                    ? 'bg-neutral-100 text-neutral-400 line-through cursor-not-allowed'
                    : 'bg-white border-neutral-300 active:bg-neutral-50'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">Arrival notes (gate code, parking, etc.)</div>
        <textarea
          value={arrivalNotes}
          onChange={(e) => setArrivalNotes(e.target.value)}
          className="w-full border rounded p-1.5 text-sm h-14 bg-white"
          placeholder="Gate code, parking, dog notes..."
        />
      </div>

      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">Goals for this visit</div>
        <select
          value={goalsChoice}
          onChange={(e) => setGoalsChoice(e.target.value)}
          className="w-full border rounded p-1.5 text-sm bg-white"
        >
          <option value="">Select an option...</option>
          <option value="I'll add every window, and the insides too, if they look perfect and your tech has the time!">
            1. Add every window (+ insides if time allows)
          </option>
          <option value="Just the number I booked, guaranteed no add-ons.">
            2. Just the number I booked, no add-ons
          </option>
          <option value="I booked the ones I believe will be easy for them, but if they qualify I hope to add a few more.">
            3. Maybe add a few more if they qualify
          </option>
          <option value="Too many questions, just get here and we'll chat.">
            4. We'll chat when you arrive
          </option>
        </select>
      </div>

      {selectedSlot && (
        <div className="text-sm text-emerald-700 font-medium">
          Selected:{' '}
          {new Date(selectedSlot).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}