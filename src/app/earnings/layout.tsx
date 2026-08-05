import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'Earnings Calendar',
  description:
    'Upcoming earnings reports for the InvestMoat coverage universe — see which covered names report soon, with session timing and consensus EPS.',
  openGraph: {
    title: 'Earnings Calendar | InvestMoat',
    description:
      'Upcoming earnings reports for the InvestMoat coverage universe — see which covered names report soon.',
    url: `${SITE_URL}/earnings`,
    type: 'website',
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'Earnings Calendar | InvestMoat',
    description:
      'Upcoming earnings reports for the InvestMoat coverage universe.',
  },
  alternates: {
    canonical: `${SITE_URL}/earnings`,
  },
};

export default function EarningsLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/earnings#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Earnings',
            item: `${SITE_URL}/earnings`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/earnings#page`,
        url: `${SITE_URL}/earnings`,
        name: 'Earnings Calendar',
        description:
          'Upcoming earnings reports for stocks in the InvestMoat coverage universe.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${SITE_URL}/earnings#breadcrumb` },
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
