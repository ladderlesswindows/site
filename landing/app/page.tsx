"use client";

import { useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import CoverageModule from "@/components/CoverageModule";

export default function LadderlessLanding() {
  const [showVideo, setShowVideo] = useState(false);

  const openVideo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          {/* branding module: logo + "How?" marketing button (generic, not coverage-specific) */}
          <div className="border border-neutral-200 rounded-3xl p-2 mb-6">
            {/* only the logo */}
            <div className="relative flex justify-center mb-4">
              <img
                src="/ll.jpg"
                alt="Ladderless Windows"
                className="w-full h-auto object-contain rounded-3xl"
              />
              {/* Floating circular "How?" button on left of logo (desktop only) */}
              <button
                onClick={openVideo}
                title="But how?!"
                className="hidden md:block absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-300 text-black text-[10px] font-bold flex items-center justify-center shadow-sm active:scale-95 transition"
              >
                How?
              </button>
              {/* Future: interior offer callout */}
            </div>
            {/* Mobile: marketing button in the top area */}
            <div className="md:hidden flex justify-start mb-2">
              <button
                onClick={openVideo}
                title="But how?!"
                className="w-8 h-8 rounded-full bg-amber-300 text-black text-[10px] font-bold flex items-center justify-center border border-amber-200 active:bg-amber-400 active:scale-95 transition"
              >
                How?
              </button>
              {/* TODO: later "Now offering interior too!" on right */}
            </div>
          </div>

          {/* coverage module — the swappable part for different locations (e.g. Gilroy) */}
          <CoverageModule />

          {/* Subtle trust line - floating, no box */}
          <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
            Fully Insured • Vetted Technicians • Satisfaction Guaranteed
          </p>

          {/* Very tiny admin link at the bottom of the home page */}
          <div className="mt-6 text-center">
            <Link href="/admin/bookings" className="text-[9px] text-neutral-400 hover:text-neutral-600 tracking-wide">
              admin
            </Link>
          </div>

          {/* Video modal for "But how?!" */}
          {showVideo && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={closeVideo}
            >
              <div
                className="relative w-full max-w-2xl rounded-xl bg-white overflow-hidden"
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
