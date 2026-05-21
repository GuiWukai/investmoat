'use client';

import { useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import { Spinner } from "@heroui/react";
import type { RankedStock } from "../_lib/meta";

type Props = {
  portfolio: RankedStock[];
  weights: Record<string, number>;
  scoresLoading: boolean;
};

export function AllocationPie({ portfolio, weights, scoresLoading }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const pieSorted = useMemo(
    () => [...portfolio].sort((a, b) => (weights[b.ticker] ?? 0) - (weights[a.ticker] ?? 0)),
    [portfolio, weights]
  );

  const slices = useMemo(() => {
    const cx = 100, cy = 100, outerR = 88, innerR = 56, GAP = 0.016;
    const sliceAngles = pieSorted.map(s => ((weights[s.ticker] ?? 0) / 100) * 2 * Math.PI);
    const startAngles = sliceAngles.map((_, i) =>
      -Math.PI / 2 + sliceAngles.slice(0, i).reduce((a, b) => a + b, 0)
    );

    return pieSorted.map((stock, idx) => {
      const sliceAngle = sliceAngles[idx];
      const sa = startAngles[idx] + GAP / 2;
      const ea = startAngles[idx] + sliceAngle - GAP / 2;
      const largeArc = (ea - sa) > Math.PI ? 1 : 0;
      const c = Math.cos, s = Math.sin;
      const d = [
        `M ${cx + outerR * c(sa)} ${cy + outerR * s(sa)}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${cx + outerR * c(ea)} ${cy + outerR * s(ea)}`,
        `L ${cx + innerR * c(ea)} ${cy + innerR * s(ea)}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * c(sa)} ${cy + innerR * s(sa)}`,
        'Z',
      ].join(' ');
      return { ticker: stock.ticker, color: stock.color, d };
    });
  }, [pieSorted, weights]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <PieChart size={16} className="text-blue-400" />
        <h3 className="font-bold text-white/85">Visual Allocation</h3>
      </div>

      <div className="flex justify-center mb-6">
        <svg viewBox="0 0 200 200" className="w-56 h-56">
          {slices.map((slice, idx) => {
            const isHov = hovered === slice.ticker;
            return (
              <path
                key={slice.ticker}
                d={slice.d}
                fill={slice.color}
                opacity={hovered && !isHov ? 0.2 : isHov ? 1 : 0.85}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  transformOrigin: '100px 100px',
                  animation: `fade-in-scale 0.6s ease-out ${0.1 + idx * 0.04}s both`,
                  transform: isHov ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={() => setHovered(slice.ticker)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          {hovered ? (() => {
            const s = portfolio.find(p => p.ticker === hovered)!;
            return (
              <>
                <text x="100" y="95" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui,sans-serif">{s.ticker}</text>
                <text x="100" y="113" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="system-ui,sans-serif">{weights[s.ticker] ?? 0}%</text>
              </>
            );
          })() : (
            <>
              <text x="100" y="95" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="7.5" fontFamily="system-ui,sans-serif" letterSpacing="2.5">PORTFOLIO</text>
              <text x="100" y="114" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui,sans-serif">{portfolio.length} Holdings</text>
            </>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
        {pieSorted.map((stock) => (
          <div key={stock.ticker} className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: stock.color }} />
            <span className="text-xs font-bold text-white/70 truncate">{stock.ticker}</span>
            {scoresLoading
              ? <Spinner size="sm" color="default" classNames={{ wrapper: "w-3 h-3" }} />
              : <span className="text-xs text-white/30 ml-auto">{weights[stock.ticker] ?? 0}%</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
