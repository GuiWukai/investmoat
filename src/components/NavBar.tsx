'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { allCoverageData } from '@/app/stockData';

const navLinks = [
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Stocks', href: '/stocks' },
];

type StockResult = { name: string; ticker: string; href: string };

/** Sidebar search (desktop) — inline input with dropdown */
function NavSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim().toLowerCase();
  const results: StockResult[] = trimmed
    ? allCoverageData
        .filter(
          (s) =>
            s.name.toLowerCase().includes(trimmed) ||
            s.ticker.toLowerCase().includes(trimmed)
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(href: string) {
    setQuery('');
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].href);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks…"
          className="w-full pl-8 pr-7 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/8 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && trimmed && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-[#0a0d12] shadow-xl z-[200] overflow-hidden">
          {results.length > 0 ? (
            results.map((s) => (
              <button
                key={s.href}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s.href); }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors group"
              >
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">{s.name}</span>
                <span className="text-xs font-bold text-white/30 group-hover:text-white/50 transition-colors ml-2">{s.ticker}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2.5 text-sm text-white/30">No stocks found</div>
          )}
        </div>
      )}
    </div>
  );
}

/** Mobile full-screen search popup */
function MobileSearchPopup({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim().toLowerCase();
  const results: StockResult[] = trimmed
    ? allCoverageData
        .filter(
          (s) =>
            s.name.toLowerCase().includes(trimmed) ||
            s.ticker.toLowerCase().includes(trimmed)
        )
        .slice(0, 8)
    : [];

  function handleSelect(href: string) {
    onClose();
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].href);
  }

  return (
    <div
      className="lg:hidden fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'rgba(5, 7, 10, 0.97)' }}
    >
      {/* Search input row */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks…"
          className="flex-1 bg-transparent text-white placeholder:text-white/30 text-base focus:outline-none"
        />
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {trimmed ? (
          results.length > 0 ? (
            results.map((s) => (
              <button
                key={s.href}
                onClick={() => handleSelect(s.href)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 text-left hover:bg-white/5 transition-colors group"
              >
                <span className="text-base text-white/80 group-hover:text-white transition-colors">{s.name}</span>
                <span className="text-sm font-bold text-white/30 group-hover:text-white/50 transition-colors ml-3">{s.ticker}</span>
              </button>
            ))
          ) : (
            <div className="px-5 py-6 text-sm text-white/30">No stocks found</div>
          )
        ) : (
          <div className="px-5 py-6 text-sm text-white/30">Type to search stocks by name or ticker…</div>
        )}
      </div>
    </div>
  );
}

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center px-4 h-16 bg-background/70 backdrop-blur-lg border-b border-white/5">
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
        {/* Search icon — right side of mobile top bar */}
        <button
          onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
          aria-label="Open search"
          className="ml-auto p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile search popup */}
      {isSearchOpen && (
        <MobileSearchPopup onClose={() => setIsSearchOpen(false)} />
      )}

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

        <div className="mt-4">
          <NavSearch />
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-white/20 font-medium">
          &copy; 2026 InvestMoat
        </div>
      </aside>
    </>
  );
}
