import type { TenMoatsData } from '@/types/stockAnalysis';

// Status → point scale. Tightened so "intact" requires demonstrable presence
// rather than just box-checking: the gap between strong (100) and intact (65)
// is 35 pts, and weakened (35) genuinely penalises rather than half-credits.
// A company rated all-intact across a full moat slate now scores ~67 (vs ~79
// under the previous 100/75/50/10 scale) — below the 75 portfolio threshold,
// forcing real demonstrated strength to qualify.
const MOAT_POINTS: Record<string, number> = { strong: 100, intact: 65, weakened: 35, destroyed: 10 };

/** Returns null for N/A moats (excluded from group average), number otherwise. */
function moatPoints(m: { status: string; note: string }): number | null {
  if (m.status === 'destroyed' && (m.note.startsWith('N/A') || m.note.startsWith('Not applicable'))) return null;
  return MOAT_POINTS[m.status] ?? 0;
}

/**
 * Per-moat base weights and default AI-exposure group.
 *
 * Resilient moats (default: networkEffects, proprietaryData, systemOfRecord,
 * regulatoryLockIn, transactionEmbedding) sum to 60. Vulnerable moats default
 * to 40. The split represents the framework's bias that AI-resilient sources
 * of durability matter more.
 *
 * Weight calibration: networkEffects is the single most durable moat.
 * transactionEmbedding and regulatoryLockIn are raised vs. earlier calibration
 * because empirical compounders (V, MA, ICE, SPGI) prove these moats outlast
 * cycles. proprietaryData is lowered slightly — AI commoditisation of similar-
 * quality data means most "proprietary" data claims are weaker than a decade ago.
 *
 * The `defaultGroup` is overridable per-stock via `aiExposure` on the moat
 * assessment, letting moats that are AI-strengthened for a specific company
 * (CUDA, Palantir ontology, MSFT Office surface) route to the resilient
 * bucket where their economics belong.
 */
type MoatKey =
  | 'networkEffects' | 'proprietaryData' | 'systemOfRecord'
  | 'regulatoryLockIn' | 'transactionEmbedding'
  | 'businessLogic' | 'bundling' | 'learnedInterfaces'
  | 'talentScarcity' | 'publicDataAccess';

const MOAT_SPEC: Record<MoatKey, { weight: number; defaultGroup: 'resilient' | 'vulnerable' }> = {
  networkEffects:       { weight: 15, defaultGroup: 'resilient' },
  proprietaryData:      { weight: 12, defaultGroup: 'resilient' },
  systemOfRecord:       { weight: 12, defaultGroup: 'resilient' },
  regulatoryLockIn:     { weight: 11, defaultGroup: 'resilient' },
  transactionEmbedding: { weight: 10, defaultGroup: 'resilient' },
  businessLogic:        { weight: 14, defaultGroup: 'vulnerable' },
  bundling:             { weight: 10, defaultGroup: 'vulnerable' },
  learnedInterfaces:    { weight:  8, defaultGroup: 'vulnerable' },
  talentScarcity:       { weight:  5, defaultGroup: 'vulnerable' },
  publicDataAccess:     { weight:  3, defaultGroup: 'vulnerable' },
};

const RESILIENT_BASE_TOTAL = 60;
const VULNERABLE_BASE_TOTAL = 40;

/**
 * Quality-gated breadth bonus: +1 pt per moat rated intact-or-better beyond 5,
 * capped at +4. Diversification only counts when the moats are demonstrably
 * present — a company with 10 applicable but mostly-weakened moats no longer
 * receives the breadth bonus, since broad mediocrity is not durability.
 *   ≤5 intact-or-better → +0
 *    6 intact-or-better → +1
 *    7 intact-or-better → +2
 *    8 intact-or-better → +3
 *   9–10 intact-or-better → +4
 */
function qualityGatedBreadthBonus(intactOrBetterCount: number): number {
  return Math.min(4, Math.max(0, intactOrBetterCount - 5));
}

