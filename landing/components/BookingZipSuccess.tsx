"use client";

import Link from "next/link";
import { getZipInfo, isPartialCoverage, getSuccessHeadline } from "./zipRegistry";
import { useMomEasterEggRedirect } from "@/hooks/useMomEasterEggRedirect";
import { isMomEasterEggZip, MOM_EASTER_EGG_HEADLINE } from "@/lib/easterEggZips";
import { BookingCoverageNotesPanel } from "./BookingCoverageNotesPanel";
import { PartialCoverageDetailsBox } from "./PartialCoverageDetailsBox";
import { MomLovePanel } from "./MomLovePanel";


type BookingZipSuccessProps = {
  zip: string;
  isMomFlow?: boolean;
  onStartBooking: () => void;
  explainHref: string;
};

export function BookingZipSuccess({
  zip,
  isMomFlow = false,
  onStartBooking,
  explainHref,
}: BookingZipSuccessProps) {
  const momRedirecting = useMomEasterEggRedirect(isMomFlow ? null : zip);
  const zipInfo = getZipInfo(zip);
  const isMomZip = isMomFlow || isMomEasterEggZip(zip);
  const isPartial = isMomZip ? true : isPartialCoverage(zip);
  const explanation = zipInfo?.explanation ?? "";

  if (momRedirecting) {
    return (
      <div className="text-center text-sm text-neutral-500 py-4">Redirecting…</div>
    );
  }

  if (!zipInfo && !isMomZip) {
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
          {isMomZip ? MOM_EASTER_EGG_HEADLINE : getSuccessHeadline(zip)}
        </p>
      </div>

      {isMomZip && (
        <div className="md:hidden">
          <MomLovePanel />
        </div>
      )}

      {isPartial && explanation && !isMomZip && (
        <PartialCoverageDetailsBox details={explanation} />
      )}

      <div className="flex gap-3">
        <button
          onClick={onStartBooking}
          type="button"
          className="flex-1 py-4 px-2 text-sm font-semibold leading-snug text-center rounded-3xl bg-[#0f766e] text-white hover:bg-[#0c5f58] active:bg-[#0a524c] shadow-lg shadow-emerald-900/20 transition-all"
        >
          Start 30 Second Booking
        </button>

        <Link
          href={explainHref}
          className="flex-1 py-4 px-2 text-sm font-medium leading-snug text-center rounded-3xl border-2 border-[#0f766e] text-[#0f766e] active:bg-emerald-50 flex items-center justify-center"
        >
          Please explain more first ..
        </Link>
      </div>

      <BookingCoverageNotesPanel />
    </div>
  );
}