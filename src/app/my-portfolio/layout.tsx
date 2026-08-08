import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'My Portfolio',
  description:
    'Track your personal holdings in the browser — add covered names, set share counts, and see live values. Data stays on this device.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'My Portfolio | InvestMoat',
    description:
      'Personal holdings tracker stored in your browser. Add covered names, set shares, and follow live values.',
    url: `${SITE_URL}/my-portfolio`,
    type: 'website',
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  alternates: {
    canonical: `${SITE_URL}/my-portfolio`,
  },
};

export default function MyPortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
