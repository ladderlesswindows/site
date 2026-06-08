"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import BookingSummary from '@/components/BookingSummary';

function LocationContent() {
  const searchParams = useSearchParams();
  const zip = searchParams.get('zip') || '95060';
  const windowsParam = searchParams.get('windows') || '1';
  const paramWindows = parseInt(windowsParam, 10);
  const screenParam = searchParams.get('screenReinstall');
  const paramScreenReinstall = screenParam === 'true' || screenParam === '1';
  const flow = searchParams.get('flow') || '';
  const is30sPath = flow === '30s';
  const qualifierParam = searchParams.get('qualifier') || '';

  // Local state so user can still tweak windows + screen option on the page that follows the 30s question.
  // For the custom/No path we keep the photo (user likes it) and use param values.
  const [windows, setWindows] = useState(paramWindows);
  const [screenReinstall, setScreenReinstall] = useState(paramScreenReinstall);
  const [qualifierCode, setQualifierCode] = useState(qualifierParam);
  const [isSpecialAddress, setIsSpecialAddress] = useState(false);

  // Full address form state for 30s checkout (fields Stripe etc. would need)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [stateAbbr, setStateAbbr] = useState("CA");
  const [zipCode, setZipCode] = useState(zip);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const streetLower = street.toLowerCase();
    const cityLower = city.toLowerCase();
    const streetMatch = streetLower.includes('121 34th') && (streetLower.includes('ave') || streetLower.includes('avenue'));
    const cityMatch = cityLower.includes('capitola');
    const match = streetMatch && cityMatch;
    setIsSpecialAddress(match);
    if (match) {
      setScreenReinstall(false);
    }
  }, [street, city]);

  const mapSrc = `/${zip}-map.jpg`;
  const mapAlt = `${zip} area map`;

  // For passing full info toward Stripe in the 30s path
  const addressSummary = [street, apt, city, stateAbbr, zipCode].filter(Boolean).join(', ');

  const handleSpecialSchedule = () => {
    const pw = prompt('Enter password');
    if (pw === 'shark') {
      window.location.href = '/admin/bookings';
    } else if (pw !== null) {
      alert('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          {/* same branding section above */}
          <div className="border border-neutral-200 rounded-3xl p-2 mb-6">
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

          {is30sPath ? (
            <>
              {/* Red policy statement on top of the checkout section, followed by tip info */}
              <div className="mb-3 text-sm">
                <span className="text-red-600 font-semibold">We have a strict policy that all transactions are done through the app.</span> There will be a chance to tip at the end and the technitions receive 100% of tips. Technitions MAY offer other services like house-cleaning etc, however.
              </div>

              <div className="flex gap-2">
                {/* Left: expanded address form + disclaimers box */}
                <div className="flex-1 space-y-3">
                  <div className="border border-neutral-200 rounded-3xl p-2">
                    <h3 className="font-semibold mb-2 text-sm">Your Details &amp; Address</h3>
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-[10px] text-neutral-500 mb-0.5">Full Name *</div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full border rounded p-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 mb-0.5">Email *</div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email for receipt"
                          className="w-full border rounded p-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 mb-0.5">Phone</div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full border rounded p-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 mb-0.5">Street Address *</div>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="123 Main St"
                          className="w-full border rounded p-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 mb-0.5">Apt / Unit (optional)</div>
                        <input
                          type="text"
                          value={apt}
                          onChange={(e) => setApt(e.target.value)}
                          placeholder="Apt 2B"
                          className="w-full border rounded p-1.5 text-sm"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="flex-1">
                          <div className="text-[10px] text-neutral-500 mb-0.5">City *</div>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full border rounded p-1.5 text-sm"
                          />
                        </div>
                        <div className="w-14">
                          <div className="text-[10px] text-neutral-500 mb-0.5">State</div>
                          <input
                            type="text"
                            value={stateAbbr}
                            onChange={(e) => setStateAbbr(e.target.value)}
                            placeholder="CA"
                            className="w-full border rounded p-1.5 text-sm"
                          />
                        </div>
                        <div className="w-16">
                          <div className="text-[10px] text-neutral-500 mb-0.5">ZIP</div>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="ZIP"
                            className="w-full border rounded p-1.5 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 mb-0.5">Access Notes</div>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Gate codes, parking, screens, etc."
                          className="w-full border rounded p-1.5 text-sm h-14"
                        />
                      </div>
                    </div>
                  </div>

                  {/* New disclaimers box for deeper understanding */}
                  <div className="border border-neutral-200 rounded-3xl p-2">
                    <h3 className="font-semibold mb-1 text-xs">Disclaimers (for deeper understanding of the visit)</h3>
                    <p className="text-[10px] text-neutral-500">
                      [Placeholder: Your disclaimers and additional details will be added here for those who want a more thorough understanding of the visit.]
                    </p>
                  </div>
                </div>

                {/* Right: subtotals with editable windows + screen charge toggle */}
                <div className="w-40 flex-shrink-0">
                  <BookingSummary
                    zip={zip}
                    windows={windows}
                    screenReinstall={screenReinstall}
                    onWindowsChange={setWindows}
                    onScreenReinstallChange={setScreenReinstall}
                    qualifierCode={qualifierCode}
                    onQualifierChange={setQualifierCode}
                    specialZeroPrice={isSpecialAddress}
                  />
                </div>
              </div>

              {isSpecialAddress ? (
                <>
                  <div className="text-center mb-3 text-sm font-medium text-emerald-700">
                    Hi John and Deb, Please Book your ideal monthly cleaning day!
                  </div>
                  <button
                    onClick={handleSpecialSchedule}
                    className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center mt-3"
                  >
                    Schedule
                  </button>
                </>
              ) : (
                <Link
                  href={`/booking/slot?zip=${zip}&windows=${windows}&screenReinstall=${screenReinstall}&qualifier=${encodeURIComponent(qualifierCode)}&name=${encodeURIComponent(fullName)}&address=${encodeURIComponent(addressSummary)}&email=${encodeURIComponent(email)}`}
                  className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center mt-3"
                >
                  Choose Time Slot
                </Link>
              )}

              <div className="text-center mt-2">
                <Link href="/" className="text-xs text-neutral-500">← Back to Coverage</Link>
              </div>
            </>
          ) : (
            <>
              <img
                src={mapSrc}
                alt={mapAlt}
                className="w-full h-auto mb-6 rounded-3xl"
              />

              {/* address / location module (kept for custom/No path) */}
              <div className="border border-neutral-200 rounded-3xl p-2">
                <div className="mb-4">
                  <div className="text-sm text-neutral-600 mb-2">
                    For ZIP <span className="font-semibold">{zip}</span> • {paramWindows} window{paramWindows > 1 ? 's' : ''} at ${paramWindows * 20} each
                  </div>
                  <h3 className="font-semibold mb-3">Your Location</h3>
                  <p className="text-sm text-neutral-600 mb-4">Please provide your service address and any access notes.</p>

                  <input type="text" placeholder="Full address" className="w-full border rounded p-2 mb-2" />
                  <input type="text" placeholder="City, State, ZIP" className="w-full border rounded p-2 mb-2" defaultValue={`${zip}`} />
                  <textarea placeholder="Access notes, gate codes, etc." className="w-full border rounded p-2 mb-2 h-20" />
                </div>

                <Link
                  href={`/booking/success?zip=${zip}&windows=${paramWindows}&screenReinstall=false`}
                  className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center"
                >
                  Continue to Real-Time Booking
                </Link>

                <div className="text-center mt-3">
                  <Link href="/" className="text-xs text-neutral-500">← Back to Coverage</Link>
                </div>
              </div>
            </>
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

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LocationContent />
    </Suspense>
  );
}
