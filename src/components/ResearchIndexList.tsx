'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import {
  Button,
  Card,
  SearchField,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';

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
  'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20';

/** Sentinel id for the "no theme selected" pill — ToggleButton ids can't be null. */
const ALL_TAGS = '__all__';

/** The theme pills keep the house eyebrow type rather than HeroUI's button text. */
const TAG_PILL =
  'pill-toggle shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1';

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
          className={`text-[10px] font-black tracking-wider text-foreground/45 px-1.5 py-0.5 rounded bg-foreground/[0.04] border border-foreground/[0.06]${
            i >= MOBILE_TICKERS ? ' hidden sm:inline-block' : ''
          }`}
        >
          {ticker}
        </span>
      ))}
      {overflowMobile > 0 && (
        <span className="text-[10px] text-foreground/30 sm:hidden">+{overflowMobile} more</span>
      )}
      {overflowDesktop > 0 && (
        <span className="hidden text-[10px] text-foreground/30 sm:inline">+{overflowDesktop} more</span>
      )}
    </div>
  );
}

function Meta({ article }: { article: ResearchSummary }) {
  return (
    <span className="text-[11px] uppercase tracking-widest text-foreground/30">
      {article.published}
      <span className="text-foreground/10 mx-2">·</span>
      <span className="inline-flex items-center gap-1.5 align-middle">
        <Clock size={11} className="text-foreground/25" />
        {article.minutes} min
      </span>
      {/* The chip rail already carries the coverage count on a phone. */}
      <span className="hidden sm:inline">
        <span className="text-foreground/10 mx-2">·</span>
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
      className="product-card group block rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.055] to-foreground/[0.015] p-5 sm:p-6 md:p-8"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent text-[#0a0b0d]">
          Latest
        </span>
        <TagChips tags={article.tags} />
      </div>

      <h2 className="text-[22px] sm:text-2xl md:text-[34px] font-bold text-foreground/90 group-hover:text-foreground transition-colors leading-[1.15]">
        {article.title}
      </h2>

      <p className="research-prose mt-3 sm:mt-3.5 text-[15.5px] md:text-[17px] text-foreground/55 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
        {article.dek}
      </p>

      <div className="mt-4 sm:mt-5">
        <TickerChips tickers={article.tickers} limit={10} />
      </div>

      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-4">
        <Meta article={article} />
        {/* The whole card is the tap target on a phone, so the CTA is desktop-only. */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent group-hover:text-gold-bright transition-colors">
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
      className="product-card group block rounded-2xl border border-foreground/[0.07] bg-foreground/[0.02] p-5 md:p-7"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3">
        <TagChips tags={article.tags} />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-foreground/90 group-hover:text-foreground transition-colors leading-snug">
        {article.title}
      </h2>

      <p className="research-prose mt-2.5 text-[15px] sm:text-[15.5px] text-foreground/50 leading-relaxed line-clamp-2 sm:line-clamp-none">
        {article.dek}
      </p>

      <div className="mt-3.5 sm:mt-4">
        <TickerChips tickers={article.tickers} limit={8} />
      </div>

      <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center justify-between gap-3">
        <Meta article={article} />
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-gold-bright transition-colors">
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
          <SearchField
            aria-label="Search research"
            className="max-w-md"
            fullWidth
            onChange={setQuery}
            value={query}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search research by title, theme or ticker…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          {/* A dozen themes wrap into a wall of pills on a phone, so below sm the
              row stays one line deep and scrolls sideways, bleeding to the edge.
              The group is detached so the pills keep their individual outlines
              rather than fusing into a segmented control. */}
          {tags.length > 1 && (
            <ToggleButtonGroup
              aria-label="Filter research by theme"
              className="research-scroll -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0"
              isDetached
              onSelectionChange={(keys) => {
                const next = [...keys][0];
                setTag(next == null || next === ALL_TAGS ? null : String(next));
              }}
              selectedKeys={new Set([tag ?? ALL_TAGS])}
              selectionMode="single"
              size="sm"
            >
              <ToggleButton className={TAG_PILL} id={ALL_TAGS}>
                All ({articles.length})
              </ToggleButton>
              {tags.map(([name, count]) => (
                <ToggleButton key={name} className={TAG_PILL} id={name}>
                  {name} ({count})
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted text-sm">No research matches that filter.</p>
          <Button
            className="mx-auto mt-3 text-[11px] font-bold uppercase tracking-widest text-accent"
            onPress={() => {
              setQuery('');
              setTag(null);
            }}
            size="sm"
            variant="ghost"
          >
            Clear filters
          </Button>
        </Card>
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
