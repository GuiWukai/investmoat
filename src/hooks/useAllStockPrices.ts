'use client';

import { useEffect, useState } from "react";
import { allCoverageData } from "@/app/stockData";

export type AllPrices = {
  prices: Record<string, number | null>;
  changePercents: Record<string, number | null>;
  loaded: boolean;
};

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
