import { DEFAULT_WINDOW_PRICE } from "./qualifiers";

export const FIRST_WINDOW_ONLY_PRICE = 20;

export const WINDOW_QUALIFIER_DISCLAIMER =
  "Any single exterior window up to approx. 5 ft x 5 ft under 2 stories (25'). Most standard residential windows qualify. Decorative and specialty shapes/grids also currently qualify! Screens washed free with every window. Interior Window cleaning may be added as well for less than exterior, once exterior is done. Entire homes can be done if time allows. Custom/3+ level can get free estimates.";

export function formatPriceAmount(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

/** 1 window = $20 flat; 2+ windows = standard rate × count for all windows */
export function calculateWindowBase(
  windowCount: number,
  standardPricePerWindow: number = DEFAULT_WINDOW_PRICE
): number {
  if (windowCount <= 1) return FIRST_WINDOW_ONLY_PRICE;
  return windowCount * standardPricePerWindow;
}

export function formatWindowBaseSummary(
  windowCount: number,
  standardPricePerWindow: number = DEFAULT_WINDOW_PRICE
): string {
  const base = calculateWindowBase(windowCount, standardPricePerWindow);
  if (windowCount <= 1) {
    return `Base: ${base} ($${FIRST_WINDOW_ONLY_PRICE} first window)`;
  }
  return `Base: ${base} (${formatPriceAmount(standardPricePerWindow)} × ${windowCount})`;
}