/**
 * Compute a 0–100 moat score from the ten moats assessment.
 *
 * The framework splits moats into AI-resilient (default weight pool sums to 60)
 * and AI-vulnerable (default weight pool sums to 40) groups. Each individual
 * moat assessment may override its default classification via the optional
 * `aiExposure` field — this lets moats that are *strengthened* by AI for a
 * specific company (NVDA's CUDA learnedInterfaces, PLTR's businessLogic
 * ontology) route to the resilient pool where their economics belong, rather
 * than being demoted into the vulnerable group by default.
 *
 * N/A moats (destroyed status with "N/A" or "Not applicable" note) are excluded
 * from the score; their weight is dropped so it redistributes naturally.
 *
 * Adjustments applied to the weighted base:
 *   • Quality-gated breadth bonus: +0 to +4 for moats rated intact-or-better
 *     beyond 5 (broad mediocrity is not durability).
 *   • AI-vulnerability discount: −5 when the AI-vulnerable group contributes
 *     more total score than the resilient group, catching companies whose moat
 *     is exclusively in the AI-disruption-prone category (e.g., Adobe). The
 *     `aiExposure` overrides flow through to this calculation so AI-strengthened
 *     moats don't trigger the discount.
 *
 * Examples:
 *   all 10 apply, all strong, defaults → ~100 + 4 breadth − 0 discount = 100
 *   all 10 apply, all intact, defaults → ~65 + 4 breadth − 0 discount = 69
 *   strong vulnerable only, defaults   → ~85 + 0 breadth − 5 discount = 80
 *   NVDA-style w/ CUDA overrides       → learnedInterfaces+businessLogic
 *                                         route to resilient bucket; reflects
 *                                         AI-strengthened ecosystem economics
 */
export function computeMoatScore(tenMoats: TenMoatsData): number {
  let resilientWeightedSum = 0;
  let resilientApplicableWeight = 0;
  let vulnerableWeightedSum = 0;
  let vulnerableApplicableWeight = 0;
  let intactOrBetterCount = 0;

  for (const key of Object.keys(MOAT_SPEC) as MoatKey[]) {
    const assessment = tenMoats[key];
    const { weight, defaultGroup } = MOAT_SPEC[key];
    const pts = moatPoints(assessment);
    if (pts === null) continue;

    const effectiveGroup = assessment.aiExposure ?? defaultGroup;
    if (effectiveGroup === 'resilient') {
      resilientWeightedSum += pts * weight;
      resilientApplicableWeight += weight;
    } else {
      vulnerableWeightedSum += pts * weight;
      vulnerableApplicableWeight += weight;
    }
    if (pts >= MOAT_POINTS.intact) intactOrBetterCount++;
  }

  const resilientScore = resilientApplicableWeight > 0
    ? resilientWeightedSum / resilientApplicableWeight : 0;
  const vulnerableScore = vulnerableApplicableWeight > 0
    ? vulnerableWeightedSum / vulnerableApplicableWeight : 0;

  // Scale each group's contribution by the fraction of its base capacity that
  // applies. Capacity = base total (60 / 40) — when overrides route moats from
  // vulnerable to resilient, the resilient applicableWeight can exceed 60,
  // dilating the resilient group's contribution proportionally.
  const rW = RESILIENT_BASE_TOTAL * (resilientApplicableWeight / RESILIENT_BASE_TOTAL);
  const vW = VULNERABLE_BASE_TOTAL * (vulnerableApplicableWeight / VULNERABLE_BASE_TOTAL);
  const total = rW + vW;
  if (total === 0) return 0;
  const base = resilientScore * rW / total + vulnerableScore * vW / total;
  const breadth = qualityGatedBreadthBonus(intactOrBetterCount);
  // AI-vulnerability discount: triggers when the (effective) vulnerable group
  // is the larger total contributor. AI-strengthened overrides flow through
  // here because they route to resilient — so a stock like NVDA whose
  // learnedInterfaces is marked resilient doesn't take the discount.
  const aiDiscount = vulnerableScore * vW > resilientScore * rW ? -5 : 0;
  return Math.max(0, Math.min(100, Math.round(base + breadth + aiDiscount)));
}

