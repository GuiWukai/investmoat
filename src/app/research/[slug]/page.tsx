import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getResearchArticle,
  getAllResearchArticles,
  getAllResearchSlugs,
  parseArticleDate,
} from '@/data/research';
import ResearchArticleView, { type RelatedArticle } from '@/components/ResearchArticle';

const SITE_URL = 'https://investmoat.com';

export async function generateStaticParams() {
  return getAllResearchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) return {};

  const canonicalUrl = `${SITE_URL}/research/${article.slug}`;

  return {
    title: article.title,
    description: article.dek,
    keywords: [
      ...article.tags,
      ...article.tickers.map((t) => `${t} analysis`),
      'moat investing',
      'equity research',
      'InvestMoat',
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.dek,
      url: canonicalUrl,
      publishedTime: parseArticleDate(article.published)?.toISOString(),
      modifiedTime: parseArticleDate(article.lastReviewed)?.toISOString(),
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.dek,
    },
  };
}

/**
 * Up to two sibling pieces for the end-of-article rail, ranked by shared
 * tickers then shared tags — a reader who finished this argument is most
 * likely to want the next one about the same names.
 */
function relatedArticles(slug: string): RelatedArticle[] {
  const current = getResearchArticle(slug);
  if (!current) return [];

  return getAllResearchArticles()
    .filter((a) => a.slug !== slug)
    .map((a) => ({
      article: a,
      overlap:
        a.tickers.filter((t) => current.tickers.includes(t)).length * 2 +
        a.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 2)
    .map(({ article }) => ({
      slug: article.slug,
      title: article.title,
      dek: article.dek,
      tags: article.tags,
      published: article.published,
    }));
}

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) notFound();

  const canonicalUrl = `${SITE_URL}/research/${article.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    '@id': `${canonicalUrl}#article`,
    headline: article.title,
    description: article.dek,
    abstract: article.summary,
    datePublished: parseArticleDate(article.published)?.toISOString(),
    dateModified: parseArticleDate(article.lastReviewed)?.toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    url: canonicalUrl,
    isAccessibleForFree: true,
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    keywords: [...article.tags, ...article.tickers].join(', '),
    about: article.tickers.map((ticker) => ({
      '@type': 'Corporation',
      tickerSymbol: ticker,
    })),
    // The Markdown mirror, advertised so agents can skip the HTML.
    encoding: {
      '@type': 'MediaObject',
      encodingFormat: 'text/markdown',
      contentUrl: `${canonicalUrl}/llms.txt`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ResearchArticleView article={article} related={relatedArticles(slug)} />
    </>
  );
}
