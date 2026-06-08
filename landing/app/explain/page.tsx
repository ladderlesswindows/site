"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ExplainContent() {
  const searchParams = useSearchParams();
  const zip = searchParams.get('zip') || '95060';
  const continueHref = `/booking/address?${searchParams.toString() || 'zip=95060&windows=1&flow=30s'}`;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-8 pb-12">
        <div className="mx-auto max-w-xl">
          {/* same branding header */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/ll.jpg"
                alt="Ladderless Windows"
                className="w-full h-auto object-contain rounded-3xl"
              />
            </div>
          </div>

          {/* Looping video */}
          <div className="mb-6">
            <video
              src="/videos/IMG_3266.MP4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-2xl shadow-lg"
            />
          </div>

          {/* About intro */}
          <div className="text-[15px] leading-relaxed text-neutral-700 mb-8">
            <p>
              Ladderless is a pop-up brand experiment in Santa Cruz, Ca built by Tradesman for Tradesman. We are bringing No-minimum, Instant-booking to window cleaning. If your 1st or 2nd floor windows qualify as ladderless then try us out.
            </p>
            <p className="mt-4 text-center text-base font-semibold leading-snug text-neutral-900">
              And YES, if you are in Santa Cruz city limits, we will do ONLY your dirtiest 2nd story window for ONLY $20 flat, with a 30 second online booking process. There&apos;s NO catch!
            </p>
          </div>

          {/* Entertaining explanation text - timed to ~44s video for slow reader */}
          <div className="text-[15px] leading-relaxed text-neutral-700 mb-8">
            <p>
              Water-fed pole cleaning is the ladder-free way pros wash windows. Ultra-purified water (stripped of every mineral) flows through lightweight telescopic poles with soft brushes on the end. The brush scrubs the dirt while the water rinses it all away – no soap, no streaks, no climbing.
            </p>
            <p className="mt-3">
              This clever technique first appeared in the UK back in the 1980s. It took nearly 20 years to really catch on in the US as safety rules got stricter and better poles became available.
            </p>
            <p className="mt-3">
              Today it's everywhere. The US window cleaning industry is a multi-billion dollar business, and water-fed poles are now the standard for most residential jobs. Safer for the technicians, faster for you, and crystal-clear results every time.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href={continueHref}
              className="block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
            >
              Continue
            </Link>
            <Link
              href="/"
              className="block w-full py-3 text-base font-medium text-center rounded-3xl border border-neutral-300 text-neutral-600 active:bg-neutral-50"
            >
              Back Home
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

export default function ExplainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExplainContent />
    </Suspense>
  );
}
