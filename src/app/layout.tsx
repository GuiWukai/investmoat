'use client';

import React from "react";
import "./globals.css";
import Link from "next/link";
import { stockData, getAverageScore } from "./stockData";
import { Providers } from "./providers";
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle, 
  NavbarMenu, 
  NavbarMenuItem,
  Button,
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
        border: `1px solid ${getScoreColor(avg)}33`
      }}>
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
    { name: "Dashboard", href: "/" },
    { name: "Portfolio Distribution", href: "/portfolio" },
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
            {/* Mobile Navbar */}
            <Navbar 
              isBordered 
              isMenuOpen={isMenuOpen} 
              onMenuOpenChange={setIsMenuOpen}
              className="lg:hidden bg-background/70 backdrop-blur-lg border-white/5"
            >
              <NavbarContent justify="start">
                <NavbarMenuToggle
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
              </NavbarContent>
              <NavbarContent justify="center">
                <NavbarBrand>
                  <Link href="/" className="flex items-center gap-2">
                    <span className="primary-gradient w-8 h-8 rounded-lg flex items-center justify-center font-bold">M</span>
                    <p className="font-bold text-inherit">InvestMoat</p>
                  </Link>
                </NavbarBrand>
              </NavbarContent>

              <NavbarMenu className="bg-background/95 backdrop-blur-xl border-t border-white/5 pt-6 flex flex-col gap-4">
                {menuItems.map((item, index) => (
                  <NavbarMenuItem key={`${item.name}-${index}`}>
                    <Link
                      className="w-full text-lg font-semibold py-2"
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </NavbarMenuItem>
                ))}
                
                <div className="h-px bg-white/10 my-2" />
                
                <Accordion variant="light" className="px-0">
                  {categories.map((cat) => (
                    <AccordionItem 
                      key={cat.key} 
                      title={<span className="text-white/40 text-xs font-bold uppercase tracking-wider">{cat.name}</span>}
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
              </NavbarMenu>
            </Navbar>

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
                  <Link href="/" className="nav-item">Dashboard</Link>
                  <Link href="/portfolio" className="nav-item">Portfolio Distribution</Link>
                  
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
