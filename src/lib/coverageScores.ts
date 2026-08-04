/**
 * Resolving a ticker to its four scores.
 *
 * Research articles and the stock page's industry comparison both render other
 * companies' numbers, and both must render the same numbers the rest of the
 * site does — a peer table that disagrees with the peer's own page would make
 * every comparison on it unreadable. So neither owns the arithmetic: they both
 * come here, which reads the coverage registry and the same score functions
 * /stocks and /portfolio use.
 */
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  computeRecommendation,
  computeValuationScore,
  parseScenarioPrice,
} from '@/lib/valuationScore';

export type CoverageEntry = (typeof allCoverageData)[number];

export const coverageByTicker: Record<string, CoverageEntry> = Object.fromEntries(
  allCoverageData.map((s) => [s.ticker, s]),
);

export interface ResolvedScores {
  ticker: string;
  name: string;
  href: string;
  slug: string;
  moat: number;
  growth: number;
  valuation: number;
  composite: number;
  recommendation: string;
  price: number | null;
}

/**
 * Scores for one covered ticker at a given price.
 *
 * A live price recomputes the valuation pillar against the bear/base/bull
 * ladder; without one the static score in the JSON stands in. `valuationOverride`
 * exists for the one case where the caller already holds a valuation the reader
 * can see elsewhere on the page — the stock page's own gauge — so the peer table
 * cannot print a different number for the company the page is about.
 */
export function resolveScores(
  ticker: string,
  price: number | null,
  valuationOverride?: number | null,
): ResolvedScores | null {
  const s = coverageByTicker[ticker];
  if (!s) return null;

  const [moat, growth, staticVal] = s.scores;
  const bear = parseScenarioPrice(s.bearTarget);
  const base = parseScenarioPrice(s.baseTarget);
  const bull = parseScenarioPrice(s.bullTarget);

  const live =
    price != null && bear && base && bull
      ? computeValuationScore(price, bear, base, bull)
      : staticVal;
  const valuation = valuationOverride ?? live;

  return {
    ticker: s.ticker,
    name: s.name,
    href: s.href,
    slug: s.slug,
    moat: Math.round(moat),
    growth: Math.round(growth),
    valuation: Math.round(valuation),
    composite: Math.round(getAverageScore([moat, growth, valuation])),
    recommendation: computeRecommendation(moat, growth, valuation),
    price,
  };
}
