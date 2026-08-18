import type {
  AssetClass,
  CommodityMoatsData,
  CryptoMoatPillar,
  CryptoMoatsData,
  RecommendationStatus,
  StockAnalysisData,
  TenMoatsData,
} from '@/types/stockAnalysis';

// Status → point scale. "intact" requires demonstrable presence rather than
// just box-checking: the gap between strong (100) and intact (65) is 35 pts,
// and weakened (35) genuinely penalises rather than half-credits. A company
// rated all-intact across a full moat slate scores ~69 — below the portfolio
// threshold, forcing real demonstrated strength to qualify.
//
// `destroyed` is 0, not a token 10, so the ends of the scale mean something
// literal: a moat score of 0 says all ten applicable moats are destroyed, and
// 100 says all ten are strong. N/A is a separate status (`na`) — dropped and
// its weight redistributed (the moat never applied) — so it cannot be confused
// with a destroyed moat that keeps its weight and scores nothing. Under an
// earlier note-prefix convention those two cases were easy to mis-author.
const MOAT_POINTS: Record<string, number> = { strong: 100, intact: 65, weakened: 35, destroyed: 0 };

/** Returns null for N/A moats (excluded from group average), number otherwise. */
function moatPoints(m: { status: string; note: string }): number | null {
  if (m.status === 'na') return null;
  return MOAT_POINTS[m.status] ?? 0;
}

/**
 * Per-moat base weights and default AI-exposure group.
 *
 * Resilient moats (default: networkEffects, proprietaryData, systemOfRecord,
 * regulatoryLockIn, transactionEmbedding) sum to 60 inside their group.
 * Vulnerable moats default to 40 inside theirs. Those sums only weight the
 * *group average* — the groups themselves blend 80/20 (resilient/vulnerable)
 * in `moatScoreBreakdown`, which is the framework's actual bias that
 * AI-resilient sources of durability are the moat.
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

/** Group blend when both pools have applicable moats. Resilient is the moat;
 *  vulnerable is a limited modifier — these pillars are defined as things AI
 *  can substitute for, so they must not be able to outvote a fortress (or
 *  inflate a software platform past a payments network). */
const RESILIENT_BLEND = 0.80;
const VULNERABLE_BLEND = 0.20;

/**
 * Thin-coverage floor. Two `strong` resilient pillars and three N/As used to
 * print a resilient score of 100 — Eaton (regulatory + embedding only) ranked
 * with TSMC. Applicable resilient weight below this (~three typical pillars)
 * is blended toward intact (65) so a thin book cannot score as a full slate.
 */
const RESILIENT_COVERAGE_FULL = 36;

/**
 * Strength bonus: +1 per *strong* AI-resilient moat beyond 2, capped at +3.
 * Rewards concentrated structural strength (Visa's five strong resilient
 * pillars) rather than a software platform collecting +4 for nine intact
 * boxes, which is what the old intact-or-better-across-ten bonus did.
 *   ≤2 strong resilient → +0
 *    3 strong resilient → +1
 *    4 strong resilient → +2
 *   ≥5 strong resilient → +3
 */
function strongResilientBonus(strongResilientCount: number): number {
  return Math.min(3, Math.max(0, strongResilientCount - 2));
}

function coverageAdjustedResilient(
  resilientScore: number,
  resilientApplicableWeight: number,
): number {
  if (resilientApplicableWeight <= 0) return 0;
  if (resilientApplicableWeight >= RESILIENT_COVERAGE_FULL) return resilientScore;
  // Only regress a thin *strong* book toward intact. A thin weakened book
  // (CoreWeave: one weakened embedding pillar) must not be lifted to 65.
  if (resilientScore <= MOAT_POINTS.intact) return resilientScore;
  const coverage = resilientApplicableWeight / RESILIENT_COVERAGE_FULL;
  return resilientScore * coverage + MOAT_POINTS.intact * (1 - coverage);
}

