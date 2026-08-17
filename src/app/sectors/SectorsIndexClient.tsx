'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, Spinner } from '@heroui/react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  IM25_TICKERS,
  SECTORS,
  meanRounded,
  stocksInSector,
  type CoverageStock,
  type Sector,
} from '@/lib/sectors';
import { scoreColor, ScorePill } from './scoreUi';
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[44px]">
      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/25">{label}</span>
      <span className="text-sm font-black tabular-nums" style={{ color: scoreColor(value) }}>
        {value}
      </span>
    </div>
  );
}

function SectorCard({
  sector,
  stocks,
  liveScores,
  loading,
}: {
  sector: Sector;
  stocks: CoverageStock[];
  liveScores: Record<string, number>;
  loading: boolean;
}) {
  const avg = sectorAverages(stocks, liveScores);
  const leaders = topNames(stocks, liveScores);

  return (
    <Link href={`/sectors/${sector.slug}`} className="group block no-underline">
      <Card className="relative h-full overflow-hidden p-5 transition-colors hover:bg-foreground/[0.035]">
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: sector.color }}
        />
        <div className="flex items-start justify-between gap-3 pl-1">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground/90 group-hover:text-foreground">
              {sector.label}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/40">
              {sector.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-xs font-bold tabular-nums text-foreground/35">
              {stocks.length}
            </span>
            <ChevronRight
              size={16}
              className="text-foreground/15 transition-colors group-hover:text-gold-bright"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 pl-1">
          {loading ? (
            <Spinner size="sm" color="current" />
          ) : (
            <>
              <MiniStat label="Moat" value={avg.moat} />
              <MiniStat label="Growth" value={avg.growth} />
              <MiniStat label="Val" value={avg.val} />
              <div className="w-px h-7 bg-foreground/[0.07]" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/25">
                  Score
                </span>
                <ScorePill value={avg.score} />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-1.5 pl-1">
          {leaders.map((s) => (
            <span
              key={s.ticker}
              className="rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide"
              style={{
                color: sector.color,
                borderColor: `${sector.color}40`,
                background: `${sector.color}14`,
              }}
            >
              {s.ticker}
            </span>
          ))}
          {stocks.length > leaders.length && (
            <span className="text-[11px] text-foreground/25">
              +{stocks.length - leaders.length}
            </span>
          )}
          {avg.im25 > 0 && (
            <span className="ml-auto rounded-md border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright">
              {avg.im25} in IM25
            </span>
          )}
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
    <div className="animate-fade-in space-y-8">
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-2">Coverage Universe</p>
        <h1 className="mb-3 text-3xl font-extrabold gradient-text-animated md:text-4xl">
          Sectors
        </h1>
        <p className="max-w-xl text-sm text-foreground/40 md:text-base">
          The coverage book, sliced the same way the stocks filter is — so you can
          compare moat, growth, and live valuation across buckets rather than one
          name at a time.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-6">
          {[
            { label: 'Sectors', value: SECTORS.length },
            { label: 'Names', value: allCoverageData.length },
            {
              label: pricesLoaded ? `Strongest · ${strongest.sector.label}` : 'Strongest',
              value: pricesLoaded ? strongest.avg.score : '—',
            },
            { label: 'In IM25', value: im25Count },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums text-foreground">{stat.value}</span>
              <span className="text-[11px] font-medium text-foreground/25">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="fund-rule" />

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-fade-up stagger-fill-both"
        style={{ animationDelay: '0.08s' }}
      >
        {rows.map(({ sector, stocks }) => (
          <SectorCard
            key={sector.slug}
            sector={sector}
            stocks={stocks}
            liveScores={liveScores}
            loading={!pricesLoaded}
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
