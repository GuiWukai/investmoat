import { allCoverageData, stockData } from '@/app/stockData';
import type { Sector } from '@/lib/sectorCatalog';

export {
  SECTORS,
  LEGACY_SECTOR_REDIRECTS,
  getSectorBySlug,
  getSectorByKey,
  allSectorSlugs,
  allSectorKeys,
  type Sector,
  type SectorSlug,
  type SectorKey,
} from '@/lib/sectorCatalog';

export type CoverageStock = (typeof allCoverageData)[number];

export const IM25_TICKERS = new Set(stockData.map((s) => s.ticker));

export function stocksInSector(sector: Sector): CoverageStock[] {
  return allCoverageData.filter((s) => s.category === sector.key);
}

export function meanRounded(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, n) => sum + n, 0) / values.length);
}
