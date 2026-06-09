"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getZipInfo, isPartialCoverage, getExampleZip, getMinWindows, getSuccessHeadline } from "./zipRegistry";
import { calculateWindowBase, formatPriceAmount } from "./windowPricing";
import { WindowQualifierDisclaimer } from "./WindowQualifierDisclaimer";

export function ZipChecker({ 
  onZipChange, 
  forcedSuccess, 
  onClearForced,
  windowCount = 1,
  onSetWindowCount
}: { 
  onZipChange?: (zip: string) => void; 
  forcedSuccess?: string | null; 
  onClearForced?: () => void;
  windowCount?: number;
  onSetWindowCount?: (n: number) => void;
} = {}) {
  const router = useRouter();
  const exampleZip = getExampleZip();
  const [zipCode, setZipCode] = useState(exampleZip);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (forcedSuccess) {
      setZipCode(forcedSuccess);
      setIsSuccess(true);
      onZipChange?.(forcedSuccess);
      onSetWindowCount?.(getMinWindows(forcedSuccess));
    }
  }, [forcedSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidZip = /^\d{5}$/.test(zipCode.trim());

  const zipInfo = getZipInfo(zipCode);
  const isPartial = isPartialCoverage(zipCode);
  const partialExplanation = zipInfo?.explanation ?? "";

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();

    onZipChange?.(zipCode);
    onClearForced?.();

    if (!isValidZip) return;

    setIsChecking(true);

    // Brief delay, then go straight to the single-module booking page
    const min = getMinWindows(zipCode.trim());
    onSetWindowCount?.(Math.max(windowCount, min));

    setTimeout(() => {
      const count = Math.max(windowCount, min);
      router.push(`/booking?zip=${zipCode.trim()}&windows=${count}`);
    }, 180);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZipCode(value);
    onZipChange?.(value);
    onClearForced?.();
  };

  const SuccessView = ({
    zip,
    isPartial,
    explanation,
    onReset,
    windowCount = 1,
    onSetWindowCount,
  }: {
    zip: string;
    isPartial: boolean;
    explanation?: string;
    onReset: () => void;
    windowCount?: number;
    onSetWindowCount?: (n: number) => void;
  }) => {
    const minWindows = getMinWindows(zip);
    const subtotal = calculateWindowBase(windowCount);

    return (
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
      {isPartial && explanation && <p className="text-sm text-neutral-700">{explanation}</p>}

      {/* Window count selector + price info (for passing to next module) */}
      {onSetWindowCount && (
        <div className="text-center">
          <div className="text-sm text-neutral-600 mb-1">Number of standard windows</div>
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => onSetWindowCount(Math.max(minWindows, windowCount - 1))} 
              className="w-8 h-8 rounded-full border text-lg font-bold active:bg-neutral-100"
            >
              −
            </button>
            <div className="text-2xl font-semibold w-10 text-center">{windowCount}</div>
            <button 
              onClick={() => onSetWindowCount(windowCount + 1)} 
              className="w-8 h-8 rounded-full border text-lg font-bold active:bg-neutral-100"
            >
              +
            </button>
          </div>
          <div className="text-lg font-semibold text-neutral-900 mt-2">{formatPriceAmount(subtotal)}</div>
          <WindowQualifierDisclaimer className="mt-2" />
        </div>
      )}

      <Link
        href={`/booking?zip=${zipCode}&windows=${windowCount}`}
        className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center"
      >
        Start 30 Second Booking
      </Link>

      <p className="text-sm text-neutral-600 pt-1">
        30 Second Booking!
      </p>
    </div>
  );
  };

  return (
    <div className="w-full max-w-md mx-auto">
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
            setIsSuccess(false);
            setZipCode("");
            onZipChange?.("");
            onClearForced?.();
          }}
          windowCount={windowCount}
          onSetWindowCount={onSetWindowCount}
        />
      ) : (
        <div className="space-y-5 text-center pt-1">
          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-50 px-5 py-3 border border-amber-100 text-amber-800">
            Not yet covered in your area. Coming soon!
          </div>

          <button
            onClick={() => {
              setIsSuccess(false);
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
