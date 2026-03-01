'use client';

import React from "react";
import "./globals.css";
import Link from "next/link";
import { stockData, getAverageScore } from "./stockData";
import { Providers } from "./providers";
import {
  Accordion,
  AccordionItem,
  ScrollShadow
} from "@heroui/react";

function NavStockItem({ stock, closeMenu }: { stock: typeof stockData[0], closeMenu?: () => void }) {
  const avg = getAverageScore(stock.scores);
  const getScoreColor = (s: number) => {
    if (s >= 90) return '#10b981';
    if (s >= 80) return '#3b82f6';
    if (s >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Link 
      href={stock.href} 
      className="nav-item" 
      onClick={closeMenu}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <span>{stock.name} ({stock.ticker})</span>
      <span style={{
        fontSize: '0.7rem',
        fontWeight: 800,
        background: 'rgba(255,255,255,0.05)',
        padding: '2px 6px',
        borderRadius: '4px',
        color: getScoreColor(avg),
        border: `1px solid ${getScoreColor(avg)}33`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1.2,
        gap: '1px'
      }}>
        <span style={{ fontSize: '0.5rem', opacity: 0.7, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Overall</span>
        {avg}
      </span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Portfolio", href: "/" },
  ];

  const categories = [
    { name: "Large Cap Tech", key: "Big Tech" },
    { name: "Financials & SaaS", key: "Financials" },
    { name: "Hard Assets & Crypto", key: "Hard Assets" },
  ];

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <div className="main-container">
            {/* Mobile Top Bar */}
            <div className="lg:hidden sticky top-0 z-50 flex items-center justify-start px-4 h-16 bg-background/70 backdrop-blur-lg border-b border-white/5">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className="p-2 mr-3 rounded-lg hover:bg-white/5 transition-colors text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <span className="primary-gradient w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white">M</span>
                <span className="font-bold text-white">InvestMoat</span>
              </Link>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
              <div className="lg:hidden fixed inset-0 top-16 z-[100] overflow-y-auto" style={{ background: 'rgba(5, 7, 10, 0.97)' }}>
                <div className="flex flex-col p-4 gap-1 pb-24">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-item text-base font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="h-px bg-white/10 my-4" />

                  <Accordion variant="light" className="px-0">
                    {categories.map((cat) => (
                      <AccordionItem
                        key={cat.key}
                        title={<span className="text-white/40 text-xs font-bold uppercase tracking-wider text-left w-full block">{cat.name}</span>}
                        className="px-0"
                      >
                        <div className="flex flex-col gap-1">
                          {stockData
                            .filter(s => s.category === cat.key)
                            .map(s => <NavStockItem key={s.ticker} stock={s} closeMenu={() => setIsMenuOpen(false)} />)}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="sidebar glass hidden lg:flex">
              <div style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                    <span className="primary-gradient" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>M</span>
                    InvestMoat
                  </h2>
                </Link>
              </div>
              
              <ScrollShadow className="flex-1 -mx-2 px-2">
                <nav className="flex flex-col gap-1">
                  <Link href="/" className="nav-item">Portfolio</Link>
                  
                  {categories.map((cat) => (
                    <React.Fragment key={cat.key}>
                      <div className="mt-6 mb-2 px-4 text-[10px] font-black text-white/20 uppercase tracking-widest">{cat.name}</div>
                      {stockData
                        .filter(s => s.category === cat.key)
                        .map(s => <NavStockItem key={s.ticker} stock={s} />)}
                    </React.Fragment>
                  ))}
                </nav>
              </ScrollShadow>

              <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-white/20 font-medium">
                &copy; 2026 InvestMoat
              </div>
            </aside>
            
            <main className="content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
