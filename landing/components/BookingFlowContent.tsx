"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { FlowBrandingHeader } from '@/components/FlowBrandingHeader';
import { BookingPreviewLayout } from '@/components/BookingPreviewLayout';

import { BookingZipSuccess } from '@/components/BookingZipSuccess';
import {
  buildBookingSearchParams,
  isSamePathQuery,
  screensChoiceToReinstallFee,
} from '@/components/bookingFlowParams';
import { bookingFlowHref } from '@/lib/easterEggZips';
import { clampWindowCount, getMinWindows } from '@/components/zipRegistry';
import { useMomEasterEggRedirect } from '@/hooks/useMomEasterEggRedirect';
import { MOM_EASTER_EGG_ZIP } from '@/lib/easterEggZips';
import { BackHomeLink } from '@/components/BackHomeLink';
import { FlowFooter } from '@/components/FlowFooter';
import { readPreviewSlot, writePreviewSlot } from '@/lib/previewSlotStorage';

type BookingFlowContentProps = {
  basePath: '/booking' | '/booking/mom';
};

export function BookingFlowContent({ basePath }: BookingFlowContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMomFlow = basePath === '/booking/mom';
  const rawZip = searchParams.get('zip');
  const momRedirecting = useMomEasterEggRedirect(isMomFlow ? null : rawZip);
  const zip = isMomFlow ? MOM_EASTER_EGG_ZIP : rawZip || '95060';
  const windowsParam = searchParams.get('windows') || String(getMinWindows(zip));
  const initialWindows = clampWindowCount(zip, parseInt(windowsParam, 10) || getMinWindows(zip));

  const [windowCount, setWindowCount] = useState(initialWindows);
  const [qualifierCode, setQualifierCode] = useState('');
  const [showQualifier, setShowQualifier] = useState(false);
  const [showScreensModal, setShowScreensModal] = useState(false);
  const [screensChoice, setScreensChoice] = useState<'outside' | 'fee' | 'decide' | ''>('');
  const slotFromUrl = searchParams.get('slot');
  const previewSlot = slotFromUrl ?? readPreviewSlot();

  useEffect(() => {
    if (momRedirecting) return;
    setWindowCount(initialWindows);
  }, [initialWindows, momRedirecting]);

  useEffect(() => {
    if (momRedirecting) return;
    setShowQualifier(false);
    setShowScreensModal(false);
    setScreensChoice('');
  }, [zip, momRedirecting]);

  useEffect(() => {
    if (slotFromUrl) writePreviewSlot(slotFromUrl);
  }, [slotFromUrl]);

  if (momRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Redirecting…
      </div>
    );
  }

  const replaceBookingQuery = useCallback(
    (overrides: {
      windows?: number;
      qualifier?: string;
      slot?: string | null;
    }) => {
      const params = buildBookingSearchParams({
        zip,
        windows: overrides.windows ?? windowCount,
        qualifier: overrides.qualifier ?? qualifierCode,
        flow: '30s',
        slot: overrides.slot ?? previewSlot ?? undefined,
      });
      const href = bookingFlowHref(basePath, '', params);
      if (typeof window !== 'undefined') {
        const current = `${window.location.pathname}${window.location.search}`;
        if (isSamePathQuery(current, href)) return;
      }
      router.replace(href, { scroll: false });
    },
    [zip, windowCount, qualifierCode, previewSlot, basePath, router]
  );

  const updateWindowCount = useCallback(
    (count: number) => {
      const next = clampWindowCount(zip, count);
      setWindowCount(next);
      replaceBookingQuery({ windows: next });
    },
    [zip, replaceBookingQuery]
  );

  const bookingQuery = (extra?: {
    screenReinstall?: boolean;
    screensChoice?: typeof screensChoice;
    slot?: string | null;
  }) =>
    buildBookingSearchParams({
      zip,
      windows: windowCount,
      screenReinstall: extra?.screenReinstall,
      screensChoice: extra?.screensChoice,
      qualifier: qualifierCode,
      flow: '30s',
      slot: extra?.slot ?? previewSlot ?? undefined,
    });

  const syncPreviewSlot = useCallback(
    (slot: string | null) => {
      writePreviewSlot(slot);
      if (slot === slotFromUrl) return;
      replaceBookingQuery({ slot });
    },
    [slotFromUrl, replaceBookingQuery]
  );

  const handleConfirm = () => {
    if (!screensChoice) return;
    const screenReinstall = screensChoiceToReinstallFee(screensChoice);
    router.push(
      bookingFlowHref(
        basePath,
        'address',
        bookingQuery({ screenReinstall, screensChoice, slot: previewSlot })
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <BookingPreviewLayout
          windowCount={windowCount}
          minWindows={getMinWindows(zip)}
          previewSlot={previewSlot}
          onWindowCountChange={updateWindowCount}
          onSlotChange={syncPreviewSlot}
          showMomLovePanel={isMomFlow}
        >
          <div className="cream-module">
            <FlowBrandingHeader
              currentZip={zip}
              windows={windowCount}
              bookingPath={basePath}
              showZipButtons={!isMomFlow}
            />

            {!showQualifier ? (
              <BookingZipSuccess
                zip={zip}
                isMomFlow={isMomFlow}
                onStartBooking={() => setShowQualifier(true)}
                explainHref={`/explain?${bookingQuery()}`}
              />
            ) : (
              <div className="space-y-4">
                  <div className="relative group space-y-3 text-center cursor-help rounded-xl px-1 py-1">
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[60] w-[min(100%,320px)] text-[11px] leading-snug bg-neutral-900 text-white px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100 text-left">
                      I am booking now for some standard style 1st or 2nd story windows that are ready now for a 30 Second Booking! I understand that your professional water fed pole EXTERIOR window cleaning technicians are so good, despite using only purified water, that the perfection is GUARANTEED.
                    </span>
                    <div className="text-base font-semibold tracking-tight">
                      POWER USER 30 Second Booking!
                    </div>
                    <p className="text-[11px] leading-snug text-neutral-500">
                      Please Read Carefully and confirm below:
                    </p>
                    <p className="text-base font-medium leading-snug">
                      I confirm that these windows that I am booking now, are some standard 1st or 2nd story residential windows with direct access from below. I do not have to add any more windows but I may if time permits.
                    </p>
                    <ul className="text-[11px] leading-snug text-neutral-500 text-left list-disc pl-4 space-y-1">
                      <li>Free screen cleaning, optional screen reinstallation fee of $2/window</li>
                      <li>Interiors may be added if time permits</li>
                      <li>full house free-estimates given while on site</li>
                      <li>I promise to be home &amp; understand 2 windows free if worker 15m late</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowScreensModal(true)}
                      className="flex-1 py-4 px-2 text-sm font-semibold leading-snug text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
                    >
                      Yes, lets see the schedule!
                    </button>
                    <Link
                      href={`/explain?${bookingQuery()}`}
                      className="flex-1 py-4 px-2 text-sm font-medium leading-snug text-center rounded-3xl border-2 border-[#0f766e] text-[#0f766e] active:bg-emerald-50 flex items-center justify-center"
                    >
                      Please explain more first ..
                    </Link>
                  </div>

                  <button
                    onClick={() => setShowQualifier(false)}
                    className="w-full text-sm text-neutral-500 py-2"
                  >
                    ← Back
                  </button>
                  <BackHomeLink />
              </div>
            )}
          </div>
        </BookingPreviewLayout>

        {showScreensModal && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-8 px-4"
            onClick={() => {
              setShowScreensModal(false);
              setScreensChoice('');
            }}
          >
            <div
              className="w-full max-w-md bg-cream rounded-3xl border border-neutral-200 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm font-semibold text-neutral-500">Ok one more step</div>
                <button
                  onClick={() => {
                    setShowScreensModal(false);
                    setScreensChoice('');
                  }}
                  className="text-2xl leading-none text-neutral-400 hover:text-neutral-600 px-1"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="text-[15px] leading-snug text-neutral-800 space-y-3">
                <div>
                  <div className="font-semibold mb-1">
                    Screens Info: I understand my screens will be washed and dried for free with one of these requirements (check one)
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="screensChoice"
                        value="outside"
                        checked={screensChoice === 'outside'}
                        onChange={() => setScreensChoice('outside')}
                        className="mt-1 accent-[#0f766e]"
                      />
                      <span className="text-sm">
                        I will have them outside and ready for wash when the tech is finished with windows
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="screensChoice"
                        value="fee"
                        checked={screensChoice === 'fee'}
                        onChange={() => setScreensChoice('fee')}
                        className="mt-1 accent-[#0f766e]"
                      />
                      <span className="text-sm">
                        I will need to pay a{' '}
                        <span className="relative inline-block group bg-amber-100 px-0.5 rounded font-medium text-neutral-900 cursor-help underline decoration-amber-600 decoration-dotted">
                          $2 fee
                          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-[60] w-[270px] text-[11px] leading-snug bg-neutral-900 text-white px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100">
                            The technition is happy to teach you the proper way to remove and reinstall them for future visits and save this charge!
                          </span>
                        </span>{' '}
                        and let the tech inside the home briefly to remove the second level screens before the window cleaning, and then at the end of the cleaning, back inside briefly to put them back in.
                      </span>
                    </label>
                    <div className="text-red-600 text-xs pl-6 -mt-1">
                      (warning most screens have hidden springs that require compression in order to remove the screen without damage)
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="screensChoice"
                        value="decide"
                        checked={screensChoice === 'decide'}
                        onChange={() => setScreensChoice('decide')}
                        className="mt-1 accent-[#0f766e]"
                      />
                      <span className="text-sm">
                        I clearly understand but I will decide when the technician gets here OR I just have no screens.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {!screensChoice && (
                <p className="text-center text-[11px] text-red-600 mt-3 mb-0.5">
                  Select one screens option above to proceed
                </p>
              )}
              <button
                onClick={handleConfirm}
                disabled={!screensChoice}
                className={`mt-1 block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58] ${!screensChoice ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Confirm — I understand (exterior only)
              </button>

              <div className="mt-2 space-y-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowScreensModal(false);
                    setScreensChoice('');
                  }}
                  className="w-full text-xs text-neutral-500 hover:text-neutral-700 py-2"
                >
                  ← Back to question
                </button>
                <Link
                  href={`/explain?${bookingQuery()}`}
                  onClick={() => {
                    setShowScreensModal(false);
                    setScreensChoice('');
                  }}
                  className="block w-full text-xs text-neutral-500 hover:text-neutral-700 py-2 text-center"
                >
                  ← More info first please
                </Link>
                <Link
                  href="/"
                  onClick={() => {
                    setShowScreensModal(false);
                    setScreensChoice('');
                  }}
                  className="block w-full text-xs text-neutral-500 hover:text-neutral-700 py-2 text-center"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <FlowFooter />
    </div>
  );
}