export interface MoatBreakdown {
  /** Weighted average of applicable AI-resilient pillars; null if none apply. */
  resilientScore: number | null;
  /** Weighted average of applicable AI-vulnerable pillars; null if none apply. */
  vulnerableScore: number | null;
  resilientApplicableWeight: number;
  vulnerableApplicableWeight: number;
  /** Resilient score after the thin-coverage adjustment. */
  resilientAdjusted: number | null;
  /** 80/20 blend (or the single group that applies). */
  blend: number;
  breadth: number;
  strongResilientCount: number;
  total: number;
}

/**
 * Compute a 0–100 moat score from the ten moats assessment.
 *
 * The framework splits moats into AI-resilient and AI-vulnerable groups. Each
 * assessment may override its default classification via `aiExposure` — so
 * moats that are *strengthened* by AI for a specific company (NVDA's CUDA
 * learnedInterfaces, PLTR's ontology businessLogic) sit in the resilient pool
 * where their economics belong.
 *
 * N/A moats (`status: "na"`) are excluded from the group they would have sat
 * in; they do not zero-fill. A thin resilient book (applicable weight below
 * `RESILIENT_COVERAGE_FULL`) is blended toward intact so two strong pillars
 * cannot print 100.
 *
 * The two groups are not co-equal sources of durability. AI-vulnerable pillars
 * are defined as things intelligent agents can substitute for, so they blend
 * at 20% when both groups apply — enough for a real bundle to still count,
 * not enough for weakened UI/talent to drag Visa below Datadog, and not enough
 * for a strong bundle to lift Datadog past a five-pillar resilient fortress.
 * A book with no applicable resilient pillars scores 20% of its vulnerable
 * group (a talent-only firm cannot clear the portfolio moat gate on UI lock-in).
 *
 * Adjustments on top of the blend:
 *   • Strength bonus: +0 to +3 for strong resilient moats beyond the second.
 *
 * Examples (rounded):
 *   all 10 apply, all strong, defaults → 100 + 3 strength = 100 (capped)
 *   all 10 apply, all intact, defaults → 65 + 0 = 65
 *   Visa-style (5 strong resilient, 2 weakened vulnerable) → 87 + 3 = 90
 *   Datadog-style (agent+bundle strong, other resilient intact) → 72
 *   vulnerable-only, all strong → 0.20 × 100 = 20
 *   NVDA-style w/ CUDA overrides → learnedInterfaces routes to resilient
 */
export function moatScoreBreakdown(tenMoats: TenMoatsData): MoatBreakdown {
  let resilientWeightedSum = 0;
  let resilientApplicableWeight = 0;
  let vulnerableWeightedSum = 0;
  let vulnerableApplicableWeight = 0;
  let strongResilientCount = 0;

  for (const key of Object.keys(MOAT_SPEC) as MoatKey[]) {
    const assessment = tenMoats[key];
    const { weight, defaultGroup } = MOAT_SPEC[key];
    const pts = moatPoints(assessment);
    if (pts === null) continue;

    const effectiveGroup = assessment.aiExposure ?? defaultGroup;
    if (effectiveGroup === 'resilient') {
      resilientWeightedSum += pts * weight;
      resilientApplicableWeight += weight;
      if (pts >= MOAT_POINTS.strong) strongResilientCount++;
    } else {
      vulnerableWeightedSum += pts * weight;
      vulnerableApplicableWeight += weight;
    }
  }

  const resilientScore = resilientApplicableWeight > 0
    ? resilientWeightedSum / resilientApplicableWeight
    : null;
  const vulnerableScore = vulnerableApplicableWeight > 0
    ? vulnerableWeightedSum / vulnerableApplicableWeight
    : null;

  const resilientAdjusted = resilientScore == null
    ? null
    : coverageAdjustedResilient(resilientScore, resilientApplicableWeight);

  let blend = 0;
  if (resilientAdjusted == null && vulnerableScore == null) {
    blend = 0;
  } else if (resilientAdjusted == null) {
    // No durable pillars apply — vulnerable lock-in cannot carry the score.
    blend = VULNERABLE_BLEND * (vulnerableScore ?? 0);
  } else if (vulnerableScore == null) {
    blend = resilientAdjusted;
  } else {
    blend = RESILIENT_BLEND * resilientAdjusted + VULNERABLE_BLEND * vulnerableScore;
  }

  const breadth = strongResilientBonus(strongResilientCount);
  const total = Math.max(0, Math.min(100, Math.round(blend + breadth)));
  return {
    resilientScore,
    vulnerableScore,
    resilientApplicableWeight,
    vulnerableApplicableWeight,
    resilientAdjusted,
    blend,
    breadth,
    strongResilientCount,
    total,
  };
}

