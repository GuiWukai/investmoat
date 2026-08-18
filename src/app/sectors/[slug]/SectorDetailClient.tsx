'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ArrowUpRight } from 'lucide-react';
import { Card } from '@heroui/react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  IM25_TICKERS,
  SECTORS,
  meanRounded,
  stocksInSector,
  type CoverageStock,
  type Sector,
} from '@/lib/sectors';
import { scoreColor, ScorePill } from '../scoreUi';
import { MetricBand, SectorIconTile, VsBookRow } from '../sectorVisuals';
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
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active ? 'text-gold-bright' : 'text-foreground/30 hover:text-foreground/55'
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
  const inIm25 = IM25_TICKERS.has(stock.ticker);
  const moat = Math.round(stock.scores[0]);
  const growth = Math.round(stock.scores[1]);
  const val = Math.round(stock.scores[2]);

  return (
    <Link
      href={stock.href}
      className="group flex w-full items-center gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-foreground/[0.035] sm:gap-4 sm:px-5"
    >
      <span className="hidden w-5 shrink-0 text-right text-[11px] font-medium tabular-nums text-foreground/20 sm:block">
        {rank}
      </span>
      <div
        className="flex h-8 shrink-0 items-center justify-center rounded-lg px-2 text-[11px] font-black tracking-wider"
        style={{
          background: `${sectorColor}18`,
          boxShadow: `inset 0 0 0 1px ${sectorColor}30`,
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
        <p className="mt-0.5 text-[11px] tabular-nums text-foreground/30 md:hidden">
          Moat {moat}
          <span className="mx-1.5 text-foreground/15">·</span>
          Growth {growth}
          <span className="mx-1.5 text-foreground/15">·</span>
          Val {val}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-5 md:flex">
        <span className="w-10 text-center text-sm font-semibold tabular-nums" style={{ color: scoreColor(moat) }}>
          {moat}
        </span>
        <span className="w-10 text-center text-sm font-semibold tabular-nums" style={{ color: scoreColor(growth) }}>
          {growth}
        </span>
        <span className="w-10 text-center text-sm font-semibold tabular-nums" style={{ color: scoreColor(val) }}>
          {val}
        </span>
      </div>
      <div className="hidden h-6 w-px shrink-0 bg-foreground/[0.07] md:block" />
      <div className="shrink-0">
        {loading ? (
          <span className="inline-flex h-7 w-9 items-center justify-center text-xs tabular-nums text-foreground/20">
            —
          </span>
        ) : (
          <ScorePill value={liveScore} />
        )}
      </div>
      <ArrowUpRight
        size={14}
        className="shrink-0 text-foreground/15 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-bright"
      />
    </Link>
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

  const avgMoat = meanRounded(stocks.map((s) => s.scores[0]));
  const avgGrowth = meanRounded(stocks.map((s) => s.scores[1]));
  const avgVal = meanRounded(stocks.map((s) => s.scores[2]));
  const avgScore = meanRounded(
    stocks.map((s) => liveScores[s.ticker] ?? getAverageScore(s.scores)),
  );
  const im25Count = stocks.filter((s) => IM25_TICKERS.has(s.ticker)).length;

  const bookMoat = meanRounded(allCoverageData.map((s) => s.scores[0]));
  const bookGrowth = meanRounded(allCoverageData.map((s) => s.scores[1]));
  const bookVal = meanRounded(allCoverageData.map((s) => s.scores[2]));

  const others = SECTORS.filter((s) => s.slug !== sector.slug);

  return (
    <div className="animate-fade-in space-y-10 md:space-y-12">
      <header className="relative animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <span
          className="pointer-events-none absolute -left-8 -top-10 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ background: sector.color }}
          aria-hidden
        />

        <Link
          href="/sectors"
          className="relative mb-5 inline-flex items-center gap-1 text-[12px] font-medium text-foreground/40 no-underline transition-colors hover:text-gold-bright"
        >
          <ChevronLeft size={14} />
          All sectors
        </Link>

        <div className="relative flex items-start gap-4">
          <SectorIconTile slug={sector.slug} color={sector.color} size="lg" />
          <div className="min-w-0">
            <p className="section-label mb-2">Coverage Universe</p>
            <h1 className="page-title gradient-text-animated">
              {sector.label}
            </h1>
          </div>
        </div>

        <p className="page-dek relative mt-4">
          {sector.description}
        </p>
      </header>

      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.06s' }}>
        <MetricBand
          items={[
            { label: 'Names', value: stocks.length },
            { label: 'Avg moat', value: avgMoat },
            { label: 'Avg growth', value: avgGrowth },
            { label: 'Avg val', value: avgVal },
            { label: 'Avg score', value: pricesLoaded ? avgScore : '—' },
            { label: 'In IM25', value: im25Count },
          ]}
        />
      </div>

      <Card className="relative overflow-hidden p-6 animate-fade-up stagger-fill-both md:p-7" style={{ animationDelay: '0.1s' }}>
        <p className="section-label mb-1">Versus the book</p>
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-foreground/90">
          How this bucket sits against coverage
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <VsBookRow label="Moat" sectorValue={avgMoat} bookValue={bookMoat} />
          <VsBookRow label="Growth" sectorValue={avgGrowth} bookValue={bookGrowth} />
          <VsBookRow label="Val" sectorValue={avgVal} bookValue={bookVal} />
        </div>
      </Card>

      <div className="relative z-0 animate-fade-up stagger-fill-both" style={{ animationDelay: '0.14s' }}>
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 md:hidden">
          {([
            ['score', 'Score'],
            ['moat', 'Moat'],
            ['growth', 'Growth'],
            ['val', 'Val'],
            ['name', 'Name'],
          ] as const).map(([key, label]) => {
            const active = sortKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSort(key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  active
                    ? 'border border-accent/40 bg-accent-soft text-gold-bright'
                    : 'border border-border text-foreground/40 hover:text-foreground/70'
                }`}
              >
                {label}
                {active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
              </button>
            );
          })}
        </div>

        <Card className="overflow-hidden">
          <div className="hidden items-center gap-4 border-b border-border bg-foreground/[0.02] px-5 py-3 md:flex">
            <span className="w-5 shrink-0" />
            <span className="w-[44px] shrink-0" />
            <SortHeader
              label="Company" sortKey="name" active={sortKey === 'name'} dir={sortDir}
              onSort={handleSort} className="flex-1"
            />
            <div className="flex shrink-0 items-center gap-5">
              <SortHeader label="Moat" sortKey="moat" active={sortKey === 'moat'} dir={sortDir}
                onSort={handleSort} className="w-10" justify="center" />
              <SortHeader label="Growth" sortKey="growth" active={sortKey === 'growth'} dir={sortDir}
                onSort={handleSort} className="w-10" justify="center" />
              <SortHeader label="Val" sortKey="val" active={sortKey === 'val'} dir={sortDir}
                onSort={handleSort} className="w-10" justify="center" />
            </div>
            <div className="w-px shrink-0" />
            <SortHeader label="Score" sortKey="score" active={sortKey === 'score'} dir={sortDir}
              onSort={handleSort} className="w-9" justify="center" />
            <span className="w-3.5 shrink-0" />
          </div>

          <div className="divide-y divide-foreground/[0.04]">
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
          </div>
        </Card>

        <p className="mt-3 text-center text-[11px] font-medium text-foreground/25">
          {stocks.length} stock{stocks.length !== 1 ? 's' : ''} · {sector.label}
        </p>
      </div>

      <section className="animate-fade-up stagger-fill-both pb-4" style={{ animationDelay: '0.18s' }}>
        <p className="section-label mb-4">Other sectors</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {others.map((s) => {
            const names = stocksInSector(s);
            const count = names.length;
            const avg = meanRounded(
              names.map((st) => liveScores[st.ticker] ?? getAverageScore(st.scores)),
            );
            return (
              <Link
                key={s.slug}
                href={`/sectors/${s.slug}`}
                className="group flex no-underline"
              >
                <Card className="sector-product-card relative flex h-full w-full flex-col overflow-hidden p-4">
                  <span
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, ${s.color}, transparent 75%)` }}
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-2">
                    <SectorIconTile slug={s.slug} color={s.color} size="sm" />
                    {pricesLoaded ? (
                      <ScorePill value={avg} />
                    ) : (
                      <span className="text-xs tabular-nums text-foreground/20">—</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground/85 transition-colors group-hover:text-foreground">
                    {s.label}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-foreground/30">
                    {count} name{count !== 1 ? 's' : ''}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
