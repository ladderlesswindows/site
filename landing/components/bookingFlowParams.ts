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
  return params.toString();
}

/** Query string for `/booking/slot` after address step. */
export function buildSlotSearchParams(input: {
  zip: string;
  windows: number;
  screenReinstall?: boolean;
  screensChoice?: ScreensChoice;
  qualifier?: string;
  name: string;
  address: string;
  email: string;
}): string {
  return buildBookingSearchParams({ ...input, flow: "30s" });
}