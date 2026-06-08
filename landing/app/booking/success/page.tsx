"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

import { getQualifier, DEFAULT_WINDOW_PRICE } from '@/components/qualifiers';
import { calculateWindowBase, FIRST_WINDOW_ONLY_PRICE } from '@/components/windowPricing';
import { parseScreenReinstall } from '@/components/bookingFlowParams';

function SuccessContent() {
  const searchParams = useSearchParams();
  const zip = searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const screenReinstall = parseScreenReinstall(
    searchParams.get('screenReinstall'),
    searchParams.get('screensChoice')
  );
  const qualifierCode = searchParams.get('qualifier') || '';
  const slot = searchParams.get('slot') || '';
  const name = searchParams.get('name') || 'Valued Customer';
  const address = searchParams.get('address') || 'Address provided';
  const email = searchParams.get('email') || '';

  const qualifier = getQualifier(qualifierCode);
  const basePrice = qualifier ? qualifier.pricePerWindow : DEFAULT_WINDOW_PRICE;

  const windowCount = parseInt(windowsParam, 10);
  const base = calculateWindowBase(windowCount, basePrice);
  const screenFee = screenReinstall ? windowCount * 2 : 0;
  const total = base + screenFee;

  let formattedSlot = '';
  if (slot) {
    try {
      const d = new Date(slot);
      formattedSlot = d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {}
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

          {/* Success confirmation - completes the 30 second booking process */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18" />
                </svg>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-emerald-800 mb-1">30 Second Booking Complete!</h1>
              <p className="text-sm text-neutral-600 mb-4">Thank you, {name.split(' ')[0] || 'friend'}. Your pro is on the way.</p>

              {/* Quick summary carried from the path */}
              <div className="bg-cream border border-neutral-200 rounded-2xl p-3 mb-4 text-left text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-600">ZIP</span>
                  <span className="font-semibold">{zip}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-600">Windows</span>
                  <span className="font-semibold">{windowCount}</span>
                </div>
                {qualifier && (
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-600">Qualifier</span>
                    <span className="font-semibold text-emerald-700">{qualifier.displayName || qualifier.code}</span>
                  </div>
                )}
                {screenReinstall && (
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-600">Screen Reinstall</span>
                    <span className="font-semibold text-emerald-700">+${screenFee}</span>
                  </div>
                )}
                {formattedSlot && (
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-600">Scheduled</span>
                    <span className="font-semibold text-emerald-700">{formattedSlot}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  {windowCount <= 1
                    ? `First window $${FIRST_WINDOW_ONLY_PRICE}`
                    : `${basePrice}/window × ${windowCount}`}{' '}
                  + screen if selected. Screens washed free.
                  {qualifier && ` ${qualifier.displayName || qualifier.code} rate applied.`}
                </div>
              </div>

              {/* Address summary */}
              <div className="text-left text-sm mb-4 bg-cream border border-neutral-200 rounded-2xl p-3">
                <div className="text-xs text-neutral-500 mb-0.5">Service Address</div>
                <div className="font-medium">{address}</div>
                {email && <div className="text-xs text-neutral-500 mt-1">{email}</div>}
              </div>

              <p className="text-xs text-neutral-500 mb-4">
                A confirmation and pro arrival window has been sent to your email. All transactions through the app only.
              </p>

              <Link
                href="/"
                className="block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
              >
                Back to Home
              </Link>

              <p className="text-[10px] text-neutral-400 mt-3">That felt like 30 seconds, right? 😉</p>
            </div>
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

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
