'use client';

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  AlertTriangle,
  FlaskConical,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Clock,
} from 'lucide-react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import { getStockData } from '@/data/stocks';
import { Card } from "@heroui/react";
import {
  computeValuationScore,
  computeRecommendation,
  parseScenarioPrice,
} from '@/lib/valuationScore';
import {
  buildHeadingIds,
  getArticleSections,
  readingMinutes,
  FALSIFIABLE_ID,
} from '@/lib/researchMeta';
import {
  BackToTop,
  ContentsDisclosure,
  ContentsRail,
  CopyLinkButton,
  HeadingAnchor,
  ReadingProgress,
} from '@/components/ResearchChrome';
import type {
  ArticleSource,
  ResearchArticleData,
  ResearchBlock,
  ScorecardBlock,
  MoatMatrixBlock,
  TableBlock,
  ChartBlock,
  CalloutBlock,
  StatStripBlock,
  ListBlock,
  FalsifiableStatus,
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
// Deliberately tiny: **bold**, *emphasis* and [text](href) — the same three the
// Markdown mirror renders, so the two views of an article never disagree.
// Anything richer belongs in a block type, not in prose, which keeps articles
// diffable and machine-readable.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Groups: 1 bold, 2 emphasis, 3 link label, 4 link href.
  const pattern = /\*\*(.+?)\*\*|\*([^*\n]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    const [, bold, em, label, linkHref] = match;
    if (match.index > last) out.push(text.slice(last, match.index));
    if (bold !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-foreground/95">
          {bold}
        </strong>,
      );
    } else if (em !== undefined) {
      out.push(
        <em key={`${keyPrefix}-i${i}`} className="italic text-foreground/80">
          {em}
        </em>,
      );
    } else if (label !== undefined && linkHref !== undefined) {
      const href = linkHref;
      const internal = href.startsWith('/');
      const linkClass =
        'text-gold-bright hover:text-foreground underline underline-offset-[3px] decoration-accent/35 hover:decoration-foreground/60 transition-colors';
      out.push(
        internal ? (
          <Link key={`${keyPrefix}-l${i}`} href={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {label}
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

// ─── Wide-table plumbing ──────────────────────────────────────────────────────

/**
 * Horizontal scroller with edge fades. Research tables are wider than a phone;
 * without an affordance the clipped columns simply read as missing data.
 */
function ScrollArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function update() {
      const n = ref.current;
      if (!n) return;
      const max = n.scrollWidth - n.clientWidth;
      setEdges({ left: n.scrollLeft > 4, right: max > 4 && n.scrollLeft < max - 4 });
    }

    update();
    node.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      node.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={ref} className="overflow-x-auto research-scroll">
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0a0d12] to-transparent transition-opacity ${
          edges.left ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0a0d12] to-transparent transition-opacity ${
          edges.right ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

function FigureCaption({ children }: { children: ReactNode }) {
  return (
    <figcaption className="mt-3 text-[12.5px] text-foreground/35 leading-relaxed">{children}</figcaption>
  );
}

// ─── Sourcing ─────────────────────────────────────────────────────────────────
// Live blocks correct themselves; a company-reported figure can only be checked
// against the document it came from. Every static figure block cites one, and
// the citation is a link the reader can actually open.

const SOURCES_ID = 'sources';

/**
 * The citation line under a `table` or `chart`. Numbers match the Sources
 * section at the foot of the article, so a reader can go either direction.
 */
function SourceRefs({ ids, sources }: { ids?: string[]; sources: ArticleSource[] }) {
  if (!ids?.length || sources.length === 0) return null;

  const cited = ids
    .map((id) => ({ source: sources.find((s) => s.id === id), n: sources.findIndex((s) => s.id === id) + 1 }))
    .filter((c): c is { source: ArticleSource; n: number } => Boolean(c.source));

  if (cited.length === 0) return null;

  return (
    <span className="text-foreground/30">
      {' '}
      {cited.length === 1 ? 'Source' : 'Sources'}:{' '}
      {cited.map(({ source, n }, i) => (
        <React.Fragment key={source.id}>
          {i > 0 && ', '}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/45 hover:text-gold-bright transition-colors underline decoration-foreground/15 underline-offset-2"
          >
            [{n}] {source.label}
          </a>
        </React.Fragment>
      ))}
      .
    </span>
  );
}

const SOURCE_KIND_LABELS: Record<ArticleSource['kind'], string> = {
  filing: 'Filing',
  'press-release': 'Press release',
  transcript: 'Transcript',
  'company-site': 'Company',
  regulator: 'Regulator',
  'third-party': 'Third party',
};

function SourcesSection({ sources }: { sources: ArticleSource[] }) {
  return (
    <section id={SOURCES_ID} className="mt-14 scroll-mt-24">
      <div className="section-label mb-4">Sources</div>
      <ol className="space-y-2.5 not-prose">
        {sources.map((source, i) => (
          <li key={source.id} className="flex gap-3 text-[13px] leading-relaxed">
            <span className="shrink-0 tabular-nums text-foreground/25 font-bold">[{i + 1}]</span>
            <span className="min-w-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-gold-bright transition-colors break-words"
              >
                {source.label}
              </a>
              <span className="text-foreground/30">
                {' — '}
                {source.publisher ? `${source.publisher}, ` : ''}
                {source.date}
                {' · '}
                {SOURCE_KIND_LABELS[source.kind]}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function ScorePill({ value, dim = false }: { value: number; dim?: boolean }) {
  const color = scoreColor(value);
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-black tabular-nums"
      style={{
        color,
        background: `${color}${dim ? '12' : '18'}`,
        border: `1px solid ${color}30`,
      }}
    >
      {value}
    </span>
  );
}

function RecBadge({ label }: { label: string }) {
  const color = REC_COLORS[label] ?? '#6b7280';
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ color, background: `${color}14`, border: `1px solid ${color}26` }}
    >
      {label}
    </span>
  );
}

type SortKey = 'moat' | 'growth' | 'valuation' | 'composite';

function ScorecardRow({ row, note }: { row: ResolvedScores; note?: string }) {
  return (
    <tr className="border-t border-foreground/[0.05] hover:bg-foreground/[0.03] transition-colors">
      <td className="py-3 pr-3 pl-4 align-top">
        <Link href={row.href} className="group inline-flex flex-col">
          <span className="text-[13px] font-black tracking-wider text-foreground/90 group-hover:text-gold-bright transition-colors">
            {row.ticker}
          </span>
          <span className="text-[11px] text-foreground/40 leading-tight">{row.name}</span>
        </Link>
      </td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.moat} dim /></td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.growth} dim /></td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.valuation} dim /></td>
      <td className="py-3 px-2 text-center"><ScorePill value={row.composite} /></td>
      <td className="py-3 px-2 text-center"><RecBadge label={row.recommendation} /></td>
      <td className="py-3 pl-3 pr-4 text-[11.5px] text-foreground/40 leading-snug hidden lg:table-cell max-w-[18rem]">
        {note}
      </td>
    </tr>
  );
}

/** Phone layout for a scorecard row — the table's columns don't fit a 390px screen. */
function ScorecardCard({ row, note }: { row: ResolvedScores; note?: string }) {
  const pillars: [string, number][] = [
    ['Moat', row.moat],
    ['Growth', row.growth],
    ['Val', row.valuation],
  ];
  return (
    <Link
      href={row.href}
      className="block px-4 py-3.5 border-t border-foreground/[0.05] active:bg-foreground/[0.04] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-black tracking-wider text-foreground/90">{row.ticker}</div>
          <div className="text-[11px] text-foreground/40 leading-tight truncate">{row.name}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RecBadge label={row.recommendation} />
          <ScorePill value={row.composite} />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-4">
        {pillars.map(([label, value]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">
              {label}
            </span>
            <span
              className="text-[12px] font-black tabular-nums"
              style={{ color: scoreColor(value) }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
      {note && <p className="mt-2 text-[11.5px] text-foreground/35 leading-snug">{note}</p>}
    </Link>
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
  // The article's own ordering is the default; a reader can re-sort from any
  // column header without losing it.
  const authored: SortKey | 'given' = block.sort && block.sort !== 'given' ? block.sort : 'given';
  const [sort, setSort] = useState<SortKey | 'given'>(authored);

  const rows = useMemo(() => {
    const resolved = block.tickers
      .map((t) => resolveScores(t, prices[t] ?? null))
      .filter((r): r is ResolvedScores => r !== null);

    if (sort !== 'given') {
      const key = sort;
      resolved.sort((a, b) => b[key] - a[key]);
    }
    return resolved;
  }, [block.tickers, sort, prices]);

  const groups = block.groups
    ? block.groups.map((g) => ({
        label: g.label,
        rows: rows.filter((r) => g.tickers.includes(r.ticker)),
      }))
    : [{ label: '', rows }];

  const columns: { key: SortKey; label: string; accent?: boolean }[] = [
    { key: 'moat', label: 'Moat' },
    { key: 'growth', label: 'Growth' },
    { key: 'valuation', label: 'Val' },
    { key: 'composite', label: 'Score', accent: true },
  ];

  return (
    <figure className="my-9 not-prose">
      <Card className="overflow-hidden">
        {/* Phone: stacked cards. Tablet and up: the full table. */}
        <div className="sm:hidden">
          {groups.map((g) => (
            <React.Fragment key={g.label || 'all'}>
              {g.label && (
                <div className="pt-3.5 pb-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-accent bg-foreground/[0.015] border-t border-foreground/[0.05]">
                  {g.label}
                </div>
              )}
              {g.rows.map((r) => (
                <ScorecardCard key={r.ticker} row={r} note={block.notes?.[r.ticker]} />
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="hidden sm:block">
          <ScrollArea>
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">
                  <th scope="col" className="py-3 pl-4 pr-3 font-bold">
                    Name
                  </th>
                  {columns.map((c) => {
                    const active = sort === c.key;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? 'descending' : 'none'}
                        className={`py-3 px-2 text-center font-bold ${c.accent ? 'text-gold-bright' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => setSort(active ? authored : c.key)}
                          title={`Sort by ${c.label.toLowerCase()}`}
                          className={`inline-flex items-center gap-1 uppercase tracking-widest transition-colors ${
                            active ? 'text-foreground/70' : 'hover:text-foreground/55'
                          } ${c.accent && !active ? 'text-gold-bright' : ''}`}
                        >
                          {c.label}
                          <ArrowUpDown
                            size={9}
                            className={active ? 'text-accent' : 'text-foreground/15'}
                          />
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className="py-3 px-2 text-center font-bold">
                    Rec
                  </th>
                  <th scope="col" className="py-3 pl-3 pr-4 font-bold hidden lg:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <React.Fragment key={g.label || 'all'}>
                    {g.label && (
                      <tr>
                        <td
                          colSpan={7}
                          className="pt-4 pb-1.5 pl-4 text-[10px] font-bold uppercase tracking-widest text-accent bg-foreground/[0.015]"
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
          </ScrollArea>
        </div>

        <div className="px-4 py-2.5 border-t border-foreground/[0.05] flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${loaded ? 'bg-[#34d399]' : 'bg-foreground/20 animate-pulse'}`}
          />
          <span className="text-[10px] uppercase tracking-widest text-foreground/30">
            {loaded ? 'Live — valuation recomputed from current price' : 'Loading live prices…'}
          </span>
          {sort !== authored && (
            <button
              type="button"
              onClick={() => setSort(authored)}
              className="ml-auto text-[10px] uppercase tracking-widest text-foreground/25 hover:text-gold-bright transition-colors hidden sm:inline"
            >
              Reset order
            </button>
          )}
        </div>
      </Card>
      {block.caption && <FigureCaption>{block.caption}</FigureCaption>}
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
  destroyed: { label: 'Destroyed', color: '#f87171' },
  na: { label: 'N/A', color: '#6b7280' },
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

  // Legend, so the status colours are readable without hunting for a key.
  const legend = ['strong', 'intact', 'weakened', 'destroyed', 'na'] as const;

  return (
    <figure className="my-9 not-prose">
      <Card className="overflow-hidden">
        <ScrollArea>
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">
                <th
                  scope="col"
                  className="py-3 pl-4 pr-3 font-bold sticky left-0 bg-[#0b0e13] z-10"
                >
                  Name
                </th>
                {block.moats.map((m) => (
                  <th key={m} scope="col" className="py-3 px-2 text-center font-bold">
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
                        className="pt-4 pb-1.5 pl-4 text-[10px] font-bold uppercase tracking-widest text-accent bg-foreground/[0.015]"
                      >
                        {g.label}
                      </td>
                    </tr>
                  )}
                  {g.tickers.map((t) => (
                    <tr
                      key={t}
                      className="group border-t border-foreground/[0.05] hover:bg-foreground/[0.03] transition-colors"
                    >
                      <td className="py-3 pl-4 pr-3 sticky left-0 bg-[#0b0e13] group-hover:bg-[#0d1016] transition-colors">
                        <Link
                          href={byTicker[t].href}
                          className="text-[13px] font-black tracking-wider text-foreground/90 hover:text-gold-bright transition-colors"
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
                              <span className="text-foreground/15 text-xs">—</span>
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
        </ScrollArea>
        <div className="px-4 py-2.5 border-t border-foreground/[0.05] flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {legend.map((key) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: STATUS_STYLE[key].color }}
              />
              <span className="text-[10px] uppercase tracking-widest text-foreground/30">
                {STATUS_STYLE[key].label}
              </span>
            </span>
          ))}
        </div>
      </Card>
      {block.caption && <FigureCaption>{block.caption}</FigureCaption>}
    </figure>
  );
}

// ─── Static blocks ────────────────────────────────────────────────────────────

function StaticTable({ block, sources }: { block: TableBlock; sources: ArticleSource[] }) {
  return (
    <figure className="my-9 not-prose">
      <Card className="overflow-hidden">
        <ScrollArea>
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">
                {block.columns.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`py-3 px-4 font-bold ${
                      i === block.highlightColumn ? 'text-gold-bright' : ''
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
                  className="border-t border-foreground/[0.05] hover:bg-foreground/[0.03] transition-colors"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`py-3 px-4 text-[13px] leading-snug ${
                        ci === block.highlightColumn
                          ? 'text-foreground/90 font-semibold tabular-nums'
                          : ci === 0
                          ? 'text-foreground/75 font-medium'
                          : 'text-foreground/50'
                      }`}
                    >
                      {renderInline(cell, `t${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Card>
      <FigureCaption>
        {block.caption && <span>{block.caption} </span>}
        <span className="text-foreground/25">Figures as of {block.asOf}.</span>
        <SourceRefs ids={block.sources} sources={sources} />
      </FigureCaption>
    </figure>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
// Static, company-reported series. Rendered as inline SVG so it needs no
// client-side charting library and reads identically on the server, in the
// Markdown mirror's fallback table, and to a screen reader.

const SERIES_COLORS = ['#e4c98a', '#3b82f6', '#fb7185', '#34d399'] as const;

const CHART_W = 760;
const CHART_H = 300;
const PAD = { top: 18, right: 18, bottom: 46, left: 58 };

/** Round a domain out to readable gridline steps. */
function niceScale(min: number, max: number): { lo: number; hi: number; step: number } {
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad / 2;
    max += pad / 2;
  }
  const rawStep = (max - min) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(Math.abs(rawStep) || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? magnitude * 10;
  return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step };
}

function formatValue(value: number, block: ChartBlock): string {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const trimmed = Number(value.toFixed(digits)).toString();
  return `${block.prefix ?? ''}${trimmed}${block.unit ?? ''}`;
}

function Chart({ block, sources }: { block: ChartBlock; sources: ArticleSource[] }) {
  const values = block.series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  // Bars are read against zero; a bar chart with a floating baseline lies.
  const { lo, hi, step } = niceScale(
    block.variant === 'bar' ? Math.min(0, rawMin) : rawMin,
    Math.max(0, rawMax),
  );

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;
  const bandW = innerW / block.categories.length;
  // Lines sit on the category boundary; bars sit inside the band.
  const x = (i: number) =>
    block.variant === 'line'
      ? PAD.left + (block.categories.length === 1 ? innerW / 2 : (i / (block.categories.length - 1)) * innerW)
      : PAD.left + bandW * i + bandW / 2;

  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(6)));

  // Show every label when they fit; otherwise thin them out rather than overlap.
  const labelEvery = block.categories.length > 9 ? Math.ceil(block.categories.length / 8) : 1;
  const titleId = `chart-${block.categories.length}-${block.series[0].name.replace(/\W+/g, '')}`;

  return (
    <figure className="my-9 not-prose">
      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
          {block.series.map((s, i) => (
            <span key={s.name} className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/45">
                {s.name}
              </span>
            </span>
          ))}
        </div>

        <ScrollArea>
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full min-w-[520px] h-auto"
            role="img"
            aria-labelledby={titleId}
          >
            <title id={titleId}>
              {block.caption ?? `${block.series.map((s) => s.name).join(' and ')} by period`}
            </title>

            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={CHART_W - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={t === 0 && lo < 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}
                />
                <text
                  x={PAD.left - 10}
                  y={y(t) + 4}
                  textAnchor="end"
                  className="fill-foreground/30"
                  style={{ fontSize: 12 }}
                >
                  {formatValue(t, block)}
                </text>
              </g>
            ))}

            {block.categories.map((c, i) =>
              i % labelEvery === 0 ? (
                <text
                  key={c + i}
                  x={x(i)}
                  y={CHART_H - PAD.bottom + 22}
                  textAnchor="middle"
                  className="fill-foreground/30"
                  style={{ fontSize: 12 }}
                >
                  {c}
                </text>
              ) : null,
            )}

            {block.series.map((s, si) => {
              const color = SERIES_COLORS[si % SERIES_COLORS.length];

              if (block.variant === 'bar') {
                const groupW = (bandW * 0.62) / block.series.length;
                return s.values.map((v, i) =>
                  v === null ? null : (
                    <rect
                      key={`${s.name}-${i}`}
                      x={x(i) - (groupW * block.series.length) / 2 + groupW * si}
                      y={Math.min(y(v), y(Math.max(lo, 0)))}
                      width={Math.max(groupW - 2, 1)}
                      height={Math.max(Math.abs(y(v) - y(Math.max(lo, 0))), 1)}
                      fill={color}
                      opacity={0.85}
                      rx={2}
                    />
                  ),
                );
              }

              // A gap in the data is a gap in the line — never interpolated.
              const segments: string[] = [];
              let current: string[] = [];
              s.values.forEach((v, i) => {
                if (v === null) {
                  if (current.length > 1) segments.push(current.join(' '));
                  current = [];
                  return;
                }
                current.push(`${current.length === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`);
              });
              if (current.length > 1) segments.push(current.join(' '));

              return (
                <g key={s.name}>
                  {segments.map((d) => (
                    <path
                      key={d.slice(0, 24)}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={2.25}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {s.values.map((v, i) =>
                    v === null ? null : (
                      <circle key={i} cx={x(i)} cy={y(v)} r={3.25} fill={color} />
                    ),
                  )}
                </g>
              );
            })}
          </svg>
        </ScrollArea>

        {/* The same numbers, for screen readers and anyone copying the data out. */}
        <table className="sr-only">
          <caption>{block.caption ?? 'Chart data'}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              {block.series.map((s) => (
                <th key={s.name} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.categories.map((c, i) => (
              <tr key={c + i}>
                <th scope="row">{c}</th>
                {block.series.map((s) => (
                  <td key={s.name}>
                    {s.values[i] === null ? 'not reported' : formatValue(s.values[i] as number, block)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <FigureCaption>
        {block.caption && <span>{block.caption} </span>}
        {block.note && <span>{block.note} </span>}
        <span className="text-foreground/25">Figures as of {block.asOf}.</span>
        <SourceRefs ids={block.sources} sources={sources} />
      </FigureCaption>
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
      className="my-9 rounded-2xl p-5 md:p-6 not-prose"
      style={{
        background: `linear-gradient(180deg, ${color}0d 0%, rgba(255,255,255,0.015) 60%)`,
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {block.title ?? fallback}
        </span>
      </div>
      <p className="research-prose text-[15.5px] text-foreground/70 leading-[1.7]">
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
    <div className="my-9 grid grid-cols-2 lg:grid-cols-4 gap-3 not-prose">
      {block.stats.map((stat, i) => {
        let display = stat.value ?? '—';
        let color: string | undefined;
        let href: string | undefined;

        if (stat.live) {
          const resolved = resolveScores(stat.live.ticker, prices[stat.live.ticker] ?? null);
          if (resolved) {
            href = resolved.href;
            if (stat.live.field === 'price') {
              display = resolved.price != null ? `$${resolved.price.toFixed(2)}` : '—';
            } else {
              const value = resolved[stat.live.field];
              display = String(value);
              color = scoreColor(value);
            }
          }
        }

        const body = (
          <>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              {stat.label}
            </span>
            <div
              className="text-2xl font-black mt-1 tabular-nums"
              style={{ color: color ?? '#f4f1ea' }}
            >
              {display}
            </div>
            {stat.note && (
              <div className="text-[11px] text-foreground/35 mt-1 leading-snug">{stat.note}</div>
            )}
          </>
        );

        const cardClass =
          'rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 transition-colors';

        // A live stat is a doorway to the underwriting behind it.
        return href ? (
          <Link
            key={`${index}-${i}`}
            href={href}
            className={`${cardClass} hover:bg-foreground/[0.04] hover:border-foreground/[0.12]`}
          >
            {body}
          </Link>
        ) : (
          <div key={`${index}-${i}`} className={cardClass}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

function BulletList({ block, index }: { block: ListBlock; index: number }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className="my-6 space-y-3.5 not-prose">
      {block.items.map((item, i) => (
        <li
          key={`${index}-${i}`}
          className="research-prose flex gap-3.5 text-[16px] text-foreground/65 leading-[1.7]"
        >
          {block.ordered ? (
            <span className="shrink-0 mt-[0.15rem] w-5 text-right font-mono text-[11px] font-bold text-accent/70 tabular-nums">
              {i + 1}
            </span>
          ) : (
            <span className="shrink-0 mt-[0.6rem] w-1.5 h-1.5 rounded-full bg-accent/60" />
          )}
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
  headingId,
  lead,
  sources,
}: {
  block: ResearchBlock;
  index: number;
  prices: Record<string, number | null>;
  loaded: boolean;
  headingId?: string;
  lead?: boolean;
  sources: ArticleSource[];
}) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="mt-14 mb-5 scroll-mt-24" id={headingId}>
          {block.eyebrow && <div className="section-label mb-2">{block.eyebrow}</div>}
          <h2 className="group text-[26px] md:text-[32px] font-bold text-foreground/90 leading-tight">
            {block.text}
            {headingId && <HeadingAnchor id={headingId} />}
          </h2>
          <div className="fund-rule mt-4" />
        </div>
      );
    case 'prose':
      return (
        <p
          className={`research-prose my-5 text-foreground/70 ${
            lead
              ? 'text-[18px] md:text-[20px] leading-[1.7] text-foreground/80'
              : 'text-[17px] md:text-[18px] leading-[1.75]'
          }`}
        >
          {renderInline(block.body, `p${index}`)}
        </p>
      );
    case 'scorecard':
      return <Scorecard block={block} prices={prices} loaded={loaded} />;
    case 'moat-matrix':
      return <MoatMatrix block={block} />;
    case 'table':
      return <StaticTable block={block} sources={sources} />;
    case 'chart':
      return <Chart block={block} sources={sources} />;
    case 'callout':
      return <Callout block={block} index={index} />;
    case 'stat-strip':
      return <StatStrip block={block} prices={prices} index={index} />;
    case 'list':
      return <BulletList block={block} index={index} />;
  }
}

// ─── Standing sections ────────────────────────────────────────────────────────
// Authored once, in code. The method note used to be copied into every article
// as a `method` callout, which meant three articles carrying three slightly
// different accounts of the same mechanism. It is a property of the site, not
// of any one piece.

function MethodFooter({ slug }: { slug: string }) {
  const { color, Icon } = CALLOUT_STYLE.method;
  return (
    <aside
      className="my-9 rounded-2xl p-5 md:p-6 not-prose"
      style={{
        background: `linear-gradient(180deg, ${color}0d 0%, rgba(255,255,255,0.015) 60%)`,
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          How to read the numbers on this page
        </span>
      </div>
      <p className="research-prose text-[15.5px] text-foreground/70 leading-[1.7]">
        Every score, moat status and recommendation above is computed from the underlying stock JSON
        at render time — the same data and the same formulas that drive{' '}
        <Link href="/stocks" className="text-foreground/80 hover:text-gold-bright transition-colors">
          /stocks
        </Link>{' '}
        and{' '}
        <Link href="/portfolio" className="text-foreground/80 hover:text-gold-bright transition-colors">
          /portfolio
        </Link>
        , with the valuation pillar recomputed against the live price. Nothing is transcribed by
        hand, so the tables here cannot drift from the analyses they cite. Company-reported figures
        are static: each one carries the period it was reported for and a link to the document it
        came from. The Markdown mirror at{' '}
        <Link
          href={`/research/${slug}/llms.txt`}
          className="font-mono text-foreground/70 hover:text-gold-bright transition-colors"
        >
          /llms.txt
        </Link>{' '}
        resolves the same way.
      </p>
    </aside>
  );
}

const FALSIFIABLE_STYLE: Record<FalsifiableStatus, { color: string; label: string }> = {
  holding: { color: 'rgba(52, 211, 153, 0.55)', label: 'Holding' },
  watch: { color: 'rgba(245, 158, 11, 0.6)', label: 'On watch' },
  tripped: { color: 'rgba(251, 113, 133, 0.7)', label: 'Tripped' },
  retired: { color: 'rgba(255, 255, 255, 0.25)', label: 'Retired' },
};

function StatusBadge({ status }: { status: FalsifiableStatus }) {
  const { color, label } = FALSIFIABLE_STYLE[status];
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border"
      style={{ color, borderColor: color, background: 'rgba(255,255,255,0.02)' }}
    >
      {label}
    </span>
  );
}

/**
 * The visible answer to "has anything changed since this was published".
 * `lastReviewed` says someone looked; this says what they found.
 */
function RevisionLog({
  revisions,
  published,
}: {
  revisions: { date: string; note: string }[];
  published: string;
}) {
  return (
    <section className="mt-14">
      <div className="section-label mb-4">Revisions</div>
      <ol className="not-prose space-y-3">
        {revisions.map((r, i) => (
          <li key={`${r.date}-${i}`} className="flex flex-col sm:flex-row sm:gap-4">
            <span className="shrink-0 sm:w-36 text-[11px] uppercase tracking-widest text-foreground/30 pt-0.5">
              {r.date}
            </span>
            <span className="research-prose text-[14.5px] text-foreground/60 leading-[1.7]">
              {renderInline(r.note, `rev${i}`)}
            </span>
          </li>
        ))}
        <li className="flex flex-col sm:flex-row sm:gap-4">
          <span className="shrink-0 sm:w-36 text-[11px] uppercase tracking-widest text-foreground/30 pt-0.5">
            {published}
          </span>
          <span className="text-[14.5px] text-foreground/35 leading-[1.7]">Published.</span>
        </li>
      </ol>
    </section>
  );
}

/** A sibling article, passed in from the server page. */
export interface RelatedArticle {
  slug: string;
  title: string;
  dek: string;
  tags: string[];
  published: string;
}

export default function ResearchArticle({
  article,
  related = [],
}: {
  article: ResearchArticleData;
  related?: RelatedArticle[];
}) {
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

  const sections = useMemo(() => getArticleSections(article), [article]);
  const headingIds = useMemo(() => buildHeadingIds(article), [article]);
  const minutes = useMemo(() => readingMinutes(article), [article]);
  // The opening paragraph gets the standfirst treatment.
  const firstProse = article.blocks.findIndex((b) => b.type === 'prose');

  const covered = tickers
    .map((t) => resolveScores(t, prices[t] ?? null))
    .filter((r): r is ResolvedScores => r !== null)
    .sort((a, b) => b.composite - a.composite);

  // The method note only makes a claim worth making if something on the page
  // actually resolves live.
  const hasLiveBlock = article.blocks.some(
    (b) =>
      b.type === 'scorecard' ||
      b.type === 'moat-matrix' ||
      (b.type === 'stat-strip' && b.stats.some((s) => s.live)),
  );

  return (
    <>
      <ReadingProgress />
      <BackToTop />

      <div className="research-page mx-auto max-w-3xl xl:max-w-[62rem] xl:grid xl:grid-cols-[minmax(0,1fr)_12rem] xl:gap-10 2xl:gap-14 px-4 sm:px-6 py-8 md:py-14">
        <article className="min-w-0">
          <header>
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/research"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/30 hover:text-gold-bright transition-colors"
              >
                <ArrowLeft size={12} />
                Research
              </Link>
              <CopyLinkButton />
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-5 mb-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-[32px] md:text-5xl font-bold leading-[1.1] gradient-text">
              {article.title}
            </h1>

            <p className="research-prose mt-5 text-[18px] md:text-xl text-foreground/55 leading-relaxed">
              {article.dek}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-widest text-foreground/30">
              <span>Published {article.published}</span>
              <span className="hidden sm:inline text-foreground/10">·</span>
              <span>Reviewed {article.lastReviewed}</span>
              <span className="hidden sm:inline text-foreground/10">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={11} className="text-foreground/25" />
                {minutes} min read
              </span>
              <span className="hidden sm:inline text-foreground/10">·</span>
              <span>{covered.length} names covered</span>
            </div>
          </header>

          <div className="fund-rule my-8" />

          {/* Thesis up front — a reader who bounces should still leave with the argument. */}
          <section
            aria-label="Thesis in brief"
            className="rounded-2xl border border-foreground/[0.07] bg-foreground/[0.02] p-5 md:p-6"
            style={{ borderLeft: '3px solid rgba(201, 169, 106, 0.55)' }}
          >
            <div className="section-label mb-2.5">Thesis in brief</div>
            <p className="research-prose text-[15.5px] md:text-base text-foreground/65 leading-[1.7]">
              {article.summary}
            </p>
          </section>

          {/* Names covered — live, so a skim still lands on current scores. */}
          {covered.length > 0 && (
            <div className="mt-8 not-prose">
              <div className="section-label mb-3">Names covered</div>
              <div className="flex gap-2 overflow-x-auto research-scroll pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
                {covered.map((c) => (
                  <Link
                    key={c.ticker}
                    href={c.href}
                    title={`${c.name} — ${c.recommendation}`}
                    className="group shrink-0 inline-flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border border-foreground/[0.07] bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/15 transition-colors"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: REC_COLORS[c.recommendation] ?? '#6b7280' }}
                    />
                    <span className="text-[11px] font-black tracking-wider text-foreground/70 group-hover:text-foreground">
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

          <div className="mt-8">
            <ContentsDisclosure sections={sections} />
          </div>

          {article.blocks.map((block, i) => (
            <Block
              key={i}
              block={block}
              index={i}
              prices={prices}
              loaded={loaded}
              headingId={headingIds.get(i)}
              lead={i === firstProse}
              sources={article.sources ?? []}
            />
          ))}

          {hasLiveBlock && <MethodFooter slug={article.slug} />}

          {article.falsifiableBy && (
            <div
              id={FALSIFIABLE_ID}
              className="mt-14 scroll-mt-24 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 md:p-6"
              style={{
                borderLeft: `3px solid ${FALSIFIABLE_STYLE[article.falsifiableBy.status].color}`,
              }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-2.5">
                <div className="section-label">What would prove this wrong</div>
                <StatusBadge status={article.falsifiableBy.status} />
              </div>
              <p className="research-prose text-[15.5px] md:text-base text-foreground/70 leading-[1.7]">
                {article.falsifiableBy.claim}
              </p>
              {article.falsifiableBy.note && (
                <p className="research-prose mt-3 text-[14.5px] text-foreground/45 leading-[1.7]">
                  <span className="text-foreground/30">Checked {article.lastReviewed}: </span>
                  {renderInline(article.falsifiableBy.note, 'fnote')}
                </p>
              )}
            </div>
          )}

          {article.sources && article.sources.length > 0 && (
            <SourcesSection sources={article.sources} />
          )}

          {article.revisions && article.revisions.length > 0 && (
            <RevisionLog revisions={article.revisions} published={article.published} />
          )}

          {related.length > 0 && (
            <section className="mt-14">
              <div className="section-label mb-4">More research</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/research/${r.slug}`}
                    className="group rounded-2xl border border-foreground/[0.07] bg-foreground/[0.02] p-4 hover:bg-foreground/[0.04] hover:border-foreground/15 transition-colors"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-accent/70">
                      {r.tags[0]}
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-bold text-foreground/85 group-hover:text-foreground leading-snug">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] text-foreground/40 leading-relaxed line-clamp-2">
                      {r.dek}
                    </p>
                    <span className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-foreground/25">
                        {r.published}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/25 group-hover:text-gold-bright transition-colors">
                        Read
                        <ArrowRight
                          size={11}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="fund-rule my-10" />

          <footer className="text-xs text-foreground/30 leading-relaxed space-y-3">
            <p>
              Scores on this page are computed from each asset&apos;s JSON by the formulas in{' '}
              <Link href="/stocks" className="text-foreground/45 hover:text-gold-bright transition-colors">
                the coverage universe
              </Link>
              , with the valuation pillar recomputed against the live price. A clean Markdown
              mirror of this article is available at{' '}
              <Link
                href={`/research/${article.slug}/llms.txt`}
                className="font-mono text-foreground/45 hover:text-gold-bright transition-colors"
              >
                /research/{article.slug}/llms.txt
              </Link>
              .
            </p>
            <p>
              InvestMoat is an open-source research and education framework. Nothing here is
              financial advice.
            </p>
          </footer>
        </article>

        <aside className="hidden xl:block">
          <ContentsRail sections={sections} />
        </aside>
      </div>
    </>
  );
}
