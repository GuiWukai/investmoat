import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  metadataBase: new URL('https://investmoat.com'),
  title: {
    default: 'InvestMoat — AI-Era Moat Portfolio',
    template: '%s | InvestMoat',
  },
  description:
    'InvestMoat scores stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
  keywords: [
    'moat investing', 'AI era stocks', 'stock analysis', 'moat score',
    'high conviction portfolio', 'stock valuation', 'competitive moat',
    'growth stocks', 'investment research', 'InvestMoat',
  ],
  authors: [{ name: 'InvestMoat', url: 'https://investmoat.com' }],
  creator: 'InvestMoat',
  openGraph: {
    type: 'website',
    siteName: 'InvestMoat',
    title: 'InvestMoat — AI-Era Moat Portfolio',
    description:
      'InvestMoat scores stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
    url: 'https://investmoat.com',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'InvestMoat — AI-Era Moat Portfolio',
    description:
      'InvestMoat scores stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: 'https://investmoat.com',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://investmoat.com/#website',
      url: 'https://investmoat.com',
      name: 'InvestMoat',
      description:
        'InvestMoat scores stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
      publisher: { '@id': 'https://investmoat.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://investmoat.com/stocks?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://investmoat.com/#organization',
      name: 'InvestMoat',
      url: 'https://investmoat.com',
      description:
        'Open-source AI-era moat investing research and portfolio framework.',
      sameAs: [],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <div className="main-container">
            <NavBar />
            <main className="content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
