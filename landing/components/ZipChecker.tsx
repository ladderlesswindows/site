"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getZipInfo, isPartialCoverage, getExampleZip, getMinWindows, getSuccessHeadline } from "./zipRegistry";
import {
  isMomEasterEggZip,
  MOM_EASTER_EGG_PATH,
  MOM_EASTER_EGG_ZIP,
} from "@/lib/easterEggZips";
import { PartialCoverageDetailsBox } from "./PartialCoverageDetailsBox";
import { BookingPreviewLayout } from "./BookingPreviewLayout";
import { readPreviewSlot, writePreviewSlot } from "@/lib/previewSlotStorage";


function MomZipRedirect() {
  useEffect(() => {
    window.location.assign(`${MOM_EASTER_EGG_PATH}?zip=${MOM_EASTER_EGG_ZIP}`);
  }, []);
  return (
    <div className="text-center text-sm text-neutral-500 py-4">Redirecting…</div>
  );
}

export function ZipChecker({ 
  onZipChange, 
  forcedSuccess, 
  onClearForced,
  windowCount = 1,
  onSetWindowCount,
  onSuccessChange,
}: { 
  onZipChange?: (zip: string) => void; 
  forcedSuccess?: string | null; 
  onClearForced?: () => void;
  windowCount?: number;
  onSetWindowCount?: (n: number) => void;
  onSuccessChange?: (isSuccess: boolean) => void;
} = {}) {
  const router = useRouter();
  const exampleZip = getExampleZip();
  const [zipCode, setZipCode] = useState(exampleZip);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [previewSlot, setPreviewSlot] = useState<string | null>(() => readPreviewSlot());

  const setSuccess = useCallback(
    (next: boolean) => {
      setIsSuccess(next);
      onSuccessChange?.(next);
    },
    [onSuccessChange]
  );

  useEffect(() => {
    if (forcedSuccess) {
      setZipCode(forcedSuccess);
      setSuccess(true);
      onZipChange?.(forcedSuccess);
      onSetWindowCount?.(getMinWindows(forcedSuccess));
    }
  }, [forcedSuccess, setSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidZip = /^\d{5}$/.test(zipCode.trim());

  const zipInfo = getZipInfo(zipCode);
  const isPartial = isPartialCoverage(zipCode);
  const partialExplanation = zipInfo?.explanation ?? "";

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();

    onZipChange?.(zipCode);
    onClearForced?.();

    if (!isValidZip) return;

    const trimmed = zipCode.trim();
    if (isMomEasterEggZip(trimmed)) {
      window.location.assign(`${MOM_EASTER_EGG_PATH}?zip=${MOM_EASTER_EGG_ZIP}`);
      return;
    }

    setIsChecking(true);

    // Brief delay, then go straight to the single-module booking page
    const min = getMinWindows(trimmed);
    onSetWindowCount?.(Math.max(windowCount, min));

    setTimeout(() => {
      const count = Math.max(windowCount, min);
      const slotQuery = previewSlot ? `&slot=${encodeURIComponent(previewSlot)}` : "";
      router.push(`/booking?zip=${trimmed}&windows=${count}${slotQuery}`);
    }, 180);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZipCode(value);
    setSuccess(false);
    onZipChange?.(value);
    onClearForced?.();
  };

  const handlePreviewSlotChange = (slot: string | null) => {
    setPreviewSlot(slot);
    writePreviewSlot(slot);
  };

  const bookingHref = (zip: string, count: number) => {
    const params = new URLSearchParams({ zip, windows: String(count) });
    if (previewSlot) params.set("slot", previewSlot);
    return `/booking?${params.toString()}`;
  };

  const SuccessView = ({
    zip,
    isPartial,
    explanation,
    onReset,
  }: {
    zip: string;
    isPartial: boolean;
    explanation?: string;
    onReset: () => void;
  }) => {
    const minWindows = getMinWindows(zip);
    const count = windowCount;

    return (
      <BookingPreviewLayout
        windowCount={count}
        minWindows={minWindows}
        previewSlot={previewSlot}
        onWindowCountChange={(next) => onSetWindowCount?.(next)}
        onSlotChange={handlePreviewSlotChange}
      >
        <div className="cream-module">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-700 mb-4 text-center">
            Check if we serve your area
          </h2>

          <div className="space-y-5 text-center pt-1">
            <div className={`flex gap-2 ${isPartial ? "flex-col items-stretch" : "items-center justify-start"}`}>
              <div className={`flex gap-2.5 rounded-2xl bg-emerald-50 px-5 py-3 border border-emerald-100 ${isPartial ? "items-start text-left w-full" : "inline-flex items-center"}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-700 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className={`font-semibold text-emerald-800 ${isPartial ? "text-sm leading-snug" : "tracking-tight"}`}>
                  {getSuccessHeadline(zip)}
                </p>
              </div>
              <button
                onClick={onReset}
                className="text-xs font-medium tracking-wide text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-100 border border-emerald-100 px-3 py-1 rounded-xl transition-all flex-shrink-0 self-start"
              >
                Check different ZIP
              </button>
            </div>
            {isPartial && explanation && <PartialCoverageDetailsBox details={explanation} />}

            <Link
              href={bookingHref(zip, count)}
              className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center"
            >
              Start 30 Second Booking
            </Link>

            <p className="text-sm text-neutral-600 pt-1">30 Second Booking!</p>
          </div>
        </div>
      </BookingPreviewLayout>
    );
  };

  return (
    <div className={isSuccess ? "w-full" : "w-full max-w-md mx-auto"}>
      {!isSuccess ? (
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zipCode}
              onChange={handleZipChange}
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
      ) : zipInfo ? (
        <SuccessView
          zip={zipCode}
          isPartial={isPartial}
          explanation={partialExplanation}
          onReset={() => {
            setSuccess(false);
            setZipCode("");
            onZipChange?.("");
            onClearForced?.();
          }}
        />
      ) : isMomEasterEggZip(zipCode.trim()) ? (
        <MomZipRedirect />
      ) : (
        <div className="space-y-5 text-center pt-1">
          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-50 px-5 py-3 border border-amber-100 text-amber-800">
            Not yet covered in your area. Coming soon!
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setZipCode("");
              onZipChange?.("");
              onClearForced?.();
            }}
            className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white active:bg-neutral-900 transition-all text-center"
          >
            Back to home
          </button>
        </div>
      )}
    </div>
  );
}
