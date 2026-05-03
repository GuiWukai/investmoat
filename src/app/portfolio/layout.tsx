import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { stockData } from '../stockData';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'Portfolio Distribution',
  description:
    'A high-conviction portfolio of up to 25 stocks selected for moat durability, growth trajectory, and valuation discipline — with live score-weighted allocations.',
  openGraph: {
    title: 'Portfolio Distribution | InvestMoat',
    description:
      'A high-conviction portfolio of up to 25 stocks selected for moat durability, growth trajectory, and valuation discipline — with live score-weighted allocations.',
    url: `${SITE_URL}/portfolio`,
    type: 'website',
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'Portfolio Distribution | InvestMoat',
    description:
      'Live score-weighted allocations across up to 25 high-conviction moat stocks for the AI era.',
  },
  alternates: {
    canonical: `${SITE_URL}/portfolio`,
  },
};

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/portfolio#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${SITE_URL}/portfolio` },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/portfolio#page`,
        url: `${SITE_URL}/portfolio`,
        name: 'Portfolio Distribution',
        description:
          `${stockData.length}-position high-conviction portfolio scored on moat, growth, and live valuation.`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${SITE_URL}/portfolio#breadcrumb` },
        mainEntity: { '@id': `${SITE_URL}/portfolio#holdings` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/portfolio#holdings`,
        name: 'InvestMoat Portfolio Holdings',
        numberOfItems: stockData.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: stockData.map((s, idx) => ({
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
