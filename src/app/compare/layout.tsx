import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'Compare Stocks',
  description:
    'Side-by-side comparison of moat durability, growth trajectory, and valuation across up to three stocks — using the InvestMoat ten-moat framework.',
  openGraph: {
    title: 'Compare Stocks | InvestMoat',
    description:
      'Side-by-side comparison of moat durability, growth trajectory, and valuation across up to three stocks.',
    url: `${SITE_URL}/compare`,
    type: 'website',
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'Compare Stocks | InvestMoat',
    description:
      'Side-by-side comparison of moat, growth, and valuation across up to three stocks.',
  },
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}