export function computeMoatScore(tenMoats: TenMoatsData): number {
  return moatScoreBreakdown(tenMoats).total;
}

// ─── Asset-class-specific moat scoring ────────────────────────────────────────
//
// Equities are scored via the 10-moat framework above. Crypto protocols and
// commodities have categorically different sources of durability — protocol
// effects, credible neutrality, monetary history, supply inelasticity — that
// the business-moat framework can't see. Each asset class gets its own
// pillar set and weights. Outputs are still 0–100 but are NOT directly
// comparable across asset classes: BTC moat=100 measures protocol durability,
// not the same thing as AXON moat=92.

// Both commodity and crypto frameworks use dynamic weights via primaryMoat:
// the declared primary pillar carries the most weight, the non-primary pillars
// split the rest equally. N/A pillars (`status: "na"`) drop out and their
// weight redistributes.
//
// WHY THE PRIMARY WEIGHT IS NO LONGER 50%. Unlike MOAT_SPEC, where the
// framework fixes every weight, primaryMoat is declared per asset — so the
// author chooses which pillar counts most. That choice has never once resolved
// downward: every crypto and commodity asset in coverage declares a primaryMoat
// at or tied to its maximum-scoring option. At 50% it was a large free option
// rather than an analytical statement, and it grew as the pillar set shrank —
// one label decided half of a five-pillar score.
//
// ETH showed the cost. It has exactly one strong pillar (networkEffects) and
// four merely intact; declaring that pillar primary was worth 14 points of moat
// (83 vs 69 for any other choice) and carried it into the top of the portfolio
// on that label alone. No equity can do that: MOAT_SPEC caps the heaviest single
// moat at 15, so the largest swing one label can produce is ~6 points.
//
// Cutting crypto to 30/17.5 and commodity to 40/30 keeps the intent — BTC still
// scores on credible neutrality, gold on monetary history — while requiring the
// rest of the pillar set to corroborate it. The primary stays the single
// heaviest pillar; it just stops outvoting everything else combined. Affected
// assets: BTC 96→94, ETH 83→76, SOL 58→55, U 88→85, XAU 75→70, HG 50→47, XAG
// unchanged. Portfolio membership was unchanged; the effect was a reordering of
// the top of the table.
//
// COMPOSITE RANKS ARE DELIBERATELY NOT QUOTED HERE. They were, and the numbers
// went stale inside this same branch: the original note claimed "BTC 1→2, ETH
// 3→6", which two commits later was wrong in both directions once BTC's CAGR was
// re-based and ETH was re-reviewed. A rank is a fact about the whole book, so any
// unrelated coverage change invalidates it. State the pillar deltas a change
// causes — those are attributable to it — and let the table report ranks.
const COMMODITY_PRIMARY_WEIGHT = 40;
const COMMODITY_OTHER_WEIGHT = 30;
const CRYPTO_PRIMARY_WEIGHT = 30;
const CRYPTO_OTHER_WEIGHT = 17.5;

/**
 * Compute crypto moat score with dynamic weights driven by primaryMoat.
 * Primary pillar gets 30%; the four other pillars share the remaining 70%
 * (17.5% each). Lets BTC score on credibleNeutrality, ETH on networkEffects,
 * SOL on its consumer networkEffects — without averaging through pillars
 * that don't define what makes each protocol durable, and without letting
 * one declared label decide the score on its own (see the note on
 * CRYPTO_PRIMARY_WEIGHT above).
 */
