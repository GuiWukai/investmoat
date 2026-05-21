import { useEffect, useState } from "react";
import { allCoverageData } from "../../stockData";

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
    Promise.all(
      allCoverageData.map(s =>
        fetch(`/api/stock-price/${s.slug}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => [s.ticker, d?.price ?? null, d?.changePercent ?? null] as const)
          .catch(() => [s.ticker, null, null] as const)
      )
    ).then(entries => {
      if (cancelled) return;
      setPrices(Object.fromEntries(entries.map(([t, p]) => [t, p])));
      setChangePercents(Object.fromEntries(entries.map(([t, , c]) => [t, c])));
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  return { prices, changePercents, loaded };
}
