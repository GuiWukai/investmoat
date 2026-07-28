import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getResearchArticle, getAllResearchSlugs, parseArticleDate } from '@/data/research';
import ResearchArticleView from '@/components/ResearchArticle';

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
      <ResearchArticleView article={article} />
    </>
  );
}
