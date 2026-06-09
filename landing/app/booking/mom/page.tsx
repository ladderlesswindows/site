"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlowBrandingHeader } from '@/components/FlowBrandingHeader';
import { FlowPageLayout } from '@/components/FlowPageLayout';
import {
  isMomEasterEggZip,
  MOM_EASTER_EGG_HEADLINE,
  MOM_EASTER_EGG_ZIP,
} from '@/lib/easterEggZips';

function MomEasterEggContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zip = searchParams.get('zip') || MOM_EASTER_EGG_ZIP;

  useEffect(() => {
    if (!isMomEasterEggZip(zip)) {
      router.replace('/');
    }
  }, [zip, router]);

  if (!isMomEasterEggZip(zip)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <FlowPageLayout
          main={
            <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
              <FlowBrandingHeader currentZip={zip} windows={1} showZipButtons={false} />

              <div className="space-y-5 text-center">
                <div className="flex gap-2.5 rounded-2xl bg-emerald-50 px-5 py-3 border border-emerald-100 items-start text-left w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-semibold text-emerald-800 text-sm leading-snug">
                    {MOM_EASTER_EGG_HEADLINE}
                  </p>
                </div>

                <p className="text-sm text-neutral-600 leading-snug">
                  Love you — we&apos;ll figure out the calendar together.
                </p>

                <Link
                  href="/"
                  className="block w-full py-4 text-lg font-semibold tracking-wide rounded-3xl border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white active:bg-neutral-900 transition-all text-center"
                >
                  Back Home
                </Link>
              </div>
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

export default function MomEasterEggPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MomEasterEggContent />
    </Suspense>
  );
}