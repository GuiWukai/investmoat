'use client';

import { GitCompare, ArrowRight } from 'lucide-react';

type Props = {
  onSelect: (slugs: string[]) => void;
};

const SUGGESTED_COMPARISONS: Array<{ label: string; tickers: string[]; slugs: string[] }> = [
  { label: 'AI Infrastructure',  tickers: ['NVDA', 'AVGO', 'TSM'],   slugs: ['nvda', 'avgo', 'tsm'] },
  { label: 'Payment Networks',   tickers: ['V', 'MA', 'SPGI'],       slugs: ['visa', 'mastercard', 'spgi'] },
  { label: 'Cloud Hyperscalers', tickers: ['MSFT', 'AMZN', 'GOOGL'], slugs: ['msft', 'amazon', 'google'] },
  { label: 'AI Software Plays',  tickers: ['PLTR', 'CRM', 'NOW'],    slugs: ['pltr', 'crm', 'now'] },
];

export function EmptyState({ onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 md:py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
          <GitCompare size={20} className="text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white/85 mb-2">Compare up to three stocks side-by-side</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-6">
          See live prices, composite scores, scenario targets, and the ten-moat framework
          across multiple tickers — all on one page.
        </p>

        <div className="space-y-2">
          <p className="section-label mb-3">Try a comparison</p>
          {SUGGESTED_COMPARISONS.map(({ label, tickers, slugs }) => (
            <button
              key={label}
              onClick={() => onSelect(slugs)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                  {label}
                </span>
                <span className="text-[10px] font-mono text-white/30 group-hover:text-white/50 transition-colors truncate">
                  {tickers.join(' · ')}
                </span>
              </div>
              <ArrowRight size={13} className="text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
