import { allCoverageData, getAverageScore } from "../../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";
import {
  MAX_PORTFOLIO,
  MAX_WEIGHT_PCT,
  NEAR_TOP_COUNT,
  PORTFOLIO_THRESHOLD,
  SCORE_BASELINE,
  type RankedStock,
  stockMeta,
} from "./meta";

export function computeRanked(allPrices: Record<string, number | null>): RankedStock[] {
  return [...allCoverageData]
    .map(s => {
      const price = allPrices[s.ticker];
      const bear = parseScenarioPrice(s.bearTarget);
      const base = parseScenarioPrice(s.baseTarget);
      const bull = parseScenarioPrice(s.bullTarget);
      const composite = (price != null && bear && base && bull)
        ? getAverageScore([s.scores[0], s.scores[1], computeValuationScore(price, bear, base, bull)])
        : getAverageScore(s.scores);
      return { s, composite };
    })
    .sort((a, b) => b.composite - a.composite)
    .map(({ s, composite }, idx) => ({
      ticker:   s.ticker,
      name:     s.name,
      slug:     s.slug,
      href:     s.href,
      color:    stockMeta[s.ticker]?.color    ?? "#888888",
      category: stockMeta[s.ticker]?.category ?? "Other",
      stock:    s,
      composite,
      rank:     idx + 1,
    }));
}

export function selectPortfolio(ranked: RankedStock[]): RankedStock[] {
  return ranked.filter(r => r.composite >= PORTFOLIO_THRESHOLD).slice(0, MAX_PORTFOLIO);
}

export function selectNearTop(ranked: RankedStock[], portfolio: RankedStock[]): RankedStock[] {
  const inPortfolio = new Set(portfolio.map(p => p.ticker));
  return ranked.filter(r => !inPortfolio.has(r.ticker)).slice(0, NEAR_TOP_COUNT);
}

export function computeDynamicWeights(
  portfolio: RankedStock[],
  liveScores: Record<string, number>,
): Record<string, number> {
  const adjusted = Object.fromEntries(
    portfolio.map((p) => [p.ticker, Math.max((liveScores[p.ticker] ?? 0) - SCORE_BASELINE, 1)])
  );

  const rawWeights: Record<string, number> = {};
  const capped = new Set<string>();
  let uncappedTickers = portfolio.map((p) => p.ticker);
  let budget = 100;

  while (uncappedTickers.length > 0) {
    const poolScore = uncappedTickers.reduce((s, t) => s + adjusted[t], 0);
    let anyCapped = false;
    for (const t of uncappedTickers) {
      const w = poolScore > 0 ? (adjusted[t] / poolScore) * budget : 0;
      if (w > MAX_WEIGHT_PCT) {
        rawWeights[t] = MAX_WEIGHT_PCT;
        capped.add(t);
        budget -= MAX_WEIGHT_PCT;
        anyCapped = true;
      }
    }
    if (!anyCapped) {
      const poolTotal = uncappedTickers.reduce((s, t) => s + adjusted[t], 0);
      for (const t of uncappedTickers) {
        rawWeights[t] = poolTotal > 0 ? (adjusted[t] / poolTotal) * budget : 0;
      }
      break;
    }
    uncappedTickers = uncappedTickers.filter((t) => !capped.has(t));
  }

  const floors = Object.fromEntries(portfolio.map((p) => [p.ticker, Math.floor(rawWeights[p.ticker])]));
  const remainder = 100 - Object.values(floors).reduce((a, b) => a + b, 0);
  const sorted = [...portfolio].sort((a, b) => (rawWeights[b.ticker] % 1) - (rawWeights[a.ticker] % 1));
  sorted.slice(0, remainder).forEach((p) => { floors[p.ticker]++; });
  return floors;
}

export function computeWeightedDailyChange(
  portfolio: RankedStock[],
  changePercents: Record<string, number | null>,
  weights: Record<string, number>,
): number | null {
  let acc = 0;
  let totalW = 0;
  portfolio.forEach(p => {
    const cp = changePercents[p.ticker];
    const w = weights[p.ticker] ?? 0;
    if (cp != null && w > 0) {
      acc += cp * w;
      totalW += w;
    }
  });
  return totalW === 0 ? null : acc / totalW;
}

export function computeWeightedScenarioReturns(
  portfolio: RankedStock[],
  prices: Record<string, number | null>,
  weights: Record<string, number>,
): { bear: number | null; base: number | null; bull: number | null } {
  const acc = { bear: 0, base: 0, bull: 0, w: 0 };
  portfolio.forEach(p => {
    const price = prices[p.ticker];
    const bear = parseScenarioPrice(p.stock.bearTarget);
    const base = parseScenarioPrice(p.stock.baseTarget);
    const bull = parseScenarioPrice(p.stock.bullTarget);
    const w = weights[p.ticker] ?? 0;
    if (price != null && price > 0 && bear && base && bull && w > 0) {
      acc.bear += ((bear - price) / price) * 100 * w;
      acc.base += ((base - price) / price) * 100 * w;
      acc.bull += ((bull - price) / price) * 100 * w;
      acc.w    += w;
    }
  });
  if (acc.w === 0) return { bear: null, base: null, bull: null };
  return { bear: acc.bear / acc.w, base: acc.base / acc.w, bull: acc.bull / acc.w };
}
