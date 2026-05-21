'use client';

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AllocationPie } from "./_components/AllocationPie";
import { StrategySummary } from "./_components/StrategySummary";
import { HoldingsTable } from "./_components/HoldingsTable";
import { FIN_CATEGORIES, TECH_CATEGORIES } from "./_lib/meta";
import { useAllStockPrices } from "@/hooks/useAllStockPrices";
import {
  computeDynamicWeights,
  computeRanked,
  computeWeightedDailyChange,
  computeWeightedScenarioReturns,
  selectNearTop,
  selectPortfolio,
} from "./_lib/weights";

const WatchlistTable = dynamic(() => import("./_components/WatchlistTable"), {
  ssr: false,
  loading: () => null,
});

export default function PortfolioPage() {
  const { prices, changePercents, loaded: pricesLoaded } = useAllStockPrices();
  const [scoreColumn, setScoreColumn] = useState<'score' | 'change'>('score');

  const ranked = useMemo(() => computeRanked(prices), [prices]);
  const portfolio = useMemo(() => selectPortfolio(ranked), [ranked]);
  const nearTop = useMemo(() => selectNearTop(ranked, portfolio), [ranked, portfolio]);

  const liveScores = useMemo(() => {
    const m: Record<string, number> = {};
    portfolio.forEach(p => { m[p.ticker] = Math.round(p.composite); });
    return m;
  }, [portfolio]);

  const dynamicWeights = useMemo(
    () => computeDynamicWeights(portfolio, liveScores),
    [portfolio, liveScores]
  );

  const weightedDailyChange = useMemo(
    () => pricesLoaded ? computeWeightedDailyChange(portfolio, changePercents, dynamicWeights) : null,
    [pricesLoaded, portfolio, changePercents, dynamicWeights]
  );

  const weightedScenarioReturns = useMemo(
    () => pricesLoaded
      ? computeWeightedScenarioReturns(portfolio, prices, dynamicWeights)
      : { bear: null, base: null, bull: null },
    [pricesLoaded, portfolio, prices, dynamicWeights]
  );

  const techWeight = useMemo(
    () => portfolio.reduce((s, p) => TECH_CATEGORIES.has(p.category) ? s + (dynamicWeights[p.ticker] ?? 0) : s, 0),
    [portfolio, dynamicWeights]
  );
  const finWeight = useMemo(
    () => portfolio.reduce((s, p) => FIN_CATEGORIES.has(p.category) ? s + (dynamicWeights[p.ticker] ?? 0) : s, 0),
    [portfolio, dynamicWeights]
  );

  const scoresLoading = !pricesLoaded;

  return (
    <div className="animate-fade-in dot-pattern">
      <header className="pt-6 md:pt-12 pb-12 animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">Portfolio</p>
        <h1 className="text-4xl md:text-6xl font-extrabold gradient-text-animated leading-tight mb-4">
          Portfolio Distribution
        </h1>
        <p className="text-white/45 text-base md:text-lg max-w-2xl leading-relaxed">
          {portfolio.length} high-conviction positions selected for moat durability, growth scaling,
          and valuation discipline. Higher-scoring positions receive proportionally larger allocations
          (max 10% per position).
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 animate-fade-up stagger-fill-both" style={{ animationDelay: '0.15s' }}>
        <AllocationPie
          portfolio={portfolio}
          weights={dynamicWeights}
          scoresLoading={scoresLoading}
        />
        <StrategySummary
          positions={portfolio.length}
          pricesLoaded={pricesLoaded}
          weightedDailyChange={weightedDailyChange}
          weightedScenarioReturns={weightedScenarioReturns}
          techWeight={techWeight}
          finWeight={finWeight}
        />
      </div>

      <HoldingsTable
        portfolio={portfolio}
        weights={dynamicWeights}
        prices={prices}
        changePercents={changePercents}
        pricesLoaded={pricesLoaded}
        scoresLoading={scoresLoading}
        scoreColumn={scoreColumn}
        onScoreColumnChange={setScoreColumn}
      />

      <WatchlistTable
        nearTop={nearTop}
        prices={prices}
        changePercents={changePercents}
        pricesLoaded={pricesLoaded}
        scoreColumn={scoreColumn}
      />
    </div>
  );
}
