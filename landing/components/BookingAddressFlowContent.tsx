"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FlowBrandingHeader } from '@/components/FlowBrandingHeader';
import { FlowPageLayout } from '@/components/FlowPageLayout';
import { BookingSubtotalPanel } from '@/components/BookingSubtotalPanel';
import { BookingPricesPanel } from '@/components/BookingPricesPanel';
import { BookingSchedulePanel } from '@/components/BookingSchedulePanel';
import Link from 'next/link';
import {
  buildBookingSearchParams,
  isSamePathQuery,
  parseScreenReinstall,
  type ScreensChoice,
} from '@/components/bookingFlowParams';
import { reserveBookingSlot } from '@/lib/bookingSlots';
import { useSupabase } from '@/hooks/useSupabase';
import { getQualifier, DEFAULT_WINDOW_PRICE } from '@/components/qualifiers';
import { calculateWindowBase } from '@/components/windowPricing';
import { clampWindowCount, getMinWindows } from '@/components/zipRegistry';
import { bookingFlowHref, MOM_EASTER_EGG_ZIP } from '@/lib/easterEggZips';
import { BackHomeLink } from '@/components/BackHomeLink';
import { FlowFooter } from '@/components/FlowFooter';

type BookingAddressFlowContentProps = {
  basePath: '/booking' | '/booking/mom';
};

