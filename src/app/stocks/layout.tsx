import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Stock Coverage',
  description:
    'Browse 40+ stocks scored on moat durability, growth trajectory, and live valuation. Filter by Large Cap Tech, Financials & SaaS, Hard Assets, and Healthcare.',
  openGraph: {
    title: 'Stock Coverage | InvestMoat',
    description:
      'Browse 40+ stocks scored on moat durability, growth trajectory, and live valuation. Filter by Large Cap Tech, Financials & SaaS, Hard Assets, and Healthcare.',
    url: 'https://investmoat.com/stocks',
    type: 'website',
  },
  twitter: {
    title: 'Stock Coverage | InvestMoat',
    description:
      'Browse 40+ stocks scored on moat durability, growth trajectory, and live valuation.',
  },
  alternates: {
    canonical: 'https://investmoat.com/stocks',
  },
};

export default function StocksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
