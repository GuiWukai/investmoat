'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Spinner } from '@heroui/react';
import { getAverageScore } from '@/app/stockData';
import { IM25_TICKERS, type CoverageStock, type Sector } from '@/lib/sectors';
import { ScorePill, SubScore } from '../scoreUi';
import { useLiveCoverageScores } from '../useLiveCoverageScores';

type SortKey = 'name' | 'moat' | 'growth' | 'val' | 'score';
type SortDir = 'asc' | 'desc';

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={11} className="text-foreground/15" />;
  return dir === 'asc'
    ? <ArrowUp size={11} className="text-gold-bright" />
    : <ArrowDown size={11} className="text-gold-bright" />;
}

function SortHeader({
  label, sortKey, active, dir, onSort, className, justify = 'start',
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
  justify?: 'start' | 'center';
}) {
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active ? 'text-gold-bright' : 'text-foreground/20 hover:text-foreground/45'
      } ${justify === 'center' ? 'justify-center' : ''} ${className ?? ''}`}
    >
      <span>{label}</span>
      <SortIndicator active={active} dir={dir} />
    </button>
  );
}

function StockRow({
  stock, rank, liveScore, loading, sectorColor,
}: {
  stock: CoverageStock;
  rank: number;
  liveScore: number;
  loading: boolean;
  sectorColor: string;
}) {
  const router = useRouter();
  const inIm25 = IM25_TICKERS.has(stock.ticker);

  return (
    <button
      onClick={() => router.push(stock.href)}
      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-foreground/[0.04] sm:gap-4 sm:px-5"
    >
      <span className="hidden w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-foreground/15 sm:block">
        {rank}
      </span>
      <div
        className="flex h-8 shrink-0 items-center justify-center rounded-lg px-2 text-[11px] font-black tracking-wider"
        style={{
          background: `${sectorColor}18`,
          border: `1px solid ${sectorColor}30`,
          color: sectorColor,
          minWidth: '44px',
        }}
      >
        {stock.ticker}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-semibold leading-tight text-foreground/90 transition-colors group-hover:text-foreground">
            {stock.name}
          </span>
          {inIm25 && (
            <span className="rounded-md border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright">
              IM25
            </span>
          )}
        </div>
      </div>
      <div className="hidden items-center gap-5 shrink-0 md:flex">
        <SubScore label="Moat" value={Math.round(stock.scores[0])} />
        <SubScore label="Growth" value={Math.round(stock.scores[1])} />
        <SubScore label="Val" value={Math.round(stock.scores[2])} />
      </div>
      <div className="hidden h-6 w-px shrink-0 bg-foreground/[0.07] md:block" />
      <div className="shrink-0">
        {loading ? <Spinner size="sm" color="current" /> : <ScorePill value={liveScore} />}
      </div>
      <ChevronRight
        size={14}
        className="shrink-0 text-foreground/15 transition-colors group-hover:text-foreground/50"
      />
    </button>
  );
}

export default function SectorDetailClient({
  sector,
  stocks,
}: {
  sector: Sector;
  stocks: CoverageStock[];
}) {
  const { liveScores, pricesLoaded } = useLiveCoverageScores();
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    const value = (s: CoverageStock): number | string => {
      switch (sortKey) {
        case 'name': return s.name.toLowerCase();
        case 'moat': return s.scores[0];
        case 'growth': return s.scores[1];
        case 'val': return s.scores[2];
        case 'score': return liveScores[s.ticker] ?? getAverageScore(s.scores);
      }
    };
    return [...stocks].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      let cmp: number;
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
      else cmp = (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [stocks, sortKey, sortDir, liveScores]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

  const avgMoat = Math.round(stocks.reduce((sum, s) => sum + s.scores[0], 0) / stocks.length);
  const avgGrowth = Math.round(stocks.reduce((sum, s) => sum + s.scores[1], 0) / stocks.length);
  const avgVal = Math.round(stocks.reduce((sum, s) => sum + s.scores[2], 0) / stocks.length);
  const avgScore = Math.round(
    stocks.reduce((sum, s) => sum + (liveScores[s.ticker] ?? getAverageScore(s.scores)), 0) / stocks.length,
  );
  const im25Count = stocks.filter((s) => IM25_TICKERS.has(s.ticker)).length;

  return (
    <div className="animate-fade-in space-y-8">
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <Link
          href="/sectors"
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-foreground/35 no-underline transition-colors hover:text-gold-bright"
        >
          <ChevronLeft size={14} />
          All sectors
        </Link>
        <p className="section-label mb-2">Coverage Universe</p>
        <h1 className="mb-3 text-3xl font-extrabold gradient-text-animated md:text-4xl">
          {sector.label}
        </h1>
        <p className="max-w-xl text-sm text-foreground/40 md:text-base">
          {sector.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-6">
          {[
            { label: 'Names', value: stocks.length },
            { label: 'Avg Moat', value: avgMoat },
            { label: 'Avg Growth', value: avgGrowth },
            { label: 'Avg Val', value: avgVal },
            { label: 'Avg Score', value: pricesLoaded ? avgScore : '—' },
            { label: 'In IM25', value: im25Count },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums text-foreground">{stat.value}</span>
              <span className="text-[11px] font-medium text-foreground/25">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="relative z-0 animate-fade-up stagger-fill-both" style={{ animationDelay: '0.08s' }}>
        <div className="mb-2 hidden items-center gap-4 px-5 md:flex">
          <span className="w-5 shrink-0" />
          <span className="w-[44px] shrink-0" />
          <SortHeader
            label="Company" sortKey="name" active={sortKey === 'name'} dir={sortDir}
            onSort={handleSort} className="flex-1"
          />
          <div className="flex items-center gap-5 shrink-0">
            <SortHeader label="Moat" sortKey="moat" active={sortKey === 'moat'} dir={sortDir}
              onSort={handleSort} className="min-w-[40px]" justify="center" />
            <SortHeader label="Growth" sortKey="growth" active={sortKey === 'growth'} dir={sortDir}
              onSort={handleSort} className="min-w-[40px]" justify="center" />
            <SortHeader label="Val" sortKey="val" active={sortKey === 'val'} dir={sortDir}
              onSort={handleSort} className="min-w-[40px]" justify="center" />
          </div>
          <div className="w-px shrink-0" />
          <SortHeader label="Score" sortKey="score" active={sortKey === 'score'} dir={sortDir}
            onSort={handleSort} className="w-9" justify="center" />
          <span className="w-3.5 shrink-0" />
        </div>

        <Card className="divide-y divide-foreground/[0.04] overflow-hidden">
          {sorted.map((stock, idx) => (
            <StockRow
              key={stock.ticker}
              stock={stock}
              rank={idx + 1}
              liveScore={liveScores[stock.ticker] ?? Math.round(getAverageScore(stock.scores))}
              loading={!pricesLoaded}
              sectorColor={sector.color}
            />
          ))}
        </Card>

        <p className="mt-3 text-center text-[11px] font-medium text-foreground/15">
          {stocks.length} stock{stocks.length !== 1 ? 's' : ''} · {sector.label}
        </p>
      </div>
    </div>
  );
}