export function computeCryptoMoatScore(data: CryptoMoatsData): number {
  const pillars: CryptoMoatPillar[] = [
    'networkEffects', 'schellingPoint', 'credibleNeutrality', 'regulatoryIncumbency', 'securityBudget',
  ];
  let sum = 0;
  let total = 0;
  for (const p of pillars) {
    const pts = moatPoints(data[p]);
    if (pts === null) continue;
    const weight = p === data.primaryMoat ? CRYPTO_PRIMARY_WEIGHT : CRYPTO_OTHER_WEIGHT;
    sum += pts * weight;
    total += weight;
  }
  if (total === 0) return 0;
  return Math.max(0, Math.min(100, Math.round(sum / total)));
}

/**
 * Compute commodity moat score with dynamic weights driven by primaryMoat.
 * Primary pillar gets COMMODITY_PRIMARY_WEIGHT (40); the other two share
 * COMMODITY_OTHER_WEIGHT (30 each). This lets gold score on its monetary
 * history without being dragged by tail industrial demand, and copper score
 * on its industrial utility without being dragged by its weak monetary
 * history.
 */
export function computeCommodityMoatScore(data: CommodityMoatsData): number {
  const pillars: Array<keyof Omit<CommodityMoatsData, 'verdict' | 'primaryMoat'>> = [
    'absoluteScarcity', 'monetaryHistory', 'industrialUtility',
  ];
  let sum = 0;
  let total = 0;
  for (const p of pillars) {
    const pts = moatPoints(data[p]);
    if (pts === null) continue;
    const weight = p === data.primaryMoat ? COMMODITY_PRIMARY_WEIGHT : COMMODITY_OTHER_WEIGHT;
    sum += pts * weight;
    total += weight;
  }
  if (total === 0) return 0;
  return Math.max(0, Math.min(100, Math.round(sum / total)));
}

/**
 * Dispatcher: compute the moat score using the framework that matches the
 * asset's class. Defaults to equity / tenMoats when assetClass is unset.
 * Throws if the matching moats field is missing — schema validation should
 * have caught that, so a runtime miss is a bug.
 */
export function computeAssetMoatScore(data: StockAnalysisData): number {
  const ac: AssetClass = data.assetClass ?? 'equity';
  if (ac === 'crypto') {
    if (!data.cryptoMoats) throw new Error(`${data.slug}: assetClass=crypto but cryptoMoats missing`);
    return computeCryptoMoatScore(data.cryptoMoats);
  }
  if (ac === 'commodity') {
    if (!data.commodityMoats) throw new Error(`${data.slug}: assetClass=commodity but commodityMoats missing`);
    return computeCommodityMoatScore(data.commodityMoats);
  }
  if (!data.tenMoats) throw new Error(`${data.slug}: assetClass=equity but tenMoats missing`);
  return computeMoatScore(data.tenMoats);
}

// ─── Growth score ─────────────────────────────────────────────────────────────

type GrowthDriverTrend = 'accelerating' | 'stable' | 'decelerating';
type MarginTrend = 'expanding' | 'stable' | 'compressing';
type PrimaryGrowthType = 'TAM expansion' | 'market share' | 'both';
type KeyRiskSeverity = 'low' | 'moderate' | 'high' | 'severe';

