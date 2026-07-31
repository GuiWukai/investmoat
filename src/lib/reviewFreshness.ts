/**
 * Review freshness — how much of a price move since the last analysis the
 * composite is allowed to act on.
 *
 * THE ASYMMETRY THIS FIXES. Two of the three pillars are frozen at
 * `lastAnalyzed`; only valuation responds to the tape, because only valuation
 * reads a live price. So between reviews the composite can move a long way on
 * one input while the other two sit still. In the July 2026 book this was not
 * a rounding effect: KLA's composite read 74.0 against the price its own
 * analysis was written at and 86 against the live price, and Oracle 75.7
 * against 86. Four of the ten largest holdings — KLAC, ORCL, SPCX, ASML —
 * would not have cleared the ≥80 inclusion threshold at the prices their
 * analyses were written against. Nothing was re-analysed. They fell, and the
 * composite read the fall as quality.
 *
 * WHY THAT IS WRONG, PRECISELY. The live price is a fact and is never in
 * doubt. What is in doubt is the *inference* the composite draws from it. A
 * 30% drawdown usually carries news, and news is exactly what would have
 * re-rated moat and growth had anyone looked. Scoring the cheapness while the
 * two pillars that would have absorbed the bad news are frozen books one side
 * of the trade. The longer the gap, the likelier the move encodes something
 * the analysis has not seen.
 *
 * SO WE SHRINK THE DIVERGENCE, NOT THE LEVEL. The authored valuation score is
 * by construction "the valuation score at the price on the review date". We
 * interpolate between it and the live score by a credibility factor that
 * decays with review age. A name whose price has not moved since its review is
 * untouched at any age — divergence is zero, so there is nothing to shrink.
 * Only names being re-rated by the tape alone are damped, which is the
 * population the problem is about.
 *
 * SYMMETRIC, DELIBERATELY. A rally since review is damped exactly as much as a
 * drawdown. The stale pillars cannot respond to good news either, and an
 * asymmetric rule — discount the drawdowns, keep the rallies — would be a
 * momentum tilt smuggled in as a data-quality correction.
 *
 * WHERE IT STOPS. Shrinking toward the authored score means shrinking toward
 * an older and older price, so past some age the anchor is as stale as the
 * thing it is anchoring. That is where credibility bottoms out and
 * REVIEW_OVERDUE_DAYS starts asking validate-stocks for a re-read: the model
 * stops extrapolating at exactly the point it starts asking for a human. It
 * does not keep inventing precision it has run out of.
 *
 * CALIBRATION IS JUDGEMENT, NOT A FIT. There is no dataset here to estimate
 * these constants from — that would need a history of scores, which the book
 * does not keep. They encode a stated editorial claim about the review cycle,
 * and they are three named numbers in one place so that disagreeing with them
 * is a one-line change rather than an archaeology exercise.
 */

/**
 * Full credit for a price move within this many days of the review.
 *
 * Half a review cycle. Coverage in this book is re-read roughly every 30–60
 * days, so a fortnight is the window in which the analyst can be said to have
 * had the current price in view — anything inside it is noise the review
 * already priced.
 */
export const FULL_CREDIBILITY_DAYS = 14;

/**
 * Age at which credibility reaches its floor and stops falling.
 *
 * Four months is two to four review cycles. Beyond it the authored anchor is
 * too old to shrink toward with any conviction, so the curve flattens rather
 * than continuing to a fiction of zero.
 */
export const FLOOR_CREDIBILITY_DAYS = 120;

/**
 * The floor itself. Not zero: a price move always carries *some* information,
 * and a rule that ignored the tape entirely on stale names would be as wrong
 * in the other direction — it would pin a name to a months-old price and call
 * that discipline.
 */
export const CREDIBILITY_FLOOR = 0.35;

/**
 * Age past which validate-stocks asks for a re-read. Deliberately equal to
 * FLOOR_CREDIBILITY_DAYS: the damping curve and the nag start at the same
 * point, so there is no band where the model quietly extrapolates without
 * anything saying so.
 */
