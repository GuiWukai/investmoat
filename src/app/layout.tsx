import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { NavBar } from '@/components/NavBar';
import { FAB_HAND_STORAGE_KEY } from '@/lib/fabHandedness';
import { getGaMeasurementId } from '@/lib/googleAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://investmoat.com'),
  title: {
    default: 'InvestMoat — Systematic Moat Equity Research',
    template: '%s | InvestMoat',
  },
  description:
    'A systematic equity research desk underwriting stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
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
    title: 'InvestMoat — Systematic Moat Equity Research',
    description:
      'A systematic equity research desk underwriting stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
    url: 'https://investmoat.com',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@investmoat',
    title: 'InvestMoat — Systematic Moat Equity Research',
    description:
      'A systematic equity research desk underwriting stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
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
        'A systematic equity research desk underwriting stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
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
  const gaMeasurementId = getGaMeasurementId();

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Apply a stored left-thumb FAB side before paint so the dock does
            not start on the right and jump. Right is the CSS default. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var r=localStorage.getItem(${JSON.stringify(FAB_HAND_STORAGE_KEY)});if(r){var d=JSON.parse(r);if(d&&d.hand==="left")document.documentElement.dataset.fabHand="left"}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <div className="main-container">
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
            <NavBar />
            <main className="content" id="main-content" tabIndex={-1}>
              {children}
            </main>
          </div>
        </Providers>
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
      </body>
    </html>
  );
}