export interface GrowthAnalysisInput {
  cagrEstimate: string;
  /**
   * The measured series `cagrEstimate` is answerable to, and its observed rate.
   * Not scored — it exists so the pillar's dominant input is a claim with a
   * citation rather than an assertion.
   *
   * The CAGR base drives ~78% of the growth score's variance across the book;
   * the four adjustment terms share the rest. That makes cagrEstimate the single
   * most load-bearing number in the pillar, and until now it was free text with
   * nothing to check it against. BTC's said 30–60% while every series it named
   * as a driver — holders +8.3% YoY, addresses ~9%/yr, institutional capital
   * outright shrinking — said something else entirely, and nothing in the
   * rubric noticed.
   *
   * THE SERIES MUST ACCRUE TO THE ASSET AND BE UNBOUNDED. Recording *a* series
   * is not the check — carrying the estimate is. Two ways a basis can be true,
   * checkable, and still incapable of supporting the number it is attached to:
   *
   *   • A bounded ratio. Market share and percent-of-supply are capped at 100%,
   *     so they cannot compound at their cited rate over a forecast. ETH cites
   *     "~65% of tokenized value" and "33.6% of supply staked" behind a 40%
   *     midpoint; both describe position, neither is a rate.
   *   • Third-party growth. Activity on a platform reaches the asset only
   *     through an accrual channel. Tokenized-RWA volume +315% YoY accrues to
   *     ETH via L1 fees, which fell from a ~$23M/day peak to ~$227K/day — the
   *     accrual rate is the second number, not the first.
   *
   * Where there is no revenue line (crypto, commodity) the accrual series is
   * adoption, and marking up from it is legitimate if stated: BTC anchors on
   * holders +8.3% YoY and marks up to 12–20% for institutional capital
   * intensity and the sovereign channel.
   *
   * Optional in the type so existing coverage stays valid; validate-stocks
   * requires it for crypto and commodity and reports coverage for the rest.
   */
  cagrBasis?: string;
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

/**
 * Piecewise CAGR → base score.
 *
 * Below zero the curve keeps descending to 0 at −20% CAGR (revenue roughly
 * halving across the forecast window) rather than resting on a flat floor, so
 * the bottom of the growth scale is a reachable statement about the business
 * instead of an arbitrary stop.
 *
 * SLOPE IS MONOTONE NON-INCREASING, which it was not before. The old curve
 * anchored 0% at 40 and 4% at 60 — 5 points per percentage point, the steepest
 * segment anywhere on the curve, and steeper than the distressed region beneath
 * it (2 pts/pp). It claimed more precision about the difference between a 1%
 * and a 3% grower than about the difference between a −10% and a −5% one, which
 * is backwards: forecasts are least reliable exactly where a business is
 * struggling. Anchoring 0% at 50 makes the slope decay properly —
 *
 *   ≤0%: 2.5 · 0–4%: 2.5 · 4–8%: 2.5 · 8–15%: 1.43 · 15–30%: 0.67 · 30%+: 0.25
 *
 * SATURATION ABOVE 30% IS DELIBERATE. Twenty-one assets sit at or above a 30%
 * midpoint and compress into base 90–95, so NBIS at 175% and AVGO at 40% differ
 * by 2.5 points. That looks like lost resolution, and it is — but spreading them
 * out on rate alone would assert that a 175% grower is meaningfully better than
 * a 40% one, when the real difference is how long either rate survives. The
 * pillar has no persistence input yet, so saturating is the honest choice;
 * validate-stocks flags implausibly high estimates instead of quietly absorbing
 * them.
 */
function baseFromCagr(cagr: number): number {
  if (cagr >= 30) return Math.min(95, 90 + (cagr - 30) * 0.25);
  if (cagr >= 15) return 80 + ((cagr - 15) / 15) * 10;
  if (cagr >= 8)  return 70 + ((cagr - 8) / 7) * 10;
  if (cagr >= 4)  return 60 + ((cagr - 4) / 4) * 10;
  if (cagr >= 0)  return 50 + (cagr / 4) * 10;
  return Math.max(0, 50 + cagr * 2.5);
}

/**
 * Compute a 0–100 growth score from structured growthAnalysis fields.
 * Returns null if cagrEstimate is unparseable (caller should fall back to author score).
 *
 *   growthScore = baseCAGR(cagrEstimate)        // 30 → 95
 *               + trajectoryAdj(drivers)         // ±4 (net of accelerating vs decelerating)
 *               + marginAdj(marginTrend)         // ±4, equities only
 *               + riskAdj(keyRiskSeverity)       // 0 to −15
 *
 * The risk term is treated as 0 when keyRiskSeverity is unset (legacy stocks),
 * which biases the score upward — call sites should prefer derived only when
 * keyRiskSeverity is present.
 *
 * THE RISK TERM CARRIES UNMATERIALISED DOWNSIDE ONLY. It caps at −15 while the
 * base spans ~70 points, so it cannot be where a structural fact is charged: a
 * measured series pointing against the estimate belongs in cagrEstimate, and an
 * observed change in a driver belongs in that driver's trend. Once a risk
 * becomes fact it is already charged in one of those two places, and leaving
 * severity where it was charges it twice.
 *
 * BTC is the worked example in both directions. Its July 2026 file marked the
 * sovereign driver decelerating for the Treasury–Commerce deadlock and *also*
 * held keyRiskSeverity at high for the same deadlock, while noting in its own
 * derivation that "the flow half of the risk stepped back, the policy half
 * confirmed" — both halves had moved toward less residual risk, and severity
 * did not move. Corrected to moderate: growth 68 → 73. ETH is the mirror image
 * and is not corrected here — it routes its fee collapse to keyRisk alone,
 * explicitly "charged there rather than twice", which under this rule is the
 * wrong term for it. See the cagrBasis note above.
 *
 * WHY primaryType NO LONGER SCORES. It used to add +3 for TAM expansion, +4 for
 * both, 0 for market share. Across the 128-asset book that made it a near
 * constant — 111 assets collected +3 or +4 — so it shifted the whole
 * distribution up and discriminated between almost nobody. Deleting it outright
 * moved mean rank by 1.2 places, which is the signature of a term that is not
 * doing work. It was also never a defensible claim in the first place: taking
 * share in a large market can be far more durable than riding an expanding TAM,
 * so the ordering it asserted was assumed rather than argued. The field stays in
 * the schema and still renders as a chip on the stock page, because describing
 * where growth comes from is useful — it just no longer pays points it cannot
 * justify.
 *
 * WHY marginTrend IS EQUITY-ONLY. Bitcoin has no margins. All seven crypto and
 * commodity assets carried marginTrend: "stable" — a field filled to satisfy the
 * schema, contributing 0 by coincidence rather than by analysis. Scoring it for
 * those classes was a modelling lie that a future editor could have turned into
 * a free +4 by typing "expanding". Moat already dispatches on assetClass; growth
 * now does too. Numerically this changes nothing today (every affected asset was
 * "stable"); it removes the trap.
 */
export interface GrowthBreakdown {
  base: number;
  trajectory: number;
  margin: number | null;
  risk: number;
  total: number;
}

/**
 * The growth score with its terms exposed, so the arithmetic can be *rendered*
 * from the formula rather than retyped by an author.
 *
 * `scoreDerivation` is prose and always has been — across the book it is only
 * loosely coupled to the formula it claims to describe (ORCL narrates
 * "+5 TAM expansion" where the term was worth 3), which is why 43 of 128 files
 * disagreed with their own computed score before this pillar was touched at all.
 * That string is shown directly beneath the score on every stock page, so the
 * site was explaining a third of its numbers with arithmetic that does not add
 * up. Deriving the breakdown here makes the displayed sum correct by
 * construction and demotes `scoreDerivation` to what it actually is: the
 * author's commentary on why the inputs are what they are.
 */
export function growthScoreBreakdown(
  g: GrowthAnalysisInput,
  assetClass: AssetClass = 'equity',
): GrowthBreakdown | null {
  const cagr = parseCagrEstimate(g.cagrEstimate);
  if (cagr == null) return null;

  const base = baseFromCagr(cagr);

  const trajectory = (() => {
    if (!g.drivers?.length) return 0;
    const accel = g.drivers.filter(d => d.trend === 'accelerating').length;
    const decel = g.drivers.filter(d => d.trend === 'decelerating').length;
    return ((accel - decel) / g.drivers.length) * 4;
  })();

  const margin = assetClass === 'equity'
    ? ({ expanding: 4, stable: 0, compressing: -4 } as const)[g.marginTrend]
    : null;
  const risk = g.keyRiskSeverity
    ? ({ low: 0, moderate: -5, high: -10, severe: -15 } as const)[g.keyRiskSeverity]
    : 0;

  const total = Math.max(0, Math.min(100, Math.round(base + trajectory + (margin ?? 0) + risk)));
  return { base, trajectory, margin, risk, total };
}

export function computeGrowthScore(
  g: GrowthAnalysisInput,
  assetClass: AssetClass = 'equity',
): number | null {
  return growthScoreBreakdown(g, assetClass)?.total ?? null;
}

// ─── Valuation score ──────────────────────────────────────────────────────────

/**
 * Compute a 0–100 valuation score from a live price vs. bear/base/bull targets.
 *
 * Anchor points (piecewise linear between them):
 *   price ≤ 0.8 × bear  → 100   (20% below the bear case)
 *   price = bear         →  90
 *   price = base         →  65
 *   price = bull         →  45
 *   price = 1.2 × bull   →  20
 *   price ≥ 2.0 × bull  →   0   (double the bull case)
 *
 * The curve descends all the way to 0 rather than resting at 20, so both ends
 * of the scale are reachable and mean something specific about the price. It
 * still saturates — every price at or beyond 2× bull scores 0, just as every
 * price at or below 0.8× bear scores 100 — but the dead zone now begins where
 * further overvaluation genuinely stops carrying information.
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

  if (price <= 2.0 * bull) {
    const t = (price - 1.2 * bull) / (0.8 * bull);
    return Math.round(20 - t * 20); // 20 → 0
  }

  return 0;
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

// ─── Composite ────────────────────────────────────────────────────────────────
//
// Composite: standardised geometric mean, moat 0.40 · growth 0.30 · valuation 0.30.
// Single source of truth — getAverageScore in stockData.ts delegates to computeCompositeRaw.
//
// WHY STANDARDISE. Weights only govern influence when the pillars they weight
// vary by comparable amounts. They don't: across the coverage universe the three
// rubrics produce very different spreads, because each was calibrated on its own
// terms rather than against the others.
//
//   pillar      range     sd of ln(score/100)
//   moat        22–98     0.266
//   growth      41–97     0.155
//   valuation   45–89     0.144   ← saturates at 100 below 0.8×bear, 20 above 1.2×bull
//
// Feeding those straight into a weighted geometric mean made the declared 40/30/30
// a fiction: moat moved the ranking roughly 4× as much per typical move as either
// other pillar, and drove ~71% of composite dispersion. The most subjective pillar
// (author-assigned moat status labels) was silently outvoting the one pillar that
// responds to price.
//
// So each pillar is converted to a z-score against the universe's own distribution
// before weighting. Post-standardisation a 1-sd move in any pillar shifts the
// composite in exact proportion to that pillar's weight — 40 : 30 : 30.
//
// This corrects the *weighting*; it cannot manufacture resolution a rubric doesn't
// have. The valuation curve still saturates at both ends, so names beyond 1.2×bull
// remain indistinguishable from each other — they are now merely punished as much
// as a 30%-weight pillar should punish them.

type PillarKey = 'moat' | 'growth' | 'valuation';
interface PillarCalibration {
  /** Mean of ln(score/100) across the coverage universe. */
  logMean: number;
  /** Standard deviation of ln(score/100) across the coverage universe. */
  logSd: number;
}

