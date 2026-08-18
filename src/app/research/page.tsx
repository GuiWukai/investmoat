import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllResearchArticles } from '@/data/research';
import { readingMinutes } from '@/lib/researchMeta';
import { researchIndexJsonLd, SITE_URL } from '@/lib/researchSeo';
import ResearchIndexList, { type ResearchSummary } from '@/components/ResearchIndexList';
import { Card } from "@heroui/react";

const INDEX_DESCRIPTION =
  'Cross-cutting equity research from the InvestMoat framework — comparative analysis across the coverage universe, with live scores computed from the same data that drives every stock page.';

export const metadata: Metadata = {
  title: 'Research',
  description: INDEX_DESCRIPTION,
  keywords: [
    'equity research',
    'moat investing research',
    'AI era stock analysis',
    'comparative stock analysis',
    'enterprise software research',
    'InvestMoat research',
  ],
  alternates: { canonical: `${SITE_URL}/research` },
  openGraph: {
    type: 'website',
    title: 'Research | InvestMoat',
    description:
      'Cross-cutting equity research — comparative analysis across the coverage universe, with live scores.',
    url: `${SITE_URL}/research`,
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'Research | InvestMoat',
    description:
      'Cross-cutting equity research — comparative analysis across the coverage universe, with live scores.',
  },
};

export default function ResearchIndexPage() {
  // Reading time is derived from the blocks, so the card can promise a length
  // without an author having to keep a number in sync.
  const articles: ResearchSummary[] = getAllResearchArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    dek: a.dek,
    tags: a.tags,
    tickers: a.tickers,
    published: a.published,
    lastReviewed: a.lastReviewed,
    minutes: readingMinutes(a),
  }));

  const names = new Set(articles.flatMap((a) => a.tickers));

  const jsonLd = researchIndexJsonLd(articles);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="research-page max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-16">
      <header>
        <div className="section-label mb-3">Research</div>
        <h1 className="page-title gradient-text">
          Cross-cutting analysis
        </h1>
        <p className="research-prose mt-5 text-[17px] md:text-lg text-foreground/55 leading-relaxed max-w-2xl">
          The stock pages underwrite one name at a time. These pieces read across the
          universe — cohorts, category-wide narratives, and the places where the market&apos;s
          story and the framework&apos;s scores disagree. Every score cited is computed live
          from the same data, so nothing here goes stale quietly.
        </p>

        {articles.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] uppercase tracking-widest text-foreground/30">
            <span>
              {articles.length} {articles.length === 1 ? 'piece' : 'pieces'} published
            </span>
            <span className="text-foreground/10">·</span>
            <span>{names.size} names covered</span>
            <span className="text-foreground/10">·</span>
            <span>Scores recomputed live</span>
          </div>
        )}
      </header>

      <div className="fund-rule my-9" />

      {articles.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-foreground/45 text-sm">No research published yet.</p>
          <p className="text-foreground/25 text-xs mt-1.5">
            Cross-cutting pieces land here as the coverage universe grows.
          </p>
        </Card>
      ) : (
        <ResearchIndexList articles={articles} />
      )}

      {/* How to read these pieces — the promises that make them different from
          a blog post, stated once here instead of in every article. */}
      <section className="mt-12">
        <h2 className="section-label mb-4">How this research works</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {METHOD_NOTES.map((note) => (
            <div
              key={note.title}
              className="product-card rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 md:p-6"
            >
              <h3 className="text-[13px] font-bold text-foreground/80 tracking-wide">{note.title}</h3>
              <p className="mt-2 text-[13px] text-foreground/40 leading-relaxed">{note.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-foreground/30 leading-relaxed">
          Every piece has a Markdown mirror at{' '}
          <code className="font-mono text-foreground/45">/research/[slug]/llms.txt</code> for agents and
          readers who prefer plain text. Start from{' '}
          <Link href="/stocks" className="text-foreground/45 hover:text-gold-bright transition-colors">
            the coverage universe
          </Link>{' '}
          to see the underwriting each argument is built on.
        </p>
      </section>
      </div>
    </>
  );
}

const METHOD_NOTES = [
  {
    title: 'Numbers stay live',
    body: 'Articles carry tickers, never scores. Every moat, growth and valuation figure resolves against the coverage registry at render time, with valuation recomputed from the current price.',
  },
  {
    title: 'Every thesis is falsifiable',
    body: 'Each piece states, in one sentence, the observation that would prove it wrong — and carries the date it was last checked against the underlying data.',
  },
  {
    title: 'Cross-cutting by design',
    body: 'A stock page underwrites one name. These read across four or more, where the comparison itself is the argument and the market has a story the data disputes.',
  },
];
