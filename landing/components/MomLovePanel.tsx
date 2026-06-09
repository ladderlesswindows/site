/** Mom easter egg (ZIP 79510) — rose + love note */
export function MomLovePanel() {
  return (
    <div className="rounded-3xl border-2 border-rose-200 bg-rose-50/80 p-4 text-center shadow-sm">
      <div className="text-5xl leading-none mb-2" aria-hidden>
        🌹
      </div>
      <p className="text-lg font-semibold text-rose-800 tracking-wide">I love you</p>
    </div>
  );
}