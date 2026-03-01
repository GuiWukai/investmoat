'use client';

import { useEffect, useState } from 'react';
import { ScoreGauge } from '@/components/AnalysisComponents';
import {
  computeValuationScore,
  parseScenarioPrice,
  valuationDescription,
} from '@/lib/valuationScore';

interface DynamicValuationGaugeProps {
  slug: string;
  bearTarget: string; // e.g. "$240"
  baseTarget: string; // e.g. "$330"
  bullTarget: string; // e.g. "$400"
  fallbackScore: number;
  fallbackDescription: string;
}

export function DynamicValuationGauge({
  slug,
  bearTarget,
  baseTarget,
  bullTarget,
  fallbackScore,
  fallbackDescription,
}: DynamicValuationGaugeProps) {
  const [score, setScore] = useState<number>(fallbackScore);
  const [description, setDescription] = useState<string>(fallbackDescription);

  const bear = parseScenarioPrice(bearTarget);
  const base = parseScenarioPrice(baseTarget);
  const bull = parseScenarioPrice(bullTarget);

  useEffect(() => {
    if (!bear || !base || !bull) return;

    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || d?.price == null) return;
        const liveScore = computeValuationScore(d.price, bear, base, bull);
        const liveDesc = valuationDescription(
          d.price,
          bear, base, bull,
          bearTarget, baseTarget, bullTarget,
        );
        setScore(liveScore);
        setDescription(liveDesc);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug, bear, base, bull, bearTarget, baseTarget, bullTarget]);

  return (
    <ScoreGauge
      score={score}
      label="Valuation Score"
      description={description}
    />
  );
}
