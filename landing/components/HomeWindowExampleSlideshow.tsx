"use client";

import { useEffect, useMemo, useState } from "react";
import { getHomeWindowExampleSlides } from "@/lib/homeWindowExampleSlides";

const SLIDE_MS = 3500;

type HomeWindowExampleSlideshowProps = {
  windowCount: number;
  /** Home periphery — no cream fill (booking flow keeps cream). */
  plainSurface?: boolean;
};

/** Auto-advancing approved-window examples under the home window counter. */
export function HomeWindowExampleSlideshow({
  windowCount,
  plainSurface = false,
}: HomeWindowExampleSlideshowProps) {
  const slides = useMemo(() => getHomeWindowExampleSlides(windowCount), [windowCount]);
  const [current, setCurrent] = useState(0);
  const [available, setAvailable] = useState<boolean[]>(() => slides.map(() => true));

  useEffect(() => {
    setAvailable(slides.map(() => true));
    setCurrent(0);
  }, [slides]);

  const visibleSlides = slides.filter((_, idx) => available[idx]);

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
    const index = slides.findIndex((item) => item.src === src);
    if (index < 0) return;
    setAvailable((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const shellClass = plainSurface ? "home-side-module" : "cream-module-pad3";

  return (
    <div className={`${shellClass} mt-3`}>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-2">
        {windowCount}-window examples
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] bg-neutral-100">
        {slides.map((item, idx) =>
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