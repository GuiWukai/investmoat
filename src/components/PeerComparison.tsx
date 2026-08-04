'use client';

/**
 * Industry Comparison — where this asset's scores sit inside its peer group.
 *
 * The section answers the question a single score can't: the pillar rubrics are
 * calibrated against all of coverage, so a 74 is a statement about 131 unrelated
 * assets. Here the same 74 is placed against the handful of names that face the
 * same customers, and the moat block names the pillars where this asset and its
 * peers actually disagree.
 *
 * Every number is resolved live from the coverage registry, so a peer's row
 * moves the moment that peer is re-analysed — nothing is transcribed.
 */

import React from 'react';
import Link from 'next/link';
import { Card } from '@heroui/react';
import { AnalysisSection, scoreHex } from '@/components/AnalysisComponents';
import { getPeerGroup } from '@/data/peerGroups';
import {
  buildPeerComparison,
  notableMoatGaps,
  ordinal,
  type PeerMoatGap,
  type PeerStanding,
} from '@/lib/peerComparison';
import type { ResolvedScores } from '@/lib/coverageScores';
import { useLivePrices } from '@/lib/useLivePrices';
import type { MoatStatus } from '@/types/stockAnalysis';

const REC_COLORS: Record<string, string> = {
  'Strong Buy': '#34d399',
  Accumulate: '#60a5fa',
  Hold: '#fbbf24',
  'Speculative Buy': '#a78bfa',
  Avoid: '#fb7185',
};

const STATUS_COLORS: Record<MoatStatus, string> = {
  strong: '#34d399',
  intact: '#60a5fa',
  weakened: '#fbbf24',
  destroyed: '#fb7185',
};

/**
 * Narrowest span the distribution bar will draw. Without a floor, a group whose
 * scores sit within three points renders as a bar with the members flung to
 * opposite ends — visually a chasm, numerically a rounding difference.
 */
const MIN_BAR_SPAN = 24;

function barDomain(values: number[]): { lo: number; hi: number } {
  let lo = Math.max(0, Math.min(...values) - 3);
  let hi = Math.min(100, Math.max(...values) + 3);
  const shortfall = MIN_BAR_SPAN - (hi - lo);
  if (shortfall > 0) {
    lo = Math.max(0, lo - shortfall / 2);
    hi = Math.min(100, hi + shortfall / 2);
  }
  return { lo, hi };
}

function DistributionBar({
  standing,
  rows,
  subjectTicker,
}: {
  standing: PeerStanding;
  rows: ResolvedScores[];
  subjectTicker: string;
}) {
  const { lo, hi } = barDomain([...standing.values, standing.median]);
  const span = hi - lo || 1;
  const pct = (v: number) => `${((v - lo) / span) * 100}%`;
  const hex = scoreHex(standing.value);

  return (
    <div className="relative h-6" role="img" aria-label={`${standing.label}: ${standing.value}, ${ordinal(standing.rank)} of ${standing.count}, group median ${standing.median}`}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-foreground/[0.05]" />

      {/* Group median — the reference the delta is quoted against. */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-4 bg-foreground/25"
        style={{ left: pct(standing.median) }}
      />

      {rows
        .filter((r) => r.ticker !== subjectTicker)
        .map((r) => (
          <div
            key={r.ticker}
            title={`${r.ticker} ${r[standing.key]}`}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[3px] h-2.5 rounded-full bg-foreground/30"
            style={{ left: pct(r[standing.key]) }}
          />
        ))}

      <div
        title={`${subjectTicker} ${standing.value}`}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
        style={{ left: pct(standing.value), background: hex, boxShadow: `0 0 0 3px ${hex}22` }}
      />
    </div>
  );
}

function StandingRow({
  standing,
  rows,
  subjectTicker,
}: {
  standing: PeerStanding;
  rows: ResolvedScores[];
  subjectTicker: string;
}) {
  const delta = Math.round((standing.value - standing.median) * 10) / 10;
  const deltaColor = delta > 0 ? '#34d399' : delta < 0 ? '#fb7185' : 'rgba(244,241,234,0.35)';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-0.5">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="section-label">{standing.label}</span>
          <span className="text-[11px] text-foreground/45 whitespace-nowrap">
            {ordinal(standing.rank)} of {standing.count}
          </span>
        </div>
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-sm font-black tabular-nums" style={{ color: scoreHex(standing.value) }}>
            {standing.value}
          </span>
          <span className="text-[11px] tabular-nums" style={{ color: deltaColor }}>
            {delta > 0 ? '+' : delta < 0 ? '\u2212' : '±'}
            {Math.abs(delta)}
          </span>
          <span className="text-[11px] text-foreground/25 whitespace-nowrap hidden sm:inline">
            vs median {standing.median}
          </span>
        </div>
      </div>
      <DistributionBar standing={standing} rows={rows} subjectTicker={subjectTicker} />
    </div>
  );
}

