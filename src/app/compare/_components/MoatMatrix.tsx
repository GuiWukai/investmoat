'use client';

import type { StockAnalysisData } from '@/types/stockAnalysis';
import { Layers } from 'lucide-react';
import { MOAT_LABELS, STATUS_STYLES, TEN_MOAT_KEYS } from '../_lib/moatLabels';

type Props = {
  stocks: StockAnalysisData[];
};

export function MoatMatrix({ stocks }: Props) {
  // Only equity stocks fit the 10-moat framework. Crypto / commodity use
  // different pillars that aren't comparable cell-for-cell.
  const equityStocks = stocks.filter(s => (s.assetClass ?? 'equity') === 'equity' && s.tenMoats);
  const skippedCount = stocks.length - equityStocks.length;

  if (equityStocks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <Layers size={16} className="text-amber-400" />
          <h3 className="font-bold text-white/85">Moat Framework</h3>
        </div>
        <p className="text-white/40 text-sm">
          The ten-moat matrix is only available for equity assets. Crypto protocols and commodities use
          different pillar frameworks and aren&apos;t directly comparable cell-for-cell.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-2">
        <Layers size={16} className="text-amber-400" />
        <h3 className="font-bold text-white/85">Ten-Moat Framework</h3>
      </div>
      <p className="text-white/40 text-xs md:text-sm mb-5 leading-relaxed">
        Resilient moats (top five) score 60% of the moat composite; vulnerable moats (bottom five) score 40%.
        {skippedCount > 0 && ` Skipping ${skippedCount} non-equity ticker${skippedCount !== 1 ? 's' : ''}.`}
      </p>

      <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left section-label py-2 pr-4">Moat Type</th>
              <th className="text-right section-label py-2 pr-4 hidden sm:table-cell w-12">Wt.</th>
              {equityStocks.map(s => (
                <th key={s.slug} className="text-center section-label py-2 px-2">
                  {s.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEN_MOAT_KEYS.map((key, idx) => {
              const meta = MOAT_LABELS[key];
              const isResilient = meta.group === 'resilient';
              const isGroupBoundary = idx === 5;
              return (
                <tr
                  key={key}
                  className={`border-b border-white/[0.03] last:border-0 ${isGroupBoundary ? 'border-t-2 border-t-white/[0.08]' : ''}`}
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-1 h-3 rounded-full ${isResilient ? 'bg-emerald-500/60' : 'bg-amber-500/60'}`}
                        aria-hidden
                      />
                      <span className="text-xs md:text-sm font-semibold text-white/80">{meta.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-right hidden sm:table-cell">
                    <span className="text-xs font-mono text-white/30">{meta.weight}</span>
                  </td>
                  {equityStocks.map(stock => {
                    const moat = stock.tenMoats?.[key];
                    if (!moat) {
                      return (
                        <td key={stock.slug} className="py-2.5 px-2 text-center">
                          <span className="text-xs text-white/20">—</span>
                        </td>
                      );
                    }
                    const isNA = moat.status === 'destroyed' && (moat.note.startsWith('N/A') || moat.note.startsWith('Not applicable'));
                    const style = STATUS_STYLES[moat.status];
                    return (
                      <td key={stock.slug} className="py-2.5 px-2 text-center">
                        <span
                          title={moat.note}
                          className={`inline-flex items-center justify-center text-[10px] md:text-[11px] font-black px-2 py-1 rounded-md border ${
                            isNA
                              ? 'text-white/30 bg-white/[0.04] border-white/10'
                              : `${style.text} ${style.bg} ${style.border}`
                          }`}
                        >
                          {isNA ? 'N/A' : style.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-white/[0.05] text-[11px] text-white/40">
        <span className="font-bold uppercase tracking-wider text-white/30">Legend:</span>
        {(['strong', 'intact', 'weakened', 'destroyed'] as const).map(status => {
          const style = STATUS_STYLES[status];
          return (
            <span key={status} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${style.bg} ${style.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.bg.replace('/15', '/70')}`} />
              <span className={style.text}>{style.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
