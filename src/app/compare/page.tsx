'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GitCompare } from 'lucide-react';
import { allCoverageData } from '../stockData';
import { getStockData } from '@/data/stocks';
import { useStockPrices } from '@/hooks/useAllStockPrices';
import { TickerPicker } from './_components/TickerPicker';
import { CompareCard } from './_components/CompareCard';
import { MoatMatrix } from './_components/MoatMatrix';
import { EmptyState } from './_components/EmptyState';

const MAX_TICKERS = 3;
const PARAM = 't';

function parseSlugs(raw: string | null): string[] {
  if (!raw) return [];
  const valid = new Set(allCoverageData.map(s => s.slug));
  return Array.from(
    new Set(raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))
  )
    .filter(s => valid.has(s))
    .slice(0, MAX_TICKERS);
}

function CompareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => parseSlugs(searchParams.get(PARAM)), [searchParams]);
  const [selected, setSelected] = useState<string[]>(initial);

  // Sync state → URL whenever selected changes
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (selected.length === 0) {
      params.delete(PARAM);
    } else {
      params.set(PARAM, selected.join(','));
    }
    const qs = params.toString();
    router.replace(qs ? `/compare?${qs}` : '/compare', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const stocks = useMemo(
    () => selected.map(slug => getStockData(slug)).filter((s): s is NonNullable<ReturnType<typeof getStockData>> => s !== null),
    [selected]
  );

  const { prices, changePercents, loaded: pricesLoaded } = useStockPrices(selected);

  const handleAdd = useCallback((slug: string) => {
    setSelected(prev => prev.includes(slug) || prev.length >= MAX_TICKERS ? prev : [...prev, slug]);
  }, []);

  const handleRemove = useCallback((slug: string) => {
    setSelected(prev => prev.filter(s => s !== slug));
  }, []);

  const handleSuggested = useCallback((slugs: string[]) => {
    setSelected(slugs.slice(0, MAX_TICKERS));
  }, []);

  const gridCols = stocks.length === 1
    ? 'grid-cols-1 max-w-md'
    : stocks.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="animate-fade-in dot-pattern space-y-8">
      <header className="pt-6 md:pt-12 animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <GitCompare size={16} className="text-blue-400" />
          <p className="section-label">Compare</p>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold gradient-text-animated leading-tight mb-3">
          Side-by-side analysis
        </h1>
        <p className="text-white/45 text-base md:text-lg max-w-2xl leading-relaxed">
          Pick up to {MAX_TICKERS} tickers to compare live prices, composite scores, scenario targets,
          and the ten-moat framework on a single screen.
        </p>
      </header>

      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.08s' }}>
        <TickerPicker
          selected={selected}
          onAdd={handleAdd}
          onRemove={handleRemove}
          maxTickers={MAX_TICKERS}
        />
      </div>

      {stocks.length === 0 ? (
        <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.16s' }}>
          <EmptyState onSelect={handleSuggested} />
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 ${gridCols} animate-fade-up stagger-fill-both`}
            style={{ animationDelay: '0.16s' }}
          >
            {stocks.map(stock => (
              <CompareCard
                key={stock.slug}
                data={stock}
                price={prices[stock.slug]}
                changePercent={changePercents[stock.slug]}
                pricesLoaded={pricesLoaded}
                onRemove={() => handleRemove(stock.slug)}
              />
            ))}
          </div>

          {stocks.length >= 2 && (
            <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.24s' }}>
              <MoatMatrix stocks={stocks} />
            </div>
          )}

          {stocks.length === 1 && (
            <p className="text-center text-sm text-white/30 py-4">
              Add another ticker to see the side-by-side moat framework.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="animate-fade-in py-12" />}>
      <CompareInner />
    </Suspense>
  );
}
