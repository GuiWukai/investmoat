import type { Metadata } from 'next';
import { SECTORS } from '@/lib/sectorCatalog';
import SectorsIndexClient from './SectorsIndexClient';

const SITE_URL = 'https://investmoat.com';

const DESCRIPTION =
  'Browse InvestMoat coverage by sector — Platforms, Software, Semiconductors, Financials, Healthcare, Industrials, Energy, Consumer, Hard Assets, Crypto — with average moat, growth, and live valuation scores.';

export const metadata: Metadata = {
  title: 'Sectors',
  description: DESCRIPTION,
  keywords: [
    'stock sectors',
    'moat investing by sector',
    'tech stocks',
    'software stocks',
    'semiconductor stocks',
    'healthcare stocks',
    'industrials',
    'hard assets',
    'InvestMoat sectors',
  ],
  alternates: { canonical: `${SITE_URL}/sectors` },
  openGraph: {
    type: 'website',
    title: 'Sectors | InvestMoat',
    description: DESCRIPTION,
    url: `${SITE_URL}/sectors`,
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'Sectors | InvestMoat',
    description: DESCRIPTION,
  },
};

export default function SectorsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/sectors#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Sectors', item: `${SITE_URL}/sectors` },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/sectors#page`,
        url: `${SITE_URL}/sectors`,
        name: 'Sectors',
        description: DESCRIPTION,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${SITE_URL}/sectors#breadcrumb` },
        mainEntity: { '@id': `${SITE_URL}/sectors#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/sectors#list`,
        name: 'InvestMoat Coverage Sectors',
        numberOfItems: SECTORS.length,
        itemListElement: SECTORS.map((sector, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${SITE_URL}/sectors/${sector.slug}`,
          name: sector.label,
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
      <SectorsIndexClient />
    </>
  );
}