// ─── Growth score ─────────────────────────────────────────────────────────────

type GrowthDriverTrend = 'accelerating' | 'stable' | 'decelerating';
type MarginTrend = 'expanding' | 'stable' | 'compressing';
type PrimaryGrowthType = 'TAM expansion' | 'market share' | 'both';
type KeyRiskSeverity = 'low' | 'moderate' | 'high' | 'severe';

export interface GrowthAnalysisInput {
  cagrEstimate: string;
  drivers: Array<{ name: string; metric: string; trend: GrowthDriverTrend }>;
  primaryType: PrimaryGrowthType;
  marginTrend: MarginTrend;
  keyRisk: string;
  keyRiskSeverity?: KeyRiskSeverity;
}

/** Parses cagrEstimate strings like "22-28%", "30%+", "<5%", ">25%" → midpoint number. Returns null if unparseable. */
export function parseCagrEstimate(s: string): number | null {
  const t = s.trim().replace(/%/g, '').replace(/\s+/g, '');
  const range = t.match(/^(-?\d+(?:\.\d+)?)[-–to]+(-?\d+(?:\.\d+)?)$/i);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  const plus = t.match(/^(-?\d+(?:\.\d+)?)\+$/);
  if (plus) return parseFloat(plus[1]);
  const lt = t.match(/^<(-?\d+(?:\.\d+)?)$/);
  if (lt) return Math.max(0, parseFloat(lt[1]) - 1);
  const gt = t.match(/^>(-?\d+(?:\.\d+)?)$/);
  if (gt) return parseFloat(gt[1]);
  const num = parseFloat(t);
  return Number.isFinite(num) ? num : null;
}

/** Piecewise CAGR → base score, calibrated to the existing rubric. */
function baseFromCagr(cagr: number): number {
  if (cagr >= 30) return Math.min(95, 90 + (cagr - 30) * 0.25);
  if (cagr >= 15) return 80 + ((cagr - 15) / 15) * 10;
  if (cagr >= 8)  return 70 + ((cagr - 8) / 7) * 10;
  if (cagr >= 4)  return 60 + ((cagr - 4) / 4) * 10;
  if (cagr >= 0)  return 40 + (cagr / 4) * 20;
  return 30;
}

/**
 * Compute a 0–100 growth score from structured growthAnalysis fields.
 * Returns null if cagrEstimate is unparseable (caller should fall back to author score).
 *
 *   growthScore = baseCAGR(cagrEstimate)        // 30 → 95
 *               + trajectoryAdj(drivers)         // ±4 (net of accelerating vs decelerating)
 *               + marginAdj(marginTrend)         // ±4
 *               + typeAdj(primaryType)           // 0 to +4
 *               + riskAdj(keyRiskSeverity)       // 0 to −15
 *
 * The risk term is treated as 0 when keyRiskSeverity is unset (legacy stocks),
 * which biases the score upward — call sites should prefer derived only when
 * keyRiskSeverity is present.
 */
export function computeGrowthScore(g: GrowthAnalysisInput): number | null {
  const cagr = parseCagrEstimate(g.cagrEstimate);
  if (cagr == null) return null;

  const base = baseFromCagr(cagr);

  const trajectory = (() => {
    if (!g.drivers?.length) return 0;
    const accel = g.drivers.filter(d => d.trend === 'accelerating').length;
    const decel = g.drivers.filter(d => d.trend === 'decelerating').length;
    return ((accel - decel) / g.drivers.length) * 4;
  })();

  const margin = ({ expanding: 4, stable: 0, compressing: -4 } as const)[g.marginTrend];
  const type   = ({ 'TAM expansion': 3, both: 4, 'market share': 0 } as const)[g.primaryType];
  const risk   = g.keyRiskSeverity
    ? ({ low: 0, moderate: -5, high: -10, severe: -15 } as const)[g.keyRiskSeverity]
    : 0;

  return Math.max(0, Math.min(100, Math.round(base + trajectory + margin + type + risk)));
}

// ─── Valuation score ──────────────────────────────────────────────────────────

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
