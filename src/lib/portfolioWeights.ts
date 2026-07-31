import { RISK_FACTOR_KEYS, type RiskFactor } from './riskFactors';

/**
 * Correlation-aware position sizing.
 *
 * THE PROBLEM WITH A PER-NAME CAP ALONE. Weights are proportional to composite
 * score, capped at MAX_WEIGHT_PCT per holding. That cap is the portfolio's only
 * concentration control, and it controls the wrong thing: it bounds how much of
 * the book any one *ticker* is, not how much of it is any one *bet*. In the
 * July 2026 book eight of the ten largest holdings named the AI capital
 * expenditure cycle as their key risk, and three of them — TSMC, KLA, ASML —
 * were the same leading-edge-equipment trade wearing three tickers. Sized at
 * 4% each they reported as three modest independent positions and behaved as
 * one 12% position. Splitting a bet across more tickers made every number on
 * the page smaller without making the portfolio any less concentrated.
 *
 * THE FIX. Cap exposure per risk factor as well as per name, and redistribute
 * what the cap displaces to names that do not carry the offending factor. The
 * factor labels come from each stock's JSON (see src/lib/riskFactors.ts for
 * what qualifies as a factor and why the vocabulary is deliberately coarse).
 *
 * WHAT THIS IS NOT. This is not a covariance model. It does not estimate
 * correlations, it does not know their magnitude, and it will not tell you the
 * portfolio's variance. It encodes one claim — that names failing for the same
 * stated reason should not be sized as independent bets — and enforces it as a
 * constraint. A real risk model would be better and would need a returns
 * history the book does not keep; asserting a correlation matrix from 130 hand
 * labels would be a more precise-looking version of the same guess.
 */

/** Largest share of the book any single holding may take. */
export const MAX_WEIGHT_PCT = 10;

/**
 * Largest share of the book any single risk factor may account for.
 *
 * 3.5× the per-name cap. The reasoning is a claim about what the per-name cap
 * was ever meant to say: at 10% per name, the largest single thing you can be
 * wrong about is 10% of the book. A factor is a single thing you can be wrong
 * about, so letting one run to 60% while every ticker inside it sits at 4%
 * makes the per-name cap decorative. 35% says a correlated bloc may be the
 * largest position in the portfolio by some margin — three and a half nominal
 * positions' worth — without being able to become the portfolio.
 *
 * It binds. In the July 2026 book `ai-capex` clears 50% unconstrained, so this
 * is not a cap set where it would never be tested.
 */
export const MAX_FACTOR_PCT = 35;

/**
 * Score subtracted before weights are taken, so allocation responds to the
 * spread between holdings rather than to their common level. A book scoring
 * 80–90 weights very differently from one scoring 0–90.
 */
export const SCORE_BASELINE = 70;

export interface WeightPosition {
  ticker: string;
  /** Composite score, live and rounded as displayed. */
  score: number;
  riskFactors: readonly RiskFactor[];
}

export interface FactorExposure {
  factor: RiskFactor;
  /** Share of the book carrying this factor, after constraints, in percent. */
  pct: number;
  /** What the share would have been with factor caps switched off. */
  uncappedPct: number;
  /** Holdings carrying this factor. */
  tickers: string[];
  /** Whether the cap bound here and pulled weight out of the bloc. */
  capped: boolean;
  /**
   * True when the cap could not be met — every remaining holding also carried
   * this factor, so there was nowhere uncorrelated to move the weight to. The
   * portfolio is more concentrated than the rule allows and no amount of
   * re-weighting fixes it; only a different holding does.
   */
  unsatisfiable: boolean;
}

export interface WeightResult {
  /** Integer percentages, summing to exactly 100. */
  weights: Record<string, number>;
  /** Percentages before factor caps, for showing what the cap moved. */
  uncappedWeights: Record<string, number>;
  /** Every factor present in the book, heaviest first. */
  exposures: FactorExposure[];
  /** Factors whose cap bound, heaviest first. */
  cappedFactors: FactorExposure[];
}

const EPSILON = 1e-9;

