import { calculateWindowBase, formatPriceAmount } from "./windowPricing";

const SCREEN_REINSTALL_FEE_PER_WINDOW = 2;

type BookingSubtotalPanelProps = {
  windowCount: number;
  minWindows?: number;
  screenReinstall?: boolean;
  /** booking = pre-screen-choice note; address = fee applied / calendar note */
  variant?: "booking" | "address";
  onWindowCountChange?: (count: number) => void;
  onScreenReinstallChange?: (checked: boolean) => void;
};

export function BookingSubtotalPanel({
  windowCount,
  minWindows = 1,
  screenReinstall = false,
  variant = "booking",
  onWindowCountChange,
  onScreenReinstallChange,
}: BookingSubtotalPanelProps) {
  const base = calculateWindowBase(windowCount);
  const screenFee = screenReinstall ? windowCount * SCREEN_REINSTALL_FEE_PER_WINDOW : 0;
  const subtotal = base + screenFee;
  const interactive = Boolean(onWindowCountChange || onScreenReinstallChange);

  return (
    <div className="cream-module-pad3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-1">
        Subtotal
      </div>
      <div className="text-2xl font-semibold text-center text-neutral-900">
        {formatPriceAmount(subtotal)}
      </div>

      {screenReinstall && (
        <div className="text-[9px] text-emerald-700 text-center mt-1">
          includes ${screenFee} screen reinstall ({windowCount} × $2)
        </div>
      )}

      {interactive && onWindowCountChange && (
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
      )}

      {interactive && onScreenReinstallChange && (
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <label className="flex items-start gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={screenReinstall}
              onChange={(e) => onScreenReinstallChange(e.target.checked)}
              className="accent-[#0f766e] w-3.5 h-3.5 mt-0.5 flex-shrink-0"
            />
            <span className="text-[9px] text-neutral-700 leading-snug">
              Screen reinstall fee (+$2/window) — tech removes &amp; reinstalls for free cleaning
            </span>
          </label>
        </div>
      )}

      <div className="text-[9px] leading-snug text-neutral-500 mt-3 text-left">
        {variant === "booking" ? (
          <>
            <p>On next step choose Free Screen Cleaning procedure.</p>
            <ul className="mt-1.5 list-disc pl-3.5 space-y-1">
              <li>
                $2 fee will apply for technician to remove and reinstall them for the free screen
                cleaning.
              </li>
              <li>
                Technician will give a free removal lesson if desired to avoid this fee in future
                visits (most have springs that need compression to remove/install smoothly)
              </li>
            </ul>
          </>
        ) : (
          <p>
            {screenReinstall
              ? "Screen reinstall fee applied. Uncheck above to remove."
              : "Free screen cleaning — check above to add reinstall fee, or have screens ready outside."}
          </p>
        )}
      </div>
    </div>
  );
}