export const REVIEW_OVERDUE_DAYS = FLOOR_CREDIBILITY_DAYS;

const MS_PER_DAY = 86_400_000;

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Parse a `lastAnalyzed` string into a UTC date.
 *
 * Accepts both forms the schema allows: "June 27, 2026" (preferred) and the
 * legacy "June 2026". A month-only date is read as the FIRST of that month,
 * which can only make a review look older than it is — the conservative
 * direction, since the penalty for over-trusting a stale review is a position
 * sized on an unverified price move, and the penalty for under-trusting a
 * fresh one is a slightly damped score.
 *
 * Returns null for anything unparseable rather than guessing a date.
 */
export function parseReviewDate(lastAnalyzed: string | undefined): Date | null {
  if (!lastAnalyzed) return null;
  const match = lastAnalyzed.trim().match(/^([A-Za-z]+)\s+(?:(\d{1,2}),\s*)?(\d{4})$/);
  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;

  const day = match[2] ? Number(match[2]) : 1;
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));

  // Rejects "February 31, 2026" — Date.UTC would roll it into March.
  if (date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
  return date;
}

/**
 * Whole days between a review and `asOf`. Null when the date is unparseable or
 * missing; negative ages (a review dated in the future) clamp to 0.
 */
export function reviewAgeDays(lastAnalyzed: string | undefined, asOf: Date = new Date()): number | null {
  const reviewed = parseReviewDate(lastAnalyzed);
  if (!reviewed) return null;
  return Math.max(0, Math.floor((asOf.getTime() - reviewed.getTime()) / MS_PER_DAY));
}

/**
 * How much of the live-vs-authored valuation divergence to act on, 0–1.
 *
 * Flat at 1 through FULL_CREDIBILITY_DAYS, linear down to CREDIBILITY_FLOOR at
 * FLOOR_CREDIBILITY_DAYS, flat thereafter. Linear rather than exponential
 * because the anchors are the claim being made — an exponential would imply a
 * decay rate nobody measured.
 *
 * An unknown age (null) is treated as maximally stale. A file with no readable
 * review date has not earned the benefit of the doubt.
 */
export function valuationCredibility(ageDays: number | null): number {
  if (ageDays == null) return CREDIBILITY_FLOOR;
  if (ageDays <= FULL_CREDIBILITY_DAYS) return 1;
  if (ageDays >= FLOOR_CREDIBILITY_DAYS) return CREDIBILITY_FLOOR;

  const span = FLOOR_CREDIBILITY_DAYS - FULL_CREDIBILITY_DAYS;
  const travelled = (ageDays - FULL_CREDIBILITY_DAYS) / span;
  return 1 - travelled * (1 - CREDIBILITY_FLOOR);
}

export interface DampedValuation {
  /** The valuation pillar the composite should use, 0–100. */
  score: number;
  /** Live score before damping — what the raw price implies. */
  liveScore: number;
  /** The review-date anchor the live score is shrunk toward. */
  authoredScore: number;
  /** Credibility applied to the divergence, 0–1. */
  credibility: number;
  /** Review age in days; null when unknown. */
  ageDays: number | null;
  /** Signed points of valuation the damping removed. Zero when nothing moved. */
  damped: number;
}

/**
 * Shrink a live valuation score toward the score its analysis was written at.
 *
 * `damped` is reported rather than inferred so callers can show the size of the
 * correction instead of just its result — a 12-point haircut and a 0.4-point
 * one are very different claims about a holding, and both look identical once
 * the arithmetic is folded away.
 */
export function dampValuationScore(
  liveScore: number,
  authoredScore: number,
  ageDays: number | null,
): DampedValuation {
  const credibility = valuationCredibility(ageDays);
  const score = authoredScore + (liveScore - authoredScore) * credibility;
  return {
    score,
    liveScore,
    authoredScore,
    credibility,
    ageDays,
    damped: score - liveScore,
  };
}