function ScorePill({ value, dim = false }: { value: number; dim?: boolean }) {
  const color = scoreHex(value);
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-black tabular-nums"
      style={{ color, background: `${color}${dim ? '12' : '18'}`, border: `1px solid ${color}30` }}
    >
      {value}
    </span>
  );
}

function RecBadge({ label }: { label: string }) {
  const color = REC_COLORS[label] ?? '#94a3b8';
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ color, background: `${color}14`, border: `1px solid ${color}26` }}
    >
      {label}
    </span>
  );
}

function PeerTable({ rows, subjectTicker }: { rows: ResolvedScores[]; subjectTicker: string }) {
  return (
    <>
      {/* Phone: the six columns don't fit, so each name becomes a card. */}
      <div className="sm:hidden">
        {rows.map((r) => {
          const isSubject = r.ticker === subjectTicker;
          return (
            <div
              key={r.ticker}
              className="border-t border-foreground/[0.05] px-4 py-3.5"
              style={isSubject ? { background: 'rgba(201,169,106,0.05)' } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={r.href} className="min-w-0">
                  <div
                    className={`text-[13px] font-black tracking-wider ${isSubject ? 'text-gold-bright' : 'text-foreground/90'}`}
                  >
                    {r.ticker}
                  </div>
                  <div className="text-[11px] text-foreground/40 leading-tight truncate">{r.name}</div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <RecBadge label={r.recommendation} />
                  <ScorePill value={r.composite} />
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-4">
                {(
                  [
                    ['Moat', r.moat],
                    ['Growth', r.growth],
                    ['Val', r.valuation],
                  ] as [string, number][]
                ).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">
                      {label}
                    </span>
                    <span className="text-[12px] font-black tabular-nums" style={{ color: scoreHex(value) }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">
              <th scope="col" className="py-3 pl-4 pr-3 font-bold">Name</th>
              <th scope="col" className="py-3 px-2 text-center font-bold">Moat</th>
              <th scope="col" className="py-3 px-2 text-center font-bold">Growth</th>
              <th scope="col" className="py-3 px-2 text-center font-bold">Val</th>
              <th scope="col" className="py-3 px-2 text-center font-bold text-gold-bright">Score</th>
              <th scope="col" className="py-3 pl-2 pr-4 text-center font-bold">Rec</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isSubject = r.ticker === subjectTicker;
              return (
                <tr
                  key={r.ticker}
                  className="border-t border-foreground/[0.05] hover:bg-foreground/[0.03] transition-colors"
                  style={
                    isSubject
                      ? { background: 'rgba(201,169,106,0.05)', boxShadow: 'inset 3px 0 0 var(--accent)' }
                      : undefined
                  }
                >
                  <td className="py-3 pr-3 pl-4 align-top">
                    <Link href={r.href} className="group inline-flex flex-col">
                      <span
                        className={`text-[13px] font-black tracking-wider transition-colors ${
                          isSubject ? 'text-gold-bright' : 'text-foreground/90 group-hover:text-gold-bright'
                        }`}
                      >
                        {r.ticker}
                      </span>
                      <span className="text-[11px] text-foreground/40 leading-tight">{r.name}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-center"><ScorePill value={r.moat} dim /></td>
                  <td className="py-3 px-2 text-center"><ScorePill value={r.growth} dim /></td>
                  <td className="py-3 px-2 text-center"><ScorePill value={r.valuation} dim /></td>
                  <td className="py-3 px-2 text-center"><ScorePill value={r.composite} /></td>
                  <td className="py-3 pl-2 pr-4 text-center"><RecBadge label={r.recommendation} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MoatGapList({ gaps, direction }: { gaps: PeerMoatGap[]; direction: 'stronger' | 'weaker' }) {
  const stronger = direction === 'stronger';
  const heading = stronger ? 'Ahead of the group' : 'Behind the group';
  const accent = stronger ? '#34d399' : '#fb7185';

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-3.5 rounded-full" style={{ background: accent }} />
        <span className="section-label">{heading}</span>
      </div>
      {gaps.length === 0 ? (
        <p className="text-[13px] text-foreground/30 leading-relaxed">
          Nothing here — no pillar separates it from the group in this direction.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {gaps.map((gap) => {
            const peers = stronger ? gap.peersBelow : gap.peersAbove;
            return (
              <li key={gap.key} className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-foreground/80">{gap.label}</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                  style={{
                    color: STATUS_COLORS[gap.status],
                    background: `${STATUS_COLORS[gap.status]}14`,
                    border: `1px solid ${STATUS_COLORS[gap.status]}26`,
                  }}
                >
                  {gap.status}
                </span>
                <span className="text-[11.5px] text-foreground/35">
                  {peers} {peers === 1 ? 'peer rates' : 'peers rate'} it {stronger ? 'lower' : 'higher'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PeerComparison({
  ticker,
  subjectValuation,
}: {
  ticker: string;
  /** The valuation the page's own gauge is showing, so the two agree. */
  subjectValuation?: number | null;
}) {
  const group = getPeerGroup(ticker);
  const { prices, loaded } = useLivePrices(group?.tickers ?? []);
  const model = buildPeerComparison(ticker, prices, subjectValuation);
  if (!model) return null;

  const { stronger, weaker } = notableMoatGaps(model.moatGaps);
  const composite = model.standings[0];
  const showMoatGaps = stronger.length > 0 || weaker.length > 0;

  return (
    <AnalysisSection title="Industry Comparison">
      <div className="space-y-4">
        <Card className="p-5 md:p-6 space-y-5">
          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap mb-2">
              <h4 className="text-base font-bold text-foreground/85">{model.group.label}</h4>
              <span className="text-[11px] text-foreground/35">{model.rows.length} names in coverage</span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">{model.group.basis}</p>
            <p className="text-sm text-foreground/65 leading-relaxed mt-3">
              <strong className="text-foreground/85">{ticker}</strong> ranks{' '}
              <strong className="text-foreground/85">{ordinal(composite.rank)} of {composite.count}</strong>{' '}
              in this group on composite score, against a group median of {composite.median}.
            </p>
          </div>

          <div className="h-px bg-foreground/[0.05]" />

          <div className="space-y-4">
            {model.standings.map((standing) => (
              <StandingRow
                key={standing.key}
                standing={standing}
                rows={model.rows}
                subjectTicker={ticker}
              />
            ))}
          </div>

          <p className="text-[11px] text-foreground/25 leading-relaxed">
            Each bar spans the group. Ticks are peers, the line is the group median, the dot is {ticker}.
          </p>
        </Card>

        {showMoatGaps && (
          <Card className="p-5 md:p-6">
            <h4 className="text-base font-bold text-foreground/85 mb-1.5">Where the moat differs</h4>
            <p className="text-sm text-foreground/45 leading-relaxed mb-5">
              Pillars on which {ticker} is assessed differently from most of the group. Pillars marked N/A for
              either side are left out — a moat that never applied is not one that was lost.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <MoatGapList gaps={stronger} direction="stronger" />
              <MoatGapList gaps={weaker} direction="weaker" />
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <PeerTable rows={model.rows} subjectTicker={ticker} />
          <div className="px-4 py-2.5 border-t border-foreground/[0.05] flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${loaded ? 'bg-[#34d399]' : 'bg-foreground/20 animate-pulse'}`}
            />
            <span className="text-[10px] uppercase tracking-widest text-foreground/30">
              {loaded ? 'Live — valuation recomputed from current prices' : 'Loading live prices…'}
            </span>
          </div>
        </Card>
      </div>
    </AnalysisSection>
  );
}
