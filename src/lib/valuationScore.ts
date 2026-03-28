import type { TenMoatsData } from '@/types/stockAnalysis';

// Status → point scale. Gaps are equal (25 pts each) so a single status
// step up/down has the same impact regardless of where on the scale it occurs.
// A floor of 10 for genuinely-destroyed moats avoids a total zero contribution
// while still pulling the group average down meaningfully.
const MOAT_POINTS: Record<string, number> = { strong: 100, intact: 75, weakened: 50, destroyed: 10 };

/** Returns null for N/A moats (excluded from group average), number otherwise. */
function moatPoints(m: { status: string; note: string }): number | null {
  if (m.status === 'destroyed' && (m.note.startsWith('N/A') || m.note.startsWith('Not applicable'))) return null;
  return MOAT_POINTS[m.status] ?? 0;
}

/**
 * Individual base weights for resilient moats (sum = 60).
 * networkEffects and proprietaryData are historically the most durable moats;
 * regulatoryLockIn and transactionEmbedding carry less weight as they are
 * more susceptible to external (policy/platform) disruption.
 */
const RESILIENT_WEIGHTS = {
  networkEffects:       15,
  proprietaryData:      15,
  systemOfRecord:       12,
  regulatoryLockIn:     10,
  transactionEmbedding:  8,
} as const;

/**
 * Individual base weights for vulnerable moats (sum = 40).
 * businessLogic represents the deepest process expertise and is most at risk
 * from AI; publicDataAccess is nearly commoditised so carries minimal weight.
 */
const VULNERABLE_WEIGHTS = {
  businessLogic:    14,
  bundling:         10,
  learnedInterfaces: 8,
  talentScarcity:    5,
  publicDataAccess:  3,
} as const;

const RESILIENT_TOTAL = Object.values(RESILIENT_WEIGHTS).reduce((a, b) => a + b, 0); // 60
const VULNERABLE_TOTAL = Object.values(VULNERABLE_WEIGHTS).reduce((a, b) => a + b, 0); // 40

/**
 * Computes a weighted score for one moat group.
 * N/A moats are excluded; their weight redistributes proportionally across
 * remaining applicable moats (preserving the within-group relative ranking).
 * Returns the group's weighted-average score and the sum of applicable weights.
 */
function weightedGroupScore(
  moats: Array<[{ status: string; note: string }, number]>
): { score: number; applicableWeight: number; applicableCount: number; totalWeight: number } {
  let weightedSum = 0;
  let applicableWeight = 0;
  let applicableCount = 0;
  let totalWeight = 0;
  for (const [assessment, weight] of moats) {
    totalWeight += weight;
    const pts = moatPoints(assessment);
    if (pts === null) continue;
    weightedSum += pts * weight;
    applicableWeight += weight;
    applicableCount++;
  }
  return {
    score: applicableWeight > 0 ? weightedSum / applicableWeight : 0,
    applicableWeight,
    applicableCount,
    totalWeight,
  };
}

/**
 * Breadth bonus: +1 pt per applicable moat beyond 5, capped at +4.
 * A company defended by 8 moats is more resilient than one with 2 equally-
 * rated moats, even if their weighted averages are identical.
 *   ≤5 applicable → +0
 *    6 applicable → +1
 *    7 applicable → +2
 *    8 applicable → +3
 *   9–10 applicable → +4
 */
function breadthBonus(applicableCount: number): number {
  return Math.min(4, Math.max(0, applicableCount - 5));
}

/**
 * Compute a 0–100 moat score from the ten moats assessment.
 *
 * AI-resilient moats (networkEffects, proprietaryData, systemOfRecord,
 * regulatoryLockIn, transactionEmbedding) carry differentiated base weights
 * summing to 60. AI-vulnerable moats (businessLogic, bundling, learnedInterfaces,
 * talentScarcity, publicDataAccess) carry differentiated base weights summing to 40.
 *
 * When all 10 moats apply the effective group split is exactly 60/40. N/A moats
 * are excluded; their base weight is dropped so it redistributes naturally to
 * whichever moats remain applicable within each group.
 *
 * A breadth bonus of +1 to +4 is added for each applicable moat beyond 5,
 * rewarding companies with diversified moat portfolios.
 *
 * Examples:
 *   all 10 apply       → 60% resilient / 40% vulnerable + 4 breadth pts
 *   4 N/A vulnerable   → 60/(60+vApplicable) resilient / rest vulnerable + 1 pt
 *   all vulnerable N/A → 100% resilient / 0% vulnerable + 0 pts
 */
export function computeMoatScore(tenMoats: TenMoatsData): number {
  const resilient = weightedGroupScore([
    [tenMoats.networkEffects,        RESILIENT_WEIGHTS.networkEffects],
    [tenMoats.proprietaryData,       RESILIENT_WEIGHTS.proprietaryData],
    [tenMoats.systemOfRecord,        RESILIENT_WEIGHTS.systemOfRecord],
    [tenMoats.regulatoryLockIn,      RESILIENT_WEIGHTS.regulatoryLockIn],
    [tenMoats.transactionEmbedding,  RESILIENT_WEIGHTS.transactionEmbedding],
  ]);
  const vulnerable = weightedGroupScore([
    [tenMoats.businessLogic,     VULNERABLE_WEIGHTS.businessLogic],
    [tenMoats.bundling,          VULNERABLE_WEIGHTS.bundling],
    [tenMoats.learnedInterfaces, VULNERABLE_WEIGHTS.learnedInterfaces],
    [tenMoats.talentScarcity,    VULNERABLE_WEIGHTS.talentScarcity],
    [tenMoats.publicDataAccess,  VULNERABLE_WEIGHTS.publicDataAccess],
  ]);
  // Scale each group's contribution by the fraction of its base weight that applies.
  const rW = 60 * (resilient.applicableWeight / RESILIENT_TOTAL);
  const vW = 40 * (vulnerable.applicableWeight / VULNERABLE_TOTAL);
  const total = rW + vW;
  if (total === 0) return 0;
  const base = resilient.score * rW / total + vulnerable.score * vW / total;
  const applicableCount = resilient.applicableCount + vulnerable.applicableCount;
  return Math.min(100, Math.round(base + breadthBonus(applicableCount)));
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
