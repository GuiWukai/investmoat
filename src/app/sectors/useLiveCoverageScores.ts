'use client';

import { useEffect, useMemo, useState } from 'react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import { computeValuationScore, parseScenarioPrice } from '@/lib/valuationScore';

/**
 * Live composites for the coverage universe — same path /stocks uses.
 * Valuation recomputes from Yahoo when a price lands; otherwise the static
 * pillar blend is the fallback.
 */
export function useLiveCoverageScores() {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [pricesLoaded, setPricesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      allCoverageData.map((s) =>
        fetch(`/api/stock-price/${s.slug}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => [s.ticker, d?.price ?? null] as const)
          .catch(() => [s.ticker, null] as const),
      ),
    ).then((entries) => {
      if (cancelled) return;
      setPrices(Object.fromEntries(entries));
      setPricesLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveScores = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of allCoverageData) {
      const price = prices[s.ticker];
      const bear = parseScenarioPrice(s.bearTarget);
      const base = parseScenarioPrice(s.baseTarget);
      const bull = parseScenarioPrice(s.bullTarget);
      m[s.ticker] =
        price != null && bear && base && bull
          ? Math.round(
              getAverageScore([
                s.scores[0],
                s.scores[1],
                computeValuationScore(price, bear, base, bull),
              ]),
            )
          : Math.round(getAverageScore(s.scores));
    }
    return m;
  }, [prices]);

  return { liveScores, pricesLoaded };
}
