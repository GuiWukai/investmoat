import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Portfolio Distribution',
  description:
    'A high-conviction portfolio of up to 20 stocks selected for moat durability, growth trajectory, and valuation discipline — with live score-weighted allocations.',
  openGraph: {
    title: 'Portfolio Distribution | InvestMoat',
    description:
      'A high-conviction portfolio of up to 20 stocks selected for moat durability, growth trajectory, and valuation discipline — with live score-weighted allocations.',
    url: 'https://investmoat.com/portfolio',
    type: 'website',
  },
  twitter: {
    title: 'Portfolio Distribution | InvestMoat',
    description:
      'Live score-weighted allocations across up to 20 high-conviction moat stocks for the AI era.',
  },
  alternates: {
    canonical: 'https://investmoat.com/portfolio',
  },
};

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
