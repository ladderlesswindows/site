import Link from "next/link";
import { buildBookingEntryHref } from "@/components/bookingFlowParams";
import { getSuccessZips } from "./zipRegistry";

type FlowBrandingHeaderProps = {
  currentZip: string;
  windows?: number;
  bookingPath?: string;
  showZipButtons?: boolean;
};

export function FlowBrandingHeader({
  currentZip,
  windows = 1,
  bookingPath = "/booking",
  showZipButtons = true,
}: FlowBrandingHeaderProps) {
  const successZips = getSuccessZips();

  const zipButtonClass = (isActive: boolean) =>
    `flex-1 min-w-0 text-center text-[8px] leading-none px-0.5 py-0.5 border rounded active:bg-emerald-100 ${
      isActive
        ? "border-emerald-600 bg-emerald-100 text-emerald-800 font-semibold"
        : "border-emerald-100 bg-emerald-50 text-emerald-700"
    }`;

  return (
    <>
      {showZipButtons && (
        <div className="flex flex-nowrap gap-0.5 mb-2">
          {successZips.map((zip) => {
            const isActive = zip === currentZip;
            return (
              <Link
                key={zip}
                href={
                  bookingPath === "/booking"
                    ? buildBookingEntryHref(zip, windows)
                    : `${bookingPath}?zip=${zip}&windows=${windows}`
                }
                className={zipButtonClass(isActive)}
              >
                {zip}
              </Link>
            );
          })}
        </div>
      )}

      {/* Narrow banner placeholder — swap for photo later */}
      <div className="w-full h-10 mb-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">
        <span className="text-[10px] font-extrabold tracking-[4px] text-neutral-800">
          LADDERLESS
        </span>
      </div>
    </>
  );
}