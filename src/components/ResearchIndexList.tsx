'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Search, X } from 'lucide-react';

/** One card's worth of article, flattened on the server. */
export interface ResearchSummary {
  slug: string;
  title: string;
  dek: string;
  tags: string[];
  tickers: string[];
  published: string;
  lastReviewed: string;
  minutes: number;
}

/**
 * A phone shows one card at a time, so anything past the first line of chips is
 * scroll cost rather than signal. Both limits render; the overflow is dropped in
 * CSS at the breakpoint, which keeps the markup identical on server and client.
 */
const MOBILE_TICKERS = 4;
const MOBILE_TAGS = 1;

const TAG_CLASS =
  'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#c9a96a]/10 text-[#c9a96a] border border-[#c9a96a]/20';

function TagChips({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.map((tag, i) => (
        <span key={tag} className={`${TAG_CLASS}${i >= MOBILE_TAGS ? ' hidden sm:inline-block' : ''}`}>
          {tag}
        </span>
      ))}
    </>
  );
}

function TickerChips({ tickers, limit }: { tickers: string[]; limit: number }) {
  const overflowMobile = tickers.length - MOBILE_TICKERS;
  const overflowDesktop = tickers.length - limit;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tickers.slice(0, limit).map((ticker, i) => (
        <span
          key={ticker}
          className={`text-[10px] font-black tracking-wider text-white/45 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]${
            i >= MOBILE_TICKERS ? ' hidden sm:inline-block' : ''
          }`}
        >
          {ticker}
        </span>
      ))}
      {overflowMobile > 0 && (
        <span className="text-[10px] text-white/30 sm:hidden">+{overflowMobile} more</span>
      )}
      {overflowDesktop > 0 && (
        <span className="hidden text-[10px] text-white/30 sm:inline">+{overflowDesktop} more</span>
      )}
    </div>
  );
}

function Meta({ article }: { article: ResearchSummary }) {
  return (
    <span className="text-[11px] uppercase tracking-widest text-white/30">
      {article.published}
      <span className="text-white/10 mx-2">·</span>
      <span className="inline-flex items-center gap-1.5 align-middle">
        <Clock size={11} className="text-white/25" />
        {article.minutes} min
      </span>
      {/* The chip rail already carries the coverage count on a phone. */}
      <span className="hidden sm:inline">
        <span className="text-white/10 mx-2">·</span>
        {article.tickers.length} names
      </span>
    </span>
  );
}

/** The newest piece, given the room it deserves. */
function FeaturedCard({ article }: { article: ResearchSummary }) {
  return (
    <Link
      href={`/research/${article.slug}`}
      className="group block rounded-2xl border border-[#c9a96a]/20 bg-gradient-to-br from-[#c9a96a]/[0.055] to-white/[0.015] p-5 sm:p-6 md:p-8 hover:border-[#c9a96a]/40 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#c9a96a] text-[#0a0b0d]">
          Latest
        </span>
        <TagChips tags={article.tags} />
      </div>

      <h2 className="text-[22px] sm:text-2xl md:text-[34px] font-bold text-white/90 group-hover:text-white transition-colors leading-[1.15]">
        {article.title}
      </h2>

      <p className="research-prose mt-3 sm:mt-3.5 text-[15.5px] md:text-[17px] text-white/55 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
        {article.dek}
      </p>

      <div className="mt-4 sm:mt-5">
        <TickerChips tickers={article.tickers} limit={10} />
      </div>

      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-4">
        <Meta article={article} />
        {/* The whole card is the tap target on a phone, so the CTA is desktop-only. */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#c9a96a] group-hover:text-[#e4c98a] transition-colors">
          Read the piece
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: ResearchSummary }) {
  return (
    <Link
      href={`/research/${article.slug}`}
      className="group block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 md:p-7 hover:bg-white/[0.04] hover:border-white/15 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3">
        <TagChips tags={article.tags} />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white/90 group-hover:text-white transition-colors leading-snug">
        {article.title}
      </h2>

      <p className="research-prose mt-2.5 text-[15px] sm:text-[15.5px] text-white/50 leading-relaxed line-clamp-2 sm:line-clamp-none">
        {article.dek}
      </p>

      <div className="mt-3.5 sm:mt-4">
        <TickerChips tickers={article.tickers} limit={8} />
      </div>

      <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center justify-between gap-3">
        <Meta article={article} />
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 group-hover:text-[#e4c98a] transition-colors">
          Read
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Filterable research index. Filtering is client-side over the whole registry —
 * the set is small, so a round trip would be slower than the keystroke.
 */
export default function ResearchIndexList({ articles }: { articles: ResearchSummary[] }) {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [articles]);

  const trimmed = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (tag && !a.tags.includes(tag)) return false;
      if (!trimmed) return true;
      // Ticker match is exact-ish so "NET" doesn't drag in every mention of "network".
      return (
        a.title.toLowerCase().includes(trimmed) ||
        a.dek.toLowerCase().includes(trimmed) ||
        a.tags.some((t) => t.toLowerCase().includes(trimmed)) ||
        a.tickers.some((t) => t.toLowerCase().startsWith(trimmed))
      );
    });
  }, [articles, tag, trimmed]);

  const filtering = Boolean(tag) || trimmed.length > 0;
  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Controls — only worth the space once there's more than one piece. */}
      {articles.length > 1 && (
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-3.5">
          <div className="relative flex items-center max-w-md">
            <Search className="absolute left-3 w-3.5 h-3.5 text-white/25 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research by title, theme or ticker…"
              aria-label="Search research"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:border-[#c9a96a]/40 focus:bg-white/[0.05] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 text-white/25 hover:text-white/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* A dozen themes wrap into a wall of pills on a phone, so below sm the
              row stays one line deep and scrolls sideways, bleeding to the edge. */}
          {tags.length > 1 && (
            <div className="research-scroll -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
              <button
                type="button"
                onClick={() => setTag(null)}
                aria-pressed={tag === null}
                className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border transition-colors ${
                  tag === null
                    ? 'bg-[#c9a96a]/15 text-[#e4c98a] border-[#c9a96a]/35'
                    : 'bg-white/[0.02] text-white/35 border-white/[0.07] hover:text-white/70 hover:border-white/15'
                }`}
              >
                All ({articles.length})
              </button>
              {tags.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTag(tag === name ? null : name)}
                  aria-pressed={tag === name}
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border transition-colors ${
                    tag === name
                      ? 'bg-[#c9a96a]/15 text-[#e4c98a] border-[#c9a96a]/35'
                      : 'bg-white/[0.02] text-white/35 border-white/[0.07] hover:text-white/70 hover:border-white/15'
                  }`}
                >
                  {name} ({count})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
          <p className="text-white/50 text-sm">No research matches that filter.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setTag(null);
            }}
            className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[#c9a96a] hover:text-[#e4c98a] transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtering ? (
            filtered.map((a) => <ArticleCard key={a.slug} article={a} />)
          ) : (
            <>
              <FeaturedCard article={featured} />
              {rest.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