/**
 * Proportional allocation of `budget` across `free`, ignoring all constraints.
 */
function allocate(free: string[], adjusted: Record<string, number>, budget: number): Record<string, number> {
  const total = free.reduce((sum, t) => sum + adjusted[t], 0);
  const out: Record<string, number> = {};
  for (const t of free) out[t] = total > 0 ? (adjusted[t] / total) * budget : 0;
  return out;
}

/**
 * Solve for weights under both the per-name and per-factor caps.
 *
 * Water-filling: allocate proportionally, find the most-overshot constraint,
 * pin the holdings it binds at exactly their allowance, and re-allocate what is
 * left over the holdings still free. Each pass pins at least one holding, so it
 * terminates in at most (holdings + factors) passes.
 *
 * Returns float weights; the caller rounds.
 */
function solve(
  positions: WeightPosition[],
  adjusted: Record<string, number>,
  maxWeightPct: number,
  maxFactorPct: number,
): { weights: Record<string, number>; unsatisfiable: Set<RiskFactor> } {
  const factorsOf = new Map(positions.map(p => [p.ticker, p.riskFactors]));
  const pinned: Record<string, number> = {};
  const unsatisfiable = new Set<RiskFactor>();
  let free = positions.map(p => p.ticker);
  let budget = 100;

  const factorsPresent = RISK_FACTOR_KEYS.filter(f =>
    positions.some(p => p.riskFactors.includes(f)),
  );

  for (let pass = 0; pass <= positions.length + factorsPresent.length; pass++) {
    if (free.length === 0) break;

    const tentative = allocate(free, adjusted, budget);

    // Most-overshot constraint wins the pass. Relative overshoot rather than
    // absolute, so a 12%-of-10% name and a 60%-of-35% factor are compared on
    // the same scale instead of by whichever number happens to be bigger.
    let worst: { kind: 'name'; ticker: string } | { kind: 'factor'; factor: RiskFactor } | null = null;
    let worstOvershoot = 1 + EPSILON;

    for (const ticker of free) {
      const overshoot = tentative[ticker] / maxWeightPct;
      if (overshoot > worstOvershoot) {
        worstOvershoot = overshoot;
        worst = { kind: 'name', ticker };
      }
    }

    for (const factor of factorsPresent) {
      if (unsatisfiable.has(factor)) continue;
      const exposure =
        free.reduce((sum, t) => sum + (factorsOf.get(t)!.includes(factor) ? tentative[t] : 0), 0) +
        Object.entries(pinned).reduce(
          (sum, [t, w]) => sum + (factorsOf.get(t)!.includes(factor) ? w : 0),
          0,
        );
      const overshoot = exposure / maxFactorPct;
      if (overshoot > worstOvershoot) {
        worstOvershoot = overshoot;
        worst = { kind: 'factor', factor };
      }
    }

    if (!worst) {
      for (const ticker of free) pinned[ticker] = tentative[ticker];
      free = [];
      budget = 0;
      break;
    }

    if (worst.kind === 'name') {
      pinned[worst.ticker] = maxWeightPct;
      budget -= maxWeightPct;
      free = free.filter(t => t !== worst.ticker);
      continue;
    }

    const factor = worst.factor;
    const members = free.filter(t => factorsOf.get(t)!.includes(factor));
    const alreadyPinned = Object.entries(pinned).reduce(
      (sum, [t, w]) => sum + (factorsOf.get(t)!.includes(factor) ? w : 0),
      0,
    );
    const allowance = maxFactorPct - alreadyPinned;

    // Nowhere to put the weight: every holding that could absorb it carries the
    // same factor, or holdings already pinned have used the whole allowance.
    // Record it and stop enforcing this one rather than looping forever.
    if (members.length === 0 || allowance <= EPSILON || members.length === free.length) {
      unsatisfiable.add(factor);
      continue;
    }

    const share = allocate(members, adjusted, allowance);
    for (const t of members) pinned[t] = Math.min(share[t], maxWeightPct);
    budget -= members.reduce((sum, t) => sum + pinned[t], 0);
    free = free.filter(t => !factorsOf.get(t)!.includes(factor));
  }

  // Residual budget with nothing free to take it — only reachable when a cap
  // was unsatisfiable. Hand it back proportionally so weights still sum to 100
  // rather than quietly summing to less.
  const assigned = Object.values(pinned).reduce((a, b) => a + b, 0);
  if (assigned < 100 - EPSILON) {
    const residual = 100 - assigned;
    const tickers = positions.map(p => p.ticker);
    const share = allocate(tickers, adjusted, residual);
    for (const t of tickers) pinned[t] = (pinned[t] ?? 0) + share[t];
  }

  return { weights: pinned, unsatisfiable };
}

