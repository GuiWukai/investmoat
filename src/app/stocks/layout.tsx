import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { allCoverageData, getAverageScore } from '../stockData';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'Stock Coverage',
  description:
    'Browse 80+ stocks scored on moat durability, growth trajectory, and live valuation. Filter by Large Cap Tech, Financials & SaaS, Hard Assets, and Healthcare.',
  openGraph: {
    title: 'Stock Coverage | InvestMoat',
    description:
      'Browse 80+ stocks scored on moat durability, growth trajectory, and live valuation. Filter by Large Cap Tech, Financials & SaaS, Hard Assets, and Healthcare.',
    url: `${SITE_URL}/stocks`,
    type: 'website',
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'Stock Coverage | InvestMoat',
    description:
      'Browse 80+ stocks scored on moat durability, growth trajectory, and live valuation.',
  },
  alternates: {
    canonical: `${SITE_URL}/stocks`,
  },
};

export default function StocksLayout({ children }: { children: ReactNode }) {
  const ranked = [...allCoverageData].sort(
    (a, b) => getAverageScore(b.scores) - getAverageScore(a.scores)
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/stocks#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Stocks', item: `${SITE_URL}/stocks` },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/stocks#page`,
        url: `${SITE_URL}/stocks`,
        name: 'Stock Coverage',
        description:
          `Coverage universe of ${ranked.length} stocks scored on moat durability, growth trajectory, and live valuation.`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${SITE_URL}/stocks#breadcrumb` },
        mainEntity: { '@id': `${SITE_URL}/stocks#coverage` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/stocks#coverage`,
        name: 'InvestMoat Coverage Universe',
        numberOfItems: ranked.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: ranked.map((s, idx) => ({
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
      {children}
    </>
  );
}
