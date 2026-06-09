import type { SupabaseClient } from '@supabase/supabase-js';
import { PROVIDER_ID } from '@/lib/bookingConstants';

export const AVAILABLE_TIMES = ['09:00', '11:00', '13:00', '15:00'] as const;

export function getAvailableDates(daysAhead = 7): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    dates.push(formatLocalDate(d));
  }
  return dates;
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
      duration_minutes: 60,
      status: 'tentative',
      qualifier_code: input.qualifierCode || null,
      arrival_notes: input.arrivalNotes || null,
      goals: input.goals || null,
      expires_at: expiresAt,
    })
    .select()
    .single();
}