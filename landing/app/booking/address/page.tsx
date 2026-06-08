"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { FlowBrandingHeader } from '@/components/FlowBrandingHeader';
import { FlowPageLayout } from '@/components/FlowPageLayout';
import { BookingSubtotalPanel } from '@/components/BookingSubtotalPanel';
import Link from 'next/link';
import {
  buildBookingSearchParams,
  buildSlotSearchParams,
  parseScreenReinstall,
  type ScreensChoice,
} from '@/components/bookingFlowParams';

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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [stateAbbr] = useState('CA');
  const [zipCode] = useState(zip);
  const [isSpecialAddress, setIsSpecialAddress] = useState(false);

  useEffect(() => {
    setWindows(paramWindows);
    setScreenReinstall(parseScreenReinstall(screenParam, screensChoiceParam));
    setScreensChoice((screensChoiceParam as ScreensChoice) || '');
    setQualifierCode(qualifierParam);
  }, [paramWindows, screenParam, screensChoiceParam, qualifierParam]);

  useEffect(() => {
    const streetLower = street.toLowerCase();
    const cityLower = city.toLowerCase();
    const streetMatch =
      streetLower.includes('121 34th') &&
      (streetLower.includes('ave') || streetLower.includes('avenue'));
    const cityMatch = cityLower.includes('capitola');
    setIsSpecialAddress(streetMatch && cityMatch);
  }, [street, city]);

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

  const addressSummary = `${street.trim()}${apt ? ' ' + apt.trim() : ''}, ${city.trim()}, ${stateAbbr} ${zipCode}`;

  const canProceed =
    street.trim().length > 4 &&
    city.trim().length > 1 &&
    fullName.trim().length > 1 &&
    email.trim().includes('@');

  const goToSlotPicker = () => {
    if (!canProceed) return;
    const query = buildSlotSearchParams({
      zip,
      windows,
      screenReinstall,
      screensChoice: screensChoice || undefined,
      qualifier: qualifierCode,
      name: fullName.trim(),
      address: addressSummary,
      email: email.trim(),
    });
    router.push(`/booking/slot?${query}`);
  };

  const handleSpecialSchedule = () => {
    const pw = prompt('Enter password');
    if (pw === 'shark') {
      window.location.href = '/admin/bookings';
    } else if (pw !== null) {
      alert('Incorrect password');
    }
  };

  const backHref = `/booking?${buildBookingSearchParams({
    zip,
    windows,
    screenReinstall,
    screensChoice: screensChoice || undefined,
    qualifier: qualifierCode,
    flow: '30s',
  })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mb-4 text-sm font-medium text-center text-emerald-700">
          Awesome! Now, BOOK your ideal time in our real-time booking calendar.
        </div>

        <FlowPageLayout
          rightPanel={
            <BookingSubtotalPanel
              windowCount={windows}
              screenReinstall={screenReinstall}
              variant="address"
              onWindowCountChange={updateWindows}
              onScreenReinstallChange={toggleScreenFee}
            />
          }
          main={
            <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
              <FlowBrandingHeader currentZip={zip} windows={windows} showZipButtons={false} />

              <div className="space-y-1.5">
                <div>
                  <div className="text-[10px] text-neutral-500 mb-0.5">Full Name *</div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border rounded p-1.5 text-sm bg-white"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 mb-0.5">Email *</div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email for receipt"
                    className="w-full border rounded p-1.5 text-sm bg-white"
                  />
                </div>
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

              {isSpecialAddress ? (
                <>
                  <div className="text-center mt-4 mb-2 text-sm font-medium text-emerald-700">
                    Hi John and Deb, Please Book your ideal monthly cleaning day!
                  </div>
                  <button
                    onClick={handleSpecialSchedule}
                    className="block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
                  >
                    Schedule
                  </button>
                </>
              ) : (
                <>
                  {!canProceed && (
                    <p className="text-center text-[11px] text-red-600 mt-3">
                      Enter name, email, street, and city to continue
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={goToSlotPicker}
                    disabled={!canProceed}
                    className={`block w-full py-4 text-lg font-semibold text-center rounded-3xl mt-3 transition ${
                      canProceed
                        ? 'bg-[#0f766e] text-white active:bg-[#0c5f58]'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    Choose Time Slot
                  </button>
                </>
              )}

              <Link href={backHref} className="block w-full text-sm text-neutral-500 py-2 mt-2 text-center">
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