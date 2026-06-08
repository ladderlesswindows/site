"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import BookingSummary from '@/components/BookingSummary';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zip = searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const initialWindows = parseInt(windowsParam, 10);

  const [windowCount, setWindowCount] = useState(initialWindows);
  const [screenReinstall, setScreenReinstall] = useState(true);
  const [qualifierCode, setQualifierCode] = useState("");
  const [showNoPath, setShowNoPath] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showScreens, setShowScreens] = useState(false);
  const [screensChoice, setScreensChoice] = useState<"outside" | "fee" | "decide" | "">("");

  // POWER USER 30 Second Booking question text (exact per user)
  const questionText = `POWER USER 30 Second Booking!
Please Read Carefully and confirm below: I have windows under 25' (2 stories) without too much tree/bushes below them, that are ready now for a 30 Second Booking! I understand that your professional water fed pole exterior window cleaning technicians are so good, despite using only purified water, that the perfection is GUARANTEED and includes a free screen washing. These are pretty much standard residential windows so your pro should have no problem!`;

  const handleConfirm = () => {
    if (!screensChoice) return;
    const href = `/booking/address?zip=${zip}&windows=${windowCount}&screenReinstall=${screenReinstall}&qualifier=${encodeURIComponent(qualifierCode)}&flow=30s`;
    router.push(href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          {/* same branding section above */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-6">
            {/* quick zip success buttons (desktop) + marketing (but on this page the top is for nav) */}
            <div className="mb-2">
              <div className="hidden md:block">
                <div className="flex justify-between">
                  {/* Simplified top buttons for this module - just show current or key ones for look */}
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

          {/* Interactive summary box (with qualifier support for special pricing like STACEY at $12/window).
             User can still adjust window count, screen reinstall, and qualifier code here (example placeholder: Ladderless5).
             The Yes link carries live values + flow=30s so the following page shows the same box. */}
          <div className="mb-6">
            <BookingSummary
              zip={zip}
              windows={windowCount}
              screenReinstall={screenReinstall}
              onWindowsChange={setWindowCount}
              onScreenReinstallChange={setScreenReinstall}
              qualifierCode={qualifierCode}
              onQualifierChange={setQualifierCode}
              specialZeroPrice={false}
            />
          </div>

          {/* 30 second path qualifier box */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
            {!showNoPath ? (
              <>
                <div className="text-base font-medium leading-snug mb-4 whitespace-pre-line">
                  {questionText}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowNoPath(true)}
                    className="flex-1 py-4 text-lg font-semibold text-center rounded-3xl border-2 border-neutral-950 active:bg-neutral-100"
                  >
                    No
                  </button>
                </div>

                <Link
                  href={`/explain?zip=${zip}&windows=${windowCount}&screenReinstall=${screenReinstall}&qualifier=${encodeURIComponent(qualifierCode)}&flow=30s`}
                  className="mt-2 block w-full py-3 text-base font-medium text-center rounded-3xl border border-[#0f766e] text-[#0f766e] active:bg-emerald-50"
                >
                  Please explain more first ..
                </Link>
              </>
            ) : (
              <div>
                <div className="text-sm text-neutral-600 mb-2">
                  For ZIP <span className="font-semibold">{zip}</span> • {windowCount} window{windowCount > 1 ? 's' : ''} (see summary above for options)
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  Thank you. Your situation requires a few more details for the best service or a custom quote.
                </p>
                <Link
                  href={`/location?zip=${zip}&windows=${windowCount}&qualifier=${encodeURIComponent(qualifierCode)}&flow=custom`}
                  className="block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
                >
                  Continue to Address for Custom Quote
                </Link>
                <button 
                  onClick={() => setShowNoPath(false)} 
                  className="w-full text-sm text-neutral-500 py-2 mt-2"
                >
                  ← Back to question
                </button>
              </div>
            )}
          </div>

          {/* Confirmation popup after Yes on the PowerUser 30s page.
              Uses exact statement text provided. On confirm, goes to /booking/address (preserves 30s + special address flow). */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-8 px-4" onClick={() => { setShowConfirm(false); setShowScreens(false); setScreensChoice(""); }}>
              <div
                className="w-full max-w-md bg-cream rounded-3xl border border-neutral-200 shadow-2xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-semibold text-neutral-500">Ladderless 30-Second Booking</div>
                  <button
                    onClick={() => { setShowConfirm(false); setShowScreens(false); setScreensChoice(""); }}
                    className="text-2xl leading-none text-neutral-400 hover:text-neutral-600 px-1"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="text-[15px] leading-snug text-neutral-800 space-y-3">
                  {!showScreens ? (
                    <>
                      <p>
                        Success! These Windows Qualify as "Ladderless" because they can be done with modern Water-Fed-Pole technicians and/or squeegee w/o tall ladder. They are priced at the lowest affordable rate for the area, with premium screen cleaning free,{' '}
                        <span className="relative inline-block group bg-amber-100 px-1 py-0.5 rounded font-medium text-neutral-900 cursor-help underline decoration-amber-600 decoration-dotted">
                          and the interiors MAY be able to be added for the same rate if desired, and 33% off in winter session!
                          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[60] w-[270px] text-xs leading-snug bg-neutral-900 text-white px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100">
                            Interior available until July 4, reopens for 2 weeks only before Labor Day, and opens for winter Oct 15-memorial day, every year
                          </span>
                        </span>
                      </p>

                      <p>
                        Please Confirm you understand this initial tech will only be cleaning EXTERIOR of the windows,{' '}
                        <span className="relative inline-block group bg-amber-100 px-1 py-0.5 rounded font-medium text-neutral-900 cursor-help underline decoration-amber-600 decoration-dotted">
                          (Unless you add Interiors and the tech has time)
                          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[60] w-[300px] text-xs leading-snug bg-neutral-900 text-white px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100">
                            During Interior-available periods, you and your tech may add interior if you both agree to do that, but all transactions are required to be done in the app including tips please. Cash transactions for window services are not permitted
                          </span>
                        </span>
                        and cannot do high-risk or high liability work (like working from parts of slanted roof) on this visit. If you prefer to have technicians that can do anything, like Spiderman, on any house, Please use the VIP Exterior Cleaning company we are showcasing on the homepage.
                      </p>

                      <div className="pt-1 text-[11px] leading-tight text-neutral-500 border-t border-neutral-100 mt-2">
                        Ladderless, and this software, is a new pop-up brand by a Santa Cruz local who has run Shark SoftWash and Simple Window Cleaning in the past. All work is GUARANTEED 100% Satisfaction, and Reservations only Authorize funds until work is satisfactorily completed. SimpleWindowCleaning@gmail.com for any questions.
                      </div>

                      <button
                        onClick={() => setShowScreens(true)}
                        className="mt-4 block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
                      >
                        Sounds Great
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="pt-3 border-t border-neutral-100">
                        <div className="font-semibold mb-1">Screens Info: I understand my screens will be washed and dried for free with one of these requirements (check one)</div>
                        <div className="space-y-2">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="screensChoice"
                              value="outside"
                              checked={screensChoice === "outside"}
                              onChange={() => setScreensChoice("outside")}
                              className="mt-1 accent-[#0f766e]"
                            />
                            <span className="text-sm">I will have them outside and ready for wash when the tech is finished with windows</span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="screensChoice"
                              value="fee"
                              checked={screensChoice === "fee"}
                              onChange={() => setScreensChoice("fee")}
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
                              checked={screensChoice === "decide"}
                              onChange={() => setScreensChoice("decide")}
                              className="mt-1 accent-[#0f766e]"
                            />
                            <span className="text-sm">I clearly understand but I will decide when the technician gets here OR I just have no screens.</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] leading-tight text-neutral-500 border-t border-neutral-100 mt-2">
                        Ladderless, and this software, is a new pop-up brand by a Santa Cruz local who has run Shark SoftWash and Simple Window Cleaning in the past. All work is GUARANTEED 100% Satisfaction, and Reservations only Authorize funds until work is satisfactorily completed. SimpleWindowCleaning@gmail.com for any questions.
                      </div>
                    </>
                  )}
                </div>

                {showScreens && (
                  <>
                    {!screensChoice && (
                      <p className="text-center text-[11px] text-red-600 mt-3 mb-0.5">Select one screens option above to proceed</p>
                    )}
                    <button
                      onClick={handleConfirm}
                      disabled={!screensChoice}
                      className={`mt-1 block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58] ${!screensChoice ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      Confirm — I understand (exterior only)
                    </button>
                  </>
                )}

                <button
                  onClick={() => { setShowConfirm(false); setShowScreens(false); setScreensChoice(""); }}
                  className="mt-2 w-full text-xs text-neutral-500 py-2"
                >
                  ← Back to question
                </button>
              </div>
            </div>
          )}
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

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
