import type { Metadata } from 'next';
import { allCoverageData } from '@/app/stockData';
import { parseArticleDate } from '@/data/research';
import { articleWordCount, readingMinutes } from '@/lib/researchMeta';
import type { ResearchArticleData } from '@/types/research';

export const SITE_URL = 'https://investmoat.com';

type Coverage = (typeof allCoverageData)[number];

const byTicker: Record<string, Coverage> = Object.fromEntries(
  allCoverageData.map((s) => [s.ticker, s]),
);

export function coverageForTickers(tickers: string[]): Coverage[] {
  return tickers.map((t) => byTicker[t]).filter((s): s is Coverage => Boolean(s));
}

function isoDate(value: string): string | undefined {
  return parseArticleDate(value)?.toISOString();
}

function articleUrl(slug: string): string {
  return `${SITE_URL}/research/${slug}`;
}

function ogImageUrl(slug: string): string {
  return `${articleUrl(slug)}/opengraph-image`;
}

/** Keywords for the article `<meta>` — tags, tickers, and covered company names. */
export function researchKeywords(article: ResearchArticleData): string[] {
  const covered = coverageForTickers(article.tickers);
  return [
    ...article.tags,
    ...article.tickers.map((t) => `${t} analysis`),
    ...article.tickers.map((t) => `${t} stock`),
    ...covered.map((s) => s.name),
    ...covered.map((s) => `${s.name} stock analysis`),
    'moat investing',
    'equity research',
    'InvestMoat',
  ];
}

export function researchArticleMetadata(article: ResearchArticleData): Metadata {
  const canonicalUrl = articleUrl(article.slug);
  const image = ogImageUrl(article.slug);
  const publishedTime = isoDate(article.published);
  const modifiedTime = isoDate(article.lastReviewed);

  return {
    title: article.title,
    description: article.dek,
    keywords: researchKeywords(article),
    authors: [{ name: 'InvestMoat', url: SITE_URL }],
    alternates: {
      canonical: canonicalUrl,
      types: {
        'text/markdown': `${canonicalUrl}/llms.txt`,
      },
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.dek,
      url: canonicalUrl,
      siteName: 'InvestMoat',
      locale: 'en_US',
      publishedTime,
      modifiedTime,
      authors: ['InvestMoat'],
      section: article.tags[0],
      tags: article.tags,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@investmoat',
      title: article.title,
      description: article.dek,
      images: [{ url: image, alt: article.title }],
    },
  };
}

/**
 * JSON-LD graph for a research article: breadcrumbs plus an AnalysisNewsArticle
 * with company `about` entries, source citations, and a pointer to the Markdown
 * mirror — the same surfaces stock pages already advertise.
 */
export function researchArticleJsonLd(
  article: ResearchArticleData,
  related: { slug: string; title: string }[] = [],
) {
  const canonicalUrl = articleUrl(article.slug);
  const image = ogImageUrl(article.slug);
  const covered = coverageForTickers(article.tickers);
  const minutes = readingMinutes(article);

  const about = covered.map((s) => ({
    '@type': 'Corporation',
    name: s.name,
    tickerSymbol: s.ticker,
    url: `${SITE_URL}${s.href}`,
  }));

  const citation = (article.sources ?? []).map((source) => ({
    '@type': 'CreativeWork',
    name: source.label,
    url: source.url,
    ...(source.publisher ? { publisher: { '@type': 'Organization', name: source.publisher } } : {}),
    ...(isoDate(source.date) ? { datePublished: isoDate(source.date) } : {}),
  }));

  const mentions = related.map((r) => ({
    '@type': 'AnalysisNewsArticle',
    '@id': `${articleUrl(r.slug)}#article`,
    headline: r.title,
    url: articleUrl(r.slug),
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Research', item: `${SITE_URL}/research` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
        ],
      },
      {
        '@type': 'AnalysisNewsArticle',
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        name: article.title,
        description: article.dek,
        abstract: article.summary,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        url: canonicalUrl,
        image: {
          '@type': 'ImageObject',
          url: image,
          width: 1200,
          height: 630,
        },
        datePublished: isoDate(article.published),
        dateModified: isoDate(article.lastReviewed),
        author: { '@id': `${SITE_URL}/#organization` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        keywords: [...article.tags, ...article.tickers].join(', '),
        articleSection: article.tags[0],
        wordCount: articleWordCount(article),
        timeRequired: `PT${minutes}M`,
        about,
        ...(citation.length > 0 ? { citation } : {}),
        ...(mentions.length > 0 ? { mentions } : {}),
        encoding: {
          '@type': 'MediaObject',
          encodingFormat: 'text/markdown',
          contentUrl: `${canonicalUrl}/llms.txt`,
        },
      },
    ],
  };
}

export function researchIndexJsonLd(
  articles: { slug: string; title: string; dek: string }[],
) {
  const pageUrl = `${SITE_URL}/research`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Research', item: pageUrl },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: 'Research',
        description:
          'Cross-cutting equity research from the InvestMoat framework — comparative analysis across the coverage universe, with live scores computed from the same data that drives every stock page.',
        inLanguage: 'en-US',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#articles` },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#articles`,
        name: 'InvestMoat Research',
        numberOfItems: articles.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: articles.map((article, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: articleUrl(article.slug),
          name: article.title,
          description: article.dek,
        })),
      },
    ],
  };
}
