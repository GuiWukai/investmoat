'use client';

import { useEffect, useMemo, useState } from "react";
import { allCoverageData } from "@/app/stockData";

export type AllPrices = {
  prices: Record<string, number | null>;
  changePercents: Record<string, number | null>;
  loaded: boolean;
};

type PriceEntry = { price: number | null; changePercent: number | null };

export function useAllStockPrices(): AllPrices {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [changePercents, setChangePercents] = useState<Record<string, number | null>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slugs = allCoverageData.map(s => s.slug).join(',');

    fetch(`/api/stock-prices?tickers=${encodeURIComponent(slugs)}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled) return;
        const data: Record<string, { price: number | null; changePercent: number | null } | null> = json?.prices ?? {};

        const nextPrices: Record<string, number | null> = {};
        const nextChange: Record<string, number | null> = {};
        for (const stock of allCoverageData) {
          const entry = data[stock.slug];
          nextPrices[stock.ticker] = entry?.price ?? null;
          nextChange[stock.ticker] = entry?.changePercent ?? null;
        }

        setPrices(nextPrices);
        setChangePercents(nextChange);
        setLoaded(true);
      })
      .catch(() => { if (!cancelled) setLoaded(true); });

    return () => { cancelled = true; };
  }, []);

  return { prices, changePercents, loaded };
}

/**
 * Slug-scoped variant. Fetches the batched endpoint for only the requested
 * slugs and returns price + changePercent keyed by slug.
 */
export function useStockPrices(slugs: string[]): {
  prices: Record<string, number | null>;
  changePercents: Record<string, number | null>;
  loaded: boolean;
} {
  const key = useMemo(() => [...slugs].sort().join(','), [slugs]);
  const [fetched, setFetched] = useState<{ key: string; data: Record<string, PriceEntry | null> }>({ key: '', data: {} });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/stock-prices?tickers=${encodeURIComponent(key)}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled) return;
        setFetched({ key, data: json?.prices ?? {} });
      })
      .catch(() => { if (!cancelled) setFetched({ key, data: {} }); });
    return () => { cancelled = true; };
  }, [key]);

  return useMemo(() => {
    const prices: Record<string, number | null> = {};
    const changePercents: Record<string, number | null> = {};
    if (!key) return { prices, changePercents, loaded: true };
    for (const slug of key.split(',')) {
      const entry = fetched.data[slug];
      prices[slug] = entry?.price ?? null;
      changePercents[slug] = entry?.changePercent ?? null;
    }
    return { prices, changePercents, loaded: fetched.key === key };
  }, [key, fetched]);
}
