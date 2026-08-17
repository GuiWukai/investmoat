import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  allSectorSlugs,
  getSectorBySlug,
  stocksInSector,
} from '@/lib/sectors';
import SectorDetailClient from './SectorDetailClient';

const SITE_URL = 'https://investmoat.com';

export async function generateStaticParams() {
  return allSectorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) return {};

  const stocks = stocksInSector(sector);
  const description = `${sector.description} ${stocks.length} names scored on moat, growth, and live valuation.`;
  const canonical = `${SITE_URL}/sectors/${sector.slug}`;

  return {
    title: sector.label,
    description,
    keywords: [
      sector.label,
      `${sector.label} stocks`,
      'moat investing',
      'InvestMoat sectors',
    ],
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: `${sector.label} | InvestMoat`,
      description,
      url: canonical,
      siteName: 'InvestMoat',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@investmoat',
      title: `${sector.label} | InvestMoat`,
      description,
    },
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) notFound();

  const stocks = stocksInSector(sector);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/sectors/${sector.slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Sectors', item: `${SITE_URL}/sectors` },
          {
            '@type': 'ListItem',
            position: 3,
            name: sector.label,
            item: `${SITE_URL}/sectors/${sector.slug}`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/sectors/${sector.slug}#page`,
        url: `${SITE_URL}/sectors/${sector.slug}`,
        name: sector.label,
        description: sector.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${SITE_URL}/sectors/${sector.slug}#breadcrumb` },
        mainEntity: { '@id': `${SITE_URL}/sectors/${sector.slug}#names` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/sectors/${sector.slug}#names`,
        name: `${sector.label} — InvestMoat coverage`,
        numberOfItems: stocks.length,
        itemListElement: stocks.map((s, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${SITE_URL}${s.href}`,
          name: `${s.name} (${s.ticker})`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectorDetailClient sector={sector} stocks={stocks} />
    </>
  );
}
