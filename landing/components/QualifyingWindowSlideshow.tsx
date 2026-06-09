"use client";

import { useEffect, useState } from "react";
import { QUALIFYING_WINDOW_SLIDES } from "@/lib/qualifyingWindowSlides";

const SLIDE_MS = 4000;

/** Auto-advancing qualifying-window slideshow for the booking success left column. */
export function QualifyingWindowSlideshow() {
  const [current, setCurrent] = useState(0);
  const [available, setAvailable] = useState<boolean[]>(() =>
    QUALIFYING_WINDOW_SLIDES.map(() => true)
  );

  const visibleSlides = QUALIFYING_WINDOW_SLIDES.filter((_, idx) => available[idx]);

  useEffect(() => {
    if (visibleSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % visibleSlides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [visibleSlides.length]);

  useEffect(() => {
    if (current >= visibleSlides.length) setCurrent(0);
  }, [current, visibleSlides.length]);

  if (visibleSlides.length === 0) return null;

  const slide = visibleSlides[current] ?? visibleSlides[0];

  const markMissing = (src: string) => {
    const index = QUALIFYING_WINDOW_SLIDES.findIndex((item) => item.src === src);
    if (index < 0) return;
    setAvailable((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  return (
    <div className="cream-module-pad3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-2">
        Qualifying windows
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-neutral-100">
        {QUALIFYING_WINDOW_SLIDES.map((item, idx) =>
          available[idx] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                item.src === slide.src ? "opacity-100" : "opacity-0"
              }`}
              onError={() => markMissing(item.src)}
            />
          ) : null
        )}

        <div
          className={`absolute inset-x-0 bottom-0 px-2 py-1.5 text-[10px] font-medium leading-snug text-white ${
            slide.qualifies ? "bg-emerald-900/75" : "bg-amber-900/80"
          }`}
        >
          {slide.caption}
        </div>
      </div>

      {visibleSlides.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {visibleSlides.map((item, idx) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Show slide ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === current ? "bg-[#0f766e] scale-125" : "bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}