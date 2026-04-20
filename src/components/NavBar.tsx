'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, BarChart2, TrendingUp, Menu } from 'lucide-react';
import { allCoverageData } from '@/app/stockData';

const navLinks = [
  { name: 'Portfolio', href: '/portfolio', icon: BarChart2 },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
];

type StockResult = { name: string; ticker: string; href: string };

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
        <Search className="absolute left-3 w-3.5 h-3.5 text-white/25 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks…"
          className="w-full pl-8 pr-7 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 focus:bg-white/[0.06] transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2 text-white/25 hover:text-white/50 transition-colors"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && trimmed && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/10 bg-[#080c14] shadow-2xl z-[200] overflow-hidden">
          {results.length > 0 ? (
            results.map((s) => (
              <button
                key={s.href}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s.href); }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors group border-b border-white/[0.04] last:border-0"
              >
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{s.name}</span>
                <span className="text-xs font-bold text-white/25 group-hover:text-white/50 transition-colors ml-2 font-mono">{s.ticker}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-white/25">No stocks found</div>
          )}
        </div>
      )}
    </div>
  );
}

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
      style={{ background: 'rgba(4, 6, 8, 0.98)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
        <Search className="w-4 h-4 text-white/35 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks…"
          className="flex-1 bg-transparent text-white placeholder:text-white/25 text-base focus:outline-none"
        />
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {trimmed ? (
          results.length > 0 ? (
            results.map((s) => (
              <button
                key={s.href}
                onClick={() => handleSelect(s.href)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-white/[0.04] text-left hover:bg-white/[0.04] transition-colors group"
              >
                <span className="text-base text-white/75 group-hover:text-white transition-colors">{s.name}</span>
                <span className="text-sm font-bold text-white/25 group-hover:text-white/50 transition-colors ml-3 font-mono">{s.ticker}</span>
              </button>
            ))
          ) : (
            <div className="px-5 py-8 text-sm text-white/25">No stocks found</div>
          )
        ) : (
          <div className="px-5 py-8 text-sm text-white/25">Type to search by name or ticker…</div>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, name, icon: Icon, onClick }: { href: string; name: string; icon: React.ElementType; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
        isActive
          ? 'text-white'
          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
      }`}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/15 to-indigo-500/10 border border-blue-500/20" />
      )}
      <Icon
        className={`w-4 h-4 relative z-10 flex-shrink-0 transition-colors ${
          isActive ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'
        }`}
      />
      <span className="relative z-10">{name}</span>
      {isActive && (
        <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-blue-400" />
      )}
    </Link>
  );
}

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center px-4 h-14 border-b border-white/[0.06]" style={{ background: 'rgba(4, 6, 8, 0.85)', backdropFilter: 'blur(20px)' }}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="p-2 mr-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
          <span className="primary-gradient w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold text-white shadow-lg shadow-blue-500/20">M</span>
          <span className="font-semibold text-white text-[15px]">InvestMoat</span>
        </Link>

        <button
          onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
          aria-label="Open search"
          className="ml-auto p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
      </div>

      {isSearchOpen && (
        <MobileSearchPopup onClose={() => setIsSearchOpen(false)} />
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-[100] overflow-y-auto" style={{ background: 'rgba(4, 6, 8, 0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="flex flex-col p-3 gap-1 pb-safe">
            {navLinks.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                name={item.name}
                icon={item.icon}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sidebar glass hidden lg:flex">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2.5 group" style={{ textDecoration: 'none' }}>
            <span className="primary-gradient w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
              M
            </span>
            <div>
              <div className="text-[15px] font-semibold text-white leading-none">InvestMoat</div>
              <div className="text-[10px] text-white/25 font-medium mt-0.5 leading-none">Investment Research</div>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <NavSearch />
        </div>

        {/* Nav links */}
        <div>
          <p className="section-label mb-2 px-3">Menu</p>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((item) => (
              <NavLink key={item.href} href={item.href} name={item.name} icon={item.icon} />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-5 border-t border-white/[0.05] text-[10px] text-white/15 font-medium">
          &copy; 2026 InvestMoat
        </div>
      </aside>
    </>
  );
}
