import { getMinWindows } from "@/components/zipRegistry";
import { readPreviewSlot } from "@/lib/previewSlotStorage";

export type ScreensChoice = "outside" | "fee" | "decide" | "";

/** Canonical entry URL for a ZIP — home buttons and checker both use this */
export function buildBookingEntryHref(zip: string, windowCount?: number): string {
  const windows = windowCount ?? getMinWindows(zip);
  const params = new URLSearchParams({
    zip: zip.trim(),
    windows: String(windows),
  });
  const slot = readPreviewSlot();
  if (slot) params.set("slot", slot);
  return `/booking?${params.toString()}`;
}

export function screensChoiceToReinstallFee(choice: ScreensChoice): boolean {
  return choice === "fee";
}

export function parseScreenReinstall(
  screenParam: string | null,
  screensChoice: string | null
): boolean {
  if (screensChoice === "fee") return true;
  if (screensChoice === "outside" || screensChoice === "decide") return false;
  return screenParam === "true" || screenParam === "1";
}

/** Compare path+query ignoring param order and encoding differences */
export function isSamePathQuery(current: string, target: string): boolean {
  const split = (value: string) => {
    const q = value.indexOf("?");
    if (q === -1) return { pathname: value, params: new URLSearchParams() };
    return {
      pathname: value.slice(0, q),
      params: new URLSearchParams(value.slice(q + 1)),
    };
  };

  const a = split(current);
  const b = split(target);
  if (a.pathname !== b.pathname) return false;

  const keys = new Set<string>();
  a.params.forEach((_, key) => keys.add(key));
  b.params.forEach((_, key) => keys.add(key));

  for (const key of keys) {
    if (a.params.get(key) !== b.params.get(key)) return false;
  }
  return true;
}

export function buildBookingSearchParams(input: {
  zip: string;
  windows: number;
  screenReinstall?: boolean;
  screensChoice?: ScreensChoice;
  qualifier?: string;
  flow?: string;
  name?: string;
  address?: string;
  email?: string;
  /** ISO-like local slot key from CustomerSlotPicker, e.g. 2026-06-10T08:00 */
  slot?: string;
}): string {
  const params = new URLSearchParams();
  params.set("zip", input.zip);
  params.set("windows", String(input.windows));
  params.set("screenReinstall", String(input.screenReinstall ?? false));
  if (input.screensChoice) params.set("screensChoice", input.screensChoice);
  if (input.qualifier) params.set("qualifier", input.qualifier);
  if (input.flow) params.set("flow", input.flow);
  if (input.name) params.set("name", input.name);
  if (input.address) params.set("address", input.address);
  if (input.email) params.set("email", input.email);
  if (input.slot) params.set("slot", input.slot);
  return params.toString();
}

const BOOKING_RETURN_PATHS = new Set([
  "/booking",
  "/booking/mom",
  "/booking/address",
  "/booking/mom/address",
]);

/** Only allow in-app booking paths as explain return targets */
export function isSafeBookingReturnPath(path: string): boolean {
  try {
    const decoded = decodeURIComponent(path.trim());
    if (!decoded.startsWith("/booking")) return false;
    const pathname = decoded.split("?")[0];
    return BOOKING_RETURN_PATHS.has(pathname);
  } catch {
    return false;
  }
}

/** Link to /explain while preserving booking state and a return target */
export function buildExplainHref(returnTo: string, bookingQuery: string): string {
  const params = new URLSearchParams(bookingQuery);
  params.set("returnTo", returnTo);
  return `/explain?${params.toString()}`;
}

/**
 * Where explain "Continue" should go, or null when opened from home (no booking context).
 * Prefers explicit returnTo; falls back to /booking or /booking/mom from flow params.
 */
export function resolveExplainContinueHref(
  searchParams: URLSearchParams,
  isMomZip: (zip: string) => boolean,
  bookingHref: (basePath: string, step: "" | "address" | "success", query?: string) => string
): string | null {
  const returnTo = searchParams.get("returnTo");
  if (returnTo && isSafeBookingReturnPath(returnTo)) {
    return decodeURIComponent(returnTo.trim());
  }

  const zip = searchParams.get("zip")?.trim();
  if (!zip || searchParams.get("flow") !== "30s") return null;

  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "returnTo") params.set(key, value);
  });

  const query = params.toString();
  const basePath = isMomZip(zip) ? "/booking/mom" : "/booking";
  return bookingHref(basePath, "", query);
}