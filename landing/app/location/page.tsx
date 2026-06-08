"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { DEFAULT_WINDOW_PRICE } from '@/components/qualifiers';
import { calculateWindowBase } from '@/components/windowPricing';
import { buildBookingSearchParams } from '@/components/bookingFlowParams';

function LocationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zip = searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const paramWindows = parseInt(windowsParam, 10);
  const flow = searchParams.get('flow') || '';
  const qualifierParam = searchParams.get('qualifier') || '';

  // Legacy 30s URLs redirect to the canonical address step
  useEffect(() => {
    if (flow === '30s') {
      const params = buildBookingSearchParams({
        zip,
        windows: paramWindows,
        qualifier: qualifierParam,
        flow: '30s',
      });
      router.replace(`/booking/address?${params}`);
    }
  }, [flow, zip, paramWindows, qualifierParam, router]);

  if (flow === '30s') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Redirecting…
      </div>
    );
  }

  const mapSrc = `/${zip}-map.jpg`;
  const mapAlt = `${zip} area map`;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-6">
            <div className="mb-2">
              <div className="hidden md:block">
                <div className="flex justify-between">
                  <div
                    className="text-[9px] px-1 py-0.5 border border-emerald-100 rounded bg-emerald-50 text-emerald-700"
                    style={{ minWidth: '28px' }}
                  >
                    {zip}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <img
                src="/ll.jpg"
                alt="Ladderless Windows"
                className="w-full h-auto object-contain rounded-3xl"
              />
            </div>
          </div>

          <img src={mapSrc} alt={mapAlt} className="w-full h-auto mb-6 rounded-3xl" />

          <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
            <div className="mb-4">
              <div className="text-sm text-neutral-600 mb-2">
                For ZIP <span className="font-semibold">{zip}</span> • {paramWindows} window
                {paramWindows > 1 ? 's' : ''} (est. ${calculateWindowBase(paramWindows, DEFAULT_WINDOW_PRICE)})
              </div>
              <h3 className="font-semibold mb-3">Your Location</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Please provide your service address and any access notes. A team member will follow up with a custom quote.
              </p>

              <input type="text" placeholder="Full address" className="w-full border rounded p-2 mb-2" />
              <input
                type="text"
                placeholder="City, State, ZIP"
                className="w-full border rounded p-2 mb-2"
                defaultValue={zip}
              />
              <textarea
                placeholder="Access notes, gate codes, etc."
                className="w-full border rounded p-2 mb-2 h-20"
              />
            </div>

            <Link
              href={`/booking/success?zip=${zip}&windows=${paramWindows}&screenReinstall=false&flow=custom`}
              className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center"
            >
              Submit for Custom Quote
            </Link>

            <div className="text-center mt-3">
              <Link href="/" className="text-xs text-neutral-500">
                ← Back to Coverage
              </Link>
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

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LocationContent />
    </Suspense>
  );
}