"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { FlowBrandingHeader } from '@/components/FlowBrandingHeader';
import { FlowPageLayout } from '@/components/FlowPageLayout';
import { BookingSubtotalPanel } from '@/components/BookingSubtotalPanel';
import Link from 'next/link';
import {
  buildBookingSearchParams,
  parseScreenReinstall,
  type ScreensChoice,
} from '@/components/bookingFlowParams';
import { supabase } from '@/lib/supabase';

function AddressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const zip = searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const paramWindows = parseInt(windowsParam, 10) || 1;
  const screenParam = searchParams.get('screenReinstall');
  const screensChoiceParam = searchParams.get('screensChoice');
  const paramScreenReinstall = parseScreenReinstall(screenParam, screensChoiceParam);
  const qualifierParam = searchParams.get('qualifier') || '';

  const [windows, setWindows] = useState(paramWindows);
  const [screenReinstall, setScreenReinstall] = useState(paramScreenReinstall);
  const [screensChoice, setScreensChoice] = useState<ScreensChoice>(
    (screensChoiceParam as ScreensChoice) || ''
  );
  const [qualifierCode, setQualifierCode] = useState(qualifierParam);

  useEffect(() => {
    setWindows(paramWindows);
    setScreenReinstall(parseScreenReinstall(screenParam, screensChoiceParam));
    setScreensChoice((screensChoiceParam as ScreensChoice) || '');
    setQualifierCode(qualifierParam);
  }, [paramWindows, screenParam, screensChoiceParam, qualifierParam]);

  const syncBookingParams = (next: {
    windows?: number;
    screenReinstall?: boolean;
    screensChoice?: ScreensChoice;
  }) => {
    const params = buildBookingSearchParams({
      zip,
      windows: next.windows ?? windows,
      screenReinstall: next.screenReinstall ?? screenReinstall,
      screensChoice: (next.screensChoice ?? screensChoice) || undefined,
      qualifier: qualifierCode,
      flow: '30s',
    });
    router.replace(`/booking/address?${params}`, { scroll: false });
  };

  const updateWindows = (count: number) => {
    const next = Math.max(1, count);
    setWindows(next);
    syncBookingParams({ windows: next });
  };

  const toggleScreenFee = (checked: boolean) => {
    const choice: ScreensChoice = checked ? 'fee' : 'outside';
    setScreenReinstall(checked);
    setScreensChoice(choice);
    syncBookingParams({ screenReinstall: checked, screensChoice: choice });
  };

  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [stateAbbr] = useState('CA');
  const [zipCode] = useState(zip);

  const canBook = street.trim().length > 4 && city.trim().length > 1;

  // Time slot selection for after spot select confirm flow
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
  const [showSlotConfirm, setShowSlotConfirm] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mailingEmail, setMailingEmail] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showMailingInput, setShowMailingInput] = useState(false);
  const availableTimes = ['09:00', '11:00', '13:00', '15:00'];
  const selectedSlot = selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : null;

  const handleBookNow = async () => {
    if (!canBook) return;

    const streetAddress = street.trim();
    const fullAddress = `${streetAddress}${apt ? ' ' + apt.trim() : ''}, ${city.trim()}, CA ${zipCode}`;

    // Book it named as the street address (tentative -> confirmed)
    if (supabase) {
      try {
        const MY_PROVIDER_ID = process.env.NEXT_PUBLIC_PROVIDER_ID || 'cc79bb27-5b21-4c56-aaae-7da80d38fa9f';
        const now = new Date();

        const { data, error: insertError } = await (supabase!).from('bookings').insert({
          provider_id: MY_PROVIDER_ID,
          customer_name: streetAddress, // named as the street address
          address: fullAddress,
          scheduled_start: now.toISOString(),
          duration_minutes: 60,
          status: 'tentative',
          notes: '30s fast path - ' + streetAddress,
        }).select().single();

        if (!insertError && data) {
          await (supabase!).from('bookings').update({ status: 'confirmed' }).eq('id', data.id);
        }
      } catch (err) {
        console.error('Fast book insert (demo):', err);
      }
    }

    // Go to the fullcalendar
    router.push('/admin/bookings');
  };

  // New confirm flow after selecting a spot (time)
  const selectTime = (time: string) => {
    setSelectedTime(time);
    setShowSlotConfirm(true);
  };

  const closeSlotConfirm = (clearSelection = false) => {
    setShowSlotConfirm(false);
    if (clearSelection) {
      setSelectedTime(null);
    }
    setShowMailingInput(false);
  };

  const handleMailingList = () => {
    setShowMailingInput(true);
  };

  const submitMailing = () => {
    if (mailingEmail) {
      alert(`Thank you! ${mailingEmail} has been added to our mailing list.`);
    }
    closeSlotConfirm(true);
  };

  const handleNoSlot = () => {
    closeSlotConfirm(true);
  };

  const handleYesSlot = () => {
    closeSlotConfirm(false);
    setShowHomeConfirm(true);
  };

  const handleHomeNo = () => {
    setShowHomeConfirm(false);
  };

  const handleHomeYes = () => {
    setShowHomeConfirm(false);
    // Time is now "published" - will be shown below subtotal
  };

  const openPayment = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const backHref = `/booking?${buildBookingSearchParams({
    zip,
    windows,
    screenReinstall,
    screensChoice: screensChoice || undefined,
    qualifier: qualifierCode,
    flow: '30s',
  })}`;

  const handleCompletePayment = async () => {
    if (!paymentName || !paymentEmail) {
      alert('Please enter your name and email to complete.');
      return;
    }
    if (!selectedSlot) return;

    const customerName = paymentName.trim();
    const fullAddress = `${street.trim()}${apt ? ' ' + apt.trim() : ''}, ${city.trim()}, CA ${zipCode}`;

    if (supabase) {
      try {
        const MY_PROVIDER_ID = process.env.NEXT_PUBLIC_PROVIDER_ID || 'cc79bb27-5b21-4c56-aaae-7da80d38fa9f';
        const { data, error: insertError } = await (supabase!).from('bookings').insert({
          provider_id: MY_PROVIDER_ID,
          customer_name: customerName,
          customer_email: paymentEmail,
          customer_phone: paymentPhone || null,
          zip_code: zipCode,
          address: fullAddress,
          window_count: windows,
          estimated_price: 0,
          scheduled_start: selectedSlot,
          duration_minutes: 60,
          status: 'confirmed',
          qualifier_code: qualifierCode || null,
          notes: `30s path via ${selectedPaymentMethod} - address page`,
        }).select().single();

        if (insertError) {
          alert('Error completing booking: ' + insertError.message);
          return;
        }
        alert(`Booking confirmed for ${customerName} at ${new Date(selectedSlot).toLocaleString()}! Thank you - 100% Satisfaction Guaranteed.`);
        setShowPaymentModal(false);
        // Time is published below
      } catch (e) {
        alert('Booking completed in demo mode.');
        setShowPaymentModal(false);
      }
    } else {
      alert(`Booking confirmed for ${customerName} at ${new Date(selectedSlot).toLocaleString()} via ${selectedPaymentMethod}! (demo - no Supabase)`);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mb-4 text-sm font-medium text-center text-emerald-700">
          Awesome! Now, BOOK your ideal time in our real-time booking calendar.
        </div>

        <FlowPageLayout
          rightPanel={
            <div className="space-y-2">
              <BookingSubtotalPanel
                windowCount={windows}
                screenReinstall={screenReinstall}
                variant="address"
                onWindowCountChange={updateWindows}
                onScreenReinstallChange={toggleScreenFee}
              />
              {selectedSlot && (
                <div className="p-2 border border-emerald-200 bg-emerald-50 rounded-xl text-xs">
                  <div className="font-medium text-emerald-700">Booked time:</div>
                  <div>
                    {new Date(selectedSlot).toLocaleString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </div>
          }
          main={
            <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
              <FlowBrandingHeader currentZip={zip} windows={windows} showZipButtons={false} />

              <div className="space-y-1.5">
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
              </div>

              <Link href={backHref} className="block w-full text-sm text-neutral-500 py-2 mt-4 text-center">
                ← Back
              </Link>
            </div>
          }
        />
      </main>

      <footer className="pb-8">
        <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
          Fully Insured • Vetted Technicians • Satisfaction Guaranteed
        </p>
      </footer>
    </div>
  );
}

export default function FastAddressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AddressContent />
    </Suspense>
  );
}
