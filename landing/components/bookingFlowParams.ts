export type ScreensChoice = "outside" | "fee" | "decide" | "";

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