'use client';

import { Eye } from "lucide-react";
import type { RankedStock } from "../_lib/meta";
import { MAX_PORTFOLIO } from "../_lib/meta";
import { HoldingRow, HoldingsTableHeader } from "./HoldingRow";

type Props = {
  nearTop: RankedStock[];
  prices: Record<string, number | null>;
  changePercents: Record<string, number | null>;
  pricesLoaded: boolean;
  scoreColumn: 'score' | 'change';
};

export default function WatchlistTable({
  nearTop,
  prices,
  changePercents,
  pricesLoaded,
  scoreColumn,
}: Props) {
  if (nearTop.length === 0) return null;

  return (
    <section className="animate-fade-up stagger-fill-both pb-12" style={{ animationDelay: '0.45s' }}>
      <div className="flex items-center gap-4 mb-5">
        <div>
          <p className="section-label mb-1">Watchlist</p>
          <h2 className="text-xl font-bold text-white/85">Near the Top {MAX_PORTFOLIO}</h2>
        </div>
        <div className="h-px flex-1 bg-white/[0.05]" />
        <div className="flex items-center gap-1.5 text-white/30 shrink-0">
          <Eye size={13} />
          <span className="text-[11px] font-bold uppercase tracking-wider">{nearTop.length}</span>
        </div>
      </div>

      <p className="text-white/40 text-xs md:text-sm mb-4 max-w-2xl leading-relaxed">
        The next {nearTop.length} highest-ranked names that fell outside the {MAX_PORTFOLIO}-position
        portfolio. Worth tracking — a moat upgrade, growth re-acceleration, or valuation reset could
        promote them.
      </p>

      <div className="rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">
        <HoldingsTableHeader showRank scoreColumn={scoreColumn} />
        <div className="divide-y divide-white/[0.04]">
          {nearTop.map((stock, idx) => (
            <HoldingRow
              key={stock.ticker}
              stock={stock}
              rank={stock.rank}
              pricesLoaded={pricesLoaded}
              price={prices[stock.ticker]}
              changePercent={changePercents[stock.ticker]}
              scoreColumn={scoreColumn}
              animationDelay={0.5 + idx * 0.035}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
