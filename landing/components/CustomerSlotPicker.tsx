"use client";

import { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AVAILABLE_TIMES,
  buildSelectedSlot,
  fetchBookedSlotKeys,
  findFirstWeekWithOpenSlot,
  getBookableWeekdayDates,
  formatLocalDate,
  getMondayOfWeek,
  getMonthCalendarDays,
  getWeekdayDatesInWeek,
  parseLocalDate,
} from '@/lib/bookingSlots';

type DateViewMode = 'week' | 'month';

type CustomerSlotPickerProps = {
  supabase: SupabaseClient | null;
  providerId: string;
  supabaseReady: boolean;
  onSlotChange?: (slot: string | null) => void;
  onNotesChange?: (notes: { arrivalNotes: string; goalsChoice: string }) => void;
};

export function CustomerSlotPicker({
  supabase,
  providerId,
  supabaseReady,
  onSlotChange,
  onNotesChange,
}: CustomerSlotPickerProps) {
  const bookableDatesList = useMemo(() => getBookableWeekdayDates(30), []);
  const bookableDatesSet = useMemo(() => new Set(bookableDatesList), [bookableDatesList]);
  const monthCells = useMemo(() => getMonthCalendarDays(30), []);

  const [viewMode, setViewMode] = useState<DateViewMode>('week');
  const [weekAnchor, setWeekAnchor] = useState(() =>
    getMondayOfWeek(bookableDatesList[0] || formatLocalDate(new Date()))
  );
  const [selectedDate, setSelectedDate] = useState(bookableDatesList[0] || '');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [arrivalNotes, setArrivalNotes] = useState('');
  const [goalsChoice, setGoalsChoice] = useState('');

  const weekDates = useMemo(
    () => getWeekdayDatesInWeek(weekAnchor, bookableDatesSet),
    [weekAnchor, bookableDatesSet]
  );

  const selectedSlot =
    selectedDate && selectedTime ? buildSelectedSlot(selectedDate, selectedTime) : null;

  useEffect(() => {
    onSlotChange?.(selectedSlot);
  }, [selectedSlot, onSlotChange]);

  useEffect(() => {
    onNotesChange?.({ arrivalNotes, goalsChoice });
  }, [arrivalNotes, goalsChoice, onNotesChange]);

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;
    setLoadingAvailability(true);
    fetchBookedSlotKeys(supabase, providerId).then((set) => {
      if (!cancelled) {
        setBookedSet(set);
        setLoadingAvailability(false);
        const firstOpenWeek = findFirstWeekWithOpenSlot(bookableDatesList, set);
        setWeekAnchor(firstOpenWeek);
        const weekDays = getWeekdayDatesInWeek(firstOpenWeek, bookableDatesSet);
        if (weekDays.length > 0) {
          setSelectedDate((prev) => (weekDays.includes(prev) ? prev : weekDays[0]));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, providerId, supabaseReady, bookableDatesList, bookableDatesSet]);

  const isBooked = (date: string, time: string) => bookedSet.has(buildSelectedSlot(date, time));

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleMonthDayPick = (date: string) => {
    selectDate(date);
    setWeekAnchor(getMondayOfWeek(date));
    setViewMode('week');
  };

  const formatDayLabel = (date: string, style: 'short' | 'compact' = 'short') => {
    const d = parseLocalDate(date);
    if (style === 'compact') {
      return d.toLocaleDateString(undefined, { day: 'numeric' });
    }
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium mb-1">Choose your time slot</div>
        <p className="text-[10px] text-neutral-500">
          Live availability from Supabase — 15-minute hold while you finish.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs text-neutral-500">
            {viewMode === 'week' ? 'This week' : 'Next 30 days'}
          </div>
          <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-2 py-0.5 ${
                viewMode === 'week'
                  ? 'bg-emerald-100 text-emerald-800 font-medium'
                  : 'bg-white text-neutral-600'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-2 py-0.5 border-l border-neutral-200 ${
                viewMode === 'month'
                  ? 'bg-emerald-100 text-emerald-800 font-medium'
                  : 'bg-white text-neutral-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {weekDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => selectDate(date)}
                className={`px-2 py-1 text-[10px] rounded-full border flex-shrink-0 whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                    : 'bg-white border-neutral-300'
                }`}
              >
                {formatDayLabel(date)}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
                <div
                  key={`${label}-${i}`}
                  className="text-[8px] text-center text-neutral-400 font-medium"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {(() => {
                const firstDow = parseLocalDate(monthCells[0]?.date ?? '').getDay();
                const blanks = Array.from({ length: firstDow }, (_, i) => (
                  <div key={`blank-${i}`} className="h-7" />
                ));
                const dayButtons = monthCells.map(({ date, bookable }) => (
                  <button
                    key={date}
                    type="button"
                    disabled={!bookable}
                    onClick={() => bookable && handleMonthDayPick(date)}
                    className={`h-7 text-[10px] rounded border ${
                      !bookable
                        ? 'border-transparent text-neutral-300 cursor-default'
                        : selectedDate === date
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-800 font-medium'
                        : 'bg-white border-neutral-200 text-neutral-800 active:bg-neutral-50'
                    }`}
                  >
                    {formatDayLabel(date, 'compact')}
                  </button>
                ));
                return [...blanks, ...dayButtons];
              })()}
            </div>
            <p className="text-[9px] text-neutral-500 mt-1.5">
              Tap a weekday — you&apos;ll return to week view for times.
            </p>
          </div>
        )}
      </div>

      {viewMode === 'week' && selectedDate && (
        <div>
          <div className="text-xs text-neutral-500 mb-1">
            Times for{' '}
            {parseLocalDate(selectedDate).toLocaleDateString(undefined, {
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
      )}

      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">
          Arrival notes (gate code, parking, etc.)
        </div>
        <textarea
          value={arrivalNotes}
          onChange={(e) => setArrivalNotes(e.target.value)}
          className="w-full border rounded p-1.5 text-sm h-14 bg-white"
          placeholder="Gate code, parking, dog notes..."
        />
      </div>

      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">Goals for this visit *</div>
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
            4. We&apos;ll chat when you arrive
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