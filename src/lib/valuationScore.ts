import type { TenMoatsData } from '@/types/stockAnalysis';

const MOAT_POINTS: Record<string, number> = { strong: 100, intact: 75, weakened: 40 };

/** Returns null for N/A moats (excluded from group average), number otherwise. */
function moatPoints(m: { status: string; note: string }): number | null {
  if (m.status === 'destroyed') return (m.note.startsWith('N/A') || m.note.startsWith('Not applicable')) ? null : 0;
  return MOAT_POINTS[m.status] ?? 0;
}

function groupStats(moats: Array<{ status: string; note: string }>): { avg: number; count: number } {
  const pts = moats.map(moatPoints).filter((p): p is number => p !== null);
  return {
    avg: pts.length ? pts.reduce((a, b) => a + b, 0) / pts.length : 0,
    count: pts.length,
  };
}

/**
 * Compute a 0–100 moat score from the ten moats assessment.
 *
 * AI-resilient moats (proprietaryData, regulatoryLockIn, networkEffects,
 * transactionEmbedding, systemOfRecord) and AI-vulnerable moats
 * (learnedInterfaces, businessLogic, publicDataAccess, talentScarcity,
 * bundling) are weighted proportionally by their count of applicable moats.
 * Baseline split is 60/40 when all 10 moats apply; N/A moats are excluded
 * and their weight shifts to the other group.
 *
 * Moats rated destroyed with note starting "N/A" are excluded from their
 * group average (N/A rule from the Ten Moats framework).
 */
export function computeMoatScore(tenMoats: TenMoatsData): number {
  const resilient = groupStats([
    tenMoats.proprietaryData,
    tenMoats.regulatoryLockIn,
    tenMoats.networkEffects,
    tenMoats.transactionEmbedding,
    tenMoats.systemOfRecord,
  ]);
  const vulnerable = groupStats([
    tenMoats.learnedInterfaces,
    tenMoats.businessLogic,
    tenMoats.publicDataAccess,
    tenMoats.talentScarcity,
    tenMoats.bundling,
  ]);
  const total = resilient.count + vulnerable.count;
  if (total === 0) return 0;
  const rWeight = resilient.count / total;
  const vWeight = vulnerable.count / total;
  return Math.round(resilient.avg * rWeight + vulnerable.avg * vWeight);
}

/**
 * Compute a 0–100 valuation score from a live price vs. bear/base/bull targets.
 *
 * Anchor points (piecewise linear between them):
 *   price ≤ 0.8 × bear  → 100   (deeply below bear case)
 *   price = bear         →  90
 *   price = base         →  65
 *   price = bull         →  45
 *   price ≥ 1.2 × bull  →  20   (well above bull case)
 */
export function computeValuationScore(
  price: number,
  bear: number,
  base: number,
  bull: number,
): number {
  if (price <= 0.8 * bear) return 100;

  if (price <= bear) {
    const t = (price - 0.8 * bear) / (0.2 * bear);
    return Math.round(100 - t * 10); // 100 → 90
  }

  if (price <= base) {
    const t = (price - bear) / (base - bear);
    return Math.round(90 - t * 25); // 90 → 65
  }

  if (price <= bull) {
    const t = (price - base) / (bull - base);
    return Math.round(65 - t * 20); // 65 → 45
  }

  if (price <= 1.2 * bull) {
    const t = (price - bull) / (0.2 * bull);
    return Math.round(45 - t * 25); // 45 → 20
  }

  return 20;
}

/** Parse a price string like "$1,200", "€950.80", "~$2,900/oz" into a number. */
export function parseScenarioPrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const match = priceStr.match(/[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  return parseFloat(match[0].replace(/,/g, ''));
}

/** Generate a short description of where the price sits relative to scenarios. */
export function valuationDescription(
  price: number,
  bear: number,
  base: number,
  bull: number,
  bearStr: string,
  baseStr: string,
  bullStr: string,
): string {
  if (price <= bear) {
    const pct = (((bear - price) / bear) * 100).toFixed(0);
    return `Trading ${pct}% below the bear case (${bearStr}) — deeply discounted vs. all scenarios.`;
  }
  if (price <= base) {
    const pct = (((base - price) / base) * 100).toFixed(0);
    return `Trading ${pct}% below the base case (${baseStr}) — attractively priced.`;
  }
  if (price <= bull) {
    const pct = (((price - base) / (bull - base)) * 100).toFixed(0);
    return `Fairly valued — ${pct}% of the way from base (${baseStr}) to bull case (${bullStr}).`;
  }
  const pct = (((price - bull) / bull) * 100).toFixed(0);
  return `Trading ${pct}% above the bull case (${bullStr}) — premium valuation.`;
}
