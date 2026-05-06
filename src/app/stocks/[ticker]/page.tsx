import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStockData, getAllSlugs } from '@/data/stocks';
import StockPageClient from '@/components/StockPageClient';
import { computeMoatScore, computeGrowthScore } from '@/lib/valuationScore';

const SITE_URL = 'https://investmoat.com';

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function lastAnalyzedToISO(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.trim().match(/^([A-Za-z]+)\s+(?:(\d{1,2}),\s+)?(\d{4})$/);
  if (!match) return undefined;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return undefined;
  const day = match[2] ? parseInt(match[2], 10) : 1;
  const year = parseInt(match[3], 10);
  return new Date(Date.UTC(year, month, day)).toISOString();
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ ticker: slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ ticker: string }> }
): Promise<Metadata> {
  const { ticker } = await params;
  const data = getStockData(ticker);
  if (!data) return {};

  const title = `${data.name} (${data.ticker})`;
  const moatScore = computeMoatScore(data.tenMoats);
  const growthScore = computeGrowthScore(data.growth.growthAnalysis) ?? 0;
  const description =
    `${data.moat.description} Moat: ${moatScore}/100 · Growth: ${growthScore}/100 · ${data.recommendation}.`;
  const canonicalUrl = `${SITE_URL}/stocks/${data.slug}`;
  const publishedTime = lastAnalyzedToISO(data.lastAnalyzed);

  return {
    title,
    description,
    keywords: [
      data.name,
      data.ticker,
      `${data.ticker} stock`,
      `${data.name} stock analysis`,
      `${data.ticker} moat score`,
      `${data.ticker} valuation`,
      `${data.ticker} ${data.recommendation.toLowerCase()}`,
      'moat investing',
      'AI era stocks',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} — InvestMoat Analysis`,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'InvestMoat',
      locale: 'en_US',
      ...(publishedTime ? { publishedTime, modifiedTime: publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@investmoat',
      title: `${title} — InvestMoat Analysis`,
      description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const data = getStockData(ticker);
  if (!data) notFound();

  const moatScore = computeMoatScore(data.tenMoats);
  const growthScore = computeGrowthScore(data.growth.growthAnalysis) ?? 0;
  const valuationScore = data.valuation.score;
  const compositeScore = Math.round(moatScore * 0.4 + growthScore * 0.35 + valuationScore * 0.25);
  const canonicalUrl = `${SITE_URL}/stocks/${data.slug}`;
  const ogImageUrl = `${canonicalUrl}/opengraph-image`;
  const description =
    `${data.moat.description} Moat: ${moatScore}/100 · Growth: ${growthScore}/100 · ${data.recommendation}.`;
  const datePublished = lastAnalyzedToISO(data.lastAnalyzed);

  const headline = `${data.name} (${data.ticker}) — InvestMoat Analysis`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Stocks', item: `${SITE_URL}/stocks` },
          { '@type': 'ListItem', position: 3, name: `${data.name} (${data.ticker})`, item: canonicalUrl },
        ],
      },
      {
        '@type': 'Corporation',
        '@id': `${canonicalUrl}#company`,
        name: data.name,
        tickerSymbol: data.ticker,
        url: canonicalUrl,
      },
      {
        '@type': 'Review',
        '@id': `${canonicalUrl}#review`,
        headline,
        name: headline,
        description,
        url: canonicalUrl,
        image: ogImageUrl,
        inLanguage: 'en',
        ...(datePublished ? { datePublished, dateModified: datePublished } : {}),
        author: {
          '@type': 'Organization',
          name: 'InvestMoat',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: 'InvestMoat',
          url: SITE_URL,
        },
        itemReviewed: { '@id': `${canonicalUrl}#company` },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: compositeScore,
          bestRating: 100,
          worstRating: 0,
          name: data.recommendation,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StockPageClient ticker={ticker} />
    </>
  );
}
