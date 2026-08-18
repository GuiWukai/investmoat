/**
 * Coverage sectors — the same buckets the /stocks filter uses.
 *
 * `key` is the `category` string stored on each row in stockData.ts.
 * `slug` is the public URL segment under /sectors/[slug].
 *
 * These are business-model buckets, not GICS and not market-cap labels.
 * A name goes in the group whose economics you would actually compare it
 * against on /sectors/[slug]. When a label starts covering two businesses,
 * split it — do not paper over the mix with an "&" in the display name.
 *
 * Kept free of stockData imports so OG images (edge) can load labels
 * without pulling the full coverage registry.
 */
export const SECTORS = [
  {
    slug: 'platforms',
    key: 'Platforms',
    label: 'Platforms',
    description:
      'Network-effect consumer and marketplace businesses — ads, commerce, media, mobility, and the hyperscalers that sit on top of them.',
    color: '#3b82f6',
  },
  {
    slug: 'software',
    key: 'Software',
    label: 'Software',
    description:
      'Enterprise software, security, data platforms, and cloud infrastructure — seat, consumption, and system-of-record compounders.',
    color: '#8b5cf6',
  },
  {
    slug: 'semiconductors',
    key: 'Semiconductors',
    label: 'Semiconductors',
    description:
      'Design, foundry, memory, equipment, EDA, and the AI compute stack — the capex cycle the rest of the book is levered to.',
    color: '#f59e0b',
  },
  {
    slug: 'financials',
    key: 'Financials',
    label: 'Financials',
    description:
      'Payments rails, exchanges, credit data, banks, asset managers, and fintech — money moving, not software parked next to it.',
    color: '#34d399',
  },
  {
    slug: 'healthcare',
    key: 'Healthcare',
    label: 'Healthcare',
    description:
      'Managed care, devices, and therapeutics — durability from regulation, switching costs, and clinical lock-in.',
    color: '#14b8a6',
  },
  {
    slug: 'industrials',
    key: 'Industrials',
    label: 'Industrials',
    description:
      'Aerospace, automation, power equipment, and the picks-and-shovels names behind electrification and data-center buildout.',
    color: '#fb923c',
  },
  {
    slug: 'energy',
    key: 'Energy',
    label: 'Energy',
    description:
      'Power generators, utilities, and LNG — the molecules and megawatts, not the turbines and switchgear that sit in Industrials.',
    color: '#f43f5e',
  },
  {
    slug: 'consumer',
    key: 'Consumer',
    label: 'Consumer',
    description:
      'Retail, apparel, and luxury brands — membership flywheels and pricing power, not platforms and not financials.',
    color: '#ec4899',
  },
  {
    slug: 'hard-assets',
    key: 'Hard Assets',
    label: 'Hard Assets',
    description:
      'Uranium, copper, precious metals, and the miners that produce them — scored as commodities, not as software lookalikes.',
    color: '#c4a574',
  },
  {
    slug: 'crypto',
    key: 'Crypto',
    label: 'Crypto',
    description:
      'Monetary protocols and the equity proxies levered to them — a different moat framework from the miners in Hard Assets.',
    color: '#6366f1',
  },
  {
    slug: 'other',
    key: 'Other',
    label: 'Other',
    description:
      'Broad-market benchmarks and anything that still does not sit cleanly in a named bucket.',
    color: '#64748b',
  },
] as const;

export type Sector = (typeof SECTORS)[number];
export type SectorSlug = Sector['slug'];
export type SectorKey = Sector['key'];

const SECTOR_BY_SLUG = new Map<string, Sector>(SECTORS.map((s) => [s.slug, s]));
const SECTOR_BY_KEY = new Map<string, Sector>(SECTORS.map((s) => [s.key, s]));

/** Retired public slugs → where a bookmarked /sectors/[slug] should land. */
export const LEGACY_SECTOR_REDIRECTS: Record<string, string> = {
  'large-cap-tech': '/sectors',
};

export function getSectorBySlug(slug: string): Sector | undefined {
  return SECTOR_BY_SLUG.get(slug);
}

export function getSectorByKey(key: string): Sector | undefined {
  return SECTOR_BY_KEY.get(key);
}

export function allSectorSlugs(): SectorSlug[] {
  return SECTORS.map((s) => s.slug);
}

export function allSectorKeys(): SectorKey[] {
  return SECTORS.map((s) => s.key);
}