export const COMPOSITE_WEIGHTS: Record<PillarKey, number> = {
  moat: 0.40,
  growth: 0.30,
  valuation: 0.30,
};

/**
 * Per-pillar centre and spread, baked from the coverage universe rather than
 * recomputed at render time — a stock's published score must not move because
 * unrelated coverage was added. Re-derive with `npx tsx scripts/calibrate-pillars.ts`,
 * which also reports drift. Re-baking moves every score, so it is a deliberate
 * recalibration, not routine maintenance.
 *
 * Derived from 128 assets, July 2026. Re-baked when primaryType was retired
 * from computeGrowthScore: that term paid +3 or +4 to 111 of 128 assets, so
 * dropping it moved growth's logMean from −0.2578 to −0.2976 — a level shift,
 * not a change in what the pillar discriminates. Left un-re-baked it would have
 * pushed every asset's growth z-score down ~0.26 and dragged all 128 composites
 * with it, turning "remove a term that does nothing" into a book-wide markdown.
 * Re-baking keeps the change about discrimination, which was the point.
 *
 * Moat was re-baked August 2026 when the equity blend moved from 60/40
 * applicable-weight to 80/20 resilient-first. That compressed moat logSd
 * (software platforms stopped printing as fortresses). Left on the old
 * larger logSd, moat z-scores would shrink and the declared 40% weight would
 * under-govern; re-baking growth/valuation is out of scope (those formulae
 * did not change).
 */
