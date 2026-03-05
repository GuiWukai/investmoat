import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStockData, getAllSlugs } from '@/data/stocks';
import StockPageClient from '@/components/StockPageClient';

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
  const description =
    `${data.moat.description} Moat: ${data.moat.score}/100 · Growth: ${data.growth.score}/100 · ${data.recommendation}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — InvestMoat Analysis`,
      description,
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

  return <StockPageClient ticker={ticker} />;
}
