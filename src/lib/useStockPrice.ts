'use client';

import { useEffect, useState } from 'react';

export interface StockPriceQuote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  timestamp: string | null;
}

const cache = new Map<string, StockPriceQuote>();
const inflight = new Map<string, Promise<StockPriceQuote | null>>();

export function getCachedStockPrice(slug: string): StockPriceQuote | null {
  return cache.get(slug) ?? null;
}

/**
 * One in-flight request and one in-memory quote per slug. Stock pages used to
 * fire this endpoint from the header, the valuation gauge, the live-price
 * card and the scenario bar independently — and the Value tab remounted three
 * of those on every click, so switching tabs waited on Yahoo again.
 */
export function fetchStockPrice(slug: string): Promise<StockPriceQuote | null> {
  const cached = cache.get(slug);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(slug);
  if (pending) return pending;

  const request = fetch(`/api/stock-price/${encodeURIComponent(slug)}`)
    .then((res) => (res.ok ? (res.json() as Promise<StockPriceQuote>) : null))
    .then((data) => {
      if (data?.price != null) cache.set(slug, data);
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(slug);
    });

  inflight.set(slug, request);
  return request;
}

export function useStockPrice(slug: string): {
  data: StockPriceQuote | null;
  loading: boolean;
} {
  const [data, setData] = useState<StockPriceQuote | null>(() => cache.get(slug) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(slug));

  useEffect(() => {
    let cancelled = false;
    const cached = cache.get(slug);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setData(null);
    setLoading(true);
    fetchStockPrice(slug).then((quote) => {
      if (cancelled) return;
      if (quote) setData(quote);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading };
}
