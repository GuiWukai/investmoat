'use client';

import type { RankedStock } from "../_lib/meta";
import { HoldingRow, HoldingsTableHeader } from "./HoldingRow";

type Props = {
  portfolio: RankedStock[];
  weights: Record<string, number>;
  prices: Record<string, number | null>;
  changePercents: Record<string, number | null>;
  pricesLoaded: boolean;
  scoresLoading: boolean;
  scoreColumn: 'score' | 'change';
  onScoreColumnChange: (c: 'score' | 'change') => void;
};

export function HoldingsTable({
  portfolio,
  weights,
  prices,
  changePercents,
  pricesLoaded,
  scoresLoading,
  scoreColumn,
  onScoreColumnChange,
}: Props) {
  const sorted = [...portfolio].sort((a, b) => b.composite - a.composite);

  return (
    <section className="animate-fade-up stagger-fill-both pb-12" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-4 mb-5">
        <div>
          <p className="section-label mb-1">Holdings</p>
          <h2 className="text-xl font-bold text-white/85">Allocation Breakdown</h2>
        </div>
        <div className="h-px flex-1 bg-white/[0.05]" />
        <div className="flex lg:hidden items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1 shrink-0">
          {([['score', 'Score'], ['change', '1D %']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onScoreColumnChange(val)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                scoreColumn === val ? 'bg-white/[0.12] text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">
        <HoldingsTableHeader showWeight scoreColumn={scoreColumn} />
        <div className="divide-y divide-white/[0.04]">
          {sorted.map((stock, idx) => (
            <HoldingRow
              key={stock.ticker}
              stock={stock}
              weight={weights[stock.ticker] ?? 0}
              scoresLoading={scoresLoading}
              pricesLoaded={pricesLoaded}
              price={prices[stock.ticker]}
              changePercent={changePercents[stock.ticker]}
              scoreColumn={scoreColumn}
              animationDelay={0.3 + idx * 0.035}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
