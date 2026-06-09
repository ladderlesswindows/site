export type ZipInfo = {
  zip: string;
  city: string;
  coverage: 'partial' | 'full';
  explanation?: string;
  /** Minimum billable windows for this ZIP (default 1) */
  minWindows?: number;
};

export const DEFAULT_MIN_WINDOWS = 1;

/**
 * Coverage meta for this location/territory.
 * This + the zipRegistry array is the "coverage module" you swap for a new area.
 */
export const coverage = {
  name: "Santa Cruz Mountains & Westside",
  contactEmail: "6d7yrnk7jp@privaterelay.appleid.com",
};

export const zipRegistry: ZipInfo[] = [
  {
    zip: '95060',
    city: 'Santa Cruz',
    coverage: 'partial',
    explanation: 'Westside to Wilder(sorry no Bonny Doon), Empire Grade up to 3959. UCSC and Pogonip Pasatiempo up to Felton OK!',
  },
  {
    zip: '95003',
    city: 'Aptos',
    coverage: 'partial',
    minWindows: 2,
    explanation: 'Currently only homes under 3 miles from your nearest HWY 1 offramp and under are covered',
  },
  {
    zip: '95073',
    city: 'Soquel',
    coverage: 'partial',
    explanation: 'Currently only homes under 3 miles from your nearest HWY 1 offramp and under are covered',
  },
  {
    zip: '95065',
    city: 'Live Oak',
    coverage: 'partial',
    explanation: 'Currently only homes under 3 miles from your nearest HWY 1 offramp, or within 1 mile of Granite Creek SV exit are covered',
  },
  { zip: '95010', city: 'Capitola', coverage: 'full', minWindows: 2 },
  { zip: '95062', city: 'Live Oak', coverage: 'full' },
  { zip: '95064', city: 'Pogonip', coverage: 'full', minWindows: 2 },
  { zip: '95066', city: 'Scotts Valley', coverage: 'full', minWindows: 3 },
  { zip: '95018', city: 'Felton', coverage: 'full', minWindows: 3 },
];

export const getMinWindows = (zip: string): number =>
  getZipInfo(zip)?.minWindows ?? DEFAULT_MIN_WINDOWS;

/** Clamp window count to this ZIP's minimum */
export const clampWindowCount = (zip: string, count: number): number =>
  Math.max(getMinWindows(zip), count);

const PARTIAL_HEADLINE =
  'Your neighborhood is PARTIALLY covered. Please read details below to confirm you are within the covered area before continuing.';

/** Green-banner headline on home + /booking success step */
export function getSuccessHeadline(zip: string): string {
  const info = getZipInfo(zip);
  if (!info) return '';
  const min = getMinWindows(zip);
  if (info.coverage === 'partial') {
    return min > DEFAULT_MIN_WINDOWS
      ? `${PARTIAL_HEADLINE} ${min} window minimum applies.`
      : PARTIAL_HEADLINE;
  }
  if (min > DEFAULT_MIN_WINDOWS) {
    return `Great news! We serve your area with a ${min} window minimum.`;
  }
  return 'Great news! We serve your area.';
}

export const getZipInfo = (zip: string): ZipInfo | undefined =>
  zipRegistry.find((z) => z.zip === zip);

export const isPartialCoverage = (zip: string): boolean =>
  getZipInfo(zip)?.coverage === 'partial';

export const getSuccessZips = (): string[] => zipRegistry.map((z) => z.zip);

/** First zip in registry, used as the example prefill in the checker for this coverage. */
export const getExampleZip = (): string => zipRegistry[0]?.zip ?? "95060";
