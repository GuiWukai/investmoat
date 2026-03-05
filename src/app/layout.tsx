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
  openGraph: {
    type: 'website',
    siteName: 'InvestMoat',
    title: 'InvestMoat — AI-Era Moat Portfolio',
    description:
      'InvestMoat scores stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestMoat — AI-Era Moat Portfolio',
    description:
      'InvestMoat scores stocks on moat durability, growth trajectory, and live valuation to build a high-conviction portfolio for the AI era.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