export const PILLAR_CALIBRATION: Record<PillarKey, PillarCalibration> = {
  moat:       { logMean: -0.3536, logSd: 0.2382 },
  growth:     { logMean: -0.2976, logSd: 0.1499 },
  valuation:  { logMean: -0.3563, logSd: 0.1420 },
};

/**
 * Maps the weighted z-blend back onto the 0–100 scale.
 *
 * `logMean` / `logSd` reproduce the location and spread the un-standardised
 * formula produced over the same universe, so the recommendation bands and
 * MIN_AVG_SCORE keep the meaning they were tuned for — standardisation
 * redistributes where dispersion comes from without inflating or shrinking it.
 *
 * `blendedZSd` is the spread of Σ wₚ·zₚ itself, which is below 1 because the
 * weights sum to 1 over three only mildly-correlated pillars (pairwise ρ ≈ 0.15,
 * 0.13, −0.08). Dividing by it restores unit scale before applying `logSd`.
 */
export const COMPOSITE_CALIBRATION = {
  logMean: -0.3315,
  logSd: 0.1333,
  blendedZSd: 0.6220,
};

/**
 * Standardise one pillar score against the universe. Exported so the derivation
 * is inspectable: a returned z of 0 means "typical for this pillar", +1 means
 * one standard deviation better than the coverage universe.
 */
