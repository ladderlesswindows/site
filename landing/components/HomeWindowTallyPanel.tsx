import { DEFAULT_WINDOW_PRICE } from "./qualifiers";
import {
  calculateWindowBase,
  FIRST_WINDOW_ONLY_PRICE,
  formatPriceAmount,
  WINDOW_QUALIFIER_DISCLAIMER,
} from "./windowPricing";

type HomeWindowTallyPanelProps = {
  windowCount: number;
  minWindows?: number;
  onWindowCountChange: (count: number) => void;
};

export function HomeWindowTallyPanel({
  windowCount,
  minWindows = 1,
  onWindowCountChange,
}: HomeWindowTallyPanelProps) {
  const subtotal = calculateWindowBase(windowCount);
  const additionalRate = formatPriceAmount(DEFAULT_WINDOW_PRICE);

  return (
    <div className="home-side-module">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-1">
        Subtotal
      </div>
      <div className="text-2xl font-semibold text-center text-neutral-900">
        {formatPriceAmount(subtotal)}
      </div>

      <div className="text-center mt-3 pt-3 border-t border-neutral-200">
        <div className="text-[10px] text-neutral-600 mb-1">Windows</div>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onWindowCountChange(Math.max(minWindows, windowCount - 1))}
            className="w-7 h-7 rounded-full border text-base font-bold active:bg-neutral-100"
          >
            −
          </button>
          <div className="text-xl font-semibold w-8 text-center">{windowCount}</div>
          <button
            type="button"
            onClick={() => onWindowCountChange(windowCount + 1)}
            className="w-7 h-7 rounded-full border text-base font-bold active:bg-neutral-100"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-[10px] leading-snug text-neutral-600 text-center mt-3">
        1st window ${FIRST_WINDOW_ONLY_PRICE} then {additionalRate} per window for{" "}
        <span className="font-medium">*ladderless qualifying windows.</span>
      </p>

      <div className="mt-3 pt-3 border-t border-neutral-200">
        <div className="text-[9px] font-semibold text-neutral-700 mb-1">
          *Ladderless Qualifying Windows
        </div>
        <p className="text-[9px] leading-snug text-neutral-500 text-left">
          {WINDOW_QUALIFIER_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}