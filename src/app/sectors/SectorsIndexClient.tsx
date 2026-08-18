'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
import { ScorePill } from './scoreUi';
import { MetricBand, PillarMeter, SectorIconTile } from './sectorVisuals';
import { useLiveCoverageScores } from './useLiveCoverageScores';

function sectorAverages(stocks: CoverageStock[], liveScores: Record<string, number>) {
  return {
    moat: meanRounded(stocks.map((s) => s.scores[0])),
    growth: meanRounded(stocks.map((s) => s.scores[1])),
    val: meanRounded(stocks.map((s) => s.scores[2])),
    score: meanRounded(stocks.map((s) => liveScores[s.ticker] ?? Math.round(getAverageScore(s.scores)))),
    im25: stocks.filter((s) => IM25_TICKERS.has(s.ticker)).length,
  };
}

function topNames(stocks: CoverageStock[], liveScores: Record<string, number>, n = 4) {
  return [...stocks]
    .sort((a, b) => (liveScores[b.ticker] ?? 0) - (liveScores[a.ticker] ?? 0))
    .slice(0, n);
}

function SectorCard({
  sector,
  stocks,
  liveScores,
  loading,
  strongest,
}: {
  sector: Sector;
  stocks: CoverageStock[];
  liveScores: Record<string, number>;
  loading: boolean;
  strongest: boolean;
}) {
  const avg = sectorAverages(stocks, liveScores);
  const leaders = topNames(stocks, liveScores);

  return (
    <Link href={`/sectors/${sector.slug}`} className="group flex h-full no-underline">
      <Card className="sector-product-card relative flex h-full w-full flex-col overflow-hidden p-6 md:p-7">
        <span
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, ${sector.color}, transparent 70%)` }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-25"
          style={{ background: sector.color }}
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <SectorIconTile slug={sector.slug} color={sector.color} />
          <span className="font-mono text-[11px] font-medium tabular-nums text-foreground/30">
            {stocks.length}
          </span>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          <h2 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground/90 transition-colors group-hover:text-foreground">
            {sector.label}
          </h2>
          {strongest && !loading && (
            <span className="rounded-full border border-accent/25 bg-accent-soft px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright">
              Strongest
            </span>
          )}
        </div>
        <p className="relative mt-2 line-clamp-3 min-h-[3.6rem] text-[13.5px] leading-relaxed text-foreground/42">
          {sector.description}
        </p>

        <div className="relative mt-6 space-y-2.5">
          <PillarMeter label="Moat" value={avg.moat} loading={loading} />
          <PillarMeter label="Growth" value={avg.growth} loading={loading} />
          <PillarMeter label="Val" value={avg.val} loading={loading} />
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-1.5">
          {leaders.map((s) => (
            <span
              key={s.ticker}
              className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide"
              style={{
                color: sector.color,
                background: `${sector.color}16`,
                boxShadow: `inset 0 0 0 1px ${sector.color}38`,
              }}
            >
              {s.ticker}
            </span>
          ))}
          {stocks.length > leaders.length && (
            <span className="text-[11px] text-foreground/30">
              +{stocks.length - leaders.length}
            </span>
          )}
          {avg.im25 > 0 && (
            <span className="ml-auto rounded-md border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright">
              {avg.im25} in IM25
            </span>
          )}
        </div>

        <div className="relative mt-auto flex items-center justify-between pt-6">
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground/40 transition-colors group-hover:text-gold-bright">
            Explore
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/25">
              Score
            </span>
            {loading ? (
              <span className="text-sm font-semibold tabular-nums text-foreground/20">—</span>
            ) : (
              <ScorePill value={avg.score} />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function SectorsIndexClient() {
  const { liveScores, pricesLoaded } = useLiveCoverageScores();

  const rows = SECTORS.map((sector) => {
    const stocks = stocksInSector(sector);
    return { sector, stocks, avg: sectorAverages(stocks, liveScores) };
  });

  const strongest = [...rows].sort((a, b) => b.avg.score - a.avg.score)[0];
  const im25Count = rows.reduce((sum, r) => sum + r.avg.im25, 0);

  return (
    <div className="animate-fade-in space-y-10 md:space-y-12">
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">Coverage Universe</p>
        <h1 className="page-title gradient-text-animated max-w-2xl">
          The book, by sector.
        </h1>
        <p className="page-dek mt-4">
          Coverage grouped by business model — scored the same way as every
          stock page, so you can compare moat, growth, and live valuation as a
          book, not a ticker.
        </p>
      </header>

      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.06s' }}>
        <MetricBand
          items={[
            { label: 'Sectors', value: SECTORS.length },
            { label: 'Names in coverage', value: allCoverageData.length },
            {
              label: 'Strongest book',
              value: pricesLoaded ? strongest.avg.score : '—',
              hint: pricesLoaded ? strongest.sector.label : 'Waiting on live prices',
            },
            { label: 'Names in IM25', value: im25Count },
          ]}
        />
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3 animate-fade-up stagger-fill-both"
        style={{ animationDelay: '0.12s' }}
      >
        {rows.map(({ sector, stocks }) => (
          <SectorCard
            key={sector.slug}
            sector={sector}
            stocks={stocks}
            liveScores={liveScores}
            loading={!pricesLoaded}
            strongest={pricesLoaded && sector.slug === strongest.sector.slug}
          />
        ))}
      </div>

      <p className="pb-4 text-center font-mono text-[10px] leading-relaxed text-foreground/25">
        Averages use live valuation when a price is available · IM25 membership is the
        score-selected book ·{' '}
        <Link href="/stocks" className="text-foreground/40 hover:text-gold-bright">
          full ranked universe
        </Link>
      </p>
    </div>
  );
}
