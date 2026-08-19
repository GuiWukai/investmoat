'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ScoreGauge } from '@/components/AnalysisComponents';
import {
  computeValuationScore,
  parseScenarioPrice,
  valuationDescription,
} from '@/lib/valuationScore';
import { useStockPrice } from '@/lib/useStockPrice';

interface DynamicValuationGaugeProps {
  slug: string;
  bearTarget: string; // e.g. "$240"
  baseTarget: string; // e.g. "$330"
  bullTarget: string; // e.g. "$400"
  fallbackScore: number;
  fallbackDescription: string;
  onScoreChange?: (score: number) => void;
  onLoadingEnd?: () => void;
}

export function DynamicValuationGauge({
  slug,
  bearTarget,
  baseTarget,
  bullTarget,
  fallbackScore,
  fallbackDescription,
  onScoreChange,
  onLoadingEnd,
}: DynamicValuationGaugeProps) {
  const bear = parseScenarioPrice(bearTarget);
  const base = parseScenarioPrice(baseTarget);
  const bull = parseScenarioPrice(bullTarget);
  const { data, loading } = useStockPrice(slug);

  const live = useMemo(() => {
    if (data?.price == null || !bear || !base || !bull) return null;
    return {
      score: computeValuationScore(data.price, bear, base, bull),
      description: valuationDescription(
        data.price,
        bear, base, bull,
        bearTarget, baseTarget, bullTarget,
      ),
    };
  }, [data, bear, base, bull, bearTarget, baseTarget, bullTarget]);

  const onScoreChangeRef = useRef(onScoreChange);
  onScoreChangeRef.current = onScoreChange;
  const onLoadingEndRef = useRef(onLoadingEnd);
  onLoadingEndRef.current = onLoadingEnd;

  useEffect(() => {
    if (live) onScoreChangeRef.current?.(live.score);
    if (!loading) onLoadingEndRef.current?.();
  }, [live, loading]);

  return (
    <ScoreGauge
      score={live?.score ?? fallbackScore}
      label="Valuation Score"
      description={live?.description ?? fallbackDescription}
    />
  );
}
