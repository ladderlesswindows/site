import { HOME_REVIEWS } from "@/lib/homeReviews";

/** Fictional customer reviews — desktop home left column. */
export function HomeReviewsPanel() {
  return (
    <div className="home-side-module h-full flex flex-col">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-3">
        Customer reviews
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4">
        {HOME_REVIEWS.map((review) => (
          <article key={review.name} className="text-left">
            <div className="text-[#0f766e] text-[11px] tracking-wide" aria-hidden>
              ★★★★★
            </div>
            <p className="text-[10px] leading-snug text-neutral-700 mt-1.5">
              &ldquo;{review.quote}&rdquo;
            </p>
            <p className="text-[9px] text-neutral-500 mt-1.5">
              — {review.name}, {review.area}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}