"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildBookingEntryHref } from "@/components/bookingFlowParams";
import { getSuccessZips } from "./zipRegistry";

type HomeBrandingChromeProps = {
  onOpenVideo: () => void;
};

export function HomeBrandingChrome({ onOpenVideo }: HomeBrandingChromeProps) {
  const router = useRouter();
  const successZips = getSuccessZips();

  return (
    <>
      <div className="relative mb-4">
        <img
          src="/ll.jpg"
          alt="Ladderless Windows"
          className="w-full h-auto object-contain rounded-3xl"
        />
        <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex flex-nowrap gap-0.5">
          {successZips.map((zip) => (
            <button
              key={zip}
              type="button"
              onClick={() => router.push(buildBookingEntryHref(zip))}
              className="flex-1 min-w-0 text-[8px] leading-none px-0.5 py-0.5 border border-emerald-100 rounded bg-emerald-50/95 active:bg-emerald-100 text-emerald-700 backdrop-blur-[1px]"
            >
              {zip}
            </button>
          ))}
        </div>
        <button
          onClick={onOpenVideo}
          title="But how?!"
          className="hidden md:block absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-300 text-black text-[10px] font-bold flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          How?
        </button>
        <Link
          href="/explain"
          title="About Ladderless"
          className="hidden md:flex absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-950 text-white text-[10px] font-bold items-center justify-center shadow-sm active:scale-95 transition"
        >
          about
        </Link>
      </div>

      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={onOpenVideo}
          title="But how?!"
          className="w-8 h-8 rounded-full bg-amber-300 text-black text-[10px] font-bold flex items-center justify-center border border-amber-200 active:bg-amber-400 active:scale-95 transition"
        >
          How?
        </button>
        <Link
          href="/explain"
          title="About Ladderless"
          className="w-8 h-8 rounded-full bg-neutral-950 text-white text-[10px] font-bold flex items-center justify-center border border-neutral-800 active:bg-black active:scale-95 transition"
        >
          about
        </Link>
      </div>
    </>
  );
}