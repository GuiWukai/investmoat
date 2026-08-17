/**
 * Coverage sectors — the same buckets the /stocks filter uses.
 *
 * `key` is the `category` string stored on each row in stockData.ts.
 * `slug` is the public URL segment under /sectors/[slug].
 *
 * Kept free of stockData imports so OG images (edge) can load labels
 * without pulling the full coverage registry.
 */
export const SECTORS = [
  {
    slug: 'large-cap-tech',
    key: 'Big Tech',
    label: 'Large Cap Tech',
    description:
      'Platforms, semiconductors, and software names that set the pace of the coverage universe — scored the same way as every other bucket, not as a Mag-7 bloc.',
    color: '#3b82f6',
  },
  {
    slug: 'financials',
    key: 'Financials',
    label: 'Financials & SaaS',
    description:
      'Exchanges, payments rails, asset managers, and the enterprise software compounders that sit next to them in the book.',
    color: '#34d399',
  },
  {
    slug: 'hard-assets',
    key: 'Hard Assets',
    label: 'Hard Assets',
    description:
      'Uranium, copper, precious metals, and the monetary protocols scored on their own moat frameworks rather than as equities.',
    color: '#c4a574',
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
    slug: 'other',
    key: 'Other',
    label: 'Other',
    description:
      'Consumer, energy, media, and China platforms that do not sit cleanly in the five named buckets.',
    color: '#64748b',
  },
] as const;

export type Sector = (typeof SECTORS)[number];
export type SectorSlug = Sector['slug'];

const SECTOR_BY_SLUG = new Map<string, Sector>(SECTORS.map((s) => [s.slug, s]));
const SECTOR_BY_KEY = new Map<string, Sector>(SECTORS.map((s) => [s.key, s]));

export function getSectorBySlug(slug: string): Sector | undefined {
  return SECTOR_BY_SLUG.get(slug);
}

export function getSectorByKey(key: string): Sector | undefined {
  return SECTOR_BY_KEY.get(key);
}

export function allSectorSlugs(): SectorSlug[] {
  return SECTORS.map((s) => s.slug);
}
