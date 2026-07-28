import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllResearchArticles } from '@/data/research';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Cross-cutting equity research from the InvestMoat framework — comparative analysis across the coverage universe, with live scores computed from the same data that drives every stock page.',
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
  },
};

export default function ResearchIndexPage() {
  const articles = getAllResearchArticles();

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 md:py-16">
      <header>
        <div className="section-label mb-3">Research</div>
        <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] gradient-text">
          Cross-cutting analysis
        </h1>
        <p className="mt-5 text-base md:text-lg text-white/45 leading-relaxed max-w-2xl">
          The stock pages underwrite one name at a time. These pieces read across the
          universe — cohorts, category-wide narratives, and the places where the market&apos;s
          story and the framework&apos;s scores disagree. Every score cited is computed live
          from the same data, so nothing here goes stale quietly.
        </p>
      </header>

      <div className="fund-rule my-9" />

      {articles.length === 0 ? (
        <p className="text-white/30 text-sm">No research published yet.</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/research/${article.slug}`}
              className="group block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 md:p-7 hover:bg-white/[0.04] hover:border-white/15 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#c9a96a]/10 text-[#c9a96a] border border-[#c9a96a]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white/90 group-hover:text-white transition-colors leading-snug">
                {article.title}
              </h2>

              <p className="mt-2.5 text-[15px] text-white/45 leading-relaxed">{article.dek}</p>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {article.tickers.slice(0, 8).map((ticker) => (
                  <span
                    key={ticker}
                    className="text-[10px] font-black tracking-wider text-white/40 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]"
                  >
                    {ticker}
                  </span>
                ))}
                {article.tickers.length > 8 && (
                  <span className="text-[10px] text-white/25">
                    +{article.tickers.length - 8} more
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-[11px] uppercase tracking-widest text-white/25">
                  {article.published}
                  <span className="text-white/10 mx-2">·</span>
                  Reviewed {article.lastReviewed}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 group-hover:text-[#e4c98a] transition-colors">
                  Read
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
