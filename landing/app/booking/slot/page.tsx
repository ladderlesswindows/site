"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PROVIDER_ID } from '@/lib/bookingConstants';
import { getQualifier, DEFAULT_WINDOW_PRICE } from '@/components/qualifiers';
import { calculateWindowBase } from '@/components/windowPricing';
import { buildBookingSearchParams, parseScreenReinstall } from '@/components/bookingFlowParams';

function SlotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const zip = searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const screenReinstall = parseScreenReinstall(
    searchParams.get('screenReinstall'),
    searchParams.get('screensChoice')
  );
  const qualifierCode = searchParams.get('qualifier') || '';
  const name = searchParams.get('name') || '';
  const addressSummary = searchParams.get('address') || '';
  const email = searchParams.get('email') || '';

  const qualifier = getQualifier(qualifierCode);
  const basePrice = qualifier ? qualifier.pricePerWindow : DEFAULT_WINDOW_PRICE;

  const windowCount = parseInt(windowsParam, 10);
  const base = calculateWindowBase(windowCount, basePrice);
  const screenFee = screenReinstall ? windowCount * 2 : 0;
  const total = base + screenFee;

  // States for form
  const [arrivalNotes, setArrivalNotes] = useState('');
  const [goalsChoice, setGoalsChoice] = useState('');

  // Calendar states
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSet, setBookedSet] = useState(new Set<string>());

  const availableTimes = ['09:00', '11:00', '13:00', '15:00'];

  const selectedSlot = selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : null;

  // Load booked slots from Supabase for real availability
  useEffect(() => {
    if (!supabase) return;

    const loadBooked = async () => {
      const { data, error } = await (supabase!)
        .from('bookings')
        .select('scheduled_start, expires_at, status')
        .eq('provider_id', PROVIDER_ID)
        .in('status', ['tentative', 'confirmed', 'blocked'])
        .gte('scheduled_start', new Date().toISOString());

      if (error) {
        console.error('Error loading bookings:', error);
        return;
      }

      const set = new Set<string>();
      data?.forEach((b: any) => {
        const startIso = new Date(b.scheduled_start).toISOString().slice(0, 16);
        const isActive = b.status === 'confirmed' || b.status === 'blocked' || (b.expires_at && new Date(b.expires_at) > new Date());
        if (isActive) {
          set.add(startIso);
        }
      });
      setBookedSet(set);
    };
    loadBooked();
  }, []);

  const isBooked = (date: string, time: string) => bookedSet.has(`${date}T${time}`);

  const handleReserve = async () => {
    if (!supabase || !selectedSlot) return;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data, error } = await (supabase!).from('bookings').insert({
      provider_id: PROVIDER_ID,
      customer_name: name || 'Customer',
      customer_email: email || null,
      customer_phone: null,
      zip_code: zip,
      address: addressSummary,
      window_count: windowCount,
      estimated_price: total,
      scheduled_start: selectedSlot,
      duration_minutes: 60,
      status: 'tentative',
      qualifier_code: qualifierCode || null,
      arrival_notes: arrivalNotes || null,
      goals: goalsChoice || null,
      expires_at: expiresAt,
    }).select().single();

    if (error) {
      alert('Error reserving slot: ' + error.message);
      return;
    }

    // Proceed to success with slot and booking info
    const params = new URLSearchParams(searchParams.toString());
    params.set('slot', selectedSlot);
    if (data?.id) params.set('booking_id', data.id);
    router.push(`/booking/success?${params.toString()}`);
  };

  if (!supabase) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 px-5 pt-12 pb-12">
          <div className="mx-auto max-w-md">
            {/* same branding section above for seamlessness */}
            <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-6">
              <div className="mb-2">
                <div className="hidden md:block">
                  <div className="flex justify-between">
                    <div className="text-[9px] px-1 py-0.5 border border-emerald-100 rounded bg-emerald-50 text-emerald-700" style={{minWidth: '28px'}}>{zip}</div>
                  </div>
                </div>
              </div>
              {/* only the logo */}
              <div className="flex justify-center mb-4">
                <img
                  src="/ll.jpg"
                  alt="Ladderless Windows"
                  className="w-full h-auto object-contain rounded-3xl"
                />
              </div>
            </div>

            <div className="border border-neutral-200 rounded-3xl bg-cream p-6 text-center">
              <h1 className="text-xl font-semibold mb-3">Supabase not configured yet</h1>
              <p className="text-sm text-neutral-600 mb-4">
                The calendar requires Supabase to query real availability and create tentative slot holds.
              </p>
              <p className="text-sm text-neutral-600 mb-4">
                Please set up Supabase now (as you mentioned), then add these two lines to your <code>.env</code> (or <code>.env.local</code>) file in the <strong>ladderless-landing</strong> folder:
              </p>
              <pre className="bg-neutral-100 p-3 rounded text-left text-xs mb-4 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
              <p className="text-sm text-neutral-600 mb-4">
                Then restart the dev server (<code>npm run dev</code>).
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                Full instructions are in <strong>SUPABASE_SETUP.md</strong> (including the SQL schema to run).
              </p>
              <Link href="/" className="inline-block px-4 py-2 bg-[#0f766e] text-white rounded-3xl text-sm">
                Back to Coverage
              </Link>
            </div>
          </div>
        </main>
        <footer className="pb-8">
          <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
            Fully Insured • Vetted Technicians • Satisfaction Guaranteed
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          {/* same branding section above for seamlessness */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-6">
            <div className="mb-2">
              <div className="hidden md:block">
                <div className="flex justify-between">
                  <div className="text-[9px] px-1 py-0.5 border border-emerald-100 rounded bg-emerald-50 text-emerald-700" style={{minWidth: '28px'}}>{zip}</div>
                </div>
              </div>
            </div>
            {/* only the logo */}
            <div className="flex justify-center mb-4">
              <img
                src="/ll.jpg"
                alt="Ladderless Windows"
                className="w-full h-auto object-contain rounded-3xl"
              />
            </div>
          </div>

          {/* Compact job summary (info already entered in previous step) */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-4 text-sm">
            <div className="font-medium">Your {windowCount}-window job for ZIP {zip}</div>
            <div className="text-xs text-neutral-600">Est. ${total} {qualifier ? `(${qualifier.displayName} rate)` : ''}</div>
            {addressSummary && <div className="text-xs text-neutral-500 mt-1 truncate">{addressSummary}</div>}
          </div>

          {/* Real-time slot picker with Supabase + hold logic */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-4">
            <div className="text-sm font-medium mb-2">Choose your time slot</div>
            <p className="text-[10px] text-neutral-500 mb-3">Slots are held for 15 minutes while you complete checkout (or released automatically if you don't).</p>

            {/* Date selector */}
            <div className="mb-3">
              <div className="text-xs text-neutral-500 mb-1">Available dates</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map(date => {
                  const d = new Date(date + 'T00:00:00');
                  const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      className={`px-3 py-1 text-xs rounded-full border flex-shrink-0 whitespace-nowrap ${selectedDate === date ? 'bg-emerald-100 border-emerald-600 text-emerald-800' : 'bg-white border-neutral-300'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time selector */}
            <div className="mb-3">
              <div className="text-xs text-neutral-500 mb-1">Times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
              <div className="grid grid-cols-2 gap-2">
                {availableTimes.map(time => {
                  const booked = isBooked(selectedDate, time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={booked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 text-sm rounded-2xl border transition ${isSelected ? 'bg-emerald-600 text-white border-emerald-600' : booked ? 'bg-neutral-100 text-neutral-400 line-through cursor-not-allowed' : 'bg-white border-neutral-300 active:bg-neutral-50'}`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goals and arrival notes - as requested */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-sm font-medium mb-1">Arrival notes (gate code, parking, etc.)</div>
                <textarea
                  value={arrivalNotes}
                  onChange={(e) => setArrivalNotes(e.target.value)}
                  className="w-full border rounded p-2 text-sm h-16"
                  placeholder="Gate code, parking instructions, dog notes..."
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Summarize your goals for this visit</div>
                <select
                  value={goalsChoice}
                  onChange={(e) => setGoalsChoice(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="">Select an option...</option>
                  <option value="I'll add every window, and the insides too, if they look perfect and your tech has the time!">1. I'll add every window, and the insides too, if they look perfect and your tech has the time!</option>
                  <option value="Just the number I booked, guaranteed no add-ons.">2. Just the number I booked, guaranteed no add-ons.</option>
                  <option value="I booked the ones I believe will be easy for them, but if they qualify I hope to add a few more.">3. I booked the ones I believe will be easy for them, but if they qualify I hope to add a few more.</option>
                  <option value="Too many questions, just get here and we'll chat.">4. Too many questions, just get here and we'll chat.</option>
                </select>
              </div>
            </div>

            {selectedSlot && (
              <div className="text-sm text-emerald-700 mb-2 font-medium">
                Selected: {new Date(selectedSlot).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
            )}

            <button
              onClick={handleReserve}
              disabled={!selectedSlot}
              className={`block w-full py-4 text-lg font-semibold text-center rounded-3xl transition ${selectedSlot ? 'bg-[#0f766e] text-white active:bg-[#0c5f58]' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
            >
              Reserve Slot &amp; Proceed to Checkout
            </button>

            <p className="text-[10px] text-neutral-500 mt-2 text-center">This creates a tentative hold in the system (expires in 15 min if not completed).</p>
          </div>

          <div className="text-center">
            <Link
              href={`/booking/address?${buildBookingSearchParams({
                zip,
                windows: windowCount,
                screenReinstall,
                screensChoice: (searchParams.get('screensChoice') as 'outside' | 'fee' | 'decide' | '') || undefined,
                qualifier: qualifierCode,
                flow: '30s',
                name,
                address: addressSummary,
                email,
              })}`}
              className="text-xs text-neutral-500"
            >
              ← Back to Address
            </Link>
          </div>
        </div>
      </main>

      <footer className="pb-8">
        <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
          Fully Insured • Vetted Technicians • Satisfaction Guaranteed
        </p>
      </footer>
    </div>
  );
}

export default function SlotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading slots...</div>}>
      <SlotContent />
    </Suspense>
  );
}
