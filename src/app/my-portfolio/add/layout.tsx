import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://investmoat.com';

export const metadata: Metadata = {
  title: 'Add holding',
  description:
    'Add a covered stock to your personal portfolio — set shares and optional average cost. Data stays on this device.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Add holding | InvestMoat',
    description:
      'Add a covered name to your personal holdings tracker. Shares and average cost stay in your browser.',
    url: `${SITE_URL}/my-portfolio/add`,
    type: 'website',
    siteName: 'InvestMoat',
    locale: 'en_US',
  },
  alternates: {
    canonical: `${SITE_URL}/my-portfolio/add`,
  },
};

export default function AddHoldingLayout({ children }: { children: ReactNode }) {
  return children;
}
