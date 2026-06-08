export type ZipInfo = {
  zip: string;
  city: string;
  coverage: 'partial' | 'full';
  explanation?: string;
};

/**
 * Coverage meta for this location/territory.
 * This + the zipRegistry array + the matching images in public/ (coverage-map.png + {zip}-map.jpg)
 * is the "coverage module" you swap to run the site for a different area (e.g. Gilroy).
 *
 * To switch locations:
 *  - Replace the zipRegistry entries and update coverage meta below.
 *  - Drop in the new territory's overview (coverage-map.png) and per-zip themed maps.
 *  - templatenotcovered.jpg is generic and reusable.
 *  - The booking/location flows, branding chrome, and price logic stay untouched.
 */
export const coverage = {
  name: "Santa Cruz Mountains & Westside",
  defaultMapSrc: "/coverage-map.png",
  defaultMapAlt: "Ladderless Windows service area for West Santa Cruz and mountains",
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
  { zip: '95010', city: 'Capitola', coverage: 'full' },
  { zip: '95062', city: 'Live Oak', coverage: 'full' },
  { zip: '95064', city: 'Pogonip', coverage: 'full' },
  { zip: '95066', city: 'Scotts Valley', coverage: 'full' },
  { zip: '95018', city: 'Felton', coverage: 'full' },
];

export const getZipInfo = (zip: string): ZipInfo | undefined =>
  zipRegistry.find((z) => z.zip === zip);

export const isPartialCoverage = (zip: string): boolean =>
  getZipInfo(zip)?.coverage === 'partial';

export const getSuccessZips = (): string[] => zipRegistry.map((z) => z.zip);

export const getFullZips = (): string[] =>
  zipRegistry.filter((z) => z.coverage === 'full').map((z) => z.zip);

/** First zip in registry, used as the example prefill in the checker for this coverage. */
export const getExampleZip = (): string => zipRegistry[0]?.zip ?? "95060";
