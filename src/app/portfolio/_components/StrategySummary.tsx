'use client';

import { ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { Spinner } from "@heroui/react";
import { PORTFOLIO_THRESHOLD } from "../_lib/meta";

type ScenarioReturns = { bear: number | null; base: number | null; bull: number | null };

type Props = {
  positions: number;
  pricesLoaded: boolean;
  weightedDailyChange: number | null;
  weightedScenarioReturns: ScenarioReturns;
  techWeight: number;
  finWeight: number;
};

export function StrategySummary({
  positions,
  pricesLoaded,
  weightedDailyChange,
  weightedScenarioReturns,
  techWeight,
  finWeight,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="font-bold text-white/85">Strategy Summary</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="section-label mb-1.5">Positions</p>
          <p className="text-2xl font-black text-white">{positions}</p>
          <p className="text-white/28 text-[10px] mt-0.5">High-conviction holdings</p>
        </div>
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="section-label mb-1.5">Threshold</p>
          <p className="text-2xl font-black text-white">≥ {PORTFOLIO_THRESHOLD}</p>
          <p className="text-white/28 text-[10px] mt-0.5">Score required / 100</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="section-label mb-2">Today&apos;s Portfolio Change</p>
        {!pricesLoaded ? (
          <Spinner size="sm" color="default" />
        ) : weightedDailyChange == null ? (
          <p className="text-3xl font-black text-white/20">—</p>
        ) : (
          <div className={`flex items-center gap-2 ${weightedDailyChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {weightedDailyChange >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            <span className="text-3xl font-black tabular-nums">
              {weightedDailyChange >= 0 ? "+" : ""}{weightedDailyChange.toFixed(2)}%
            </span>
          </div>
        )}
        <p className="text-white/25 text-[10px] mt-1.5">Position-weighted · {positions} holdings</p>
      </div>

      <div>
        <p className="section-label mb-3">Est. 1-Year Return</p>
        {!pricesLoaded ? (
          <Spinner size="sm" color="default" />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {([
              { label: "Bear", value: weightedScenarioReturns.bear, border: "border-rose-500/15" },
              { label: "Base", value: weightedScenarioReturns.base, border: "border-blue-500/15" },
              { label: "Bull", value: weightedScenarioReturns.bull, border: "border-emerald-500/15" },
            ] as const).map(({ label, value, border }) => (
              <div key={label} className={`rounded-xl border ${border} bg-white/[0.02] py-3 px-2 text-center`}>
                <p className="section-label mb-1.5">{label}</p>
                {value != null ? (
                  <p className={`text-lg font-black ${value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {value >= 0 ? "+" : ""}{value.toFixed(1)}%
                  </p>
                ) : (
                  <p className="text-lg font-black text-white/20">—</p>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-white/22 text-[10px] mt-2">Weighted avg · allocation-adjusted</p>
      </div>

      <div>
        <p className="section-label mb-3">Sector Concentration</p>
        <div className="space-y-3">
          {[
            { label: "Tech & SaaS", value: techWeight, color: "bg-blue-500" },
            { label: "Financials & Payments", value: finWeight, color: "bg-emerald-500" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/45 text-xs font-medium">{label}</span>
                <span className="text-white/45 text-xs font-mono">{Math.round(value)}%</span>
              </div>
              <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