export function pillarZScore(pillar: PillarKey, score: number): number {
  const { logMean, logSd } = PILLAR_CALIBRATION[pillar];
  return (Math.log(Math.max(score, 1) / 100) - logMean) / logSd;
}

/**
 * Composite score, 0–100. Raw form returns a float for precise sorting;
 * computeComposite rounds for display and recommendation bands.
 *
 * Still a geometric mean — the blend happens in log space, so a weak pillar
 * genuinely drags the result rather than being averaged away by a strong one.
 * What standardisation changes is that "weak" is now measured against how much
 * that pillar actually varies, instead of against a rubric-specific scale.
 */
export function computeCompositeRaw(moat: number, growth: number, valuation: number): number {
  const blended =
    COMPOSITE_WEIGHTS.moat * pillarZScore('moat', moat) +
    COMPOSITE_WEIGHTS.growth * pillarZScore('growth', growth) +
    COMPOSITE_WEIGHTS.valuation * pillarZScore('valuation', valuation);

  const logComposite =
    COMPOSITE_CALIBRATION.logMean +
    COMPOSITE_CALIBRATION.logSd * (blended / COMPOSITE_CALIBRATION.blendedZSd);

  return Math.max(0, Math.min(100, Math.exp(logComposite) * 100));
}

export function computeComposite(moat: number, growth: number, valuation: number): number {
  return Math.round(computeCompositeRaw(moat, growth, valuation));
}

// Bands left where they were. Standardisation preserves the composite's location
// and spread by construction (see COMPOSITE_CALIBRATION), so the thresholds keep
// discriminating at the same population shares — what changes is which names land
// in which band, which is the point.
export function computeRecommendation(
  moat: number,
  growth: number,
  valuation: number,
): RecommendationStatus {
  const composite = computeComposite(moat, growth, valuation);
  if (composite >= 82) return 'Strong Buy';
  if (composite >= 75) return 'Accumulate';
  if (composite >= 68) return 'Hold';
  if (composite >= 60) return 'Speculative Buy';
  return 'Avoid';
}
