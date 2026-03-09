'use client';

import React from 'react';
import Link from 'next/link';

const navLinks = [
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Stocks', href: '/stocks' },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-start px-4 h-16 bg-background/70 backdrop-blur-lg border-b border-white/5">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
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
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item text-base font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
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

        <nav className="flex flex-col gap-1">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="nav-item">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-white/20 font-medium">
          &copy; 2026 InvestMoat
        </div>
      </aside>
    </>
  );
}
