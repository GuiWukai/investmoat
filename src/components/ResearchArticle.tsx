'use client';

import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Lightbulb, AlertTriangle, FlaskConical } from 'lucide-react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import { getStockData } from '@/data/stocks';
import {
  computeValuationScore,
  computeRecommendation,
  parseScenarioPrice,
} from '@/lib/valuationScore';
import type {
  ResearchArticleData,
  ResearchBlock,
  ScorecardBlock,
  MoatMatrixBlock,
  TableBlock,
  CalloutBlock,
  StatStripBlock,
  ListBlock,
  TenMoatKey,
} from '@/types/research';

// ─── Ticker resolution ────────────────────────────────────────────────────────
// Articles ship tickers, never scores. Everything numeric on the page resolves
// through the same registry that drives /stocks and /portfolio.

type Coverage = (typeof allCoverageData)[number];

const byTicker: Record<string, Coverage> = Object.fromEntries(
  allCoverageData.map((s) => [s.ticker, s]),
);

function scoreColor(score: number) {
  if (score >= 90) return '#10b981';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
}

// Bands live in valuationScore.ts — this only maps the label to a colour.
const REC_COLORS: Record<string, string> = {
  'Strong Buy': '#10b981',
  Accumulate: '#3b82f6',
  Hold: '#f59e0b',
  'Speculative Buy': '#a78bfa',
  Avoid: '#ef4444',
};

interface ResolvedScores {
  ticker: string;
  name: string;
  href: string;
  moat: number;
  growth: number;
  valuation: number;
  composite: number;
  recommendation: string;
  price: number | null;
}

function resolveScores(ticker: string, price: number | null): ResolvedScores | null {
  const s = byTicker[ticker];
  if (!s) return null;

  const [moat, growth, staticVal] = s.scores;
  const bear = parseScenarioPrice(s.bearTarget);
  const base = parseScenarioPrice(s.baseTarget);
  const bull = parseScenarioPrice(s.bullTarget);

  // Live price recomputes the valuation pillar; otherwise fall back to static.
  const valuation =
    price != null && bear && base && bull
      ? computeValuationScore(price, bear, base, bull)
      : staticVal;

  return {
    ticker: s.ticker,
    name: s.name,
    href: s.href,
    moat: Math.round(moat),
    growth: Math.round(growth),
    valuation: Math.round(valuation),
    composite: Math.round(getAverageScore([moat, growth, valuation])),
    recommendation: computeRecommendation(moat, growth, valuation),
    price,
  };
}

