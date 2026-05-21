'use client';

import { useRouter } from "next/navigation";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Spinner } from "@heroui/react";
import { parseScenarioPrice } from "@/lib/valuationScore";
import { getScoreColor, type RankedStock } from "../_lib/meta";
import { liveCompositeScore } from "../_lib/scoring";
import { CategoryBadge } from "./CategoryBadge";

export type HoldingRowProps = {
  stock: RankedStock;
  rank?: number;
  weight?: number;
  scoresLoading?: boolean;
  pricesLoaded: boolean;
  price: number | null | undefined;
  changePercent: number | null | undefined;
  scoreColumn: 'score' | 'change';
  animationDelay: number;
};

export function HoldingRow({
  stock,
  rank,
  weight,
  scoresLoading,
  pricesLoaded,
  price,
  changePercent,
  scoreColumn,
  animationDelay,
}: HoldingRowProps) {
  const router = useRouter();

  const bear = parseScenarioPrice(stock.stock.bearTarget);
  const base = parseScenarioPrice(stock.stock.baseTarget);
  const bull = parseScenarioPrice(stock.stock.bullTarget);

  const renderReturns = () => {
    if (!pricesLoaded) return <Spinner size="sm" color="default" />;
    if (price == null || !bear || !base || !bull || price <= 0) {
      return <span className="text-xs text-white/25">—</span>;
    }
    const fmt = (t: number) => {
      const r = ((t - price) / price) * 100;
      return { str: `${r >= 0 ? "+" : ""}${r.toFixed(0)}%`, pos: r >= 0 };
    };
    const b = fmt(bear), m = fmt(base), u = fmt(bull);
    return (
      <div className="flex gap-2.5 text-center">
        {[
          { label: "Bear", ...b },
          { label: "Base", ...m },
          { label: "Bull", ...u },
        ].map(({ label, str, pos }) => (
          <div key={label}>
            <div className="text-[9px] text-white/20 uppercase">{label}</div>
            <div className={`text-xs font-black ${pos ? "text-emerald-400" : "text-rose-400"}`}>{str}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderChange = () => {
    if (!pricesLoaded) return <Spinner size="sm" color="default" />;
    if (changePercent == null) return <span className="text-xs text-white/25">—</span>;
    const pos = changePercent >= 0;
    return (
      <div className={`flex items-center justify-end gap-0.5 ${pos ? "text-emerald-400" : "text-rose-400"}`}>
        {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        <span className="text-xs font-black tabular-nums">{pos ? "+" : ""}{changePercent.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <button
      onClick={() => router.push(stock.href)}
      className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-white/[0.04] transition-colors group text-left animate-slide-in-left stagger-fill-both"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: stock.color }} />

      {rank !== undefined && (
        <div className="w-9 text-right shrink-0">
          <span className="text-xs font-black text-white/35 tabular-nums">#{rank}</span>
        </div>
      )}

      <div className="min-w-[110px] md:min-w-[140px]">
        <div className="font-bold text-sm text-white/90 leading-tight">{stock.name}</div>
        <div className="text-[10px] text-white/28 tracking-[0.12em] font-black uppercase mt-0.5">{stock.ticker}</div>
      </div>

      <div className="hidden sm:block shrink-0 w-24">
        <CategoryBadge category={stock.category} />
      </div>

      <div className="flex-1" />

      <div className="hidden lg:flex items-center justify-end shrink-0 w-36">
        {renderReturns()}
      </div>

      <div className={`text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>
        {!pricesLoaded
          ? <Spinner size="sm" color="default" />
          : (() => {
              const avg = liveCompositeScore(
                price,
                stock.stock.scores[0],
                stock.stock.scores[1],
                stock.stock.scores[2],
                stock.stock.bearTarget,
                stock.stock.baseTarget,
                stock.stock.bullTarget,
              );
              return <span className={`text-sm font-black ${getScoreColor(avg)}`}>{avg}</span>;
            })()
        }
      </div>

      <div className={`text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>
        {renderChange()}
      </div>

      {weight !== undefined && (
        <div className="tabular-nums w-9 text-right shrink-0">
          {scoresLoading
            ? <Spinner size="sm" color="default" />
            : <span className="text-base font-black text-white">{weight}%</span>
          }
        </div>
      )}

      <ChevronRight
        size={15}
        className="text-white/15 group-hover:text-white/50 transition-colors shrink-0"
      />
    </button>
  );
}

export function HoldingsTableHeader({
  showRank,
  showWeight,
  scoreColumn,
}: {
  showRank?: boolean;
  showWeight?: boolean;
  scoreColumn: 'score' | 'change';
}) {
  return (
    <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 border-b border-white/[0.05] bg-white/[0.02]">
      <div className="w-0.5 shrink-0" />
      {showRank && <div className="section-label w-9 text-right shrink-0">#</div>}
      <div className="section-label min-w-[110px] md:min-w-[140px]">Holding</div>
      <div className="section-label hidden sm:block shrink-0 w-24">Category</div>
      <div className="flex-1" />
      <div className="hidden lg:block section-label text-right shrink-0 w-36">1-Yr Return</div>
      <div className={`section-label text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>Score</div>
      <div className={`section-label text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>1D %</div>
      {showWeight && <div className="section-label text-right shrink-0 w-9">Wt.</div>}
      <div className="w-[15px] shrink-0" />
    </div>
  );
}
