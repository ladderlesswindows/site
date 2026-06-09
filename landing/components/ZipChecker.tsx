"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getExampleZip, getMinWindows } from "./zipRegistry";
import { isMomEasterEggZip, MOM_EASTER_EGG_PATH, MOM_EASTER_EGG_ZIP } from "@/lib/easterEggZips";
import { buildBookingEntryHref } from "@/components/bookingFlowParams";

type ZipCheckerProps = {
  windowCount?: number;
  onSetWindowCount?: (n: number) => void;
};

/** Home ZIP input — always sends covered zips to /booking for the shared success page */
export function ZipChecker({ windowCount = 1, onSetWindowCount }: ZipCheckerProps = {}) {
  const router = useRouter();
  const exampleZip = getExampleZip();
  const [zipCode, setZipCode] = useState(exampleZip);
  const [isChecking, setIsChecking] = useState(false);

  const isValidZip = /^\d{5}$/.test(zipCode.trim());

  const goToBooking = (zip: string) => {
    const trimmed = zip.trim();
    if (isMomEasterEggZip(trimmed)) {
      window.location.assign(`${MOM_EASTER_EGG_PATH}?zip=${MOM_EASTER_EGG_ZIP}`);
      return;
    }
    const min = getMinWindows(trimmed);
    const count = Math.max(windowCount, min);
    onSetWindowCount?.(count);
    router.push(buildBookingEntryHref(trimmed, count));
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidZip) return;
    setIsChecking(true);
    setTimeout(() => goToBooking(zipCode), 180);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <input
            id="zip"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder={exampleZip}
            aria-label="ZIP code"
            className="w-full px-5 py-4 text-2xl font-semibold tracking-[2px] text-center border-2 border-neutral-300 rounded-2xl bg-white placeholder:text-neutral-400 focus:border-[#0f766e] focus:ring-0 transition-all"
            aria-describedby="zip-help"
          />
          <p id="zip-help" className="mt-1.5 text-xs text-neutral-500 text-center tracking-wide">
            Enter your 5-digit ZIP code
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValidZip || isChecking}
          className="w-full py-4 text-lg font-semibold tracking-wide rounded-2xl bg-neutral-950 text-white disabled:bg-neutral-300 disabled:text-neutral-500 hover:bg-black active:bg-neutral-900 disabled:cursor-not-allowed shadow-sm"
        >
          {isChecking ? "Checking..." : "Check Availability"}
        </button>
      </form>
    </div>
  );
}