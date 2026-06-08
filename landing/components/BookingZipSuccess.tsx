"use client";

import Link from "next/link";
import { getZipInfo, isPartialCoverage, getMinWindows, getSuccessHeadline } from "./zipRegistry";
import { calculateWindowBase, formatPriceAmount, formatWindowPrice } from "./windowPricing";
import { WindowQualifierDisclaimer } from "./WindowQualifierDisclaimer";

type BookingZipSuccessProps = {
  zip: string;
  windowCount: number;
  onWindowCountChange: (count: number) => void;
  onStartBooking: () => void;
  explainHref: string;
};

export function BookingZipSuccess({
  zip,
  windowCount,
  onWindowCountChange,
  onStartBooking,
  explainHref,
}: BookingZipSuccessProps) {
  const zipInfo = getZipInfo(zip);
  const isPartial = isPartialCoverage(zip);
  const explanation = zipInfo?.explanation ?? "";
  const minWindows = getMinWindows(zip);
  const subtotal = calculateWindowBase(windowCount);

  if (!zipInfo) {
    return (
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-50 px-5 py-3 border border-amber-100 text-amber-800">
          Not yet covered in your area. Coming soon!
        </div>
        <Link
          href="/"
          className="block w-full py-4 text-lg font-semibold tracking-wide rounded-3xl border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white active:bg-neutral-900 transition-all text-center"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
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

      {isPartial && explanation && (
        <p className="text-sm text-neutral-700 text-left">{explanation}</p>
      )}

      <div className="text-center">
        <div className="text-sm text-neutral-600 mb-1">Number of standard windows</div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onWindowCountChange(Math.max(minWindows, windowCount - 1))}
            className="w-8 h-8 rounded-full border text-lg font-bold active:bg-neutral-100"
            type="button"
          >
            −
          </button>
          <div className="text-2xl font-semibold w-10 text-center">{windowCount}</div>
          <button
            onClick={() => onWindowCountChange(windowCount + 1)}
            className="w-8 h-8 rounded-full border text-lg font-bold active:bg-neutral-100"
            type="button"
          >
            +
          </button>
        </div>
        <div className="text-lg font-semibold text-neutral-900 mt-2">{formatPriceAmount(subtotal)}</div>
        <div className="text-sm text-neutral-600 mt-1">{formatWindowPrice()}</div>
        <WindowQualifierDisclaimer className="mt-2" />
      </div>

      <button
        onClick={onStartBooking}
        type="button"
        className="block w-full py-5 text-xl font-semibold tracking-wide rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all text-center"
      >
        Start 30 Second Booking
      </button>

      <Link
        href={explainHref}
        className="block w-full py-3 text-base font-medium text-center rounded-3xl border border-[#0f766e] text-[#0f766e] active:bg-emerald-50"
      >
        Please explain more first ..
      </Link>

      <Link href="/" className="block w-full text-sm text-neutral-500 py-2">
        ← Back
      </Link>
    </div>
  );
}