import type { SupabaseClient } from '@supabase/supabase-js';
import { PROVIDER_ID } from '@/lib/bookingConstants';

export type AvailableSlot = {
  /** 24-hour HH:MM */
  time: string;
  durationMinutes: number;
};

export const AVAILABLE_SLOTS: AvailableSlot[] = [
  { time: '08:00', durationMinutes: 60 },
  { time: '09:00', durationMinutes: 60 },
  { time: '11:00', durationMinutes: 60 },
  { time: '13:00', durationMinutes: 60 },
  { time: '15:00', durationMinutes: 60 },
  { time: '16:00', durationMinutes: 60 },
  { time: '17:00', durationMinutes: 60 },
];

export const AVAILABLE_TIMES = AVAILABLE_SLOTS.map((slot) => slot.time);

/** e.g. 08:00 → 8:00 AM, 16:00 → 4:00 PM */
export function formatSlotTimeLabel(time24: string): string {
  const [hStr, mStr = '00'] = time24.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = mStr.padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  if (minutes === '00') return `${hour12}:00 ${period}`;
  return `${hour12}:${minutes} ${period}`;
}

export function getSlotDurationMinutes(time: string): number {
  return AVAILABLE_SLOTS.find((slot) => slot.time === time)?.durationMinutes ?? 60;
}

/** Next N calendar days (from tomorrow), weekdays only. */
export function getBookableWeekdayDates(daysAhead = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    dates.push(formatLocalDate(d));
  }
  return dates;
}

/** @deprecated Use getBookableWeekdayDates — kept for short rolling windows */
export function getAvailableDates(daysAhead = 7): string[] {
  return getBookableWeekdayDates(daysAhead);
}

export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/** Monday (local) of the week containing dateStr */
export function getMondayOfWeek(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatLocalDate(d);
}

/** Mon–Fri in the week starting weekMonday that are bookable */
export function getWeekdayDatesInWeek(
  weekMonday: string,
  bookableDates: Set<string>
): string[] {
  const monday = parseLocalDate(weekMonday);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = formatLocalDate(d);
    if (bookableDates.has(key)) dates.push(key);
  }
  return dates;
}

export function isWeekFullyBooked(
  weekDates: string[],
  bookedSet: Set<string>
): boolean {
  if (weekDates.length === 0) return true;
  return weekDates.every((date) =>
    AVAILABLE_TIMES.every((time) => bookedSet.has(buildSelectedSlot(date, time)))
  );
}

/** First week (Mon anchor) within range that still has an open slot */
export function findFirstWeekWithOpenSlot(
  bookableDates: string[],
  bookedSet: Set<string>
): string {
  if (bookableDates.length === 0) return getMondayOfWeek(formatLocalDate(new Date()));

  const bookableSet = new Set(bookableDates);
  let weekMonday = getMondayOfWeek(bookableDates[0]);
  const rangeEnd = bookableDates[bookableDates.length - 1];

  while (weekMonday <= rangeEnd) {
    const weekDates = getWeekdayDatesInWeek(weekMonday, bookableSet);
    if (!isWeekFullyBooked(weekDates, bookedSet)) return weekMonday;
    const nextMonday = parseLocalDate(weekMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    weekMonday = formatLocalDate(nextMonday);
  }

  return getMondayOfWeek(bookableDates[0]);
}

export type MonthCalendarCell = {
  date: string;
  bookable: boolean;
};

/** Next 30 calendar days (from tomorrow) for month-picker grid */
export function getMonthCalendarDays(daysAhead = 30): MonthCalendarCell[] {
  const cells: MonthCalendarCell[] = [];
  const today = new Date();
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const dow = d.getDay();
    cells.push({
      date: formatLocalDate(d),
      bookable: dow !== 0 && dow !== 6,
    });
  }
  return cells;
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local YYYY-MM-DDTHH:MM key — matches slot picker buttons */
export function slotKeyFromDate(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${formatLocalDate(date)}T${h}:${min}`;
}

export function buildSelectedSlot(date: string, time: string): string {
  return `${date}T${time}`;
}

export async function fetchBookedSlotKeys(
  client: SupabaseClient | null,
  providerId: string = PROVIDER_ID
): Promise<Set<string>> {
  const set = new Set<string>();
  if (!client) return set;

  const { data, error } = await client
    .from('bookings')
    .select('scheduled_start, expires_at, status')
    .eq('provider_id', providerId)
    .in('status', ['tentative', 'confirmed', 'blocked'])
    .gte('scheduled_start', new Date().toISOString());

  if (error) {
    console.error('Error loading bookings:', error);
    return set;
  }

  data?.forEach((b) => {
    const start = new Date(b.scheduled_start);
    const isActive =
      b.status === 'confirmed' ||
      b.status === 'blocked' ||
      (b.expires_at && new Date(b.expires_at) > new Date());
    if (isActive) {
      set.add(slotKeyFromDate(start));
    }
  });

  return set;
}

export type ReserveBookingInput = {
  zip: string;
  windowCount: number;
  screenReinstall: boolean;
  qualifierCode: string;
  name: string;
  email: string;
  address: string;
  scheduledStart: string;
  estimatedPrice: number;
  arrivalNotes?: string;
  goals?: string;
};

export async function reserveBookingSlot(
  client: SupabaseClient | null,
  input: ReserveBookingInput,
  providerId: string = PROVIDER_ID
) {
  if (!client) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const timePart = input.scheduledStart.split('T')[1]?.slice(0, 5) ?? '';

  return client
    .from('bookings')
    .insert({
      provider_id: providerId,
      customer_name: input.name || 'Customer',
      customer_email: input.email || null,
      customer_phone: null,
      zip_code: input.zip,
      address: input.address,
      window_count: input.windowCount,
      estimated_price: input.estimatedPrice,
      scheduled_start: input.scheduledStart,
      duration_minutes: getSlotDurationMinutes(timePart),
      status: 'tentative',
      qualifier_code: input.qualifierCode || null,
      arrival_notes: input.arrivalNotes || null,
      goals: input.goals || null,
      expires_at: expiresAt,
    })
    .select()
    .single();
}