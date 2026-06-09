"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AVAILABLE_SLOTS,
  buildSelectedSlot,
  fetchBookedSlotKeys,
  findFirstWeekWithOpenSlot,
  formatLocalDate,
  formatSlotTimeLabel,
  getBookableWeekdayDates,
  getMondayOfWeek,
  getMonthCalendarDays,
  getWeekdayDatesInWeek,
  parseLocalDate,
  parseSelectedSlot,
} from '@/lib/bookingSlots';

type DateViewMode = 'week' | 'month';
export type SlotPickerMode = 'preview' | 'live';

type CustomerSlotPickerProps = {
  supabase: SupabaseClient | null;
  providerId: string;
  supabaseReady: boolean;
  mode?: SlotPickerMode;
  initialSlot?: string | null;
  onSlotChange?: (slot: string | null) => void;
  onNotesChange?: (notes: { arrivalNotes: string }) => void;
};

function initialPickerState(
  bookableDatesList: string[],
  initialSlot?: string | null
): { weekAnchor: string; selectedDate: string; selectedTime: string | null } {
  const defaultDate = bookableDatesList[0] || '';
  const defaultWeek = getMondayOfWeek(defaultDate || formatLocalDate(new Date()));

  if (initialSlot) {
    const parsed = parseSelectedSlot(initialSlot);
    if (parsed) {
      return {
        weekAnchor: getMondayOfWeek(parsed.date),
        selectedDate: parsed.date,
        selectedTime: parsed.time,
      };
    }
  }

  return { weekAnchor: defaultWeek, selectedDate: defaultDate, selectedTime: null };
}

export function CustomerSlotPicker({
  supabase,
  providerId,
  supabaseReady,
  mode = 'live',
  initialSlot = null,
  onSlotChange,
  onNotesChange,
}: CustomerSlotPickerProps) {
  const isPreview = mode === 'preview';
  const bookableDatesList = useMemo(() => getBookableWeekdayDates(30), []);
  const bookableDatesSet = useMemo(() => new Set(bookableDatesList), [bookableDatesList]);
  const monthCells = useMemo(() => getMonthCalendarDays(30), []);

  const [viewMode, setViewMode] = useState<DateViewMode>('week');
  const [weekAnchor, setWeekAnchor] = useState(
    () => initialPickerState(bookableDatesList, initialSlot).weekAnchor
  );
  const [selectedDate, setSelectedDate] = useState(
    () => initialPickerState(bookableDatesList, initialSlot).selectedDate
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    () => initialPickerState(bookableDatesList, initialSlot).selectedTime
  );
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(!isPreview);
  const [arrivalNotes, setArrivalNotes] = useState('');

  const weekDates = useMemo(
    () => getWeekdayDatesInWeek(weekAnchor, bookableDatesSet),
    [weekAnchor, bookableDatesSet]
  );

  const selectedSlot =
    selectedDate && selectedTime ? buildSelectedSlot(selectedDate, selectedTime) : null;

  const lastNotifiedSlot = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (lastNotifiedSlot.current === selectedSlot) return;
    lastNotifiedSlot.current = selectedSlot;
    onSlotChange?.(selectedSlot);
  }, [selectedSlot, onSlotChange]);

  const lastNotifiedNotes = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!onNotesChange || isPreview) return;
    if (lastNotifiedNotes.current === arrivalNotes) return;
    lastNotifiedNotes.current = arrivalNotes;
    onNotesChange({ arrivalNotes });
  }, [arrivalNotes, onNotesChange, isPreview]);

  useEffect(() => {
    if (!initialSlot) return;
    const parsed = parseSelectedSlot(initialSlot);
    if (!parsed) return;
    setWeekAnchor(getMondayOfWeek(parsed.date));
    setSelectedDate(parsed.date);
    setSelectedTime(parsed.time);
  }, [initialSlot]);

  useEffect(() => {
    if (isPreview) {
      setLoadingAvailability(false);
      setBookedSet(new Set());
      return;
    }

    if (!supabaseReady) return;

    let cancelled = false;
    setLoadingAvailability(true);
    fetchBookedSlotKeys(supabase, providerId, bookableDatesList).then((set) => {
      if (!cancelled) {
        setBookedSet(set);
        setLoadingAvailability(false);

        if (initialSlot) {
          const parsed = parseSelectedSlot(initialSlot);
          if (parsed && set.has(buildSelectedSlot(parsed.date, parsed.time))) {
            setSelectedTime(null);
          }
        } else {
          const firstOpenWeek = findFirstWeekWithOpenSlot(bookableDatesList, set);
          setWeekAnchor(firstOpenWeek);
          const weekDays = getWeekdayDatesInWeek(firstOpenWeek, bookableDatesSet);
          if (weekDays.length > 0) {
            setSelectedDate((prev) => (weekDays.includes(prev) ? prev : weekDays[0]));
          }
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [
    supabase,
    providerId,
    supabaseReady,
    bookableDatesList,
    bookableDatesSet,
    isPreview,
    initialSlot,
  ]);

  const isBooked = (date: string, time: string) =>
    isPreview ? false : bookedSet.has(buildSelectedSlot(date, time));

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
        <div className="text-sm font-medium mb-1">
          {isPreview ? 'Upcoming openings' : 'Choose your time slot'}
        </div>
        <p className="text-[10px] text-neutral-500">
          {isPreview
            ? 'Real-time calendar preview — confirm screens to see booked times & reserve.'
            : 'Live availability — 15-minute hold while you finish.'}
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
            {AVAILABLE_SLOTS.map(({ time }) => {
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
                  {formatSlotTimeLabel(time)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isPreview && (
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
      )}

      {selectedSlot && selectedTime && (
        <div
          className={`text-sm font-medium ${
            isPreview ? 'text-neutral-600' : 'text-emerald-700'
          }`}
        >
          {isPreview ? 'Tentative pick: ' : 'Selected: '}
          {parseLocalDate(selectedDate).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}{' '}
          at {formatSlotTimeLabel(selectedTime)}
        </div>
      )}
    </div>
  );
}