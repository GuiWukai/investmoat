'use client';

import { useEffect, useState } from 'react';
import { coverageByTicker } from '@/lib/coverageScores';

/**
 * Fetch live prices for a set of covered tickers.
 *
 * Every block that recomputes the valuation pillar in the browser needs this,
 * so it lives next to the resolver rather than in any one component. The quote
 * route caches upstream for an hour, so requesting the same ticker from two
 * places on a page costs one round trip.
 *
 * Unknown tickers and failed fetches resolve to null rather than throwing: the
 * caller falls back to the static valuation score, which is the same behaviour
 * as a page loading with the network down.
 */
export function useLivePrices(tickers: string[]) {
  const key = tickers.join(',');
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const list = key ? key.split(',') : [];
    Promise.all(
      list.map((ticker) => {
        const entry = coverageByTicker[ticker];
        if (!entry) return Promise.resolve([ticker, null] as const);
        return fetch(`/api/stock-price/${entry.slug}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => [ticker, d?.price ?? null] as const)
          .catch(() => [ticker, null] as const);
      }),
    ).then((entries) => {
      if (cancelled) return;
      setPrices(Object.fromEntries(entries));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { prices, loaded };
}