/** Fetch live prices for the tickers an article references. */
function useLivePrices(tickers: string[]) {
  const key = tickers.join(',');
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const list = key ? key.split(',') : [];
    Promise.all(
      list.map((ticker) => {
        const entry = byTicker[ticker];
        if (!entry) return Promise.resolve([ticker, null] as const);
        return fetch(`/api/stock-price/${entry.slug}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => [ticker, d?.price ?? null] as const)
          .catch(() => [ticker, null] as const);
      }),
    ).then((entries) => {
      if (cancelled) return;
      setPrices(Object.fromEntries(entries));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { prices, loaded };
}

// ─── Inline markup ────────────────────────────────────────────────────────────
// Deliberately tiny: **bold** and [text](href). Anything richer belongs in a
// block type, not in prose — that keeps articles diffable and machine-readable.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-white/90">
          {match[1]}
        </strong>,
      );
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const href = match[3];
      const internal = href.startsWith('/');
      out.push(
        internal ? (
          <Link
            key={`${keyPrefix}-l${i}`}
            href={href}
            className="text-[#e4c98a] hover:text-white underline underline-offset-2 decoration-white/20 transition-colors"
          >
            {match[2]}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e4c98a] hover:text-white underline underline-offset-2 decoration-white/20 transition-colors"
          >
            {match[2]}
          </a>
        ),
      );
    }
    last = match.index + match[0].length;
    i += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function ScorePill({ value }: { value: number }) {
  const color = scoreColor(value);
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-black tabular-nums"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {value}
    </span>
  );
}

function ScorecardRow({ row, note }: { row: ResolvedScores; note?: string }) {
  const recColor = REC_COLORS[row.recommendation] ?? '#6b7280';
  return (
    <tr className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors">
      <td className="py-3 pr-3 pl-4 align-top">
        <Link href={row.href} className="group inline-flex flex-col">
          <span className="text-[13px] font-black tracking-wider text-white/90 group-hover:text-[#e4c98a] transition-colors">
            {row.ticker}
          </span>
          <span className="text-[11px] text-white/35 leading-tight">{row.name}</span>
          {note && (
            <span className="text-[11px] text-white/30 leading-snug mt-1 max-w-[26rem] md:hidden">
              {note}
            </span>
          )}
        </Link>
      </td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.moat} /></td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.growth} /></td>
      <td className="py-3 px-2 text-center hidden sm:table-cell"><ScorePill value={row.valuation} /></td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.composite} /></td>
      <td className="py-3 px-2 text-center hidden sm:table-cell">
        <span
          className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
          style={{ color: recColor }}
        >
          {row.recommendation}
        </span>
      </td>
      <td className="py-3 pl-3 pr-4 text-[11px] text-white/35 leading-snug hidden md:table-cell max-w-[20rem]">
        {note}
      </td>
    </tr>
  );
}

function Scorecard({
  block,
  prices,
  loaded,
}: {
  block: ScorecardBlock;
  prices: Record<string, number | null>;
  loaded: boolean;
}) {
  const rows = useMemo(() => {
    const resolved = block.tickers
      .map((t) => resolveScores(t, prices[t] ?? null))
      .filter((r): r is ResolvedScores => r !== null);

    if (block.sort && block.sort !== 'given') {
      const key = block.sort;
      resolved.sort((a, b) => b[key] - a[key]);
    }
    return resolved;
  }, [block.tickers, block.sort, prices]);

  const groups = block.groups
    ? block.groups.map((g) => ({
        label: g.label,
        rows: rows.filter((r) => g.tickers.includes(r.ticker)),
      }))
    : [{ label: '', rows }];

  return (
    <figure className="my-8 not-prose">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                <th className="py-3 pl-4 pr-3 font-bold">Name</th>
                <th className="py-3 px-2 text-center font-bold">Moat</th>
                <th className="py-3 px-2 text-center font-bold">Growth</th>
                <th className="py-3 px-2 text-center font-bold hidden sm:table-cell">Val</th>
                <th className="py-3 px-2 text-center font-bold text-[#e4c98a]">Score</th>
                <th className="py-3 px-2 text-center font-bold hidden sm:table-cell">Rec</th>
                <th className="py-3 pl-3 pr-4 font-bold hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <React.Fragment key={g.label || 'all'}>
                  {g.label && (
                    <tr>
                      <td
                        colSpan={7}
                        className="pt-4 pb-1.5 pl-4 text-[10px] font-bold uppercase tracking-widest text-[#c9a96a] bg-white/[0.015]"
                      >
                        {g.label}
                      </td>
                    </tr>
                  )}
                  {g.rows.map((r) => (
                    <ScorecardRow key={r.ticker} row={r} note={block.notes?.[r.ticker]} />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${loaded ? 'bg-[#34d399]' : 'bg-white/20 animate-pulse'}`}
          />
          <span className="text-[10px] uppercase tracking-widest text-white/25">
            {loaded ? 'Live — valuation recomputed from current price' : 'Loading live prices…'}
          </span>
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-2.5 text-xs text-white/30 leading-relaxed">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Moat matrix ──────────────────────────────────────────────────────────────

const MOAT_LABELS: Record<TenMoatKey, string> = {
  learnedInterfaces: 'Learned Interfaces',
  businessLogic: 'Business Logic',
  publicDataAccess: 'Public Data',
  talentScarcity: 'Talent Scarcity',
  bundling: 'Bundling',
  proprietaryData: 'Proprietary Data',
  regulatoryLockIn: 'Regulatory Lock-In',
  networkEffects: 'Network Effects',
  transactionEmbedding: 'Transaction Embedding',
  systemOfRecord: 'System of Record',
};

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  strong: { label: 'Strong', color: '#10b981' },
  intact: { label: 'Intact', color: '#3b82f6' },
  weakened: { label: 'Weakened', color: '#f59e0b' },
  destroyed: { label: 'N/A', color: '#6b7280' },
};

function moatStatusFor(ticker: string, moat: TenMoatKey): string | null {
  const entry = byTicker[ticker];
  if (!entry) return null;
  const data = getStockData(entry.slug);
  const pillar = data?.tenMoats?.[moat];
  return pillar?.status ?? null;
}

function MoatMatrix({ block }: { block: MoatMatrixBlock }) {
  const groups = block.groups
    ? block.groups.map((g) => ({
        label: g.label,
        tickers: g.tickers.filter((t) => byTicker[t]),
      }))
    : [{ label: '', tickers: block.tickers.filter((t) => byTicker[t]) }];

  return (
    <figure className="my-8 not-prose">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                <th className="py-3 pl-4 pr-3 font-bold">Name</th>
                {block.moats.map((m) => (
                  <th key={m} className="py-3 px-2 text-center font-bold">
                    {MOAT_LABELS[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <React.Fragment key={g.label || 'all'}>
                  {g.label && (
                    <tr>
                      <td
                        colSpan={block.moats.length + 1}
                        className="pt-4 pb-1.5 pl-4 text-[10px] font-bold uppercase tracking-widest text-[#c9a96a] bg-white/[0.015]"
                      >
                        {g.label}
                      </td>
                    </tr>
                  )}
                  {g.tickers.map((t) => (
                    <tr
                      key={t}
                      className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pl-4 pr-3">
                        <Link
                          href={byTicker[t].href}
                          className="text-[13px] font-black tracking-wider text-white/90 hover:text-[#e4c98a] transition-colors"
                        >
                          {t}
                        </Link>
                      </td>
                      {block.moats.map((m) => {
                        const status = moatStatusFor(t, m);
                        const style = status ? STATUS_STYLE[status] : null;
                        return (
                          <td key={m} className="py-3 px-2 text-center">
                            {style ? (
                              <span
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                                style={{
                                  color: style.color,
                                  background: `${style.color}15`,
                                  border: `1px solid ${style.color}28`,
                                }}
                              >
                                {style.label}
                              </span>
                            ) : (
                              <span className="text-white/15 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-2.5 text-xs text-white/30 leading-relaxed">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Static blocks ────────────────────────────────────────────────────────────

function StaticTable({ block }: { block: TableBlock }) {
  return (
    <figure className="my-8 not-prose">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                {block.columns.map((c, i) => (
                  <th
                    key={c}
                    className={`py-3 px-4 font-bold ${
                      i === block.highlightColumn ? 'text-[#e4c98a]' : ''
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`py-3 px-4 text-[13px] leading-snug ${
                        ci === block.highlightColumn
                          ? 'text-white/90 font-semibold tabular-nums'
                          : ci === 0
                          ? 'text-white/70 font-medium'
                          : 'text-white/45'
                      }`}
                    >
                      {renderInline(cell, `t${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <figcaption className="mt-2.5 text-xs text-white/30 leading-relaxed">
        {block.caption && <span>{block.caption} </span>}
        <span className="text-white/20">Figures as of {block.asOf}.</span>
      </figcaption>
    </figure>
  );
}

const CALLOUT_STYLE = {
  insight: { color: '#3b82f6', Icon: Lightbulb, fallback: 'Insight' },
  risk: { color: '#fb7185', Icon: AlertTriangle, fallback: 'Risk' },
  method: { color: '#c9a96a', Icon: FlaskConical, fallback: 'Method' },
} as const;

function Callout({ block, index }: { block: CalloutBlock; index: number }) {
  const { color, Icon, fallback } = CALLOUT_STYLE[block.tone];
  return (
    <aside
      className="my-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 not-prose"
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={14} style={{ color }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {block.title ?? fallback}
        </span>
      </div>
      <p className="text-[15px] text-white/60 leading-relaxed">
        {renderInline(block.body, `c${index}`)}
      </p>
    </aside>
  );
}

function StatStrip({
  block,
  prices,
  index,
}: {
  block: StatStripBlock;
  prices: Record<string, number | null>;
  index: number;
}) {
  return (
    <div className="my-8 grid grid-cols-2 lg:grid-cols-4 gap-3 not-prose">
      {block.stats.map((stat, i) => {
        let display = stat.value ?? '—';
        let color: string | undefined;

        if (stat.live) {
          const resolved = resolveScores(stat.live.ticker, prices[stat.live.ticker] ?? null);
          if (resolved) {
            if (stat.live.field === 'price') {
              display = resolved.price != null ? `$${resolved.price.toFixed(2)}` : '—';
            } else {
              const value = resolved[stat.live.field];
              display = String(value);
              color = scoreColor(value);
            }
          }
        }

        return (
          <div
            key={`${index}-${i}`}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              {stat.label}
            </span>
            <div
              className="text-2xl font-black mt-1 tabular-nums"
              style={{ color: color ?? '#f4f1ea' }}
            >
              {display}
            </div>
            {stat.note && (
              <div className="text-[11px] text-white/30 mt-1 leading-snug">{stat.note}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BulletList({ block, index }: { block: ListBlock; index: number }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className="my-6 space-y-3 not-prose">
      {block.items.map((item, i) => (
        <li key={`${index}-${i}`} className="flex gap-3 text-[15px] text-white/55 leading-relaxed">
          <span className="shrink-0 mt-[0.55rem] w-1.5 h-1.5 rounded-full bg-[#c9a96a]/50" />
          <span>{renderInline(item, `li${index}-${i}`)}</span>
        </li>
      ))}
    </Tag>
  );
}

// ─── Article ──────────────────────────────────────────────────────────────────

function Block({
  block,
  index,
  prices,
  loaded,
}: {
  block: ResearchBlock;
  index: number;
  prices: Record<string, number | null>;
  loaded: boolean;
}) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="mt-14 mb-5">
          {block.eyebrow && <div className="section-label mb-2">{block.eyebrow}</div>}
          <h2 className="text-2xl md:text-3xl font-bold text-white/90 leading-tight">
            {block.text}
          </h2>
          <div className="fund-rule mt-4" />
        </div>
      );
    case 'prose':
      return (
        <p className="my-5 text-[16px] md:text-[17px] text-white/55 leading-[1.75]">
          {renderInline(block.body, `p${index}`)}
        </p>
      );
    case 'scorecard':
      return <Scorecard block={block} prices={prices} loaded={loaded} />;
    case 'moat-matrix':
      return <MoatMatrix block={block} />;
    case 'table':
      return <StaticTable block={block} />;
    case 'callout':
      return <Callout block={block} index={index} />;
    case 'stat-strip':
      return <StatStrip block={block} prices={prices} index={index} />;
    case 'list':
      return <BulletList block={block} index={index} />;
  }
}

export default function ResearchArticle({ article }: { article: ResearchArticleData }) {
  // Every ticker the article touches — the rail, plus anything a block resolves.
  const tickers = useMemo(() => {
    const set = new Set<string>(article.tickers);
    for (const block of article.blocks) {
      if (block.type === 'scorecard' || block.type === 'moat-matrix') {
        block.tickers.forEach((t) => set.add(t));
      } else if (block.type === 'stat-strip') {
        block.stats.forEach((s) => s.live && set.add(s.live.ticker));
      }
    }
    return [...set].filter((t) => byTicker[t]);
  }, [article]);

  const { prices, loaded } = useLivePrices(tickers);

  const covered = tickers
    .map((t) => resolveScores(t, prices[t] ?? null))
    .filter((r): r is ResolvedScores => r !== null)
    .sort((a, b) => b.composite - a.composite);

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-6 py-10 md:py-16">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#c9a96a]/10 text-[#c9a96a] border border-[#c9a96a]/20"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] gradient-text">
          {article.title}
        </h1>

        <p className="mt-5 text-lg md:text-xl text-white/45 leading-relaxed">{article.dek}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] uppercase tracking-widest text-white/25">
          <span>Published {article.published}</span>
          <span className="text-white/10">·</span>
          <span>Reviewed {article.lastReviewed}</span>
          <span className="text-white/10">·</span>
          <span>{covered.length} names covered</span>
        </div>
      </header>

      <div className="fund-rule my-8" />

      {/* Names covered — live, so a skim still lands on current scores. */}
      {covered.length > 0 && (
        <div className="mb-10 not-prose">
          <div className="section-label mb-3">Names covered</div>
          <div className="flex flex-wrap gap-2">
            {covered.map((c) => (
              <Link
                key={c.ticker}
                href={c.href}
                className="group inline-flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-colors"
              >
                <span className="text-[11px] font-black tracking-wider text-white/70 group-hover:text-white">
                  {c.ticker}
                </span>
                <span
                  className="text-[11px] font-black tabular-nums px-1.5 py-0.5 rounded"
                  style={{
                    color: scoreColor(c.composite),
                    background: `${scoreColor(c.composite)}18`,
                  }}
                >
                  {c.composite}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {article.blocks.map((block, i) => (
        <Block key={i} block={block} index={i} prices={prices} loaded={loaded} />
      ))}

      {article.falsifiableBy && (
        <div className="mt-14 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
          <div className="section-label mb-2.5">What would prove this wrong</div>
          <p className="text-[15px] text-white/55 leading-relaxed">{article.falsifiableBy}</p>
        </div>
      )}

      <div className="fund-rule my-10" />

      <footer className="text-xs text-white/25 leading-relaxed space-y-3">
        <p>
          Scores on this page are computed from each asset&apos;s JSON by the formulas in{' '}
          <Link href="/stocks" className="text-white/40 hover:text-[#e4c98a] transition-colors">
            the coverage universe
          </Link>
          , with the valuation pillar recomputed against the live price. A clean Markdown
          mirror of this article is available at{' '}
          <code className="text-white/40">/research/{article.slug}/llms.txt</code>.
        </p>
        <p>
          InvestMoat is an open-source research and education framework. Nothing here is
          financial advice.
        </p>
      </footer>
    </article>
  );
}
