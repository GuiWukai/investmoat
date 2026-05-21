'use client';

import { useEffect, useState, type ReactNode } from "react";
import { getAverageScore } from "../../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

type Props = {
  slug: string;
  moat: number;
  growth: number;
  fallbackVal: number;
  bearTarget: string;
  baseTarget: string;
  bullTarget: string;
  children: (avg: number, loading: boolean) => ReactNode;
};

export function DynamicScore({
  slug,
  moat,
  growth,
  fallbackVal,
  bearTarget,
  baseTarget,
  bullTarget,
  children,
}: Props) {
  const [avg, setAvg] = useState(() =>
    Math.round(getAverageScore([moat, growth, fallbackVal]))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bear = parseScenarioPrice(bearTarget);
    const base = parseScenarioPrice(baseTarget);
    const bull = parseScenarioPrice(bullTarget);
    const fallbackAvg = Math.round(getAverageScore([moat, growth, fallbackVal]));
    if (!bear || !base || !bull) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled) return;
        if (d?.price != null) {
          const liveVal = computeValuationScore(d.price, bear, base, bull);
          setAvg(Math.round(getAverageScore([moat, growth, liveVal])));
        } else {
          setAvg(fallbackAvg);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setAvg(fallbackAvg); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [slug, moat, growth, fallbackVal, bearTarget, baseTarget, bullTarget]);

  return <>{children(avg, loading)}</>;
}
