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
}): string {
  const params = new URLSearchParams();
  params.set("zip", input.zip);
  params.set("windows", String(input.windows));
  params.set("screenReinstall", String(input.screenReinstall ?? false));
  if (input.screensChoice) params.set("screensChoice", input.screensChoice);
  if (input.qualifier) params.set("qualifier", input.qualifier);
  if (input.flow) params.set("flow", input.flow);
  return params.toString();
}