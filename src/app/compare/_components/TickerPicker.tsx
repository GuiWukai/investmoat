'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { allCoverageData } from '@/app/stockData';

type Props = {
  selected: string[];
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
  maxTickers: number;
};

export function TickerPicker({ selected, onAdd, onRemove, maxTickers }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim().toLowerCase();
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const results = useMemo(() => {
    if (!trimmed) return [];
    return allCoverageData
      .filter(s =>
        !selectedSet.has(s.slug) &&
        (s.name.toLowerCase().includes(trimmed) || s.ticker.toLowerCase().includes(trimmed))
      )
      .slice(0, 8);
  }, [trimmed, selectedSet]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedStocks = useMemo(
    () => selected.map(slug => allCoverageData.find(s => s.slug === slug)).filter(Boolean) as typeof allCoverageData,
    [selected]
  );

  const atMax = selected.length >= maxTickers;

  function handleSelect(slug: string) {
    onAdd(slug);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].slug);
    }
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {selectedStocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStocks.map(stock => (
            <div
              key={stock.slug}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300"
            >
              <span className="text-xs font-black tracking-wider">{stock.ticker}</span>
              <span className="text-xs text-blue-300/70 hidden sm:inline">{stock.name}</span>
              <button
                onClick={() => onRemove(stock.slug)}
                className="text-blue-300/50 hover:text-blue-200 transition-colors"
                aria-label={`Remove ${stock.ticker}`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!atMax && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selected.length === 0
                ? 'Search by name or ticker to start comparing…'
                : `Add another ticker (${selected.length}/${maxTickers})…`
            }
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              aria-label="Clear"
            >
              <X size={13} />
            </button>
          )}

          {open && trimmed && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/10 bg-[#080c14] shadow-2xl z-50 overflow-hidden">
              {results.length > 0 ? (
                results.map(stock => (
                  <button
                    key={stock.slug}
                    onMouseDown={e => { e.preventDefault(); handleSelect(stock.slug); }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors group border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Plus size={13} className="text-white/25 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors truncate">
                        {stock.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white/25 group-hover:text-white/50 transition-colors ml-2 font-mono flex-shrink-0">
                      {stock.ticker}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-white/25">
                  {selectedSet.size > 0 && allCoverageData.some(s => s.name.toLowerCase().includes(trimmed) || s.ticker.toLowerCase().includes(trimmed))
                    ? 'Already selected'
                    : 'No stocks found'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {atMax && (
        <p className="text-xs text-white/30">
          Maximum {maxTickers} tickers selected. Remove one to add another.
        </p>
      )}
    </div>
  );
}
