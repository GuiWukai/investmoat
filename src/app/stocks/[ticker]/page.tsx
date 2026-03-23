import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStockData, getAllSlugs } from '@/data/stocks';
import StockPageClient from '@/components/StockPageClient';
import { computeMoatScore } from '@/lib/valuationScore';

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
  const description =
    `${data.moat.description} Moat: ${moatScore}/100 · Growth: ${data.growth.score}/100 · ${data.recommendation}.`;
  const canonicalUrl = `https://investmoat.com/stocks/${data.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} — InvestMoat Analysis`,
      description,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
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
  const canonicalUrl = `https://investmoat.com/stocks/${data.slug}`;
  const description = `${data.moat.description} Moat: ${moatScore}/100 · Growth: ${data.growth.score}/100 · ${data.recommendation}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${data.name} (${data.ticker}) — InvestMoat Analysis`,
    description,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'InvestMoat',
      url: 'https://investmoat.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    about: {
      '@type': 'Corporation',
      name: data.name,
      tickerSymbol: data.ticker,
      url: canonicalUrl,
    },
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
