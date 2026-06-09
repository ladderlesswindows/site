import { DEFAULT_WINDOW_PRICE } from './qualifiers';
import {
  FIRST_WINDOW_ONLY_PRICE,
  WINDOW_QUALIFIER_DISCLAIMER,
  formatPriceAmount,
} from './windowPricing';

export function BookingPricesPanel() {
  const additionalRate = formatPriceAmount(DEFAULT_WINDOW_PRICE);

  return (
    <div className="border border-neutral-200 rounded-3xl bg-cream p-3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-2">
        Prices
      </div>

      <p className="text-[10px] leading-snug text-neutral-800 text-left">
        ${FIRST_WINDOW_ONLY_PRICE} for first window, then {additionalRate} for all additional{' '}
        <span className="font-medium">*Ladderless qualifying windows.</span>
      </p>

      <ul className="mt-2 space-y-1 text-[9px] leading-snug text-neutral-600 text-left list-disc pl-3.5">
        <li>All exterior screens cleaned free.</li>
        <li>
          1 Window Minimum is only for Santa Cruz. Slightly farther like Capitola is a 2 Window
          Minimum and farther yet, like Aptos/Scotts Valley, have a 3 Window Minimum.
        </li>
        <li>
          All transactions must be done in app, including tips (technician receives 100% of tips).
        </li>
      </ul>

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