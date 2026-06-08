import { STACEY } from "./stacey";

export type Qualifier = {
  code: string;
  pricePerWindow: number;
  displayName?: string;
};

export const qualifiers: Record<string, Qualifier> = {
  STACEY,
  // Add more old monthly account qualifiers here.
  // (Ladderless5 is used as the example placeholder text in the UI input)
  // JANE: { code: "JANE", pricePerWindow: 15, displayName: "Jane's Monthly" },
};

export function getQualifier(code: string | null | undefined): Qualifier | null {
  if (!code) return null;
  const key = code.toUpperCase().trim();
  return qualifiers[key] ?? null;
}

export const DEFAULT_WINDOW_PRICE = 12.5;
