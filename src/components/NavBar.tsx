'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, BarChart2, TrendingUp, Menu, FileText, CalendarDays, Briefcase } from 'lucide-react';
import {
  Button,
  ComboBox,
  Drawer,
  Input,
  ListBox,
  ListBoxItem,
  SearchField,
  Separator,
} from '@heroui/react';
import { allCoverageData } from '@/app/stockData';
import { MoatMark } from '@/components/MoatMark';

const navLinks = [
  { name: 'IM25', href: '/portfolio', icon: BarChart2 },
  { name: 'My Portfolio', href: '/my-portfolio', icon: Briefcase },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'Earnings', href: '/earnings', icon: CalendarDays },
  { name: 'Research', href: '/research', icon: FileText },
];

type StockResult = { name: string; ticker: string; href: string };

/**
 * Name-or-ticker match, shared by the desktop and mobile search surfaces.
 *
 * Filtering is manual rather than using a built-in text filter because a ticker
 * match ("NOW") should rank alongside a name match ("ServiceNow"), and the list
 * is capped so the results never become a scroll trap.
 */
function useStockResults(query: string, limit: number): StockResult[] {
  return useMemo<StockResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return allCoverageData
      .filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.ticker.toLowerCase().includes(trimmed)
      )
      .slice(0, limit);
  }, [query, limit]);
}

/**
 * Desktop stock search — a ComboBox in the sidebar.
 *
 * The popover pattern works here because there is a pointer, a hover state and
 * an Escape key. On touch it does not, which is why mobile gets its own surface
 * below rather than this component inside a drawer.
 */
function StockSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const results = useStockResults(query, 6);

  return (
    <ComboBox
      aria-label="Search stocks"
      allowsEmptyCollection
      fullWidth
      inputValue={query}
      items={results}
      menuTrigger="input"
      onInputChange={setQuery}
      onSelectionChange={(key) => {
        if (key == null) return;
        setQuery('');
        router.push(String(key));
      }}
      selectedKey={null}
    >
      <ComboBox.InputGroup>
        <Search className="pointer-events-none size-4 shrink-0 text-muted" />
        <Input placeholder="Search stocks…" />
      </ComboBox.InputGroup>

      <ComboBox.Popover>
        <ListBox
          items={results}
          renderEmptyState={() => (
            <p className="px-3 py-3 text-sm text-muted">
              {query.trim() ? 'No stocks found' : 'Type to search by name or ticker…'}
            </p>
          )}
        >
          {(item: StockResult) => (
            <ListBoxItem
              key={item.href}
              className="group flex items-center justify-between gap-3"
              id={item.href}
              textValue={item.name}
            >
              <span className="truncate text-sm">{item.name}</span>
              <span className="ml-auto font-mono text-xs font-bold text-muted">
                {item.ticker}
              </span>
            </ListBoxItem>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

/**
 * Mobile stock search — a full-width sheet, results inline.
 *
 * This used to be the desktop ComboBox dropped into a drawer, which stacked a
 * popover on top of a dialog: the first tap outside dismissed the popover
 * rather than the sheet, and the sheet itself had no exit at all on touch (no
 * backdrop dismiss, no close button, and no Escape key to fall back on).
 *
 * So: results render inline in the sheet body instead of in a popover, and the
 * sheet gets the three exits a touch user expects — Cancel, tap the backdrop,
 * or drag it back up by the handle.
 */
function MobileSearchSheet({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const results = useStockResults(query, 8);
  const router = useRouter();
  const trimmed = query.trim();

  const close = () => {
    setQuery('');
    onOpenChange(false);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => {
        // Start clean on the next open rather than reopening onto stale results.
        if (!open) setQuery('');
        onOpenChange(open);
      }}
    >
      {/* Drawer.Backdrop is what makes a tap outside close the sheet — a bare
          Drawer.Content renders a non-dismissable overlay, which on touch means
          no way out at all. */}
      <Drawer.Backdrop variant="blur">
        <Drawer.Content placement="top">
          <Drawer.Dialog
            aria-label="Search stocks"
            // The dialog caps itself at 85vh, which counts the space the
            // on-screen keyboard covers. The backdrop tracks the visual
            // viewport, so cap against that instead and let the body scroll.
            // (touch-action is restated because it is set inline upstream.)
            style={{ maxHeight: '100%', touchAction: 'none' }}
          >
            <Drawer.Header>
              <div className="flex items-center gap-2">
                <SearchField
                  aria-label="Search stocks"
                  className="min-w-0 flex-1"
                  fullWidth
                  onChange={setQuery}
                  // The keyboard's Search key goes to the top hit, so a
                  // one-hander never has to reach back up to the list.
                  onSubmit={() => {
                    const top = results[0];
                    if (!top) return;
                    close();
                    router.push(top.href);
                  }}
                  value={query}
                >
                  {/* Touch-sized: a 44px field, and hit slop around the clear
                      chip so it can be cleared without aiming. */}
                  <SearchField.Group className="h-11">
                    <SearchField.SearchIcon />
                    <SearchField.Input
                      autoFocus
                      enterKeyHint="search"
                      placeholder="Search by name or ticker…"
                    />
                    <SearchField.ClearButton className="mr-2 size-5 before:absolute before:-inset-2 before:content-['']" />
                  </SearchField.Group>
                </SearchField>
                <Button className="shrink-0" onPress={close} size="sm" variant="ghost">
                  Cancel
                </Button>
              </div>
            </Drawer.Header>

            <Drawer.Body>
              {results.length > 0 ? (
                <ul className="flex flex-col py-1">
                  {results.map((item) => (
                    <li key={item.href}>
                      {/* A plain link, not a ListBoxItem: tapping navigates on
                          the first touch, with no roving focus to fight the
                          keyboard for. */}
                      <Link
                        className="flex min-h-12 items-center gap-3 rounded-xl px-3 no-underline transition-colors active:bg-default"
                        href={item.href}
                        onClick={close}
                      >
                        <span className="truncate text-sm text-foreground">{item.name}</span>
                        <span className="ml-auto shrink-0 font-mono text-xs font-bold text-muted">
                          {item.ticker}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  {trimmed ? `No stocks match “${trimmed}”` : 'Search by name or ticker'}
                </p>
              )}
            </Drawer.Body>

            {/* Bottom edge on a top sheet: this is the grab target you flick
                upward to dismiss. */}
            <Drawer.Handle />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function BrandMark({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  return (
    <Link
      className="group flex items-center gap-2.5 no-underline"
      href="/"
      onClick={onClick}
    >
      <span
        className={`primary-gradient flex items-center justify-center rounded-lg text-[#0a0b0d] shadow-lg shadow-accent/20 transition-shadow group-hover:shadow-accent/40 ${
          compact ? 'size-7 rounded-md' : 'size-9'
        }`}
      >
        <MoatMark className={compact ? 'size-4' : 'size-5'} strokeWidth={compact ? 1.9 : 1.8} />
      </span>
      {compact ? (
        <span className="font-brand text-[19px] tracking-tight">InvestMoat</span>
      ) : (
        <span>
          <span className="font-brand block text-[21px] leading-none tracking-tight">
            InvestMoat
          </span>
          <span className="mt-1 block font-mono text-[9px] font-bold uppercase leading-none tracking-[0.18em] text-accent/65">
            Systematic Equity Research
          </span>
        </span>
      )}
    </Link>
  );
}

function NavLink({
  href,
  name,
  icon: Icon,
  onClick,
}: {
  href: string;
  name: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all duration-200 ${
        isActive ? 'text-foreground' : 'text-muted hover:bg-default hover:text-foreground'
      }`}
      href={href}
      onClick={onClick}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-xl border border-accent/25 bg-accent-soft" />
      )}
      <Icon
        className={`relative z-10 size-4 shrink-0 transition-colors ${
          isActive ? 'text-gold-bright' : 'text-muted group-hover:text-foreground'
        }`}
      />
      <span className="relative z-10">{name}</span>
      {isActive && (
        <span className="relative z-10 ml-auto size-1.5 rounded-full bg-gold-bright" />
      )}
    </Link>
  );
}

function DeskFooter() {
  return (
    <div className="mt-auto pt-5">
      <Separator className="mb-4" />
      <div className="mb-2 flex items-center gap-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-success" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
          Markets · Live Data
        </span>
      </div>
      <p className="font-mono text-[10px] leading-relaxed text-muted">
        Independent moat-driven equity research.
      </p>
      <p className="mt-1.5 font-mono text-[10px] text-muted/60">&copy; 2026 InvestMoat</p>
    </div>
  );
}

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <Button
          aria-label="Open menu"
          isIconOnly
          onPress={() => setIsMenuOpen(true)}
          size="sm"
          variant="ghost"
        >
          <Menu className="size-5" />
        </Button>

        <BrandMark compact />

        <Button
          aria-label="Search stocks"
          className="ml-auto"
          isIconOnly
          onPress={() => setIsSearchOpen(true)}
          size="sm"
          variant="ghost"
        >
          <Search className="size-[18px]" />
        </Button>
      </div>

      {/* Mobile navigation drawer — Backdrop so a tap outside closes it */}
      <Drawer isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content className="w-[min(20rem,85vw)]" placement="left">
            <Drawer.Dialog aria-label="Menu" className="flex h-full flex-col">
              <Drawer.Header>
                <BrandMark onClick={() => setIsMenuOpen(false)} />
              </Drawer.Header>
              <Drawer.Body className="flex flex-col gap-1">
                <p className="section-label mb-2 px-3">Menu</p>
                {navLinks.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    name={item.name}
                    onClick={() => setIsMenuOpen(false)}
                  />
                ))}
                <DeskFooter />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {/* Mobile search sheet — full-width so results have room to breathe */}
      <MobileSearchSheet isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Desktop sidebar */}
      <aside className="sidebar hidden lg:flex">
        <div className="mb-8">
          <BrandMark />
        </div>

        <div className="mb-6">
          <StockSearch />
        </div>

        <div>
          <p className="section-label mb-2 px-3">Menu</p>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon} name={item.name} />
            ))}
          </nav>
        </div>

        <DeskFooter />
      </aside>
    </>
  );
}
