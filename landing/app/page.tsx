"use client";

import { useState } from "react";
import { Footer } from "@/components/Footer";
import CoverageModule from "@/components/CoverageModule";
import { coverage } from "@/components/zipRegistry";
import { HOW_VIDEO_SRC } from "@/lib/mediaUrls";

export default function LadderlessLanding() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-5 pt-12 pb-12">
        <CoverageModule onOpenVideo={() => setShowVideo(true)} />

        <div className="mx-auto w-full max-w-md mt-8">
          <p className="text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
            Fully Insured • Vetted Technicians • Satisfaction Guaranteed
          </p>

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
        </div>

        {showVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowVideo(false)}
          >
            <div
              className="relative w-full max-w-2xl rounded-xl bg-cream overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-2 right-2 z-10 rounded-full bg-black/70 px-3 py-1 text-sm text-white hover:bg-black"
              >
                Close
              </button>
              <video
                src={HOW_VIDEO_SRC}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh]"
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}