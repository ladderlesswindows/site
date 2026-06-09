"use client";

import { useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import CoverageModule from "@/components/CoverageModule";
import { getSuccessZips, coverage } from "@/components/zipRegistry";

export default function LadderlessLanding() {
  const [showVideo, setShowVideo] = useState(false);
  const [forcedZip, setForcedZip] = useState<string | null>(null);
  const successZips = getSuccessZips();

  const openVideo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          {/* branding module: logo + "How?" marketing button (generic, not coverage-specific) */}
          <div className="border border-neutral-200 rounded-3xl bg-cream p-2 mb-6">
            {/* logo with quick ZIP row overlaid inside the frame */}
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
                    onClick={() => setForcedZip(zip)}
                    className="flex-1 min-w-0 text-[8px] leading-none px-0.5 py-0.5 border border-emerald-100 rounded bg-emerald-50/95 active:bg-emerald-100 text-emerald-700 backdrop-blur-[1px]"
                  >
                    {zip}
                  </button>
                ))}
              </div>
              {/* Floating circular "How?" button on left of logo (desktop only) */}
              <button
                onClick={openVideo}
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
            {/* Mobile: How + About buttons */}
            <div className="md:hidden flex justify-between items-center mb-2">
              <button
                onClick={openVideo}
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
          </div>

          {/* coverage module — the swappable part for different locations (e.g. Gilroy) */}
          <CoverageModule
            forcedSuccess={forcedZip}
            onClearForced={() => setForcedZip(null)}
          />

          {/* Subtle trust line - floating, no box */}
          <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
            Fully Insured • Vetted Technicians • Satisfaction Guaranteed
          </p>

          {/* Very tiny admin + contact links at the bottom of the home page */}
          <div className="mt-6 text-center space-y-1">
            <button
              type="button"
              onClick={() => {
                const pw = prompt("Enter password");
                if (pw === "shark") {
                  localStorage.setItem("adminUnlocked", "true");
                  window.location.href = "/admin/bookings";
                } else if (pw !== null) {
                  alert("Incorrect password");
                }
              }}
              className="block w-full text-[9px] text-neutral-400 hover:text-neutral-600 tracking-wide"
            >
              Admin
            </button>
            <a
              href={`mailto:${coverage.contactEmail}`}
              className="block text-[9px] text-neutral-400 hover:text-neutral-600 tracking-wide"
            >
              send email to admin
            </a>
          </div>

          {/* Video modal for "But how?!" */}
          {showVideo && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={closeVideo}
            >
              <div
                className="relative w-full max-w-2xl rounded-xl bg-cream overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeVideo}
                  className="absolute top-2 right-2 z-10 rounded-full bg-black/70 px-3 py-1 text-sm text-white hover:bg-black"
                >
                  Close
                </button>
                <video
                  src="/videos/IMG_3266.MP4"
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh]"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
