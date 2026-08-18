'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, BarChart2, TrendingUp, Menu, FileText, CalendarDays, Briefcase, X, ArrowUp, ArrowLeftRight, LayoutGrid } from 'lucide-react';
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
import {
  applyFabHandToDocument,
  classifyPointer,
  FLIP_COOLDOWN_MS,
  isFabDockTarget,
  isInteractiveTarget,
  loadFabHand,
  saveFabHand,
  SCROLL_DY,
  tallyVote,
  VOTE_DECAY_MS,
  type FabHand,
  type PointerSample,
} from '@/lib/fabHandedness';

const navLinks = [
  { name: 'IM25', href: '/portfolio', icon: BarChart2 },
  { name: 'My Portfolio', href: '/my-portfolio', icon: Briefcase },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'Sectors', href: '/sectors', icon: LayoutGrid },
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

/**
 * Reveal the mobile FAB cluster on an upward scroll.
 *
 * Search lives on the cluster, so it stays visible at the top of a page —
 * hiding it there would bury the most-used action. It tucks away while the
 * reader scrolls down and slides back when they look up. A page that cannot
 * scroll has no "up" gesture, so the cluster stays put there.
 */
function useFabRevealedOnScrollUp(forceVisible: boolean) {
  const pathname = usePathname();
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    setRevealed(
      window.scrollY <= 24 ||
        document.documentElement.scrollHeight <= window.innerHeight + 24
    );
  }, [pathname]);

  useEffect(() => {
    if (forceVisible) {
      setRevealed(true);
      return;
    }

    let lastY = window.scrollY;
    let frame = 0;
    const threshold = 6;

    function pageCanScroll() {
      return document.documentElement.scrollHeight > window.innerHeight + 24;
    }

    function update() {
      frame = 0;
      if (!pageCanScroll()) {
        setRevealed(true);
        lastY = window.scrollY;
        return;
      }
      const y = window.scrollY;
      if (y <= 24) {
        setRevealed(true);
        lastY = y;
        return;
      }
      const delta = y - lastY;
      if (delta > threshold) {
        setRevealed(false);
      } else if (delta < -threshold) {
        setRevealed(true);
      }
      lastY = y;
    }

    function onScroll() {
      if (frame === 0) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [forceVisible]);

  return forceVisible || revealed;
}

const fabButtonClass =
  'size-12 rounded-full border border-accent/25 bg-[#0b0e13]/90 text-accent shadow-lg shadow-black/40 backdrop-blur hover:border-accent/50 hover:text-gold-bright';

const FAB_LONG_PRESS_MS = 520;

/**
 * Lean the mobile FAB under the thumb that is actually using the phone.
 *
 * Side is a CSS concern (`html[data-fab-hand]`) so the first paint can
 * match a stored choice without a hydration flicker. This hook only
 * learns, persists, and announces. The same reader can swap hands: a
 * reach for the empty opposite slot moves the dock on the first tap,
 * and one-handed scrolls from the other edge follow after a short streak.
 */
function useFabHandedness() {
  const [hand, setHand] = useState<FabHand>('right');
  const [bothThumbs, setBothThumbs] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const votesRef = useRef({ left: 0, right: 0 });
  const handRef = useRef<FabHand>('right');
  const lockedRef = useRef(false);
  const bothThumbsRef = useRef(false);
  const lastFlipAt = useRef(0);
  const lastVoteAt = useRef(0);

  const commitHand = useCallback((next: FabHand, locked: boolean) => {
    const swapped = next !== handRef.current;
    const both = bothThumbsRef.current || swapped;
    bothThumbsRef.current = both;
    handRef.current = next;
    lockedRef.current = locked;
    setHand(next);
    setBothThumbs(both);
    applyFabHandToDocument(next);
    saveFabHand({ hand: next, locked, bothThumbs: both });
    setAnnouncement(
      next === 'left'
        ? 'Menu moved to the left, for a left thumb.'
        : 'Menu moved to the right, for a right thumb.'
    );
  }, []);

  const flipHand = useCallback(() => {
    const now = Date.now();
    if (now - lastFlipAt.current < FLIP_COOLDOWN_MS) return;
    lastFlipAt.current = now;
    votesRef.current = { left: 0, right: 0 };
    commitHand(handRef.current === 'left' ? 'right' : 'left', true);
  }, [commitHand]);

  useEffect(() => {
    const stored = loadFabHand();
    if (!stored) return;
    handRef.current = stored.hand;
    lockedRef.current = stored.locked;
    bothThumbsRef.current = stored.bothThumbs === true;
    setHand(stored.hand);
    setBothThumbs(stored.bothThumbs === true);
    applyFabHandToDocument(stored.hand);
  }, []);

  useEffect(() => {
    type Pending = {
      x: number;
      y: number;
      pointerType: string;
      onDock: boolean;
      onControl: boolean;
      id: number;
      scrollY: number;
    };

    let pending: Pending | null = null;
    let cancelTimer = 0;
    const mobile = window.matchMedia('(max-width: 1023px)');

    function sampleFromPending(source: Pending, scrollDy?: number): PointerSample {
      return {
        x: source.x,
        y: source.y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        pointerType: source.pointerType,
        onDock: source.onDock,
        onControl: source.onControl,
        scrollDy,
      };
    }

    function consider(sample: PointerSample) {
      const vote = classifyPointer(sample, handRef.current);
      if (!vote) return;
      const now = Date.now();
      // Explicit flip just happened — do not bounce back on the same gesture.
      if (now - lastFlipAt.current < FLIP_COOLDOWN_MS) return;
      // A lock used to ignore every vote except the empty opposite corner.
      // That trapped anyone who then swapped thumbs: scrolling with the
      // other hand never counted. Opposite-hand votes always get through.
      if (lockedRef.current && vote.hand === handRef.current) return;
      if (now - lastVoteAt.current > VOTE_DECAY_MS) {
        votesRef.current = { left: 0, right: 0 };
      }
      lastVoteAt.current = now;
      const next = tallyVote(votesRef.current.left, votesRef.current.right, vote, {
        bothThumbs: bothThumbsRef.current,
      });
      votesRef.current = { left: next.leftVotes, right: next.rightVotes };
      if (next.inferred && next.inferred !== handRef.current) {
        votesRef.current = { left: 0, right: 0 };
        // Auto-follow is not a lock — the next thumb-swap must still work.
        commitHand(next.inferred, false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!mobile.matches) return;
      if (cancelTimer) {
        window.clearTimeout(cancelTimer);
        cancelTimer = 0;
      }
      pending = {
        x: event.clientX,
        y: event.clientY,
        pointerType: event.pointerType,
        onDock: isFabDockTarget(event.target),
        onControl: isInteractiveTarget(event.target),
        id: event.pointerId,
        scrollY: window.scrollY,
      };
    }

    function onPointerMove(event: PointerEvent) {
      if (!pending || event.pointerId !== pending.id) return;
      const dy = Math.abs(event.clientY - pending.y);
      const dx = Math.abs(event.clientX - pending.x);
      if (dy >= SCROLL_DY && dy > dx) {
        consider(sampleFromPending(pending, dy));
        pending = null;
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (!pending || event.pointerId !== pending.id) return;
      const dy = Math.abs(event.clientY - pending.y);
      const dx = Math.abs(event.clientX - pending.x);
      if (dx < 10 && dy < 10) {
        consider(sampleFromPending(pending));
      }
      pending = null;
    }

    function onPointerCancel(event: PointerEvent) {
      if (!pending || event.pointerId !== pending.id) return;
      // Mobile browsers cancel the pointer when they take over for a
      // scroll. Keep the sample so the scroll listener can vote; drop
      // it if no scroll arrives.
      const id = pending.id;
      if (cancelTimer) window.clearTimeout(cancelTimer);
      cancelTimer = window.setTimeout(() => {
        cancelTimer = 0;
        if (pending?.id === id) pending = null;
      }, 400);
    }

    function onScroll() {
      if (!pending || !mobile.matches) return;
      const dy = Math.abs(window.scrollY - pending.scrollY);
      if (dy < SCROLL_DY) return;
      consider(sampleFromPending(pending, dy));
      pending = null;
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (cancelTimer) window.clearTimeout(cancelTimer);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('scroll', onScroll);
    };
  }, [commitHand]);

  return { hand, bothThumbs, announcement, flipHand };
}

function useFabLongPress(onLongPress: () => void) {
  const timerRef = useRef<number>(0);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const onPressStart = useCallback(() => {
    firedRef.current = false;
    clear();
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      timerRef.current = 0;
      onLongPress();
    }, FAB_LONG_PRESS_MS);
  }, [clear, onLongPress]);

  const onPressEnd = useCallback(() => {
    clear();
  }, [clear]);

  return {
    consumeLongPress: () => {
      const fired = firedRef.current;
      firedRef.current = false;
      return fired;
    },
    markFired: () => {
      firedRef.current = true;
    },
    bind: {
      onPressStart,
      onPressEnd,
      onContextMenu: (event: React.MouseEvent) => {
        // Long-press / right-click is the explicit "move it" gesture.
        // Swallow the browser menu so it cannot cancel the press first.
        event.preventDefault();
        event.stopPropagation();
        firedRef.current = true;
        onLongPress();
      },
    },
  };
}

/**
 * Mobile chrome as a thumb-side cluster: search plus a speed-dial menu.
 *
 * The dock leans left or right with the reader's thumb — detected from
 * reach, or set by holding the menu button / Switch side. Search is a
 * sibling of the menu so it stays one tap away; destinations still fan
 * up from the menu so a thumb never has to cross the screen. The same
 * reader can swap hands: a reach for the empty opposite slot, or a
 * short streak of one-handed scrolls from the other edge, moves the
 * cluster. On a research article, back-to-top joins the same row once
 * the reader is a screen deep, so it is not a second floating control
 * in the same corner.
 */
function isResearchArticlePath(pathname: string) {
  return pathname.startsWith('/research/');
}

function MobileFabDock({
  isMenuOpen,
  isSearchOpen,
  onMenuOpenChange,
  onSearchPress,
}: {
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onSearchPress: () => void;
}) {
  const pathname = usePathname();
  const count = navLinks.length;
  const onArticle = isResearchArticlePath(pathname);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const revealed = useFabRevealedOnScrollUp(isMenuOpen || showBackToTop) && !isSearchOpen;
  const { hand, bothThumbs, announcement, flipHand } = useFabHandedness();
  const longPress = useFabLongPress(flipHand);
  const longPressRef = useRef(longPress);
  longPressRef.current = longPress;
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    let holdTimer = 0;

    function clearHold() {
      if (holdTimer) {
        window.clearTimeout(holdTimer);
        holdTimer = 0;
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('button')) return;
      clearHold();
      holdTimer = window.setTimeout(() => {
        holdTimer = 0;
        longPressRef.current.markFired();
        flipHand();
      }, FAB_LONG_PRESS_MS);
    }

    function onContextMenu(event: Event) {
      event.preventDefault();
      const target = event.target;
      if (target instanceof Element && target.closest('button')) {
        clearHold();
        longPressRef.current.markFired();
        flipHand();
      }
    }

    dock.addEventListener('pointerdown', onPointerDown, true);
    dock.addEventListener('pointerup', clearHold, true);
    dock.addEventListener('pointercancel', clearHold, true);
    dock.addEventListener('contextmenu', onContextMenu, true);
    return () => {
      clearHold();
      dock.removeEventListener('pointerdown', onPointerDown, true);
      dock.removeEventListener('pointerup', clearHold, true);
      dock.removeEventListener('pointercancel', clearHold, true);
      dock.removeEventListener('contextmenu', onContextMenu, true);
    };
  }, [flipHand]);

  useEffect(() => {
    if (!onArticle) {
      setShowBackToTop(false);
      return;
    }
    function onScroll() {
      setShowBackToTop(window.scrollY > 1200);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onArticle]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMenuOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMenuOpen, onMenuOpenChange]);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 z-[190] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => onMenuOpenChange(false)}
      />

      <div
        aria-hidden={!revealed}
        className={`fab-dock fixed z-[200] lg:hidden ${revealed ? '' : 'fab-dock--hidden'}`}
        data-fab-dock=""
        ref={dockRef}
        style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }}
      >
        <nav
          aria-hidden={!isMenuOpen}
          aria-label="Menu"
          className="fab-speed-dial absolute bottom-[calc(100%+0.65rem)] flex flex-col gap-2"
          data-open={isMenuOpen || undefined}
          id="mobile-fab-menu"
        >
          {navLinks.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`fab-speed-dial__item flex h-11 items-center gap-2.5 rounded-full border px-3.5 no-underline shadow-lg shadow-black/40 backdrop-blur ${
                  isActive
                    ? 'border-accent/40 bg-accent-soft text-foreground'
                    : 'border-accent/25 bg-[#0b0e13]/92 text-foreground/85'
                }`}
                href={item.href}
                onClick={() => onMenuOpenChange(false)}
                style={
                  {
                    '--fab-i': isMenuOpen ? count - 1 - index : index,
                  } as React.CSSProperties
                }
              >
                <Icon
                  className={`size-4 shrink-0 ${isActive ? 'text-gold-bright' : 'text-accent'}`}
                />
                <span className="pr-0.5 text-[13px] font-medium">{item.name}</span>
                {isActive && <span className="size-1.5 rounded-full bg-gold-bright" />}
              </Link>
            );
          })}
          <button
            className="fab-speed-dial__item flex h-11 items-center gap-2.5 rounded-full border border-accent/25 bg-[#0b0e13]/92 px-3.5 text-foreground/85 shadow-lg shadow-black/40 backdrop-blur"
            onClick={() => {
              flipHand();
              onMenuOpenChange(false);
            }}
            style={
              {
                '--fab-i': isMenuOpen ? 0 : count,
              } as React.CSSProperties
            }
            type="button"
          >
            <ArrowLeftRight className="size-4 shrink-0 text-accent" />
            <span className="pr-0.5 text-[13px] font-medium">
              {bothThumbs ? 'Switch side' : hand === 'left' ? 'Use right hand' : 'Use left hand'}
            </span>
          </button>
        </nav>

        <div className="fab-dock__actions">
          {showBackToTop && (
            <Button
              aria-label="Back to top"
              className={fabButtonClass}
              isIconOnly
              onPress={() => {
                const reduce =
                  typeof window !== 'undefined' &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
              }}
            >
              <ArrowUp className="size-5" />
            </Button>
          )}

          <Button
            aria-label="Search stocks"
            className={fabButtonClass}
            isIconOnly
            onPress={onSearchPress}
          >
            <Search className="size-5" />
          </Button>

          <Button
            aria-controls="mobile-fab-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu. Hold to move to the other side.'}
            className={fabButtonClass}
            isIconOnly
            onPress={() => {
              if (longPress.consumeLongPress()) return;
              onMenuOpenChange(!isMenuOpen);
            }}
            {...longPress.bind}
          >
            <span className="relative size-5">
              <Menu
                className={`absolute inset-0 size-5 transition-all duration-200 ${
                  isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                }`}
              />
              <X
                className={`absolute inset-0 size-5 transition-all duration-200 ${
                  isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                }`}
              />
            </span>
          </Button>
        </div>
      </div>
    </>
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
      {/* Mobile top bar — brand only; search and menu live on the FAB.
          Not sticky: once the reader is into a page the bar scrolls away
          and the viewport is theirs. */}
      <div className="flex h-12 items-center border-b border-border px-4 lg:hidden">
        <BrandMark compact />
      </div>

      <MobileFabDock
        isMenuOpen={isMenuOpen}
        isSearchOpen={isSearchOpen}
        onMenuOpenChange={setIsMenuOpen}
        onSearchPress={() => {
          setIsMenuOpen(false);
          setIsSearchOpen(true);
        }}
      />

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
