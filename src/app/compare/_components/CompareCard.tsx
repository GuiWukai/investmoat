'use client';

import Link from 'next/link';
import { ChevronRight, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Spinner } from '@heroui/react';
import type { StockAnalysisData } from '@/types/stockAnalysis';
import {
  computeAssetMoatScore,
  computeCompositeRaw,
  computeGrowthScore,
  computeValuationScore,
  parseScenarioPrice,
} from '@/lib/valuationScore';
import { scoreBgColor, scoreColor } from '../_lib/moatLabels';

type Props = {
  data: StockAnalysisData;
  price: number | null | undefined;
  changePercent: number | null | undefined;
  pricesLoaded: boolean;
  onRemove: () => void;
};

export function CompareCard({ data, price, changePercent, pricesLoaded, onRemove }: Props) {
  const moatScore = computeAssetMoatScore(data);
  const growthScore = computeGrowthScore(data.growth.growthAnalysis) ?? 0;
  const fallbackVal = data.valuation.score;

  const bear = parseScenarioPrice(data.scenarios.bear.priceTarget);
  const base = parseScenarioPrice(data.scenarios.base.priceTarget);
  const bull = parseScenarioPrice(data.scenarios.bull.priceTarget);

  const liveValuation = (price != null && bear && base && bull)
    ? computeValuationScore(price, bear, base, bull)
    : fallbackVal;
  const composite = Math.round(computeCompositeRaw(moatScore, growthScore, liveValuation));
  const compositeStyle = scoreBgColor(composite);

  const fmtReturn = (target: number | null) => {
    if (price == null || !target || price <= 0) return null;
    return ((target - price) / price) * 100;
  };

  const bearReturn = fmtReturn(bear);
  const baseReturn = fmtReturn(base);
  const bullReturn = fmtReturn(bull);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black tracking-[0.18em] text-white/30 uppercase mb-1">
            {data.ticker}
          </p>
          <h3 className="text-lg font-bold text-white/90 leading-tight truncate">{data.name}</h3>
          {data.lastAnalyzed && (
            <p className="text-[10px] text-white/25 mt-0.5">As of {data.lastAnalyzed}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded-md text-white/25 hover:text-white/70 hover:bg-white/5 transition-colors flex-shrink-0"
          aria-label={`Remove ${data.ticker}`}
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 pb-4 border-b border-white/[0.05]">
        <div>
          <p className="section-label mb-1">Live Price</p>
          {!pricesLoaded ? (
            <Spinner size="sm" color="default" />
          ) : price == null ? (
            <p className="text-2xl font-black text-white/30">—</p>
          ) : (
            <p className="text-2xl font-black text-white tabular-nums">${price.toFixed(2)}</p>
          )}
        </div>
        <div className="text-right">
          <p className="section-label mb-1">1D</p>
          {!pricesLoaded ? (
            <Spinner size="sm" color="default" />
          ) : changePercent == null ? (
            <p className="text-sm font-bold text-white/25">—</p>
          ) : (
            <div className={`flex items-center justify-end gap-1 ${changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-sm font-black tabular-nums">
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-xl border p-4 text-center"
        style={{ background: compositeStyle.bg, borderColor: compositeStyle.border }}
      >
        <p className="section-label mb-1">Composite Score</p>
        <p className="text-4xl font-black tabular-nums" style={{ color: compositeStyle.text }}>
          {composite}
        </p>
        <p className="text-[10px] text-white/35 mt-1">out of 100</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Moat',   value: moatScore },
          { label: 'Growth', value: growthScore },
          { label: 'Val',    value: Math.round(liveValuation) },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-white/[0.05] bg-white/[0.02] py-2.5 px-2 text-center">
            <p className="section-label mb-0.5">{s.label}</p>
            <p className={`text-lg font-black tabular-nums ${scoreColor(s.value)}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="section-label mb-2">Scenario Targets</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Bear', target: bear, ret: bearReturn, border: 'border-rose-500/15' },
            { label: 'Base', target: base, ret: baseReturn, border: 'border-blue-500/15' },
            { label: 'Bull', target: bull, ret: bullReturn, border: 'border-emerald-500/15' },
          ].map(({ label, target, ret, border }) => (
            <div key={label} className={`rounded-lg border ${border} bg-white/[0.02] py-2.5 px-2 text-center`}>
              <p className="section-label mb-0.5">{label}</p>
              <p className="text-sm font-bold text-white/85 tabular-nums">
                {target != null ? `$${target.toFixed(0)}` : '—'}
              </p>
              {ret != null ? (
                <p className={`text-[11px] font-black mt-0.5 ${ret >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ret >= 0 ? '+' : ''}{ret.toFixed(0)}%
                </p>
              ) : (
                <p className="text-[11px] text-white/20 mt-0.5">—</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="section-label mb-2">Growth</p>
        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">CAGR Estimate</span>
            <span className="text-white/85 font-semibold">{data.growth.growthAnalysis.cagrEstimate}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Margin Trend</span>
            <span className="text-white/85 font-semibold capitalize">{data.growth.growthAnalysis.marginTrend}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Key Risk</span>
            <span className={`font-semibold capitalize ${
              data.growth.growthAnalysis.keyRiskSeverity === 'severe' ? 'text-rose-400' :
              data.growth.growthAnalysis.keyRiskSeverity === 'high' ? 'text-amber-400' :
              data.growth.growthAnalysis.keyRiskSeverity === 'moderate' ? 'text-blue-400' :
              'text-emerald-400'
            }`}>{data.growth.growthAnalysis.keyRiskSeverity}</span>
          </div>
        </div>
      </div>

      <Link
        href={`/stocks/${data.slug}`}
        className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all group text-sm text-white/60 hover:text-white"
      >
        <span className="font-semibold">Full analysis</span>
        <ChevronRight size={15} className="text-white/30 group-hover:text-white/70 transition-colors" />
      </Link>
    </div>
  );
}