export function BookingAddressFlowContent({ basePath }: BookingAddressFlowContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { supabase, providerId, ready: supabaseReady } = useSupabase();
  const isMomFlow = basePath === '/booking/mom';

  const zip = isMomFlow ? MOM_EASTER_EGG_ZIP : searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const paramWindows = clampWindowCount(zip, parseInt(windowsParam, 10) || getMinWindows(zip));
  const screenParam = searchParams.get('screenReinstall');
  const screensChoiceParam = searchParams.get('screensChoice');
  const paramScreenReinstall = parseScreenReinstall(screenParam, screensChoiceParam);
  const qualifierParam = searchParams.get('qualifier') || '';
  const slotParam = searchParams.get('slot');

  const [windows, setWindows] = useState(paramWindows);
  const [screenReinstall, setScreenReinstall] = useState(paramScreenReinstall);
  const [screensChoice, setScreensChoice] = useState<ScreensChoice>(
    (screensChoiceParam as ScreensChoice) || ''
  );
  const [qualifierCode, setQualifierCode] = useState(qualifierParam);

  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [stateAbbr] = useState('CA');
  const [zipCode] = useState(zip);
  const [isSpecialAddress, setIsSpecialAddress] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(slotParam);
  const [slotNotes, setSlotNotes] = useState({ arrivalNotes: '', goalsChoice: '' });
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    setWindows(paramWindows);
    setScreenReinstall(parseScreenReinstall(screenParam, screensChoiceParam));
    setScreensChoice((screensChoiceParam as ScreensChoice) || '');
    setQualifierCode(qualifierParam);
    setSelectedSlot(slotParam);
  }, [paramWindows, screenParam, screensChoiceParam, qualifierParam, slotParam]);

  useEffect(() => {
    const streetLower = street.toLowerCase();
    const cityLower = city.toLowerCase();
    const streetMatch =
      streetLower.includes('121 34th') &&
      (streetLower.includes('ave') || streetLower.includes('avenue'));
    const cityMatch = cityLower.includes('capitola');
    setIsSpecialAddress(streetMatch && cityMatch);
  }, [street, city]);

  const syncBookingParams = useCallback(
    (next: {
      windows?: number;
      screenReinstall?: boolean;
      screensChoice?: ScreensChoice;
      slot?: string | null;
    }) => {
      const params = buildBookingSearchParams({
        zip,
        windows: next.windows ?? windows,
        screenReinstall: next.screenReinstall ?? screenReinstall,
        screensChoice: (next.screensChoice ?? screensChoice) || undefined,
        qualifier: qualifierCode,
        flow: '30s',
        slot: next.slot ?? selectedSlot ?? undefined,
      });
      const href = bookingFlowHref(basePath, 'address', params);
      if (typeof window !== 'undefined') {
        const current = `${window.location.pathname}${window.location.search}`;
        if (isSamePathQuery(current, href)) return;
      }
      router.replace(href, { scroll: false });
    },
    [zip, windows, screenReinstall, screensChoice, qualifierCode, selectedSlot, router, basePath]
  );

  const updateWindows = (count: number) => {
    const next = clampWindowCount(zip, count);
    setWindows(next);
    syncBookingParams({ windows: next });
  };

  const toggleScreenFee = (checked: boolean) => {
    const choice: ScreensChoice = checked ? 'fee' : 'outside';
    setScreenReinstall(checked);
    setScreensChoice(choice);
    syncBookingParams({ screenReinstall: checked, screensChoice: choice });
  };

  const addressSummary = `${street.trim()}${apt ? ' ' + apt.trim() : ''}, ${city.trim()}, ${stateAbbr} ${zipCode}`;

  const hasStreet = street.trim().length >= 3;
  const hasCity = city.trim().length >= 2;
  const hasGoals = slotNotes.goalsChoice.trim().length > 0;
  const hasSlot = Boolean(selectedSlot);
  const canProceed = hasStreet && hasCity && hasGoals && hasSlot;

  const proceedStatusBox = (
    <div className="p-2 rounded-xl border border-neutral-200 bg-white text-[11px] space-y-0.5">
      <div className="font-medium text-neutral-600 mb-1">To reserve, complete:</div>
      <div className={hasStreet ? 'text-emerald-700' : 'text-red-600'}>
        {hasStreet ? '✓' : '○'} Street address
      </div>
      <div className={hasCity ? 'text-emerald-700' : 'text-red-600'}>
        {hasCity ? '✓' : '○'} City
      </div>
      <div className={hasGoals ? 'text-emerald-700' : 'text-red-600'}>
        {hasGoals ? '✓' : '○'} Goals for this visit
      </div>
      <div className={hasSlot ? 'text-emerald-700' : 'text-red-600'}>
        {hasSlot ? '✓' : '○'} Time slot
      </div>
    </div>
  );

  const addressFields = (
    <div className="space-y-1.5 pt-3 border-t border-neutral-200">
      <div className="text-[10px] font-medium text-neutral-600 mb-1">Your address</div>
      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">Street Address *</div>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="123 Main St"
          className="w-full border rounded p-1.5 text-sm bg-white"
        />
      </div>
      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">Apt / Unit (optional)</div>
        <input
          type="text"
          value={apt}
          onChange={(e) => setApt(e.target.value)}
          placeholder="Apt 2B"
          className="w-full border rounded p-1.5 text-sm bg-white"
        />
      </div>
      <div>
        <div className="text-[10px] text-neutral-500 mb-0.5">City *</div>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full border rounded p-1.5 text-sm bg-white"
        />
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1">
          <div className="text-[10px] text-neutral-500 mb-0.5">State</div>
          <input
            type="text"
            value={stateAbbr}
            readOnly
            className="w-full border rounded p-1.5 text-sm bg-neutral-50"
          />
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-neutral-500 mb-0.5">ZIP (pre-filled)</div>
          <input
            type="text"
            value={zipCode}
            readOnly
            className="w-full border rounded p-1.5 text-sm bg-neutral-50"
          />
        </div>
      </div>

      <div className="pt-2">
        <div className="text-[10px] text-neutral-500 mb-0.5">Goals for this visit *</div>
        <select
          value={slotNotes.goalsChoice}
          onChange={(e) =>
            setSlotNotes((prev) => ({ ...prev, goalsChoice: e.target.value }))
          }
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
    </div>
  );

  const qualifier = getQualifier(qualifierCode);
  const basePrice = qualifier ? qualifier.pricePerWindow : DEFAULT_WINDOW_PRICE;
  const base = calculateWindowBase(windows, basePrice);
  const screenFee = screenReinstall ? windows * 2 : 0;
  const total = base + screenFee;

  const handleSlotChange = useCallback(
    (slot: string | null) => {
      if (slot === selectedSlot) return;
      setSelectedSlot(slot);
      syncBookingParams({ slot });
    },
    [selectedSlot, syncBookingParams]
  );

  const handleNotesChange = useCallback((notes: { arrivalNotes: string }) => {
    setSlotNotes((prev) => ({ ...prev, arrivalNotes: notes.arrivalNotes }));
  }, []);

  const handleReserve = async () => {
    if (!canProceed || !selectedSlot || !supabase) return;

    setReserving(true);
    const { data, error } = await reserveBookingSlot(
      supabase,
      {
        zip,
        windowCount: windows,
        screenReinstall,
        qualifierCode,
        name: '',
        email: '',
        address: addressSummary,
        scheduledStart: selectedSlot,
        estimatedPrice: total,
        arrivalNotes: slotNotes.arrivalNotes || undefined,
        goals: slotNotes.goalsChoice || undefined,
      },
      providerId
    );
    setReserving(false);

    if (error) {
      alert('Error reserving slot: ' + error.message);
      return;
    }

    const params = buildBookingSearchParams({
      zip,
      windows,
      screenReinstall,
      screensChoice: screensChoice || undefined,
      qualifier: qualifierCode,
      flow: '30s',
      address: addressSummary,
    });
    const successParams = new URLSearchParams(params);
    successParams.set('slot', selectedSlot);
    if (data?.id) successParams.set('booking_id', data.id);
    router.push(bookingFlowHref(basePath, 'success', successParams.toString()));
  };

  const handleSpecialSchedule = () => {
    const pw = prompt('Enter password');
    if (pw === 'shark') {
      window.location.href = '/admin/bookings';
    } else if (pw !== null) {
      alert('Incorrect password');
    }
  };

  const backHref = bookingFlowHref(
    basePath,
    '',
    buildBookingSearchParams({
      zip,
      windows,
      screenReinstall,
      screensChoice: screensChoice || undefined,
      qualifier: qualifierCode,
      flow: '30s',
      slot: selectedSlot ?? undefined,
    })
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mb-4 text-sm font-medium text-center text-emerald-700">
          Awesome! Now, BOOK your ideal time in our real-time booking calendar.
        </div>

        <FlowPageLayout
          containerClassName="mx-auto w-full max-w-5xl"
          leftPanelClassName="w-full md:w-60 md:flex-shrink-0 order-1 md:order-1"
          mainClassName="w-full max-w-md flex-shrink-0 order-2 md:order-2"
          leftPanel={
            !isSpecialAddress && supabaseReady && supabase ? (
              <BookingSchedulePanel
                supabase={supabase}
                providerId={providerId}
                supabaseReady={supabaseReady}
                mode="live"
                initialSlot={slotParam}
                selectedSlot={selectedSlot}
                onSlotChange={handleSlotChange}
                onNotesChange={handleNotesChange}
              />
            ) : undefined
          }
          rightPanel={
            <div className="space-y-2">
              <BookingSubtotalPanel
                windowCount={windows}
                minWindows={getMinWindows(zip)}
                screenReinstall={screenReinstall}
                variant="address"
                onWindowCountChange={updateWindows}
                onScreenReinstallChange={toggleScreenFee}
              />
              <BookingPricesPanel />
            </div>
          }
          main={
            <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
              <FlowBrandingHeader
                currentZip={zip}
                windows={windows}
                bookingPath={basePath}
                showZipButtons={false}
              />

              {isSpecialAddress ? (
                <>
                  {addressFields}
                  <div className="text-center mt-4 mb-2 text-sm font-medium text-emerald-700">
                    Hi John and Deb, Please Book your ideal monthly cleaning day!
                  </div>
                  <button
                    type="button"
                    onClick={handleSpecialSchedule}
                    className="block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
                  >
                    Schedule
                  </button>
                </>
              ) : !supabaseReady ? (
                <div className="mt-4 p-3 border border-neutral-200 bg-white rounded-xl text-xs text-neutral-600">
                  Loading live availability…
                </div>
              ) : !supabase ? (
                <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-xl text-xs text-amber-900">
                  Supabase is not configured. For local dev, add credentials to repo-root{' '}
                  <code>.env.local</code> and restart <code>npm run dev</code>. On Vercel, add{' '}
                  <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{' '}
                  <code>NEXT_PUBLIC_PROVIDER_ID</code> in Project Settings → Environment Variables, then redeploy.
                </div>
              ) : (
                <>
                  {proceedStatusBox}
                  {addressFields}

                  <button
                    type="button"
                    onClick={handleReserve}
                    disabled={!canProceed || reserving}
                    className={`block w-full py-4 text-lg font-semibold text-center rounded-3xl mt-3 transition ${
                      canProceed && !reserving
                        ? 'bg-[#0f766e] text-white active:bg-[#0c5f58]'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {reserving ? 'Reserving…' : 'Reserve Slot & Proceed'}
                  </button>
                  <p className="text-[10px] text-neutral-500 mt-2 text-center">
                    Pick a time on the left, then complete your address and goals — reserve unlocks
                    when every item above is checked.
                  </p>
                </>
              )}

              <Link href={backHref} className="block w-full text-sm text-neutral-500 py-2 mt-2 text-center">
                ← Back
              </Link>
              <BackHomeLink />
            </div>
          }
        />
      </main>

      <FlowFooter />
    </div>
  );
}