/**
 * Round float weights to integers summing to exactly 100, by largest remainder.
 *
 * Holdings sitting on a cap are served last: handing the spare point to a name
 * already pinned at 10% would push it to 11% and break the constraint the
 * solver just enforced. They stay eligible as a last resort, because summing to
 * 100 matters more than the final point of a cap.
 */
function roundToHundred(weights: Record<string, number>, maxWeightPct: number): Record<string, number> {
  const tickers = Object.keys(weights);
  const floors: Record<string, number> = {};
  for (const t of tickers) floors[t] = Math.floor(weights[t]);

  let remainder = 100 - Object.values(floors).reduce((a, b) => a + b, 0);

  const byRemainder = [...tickers].sort((a, b) => (weights[b] % 1) - (weights[a] % 1));
  const atCap = (t: string) => weights[t] >= maxWeightPct - EPSILON;
  const queue = [...byRemainder.filter(t => !atCap(t)), ...byRemainder.filter(atCap)];

  for (const t of queue) {
    if (remainder <= 0) break;
    floors[t]++;
    remainder--;
  }

  return floors;
}

/**
 * Compute portfolio weights under per-name and per-factor caps.
 *
 * Also returns the weights the same book would get with factor caps switched
 * off, so the page can show what the correlation constraint actually moved
 * rather than just asserting that it did something.
 */
export function computePortfolioWeights(
  positions: WeightPosition[],
  options: { maxWeightPct?: number; maxFactorPct?: number; scoreBaseline?: number } = {},
): WeightResult {
  const maxWeightPct = options.maxWeightPct ?? MAX_WEIGHT_PCT;
  const maxFactorPct = options.maxFactorPct ?? MAX_FACTOR_PCT;
  const scoreBaseline = options.scoreBaseline ?? SCORE_BASELINE;

  if (positions.length === 0) {
    return { weights: {}, uncappedWeights: {}, exposures: [], cappedFactors: [] };
  }

  const adjusted: Record<string, number> = {};
  for (const p of positions) adjusted[p.ticker] = Math.max(p.score - scoreBaseline, 1);

  const capped = solve(positions, adjusted, maxWeightPct, maxFactorPct);
  // Infinity disables the factor constraint without a second code path.
  const uncapped = solve(positions, adjusted, maxWeightPct, Infinity);

  const weights = roundToHundred(capped.weights, maxWeightPct);
  const uncappedWeights = roundToHundred(uncapped.weights, maxWeightPct);

  const exposures: FactorExposure[] = RISK_FACTOR_KEYS.flatMap(factor => {
    const members = positions.filter(p => p.riskFactors.includes(factor));
    if (members.length === 0) return [];

    const pct = members.reduce((sum, p) => sum + (weights[p.ticker] ?? 0), 0);
    const uncappedPct = members.reduce((sum, p) => sum + (uncappedWeights[p.ticker] ?? 0), 0);

    return [{
      factor,
      pct,
      uncappedPct,
      tickers: members.map(p => p.ticker),
      capped: uncappedPct > maxFactorPct + EPSILON,
      unsatisfiable: capped.unsatisfiable.has(factor),
    }];
  }).sort((a, b) => b.pct - a.pct);

  return {
    weights,
    uncappedWeights,
    exposures,
    cappedFactors: exposures.filter(e => e.capped),
  };
}
