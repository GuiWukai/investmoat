'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown, LayoutGrid } from "lucide-react";
import {
  Button,
  Card,
  ListBox,
  ListBoxItem,
  SearchField,
  Select,
  Spinner,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { allCoverageData, getAverageScore } from "../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";
import { SECTORS } from "@/lib/sectorCatalog";
import { MetricBand } from "@/components/MetricBand";

const TICKER_COLORS: Record<string, string> = {
  MSFT: "#00a4ef", AMZN: "#f59e0b", ASML: "#0071c5", V:    "#1a1f71",
  MA:   "#eb001b", NVDA: "#76b900", SPGI: "#cf102d", CRM:  "#00a1e0",
  INTU: "#2ca01c", META: "#1877f2", TSLA: "#cc0000", PLTR: "#7c3aed",
  ADBE: "#ff0000", NFLX: "#e50914", AMD:  "#ed1c24", XAU:  "#f59e0b",
  HG:   "#b87333", XAG:  "#c0c0c0", U:    "#d4c419",
  BTC:  "#f7931a", KNT:  "#6b7280", CRWD: "#e8281b", FCX:  "#b45309",
  GOOGL:"#4285f4", AAPL: "#555555", AVGO: "#cc0000", TSM:  "#0071c5",
  MU:   "#0099cc", ISRG: "#009688",
};

const CATEGORIES = [
  { label: "All", key: "all" },
  ...SECTORS.map((s) => ({ label: s.label, key: s.key })),
];

// ─── Sorting ───────────────────────────────────────────────────────────────────
type SortKey = "name" | "moat" | "growth" | "val" | "score";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score",  label: "Score"  },
  { key: "moat",   label: "Moat"   },
  { key: "growth", label: "Growth" },
  { key: "val",    label: "Val"    },
  { key: "name",   label: "Name"   },
];

function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((opt) => opt.key === value);
}

function defaultSortDir(key: SortKey): SortDir {
  return key === "name" ? "asc" : "desc";
}

function parseStocksParams(sp: URLSearchParams): {
  q: string;
  cat: string;
  sort: SortKey;
  dir: SortDir;
} {
  const q = sp.get("q") ?? "";
  const catRaw = sp.get("cat") ?? "all";
  const cat = CATEGORIES.some((c) => c.key === catRaw) ? catRaw : "all";
  const sortParam = sp.get("sort");
  const sort = isSortKey(sortParam) ? sortParam : "score";
  const dirRaw = sp.get("dir");
  const dir: SortDir = dirRaw === "asc" || dirRaw === "desc" ? dirRaw : defaultSortDir(sort);
  return { q, cat, sort, dir };
}

/** Omit defaults so `/stocks` stays a clean URL when nothing is filtered. */
function stocksHref(state: { q: string; cat: string; sort: SortKey; dir: SortDir }): string {
  const params = new URLSearchParams();
  const q = state.q.trim();
  if (q) params.set("q", q);
  if (state.cat !== "all") params.set("cat", state.cat);
  if (state.sort !== "score") params.set("sort", state.sort);
  if (state.dir !== defaultSortDir(state.sort)) params.set("dir", state.dir);
  const qs = params.toString();
  return qs ? `/stocks?${qs}` : "/stocks";
}

function scoreColor(score: number) {
  if (score >= 90) return "#10b981";
  if (score >= 80) return "#3b82f6";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
}

function ScorePill({ value }: { value: number }) {
  const color = scoreColor(value);
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-black tabular-nums"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {value}
    </span>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/25">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
  );
}

// ─── Sort affordances ──────────────────────────────────────────────────────────
function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={11} className="text-foreground/15" />;
  return dir === "asc"
    ? <ArrowUp size={11} className="text-gold-bright" />
    : <ArrowDown size={11} className="text-gold-bright" />;
}

function SortHeader({
  label, sortKey, active, dir, onSort, className, justify = "start",
}: {
  label: string; sortKey: SortKey; active: boolean; dir: SortDir;
  onSort: (k: SortKey) => void; className?: string; justify?: "start" | "center";
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active ? "text-gold-bright" : "text-foreground/20 hover:text-foreground/45"
      } ${justify === "center" ? "justify-center" : ""} ${className ?? ""}`}
    >
      <span>{label}</span>
      <SortIndicator active={active} dir={dir} />
    </button>
  );
}

/** Score shown in the row's score pill for the active sort key. */
function displayScoreForSort(
  sortKey: SortKey,
  stock: typeof allCoverageData[0],
  liveScore: number,
): number {
  switch (sortKey) {
    case "moat":   return Math.round(stock.scores[0]);
    case "growth": return Math.round(stock.scores[1]);
    case "val":    return Math.round(stock.scores[2]);
    case "score":
    case "name":
      return liveScore;
  }
}

function StockRow({
  stock, rank, liveScore, loading, sortKey,
}: {
  stock: typeof allCoverageData[0];
  rank?: number;
  liveScore: number;
  loading: boolean;
  sortKey: SortKey;
}) {
  const accentColor = TICKER_COLORS[stock.ticker] ?? '#6b7280';
  // Mobile only shows one score pill — match it to the active sort so the
  // number lines up with what the user asked to order by. Desktop keeps the
  // full Moat/Growth/Val columns + composite Score.
  const mobileScore = displayScoreForSort(sortKey, stock, liveScore);
  const mobileNeedsLive = sortKey === "score" || sortKey === "name";

  return (
    <Link
      href={stock.href}
      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left no-underline transition-colors hover:bg-foreground/[0.04] sm:gap-4 sm:px-5"
    >
      {/* Rank */}
      {rank !== undefined && (
        <span className="hidden sm:block text-[11px] font-bold text-foreground/15 tabular-nums w-5 shrink-0 text-right">
          {rank}
        </span>
      )}

      {/* Ticker badge */}
      <div
        className="shrink-0 flex items-center justify-center h-8 px-2 rounded-lg text-[11px] font-black tracking-wider"
        style={{
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          minWidth: '44px',
        }}
      >
        {stock.ticker}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground/90 group-hover:text-foreground transition-colors truncate leading-tight">
          {stock.name}
        </div>
      </div>

      {/* Sub-scores — desktop only */}
      <div className="hidden md:flex items-center gap-5 shrink-0">
        <SubScore label="Moat" value={Math.round(stock.scores[0])} />
        <SubScore label="Growth" value={Math.round(stock.scores[1])} />
        <SubScore label="Val" value={Math.round(stock.scores[2])} />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-foreground/[0.07] shrink-0" />

      {/* Mobile: score matching active sort · Desktop: composite score */}
      <div className="shrink-0 md:hidden">
        {mobileNeedsLive && loading
          ? <Spinner size="sm" color="current" />
          : <ScorePill value={mobileScore} />
        }
      </div>
      <div className="hidden md:block shrink-0">
        {loading
          ? <Spinner size="sm" color="current" />
          : <ScorePill value={liveScore} />
        }
      </div>

      <ChevronRight
        size={14}
        className="shrink-0 text-foreground/15 group-hover:text-foreground/50 transition-colors"
      />
    </Link>
  );
}

/** The category pills keep the house rounded-full look on top of ToggleButton. */
const CATEGORY_PILL =
  'pill-toggle flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap';

/**
 * Mobile filter/sort control.
 *
 * This replaces a hand-rolled dropdown that managed its own open state and
 * document-level mousedown listener, and rendered its options as plain buttons
 * with no listbox semantics. HeroUI's Select portals the popover, traps and
 * restores focus, supports type-ahead and arrow keys, and closes on Escape.
 */
function MobileSelect({
  label, icon, selectedKey, onSelectionChange, children,
}: {
  label: string;
  icon: ReactNode;
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  children: ReactNode;
}) {
  return (
    <Select
      aria-label={label}
      fullWidth
      onSelectionChange={(key) => {
        if (key == null) return;
        onSelectionChange(String(key));
      }}
      selectedKey={selectedKey}
    >
      <Select.Trigger className="items-center gap-2 text-left">
        <span className="shrink-0 text-muted">{icon}</span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted">
            {label}
          </span>
          <Select.Value className="truncate text-xs font-semibold text-foreground/85">
            {({ isPlaceholder, selectedText, defaultChildren }) =>
              isPlaceholder ? defaultChildren : selectedText
            }
          </Select.Value>
        </span>
        <Select.Indicator className="ml-auto shrink-0" />
      </Select.Trigger>
      <Select.Popover>
        <ListBox className="max-h-72 overflow-y-auto">{children}</ListBox>
      </Select.Popover>
    </Select>
  );
}

function StocksPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = parseStocksParams(searchParams);

  const [query, setQuery] = useState(initial.q);
  const [activeCategory, setActiveCategory] = useState(initial.cat);
  const [sortKey, setSortKey] = useState<SortKey>(initial.sort);
  const [sortDir, setSortDir] = useState<SortDir>(initial.dir);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keep the address bar in sync so a filtered view is shareable — and so the
  // JSON-LD SearchAction (`/stocks?q=`) actually lands on a matching list.
  useEffect(() => {
    const href = stocksHref({ q: query, cat: activeCategory, sort: sortKey, dir: sortDir });
    const current = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
    if (href !== current) {
      router.replace(href, { scroll: false });
    }
  }, [query, activeCategory, sortKey, sortDir, pathname, router, searchParams]);

  // Live prices fetched once at the page level so the Score column can be sorted
  // against price-adjusted valuations (not just the static fallback).
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [pricesLoaded, setPricesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      allCoverageData.map(s =>
        fetch(`/api/stock-price/${s.slug}`)
          .then(r => (r.ok ? r.json() : null))
          .then(d => [s.ticker, d?.price ?? null] as const)
          .catch(() => [s.ticker, null] as const)
      )
    ).then(entries => {
      if (cancelled) return;
      setPrices(Object.fromEntries(entries));
      setPricesLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  const liveScores = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of allCoverageData) {
      const price = prices[s.ticker];
      const bear = parseScenarioPrice(s.bearTarget);
      const base = parseScenarioPrice(s.baseTarget);
      const bull = parseScenarioPrice(s.bullTarget);
      m[s.ticker] = (price != null && bear && base && bull)
        ? Math.round(getAverageScore([s.scores[0], s.scores[1], computeValuationScore(price, bear, base, bull)]))
        : Math.round(getAverageScore(s.scores));
    }
    return m;
  }, [prices]);

  const trimmed = query.trim().toLowerCase();

  const filtered = allCoverageData.filter(s => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const matchesQuery = !trimmed ||
      s.name.toLowerCase().includes(trimmed) ||
      s.ticker.toLowerCase().includes(trimmed);
    return matchesCategory && matchesQuery;
  });

  const sorted = useMemo(() => {
    const value = (s: typeof allCoverageData[0]): number | string => {
      switch (sortKey) {
        case "name":   return s.name.toLowerCase();
        case "moat":   return s.scores[0];
        case "growth": return s.scores[1];
        case "val":    return s.scores[2];
        case "score":  return liveScores[s.ticker] ?? getAverageScore(s.scores);
      }
    };
    return [...filtered].sort((a, b) => {
      const av = value(a), bv = value(b);
      let cmp: number;
      if (typeof av === "string" && typeof bv === "string") cmp = av.localeCompare(bv);
      else cmp = (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, liveScores]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(defaultSortDir(key));
    }
  }

  const categoryCount = (key: string) =>
    key === "all" ? allCoverageData.length : allCoverageData.filter(s => s.category === key).length;

  const visibleCategories = CATEGORIES.filter(c => categoryCount(c.key) > 0);

  const avgScore = Math.round(
    allCoverageData.reduce((sum, s) => sum + getAverageScore(s.scores), 0) / allCoverageData.length
  );

  return (
    <div className="animate-fade-in space-y-8 md:space-y-10">
      {/* Header */}
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">Coverage Universe</p>
        <h1 className="page-title gradient-text-animated mb-4">
          Stock Coverage
        </h1>
        <p className="page-dek">
          {allCoverageData.length} stocks scored on moat durability, growth trajectory, and live valuation.
          {" "}
          <Link href="/sectors" className="text-foreground/55 hover:text-gold-bright transition-colors">
            Browse by sector
            <LayoutGrid size={12} className="ml-1 inline-block align-[-1px]" />
          </Link>
        </p>
      </header>

      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.06s' }}>
        <MetricBand
          items={[
            { label: "Avg score", value: avgScore },
            { label: "Total stocks", value: allCoverageData.length },
            { label: "Categories", value: visibleCategories.length - 1 },
            { label: "In this view", value: sorted.length },
          ]}
        />
      </div>

      {/* Controls */}
      <div className="relative z-30 animate-fade-up stagger-fill-both space-y-3" style={{ animationDelay: '0.1s' }}>
        <SearchField
          aria-label="Search coverage by name or ticker"
          className="max-w-sm"
          fullWidth
          onChange={setQuery}
          // On touch the on-screen keyboard covers most of the filtered list,
          // and nothing here submits, so the keyboard had no reason to go away.
          // The keyboard's Search key now dismisses it and puts the list back
          // in view. Escape (handled by SearchField) still clears the query.
          onSubmit={() => searchInputRef.current?.blur()}
          value={query}
        >
          <SearchField.Group className="h-11 md:h-9">
            <SearchField.SearchIcon />
            <SearchField.Input
              ref={searchInputRef}
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="search"
              placeholder="Search by name or ticker…"
              spellCheck={false}
            />
            {/* The 20px chip is a fiddly thing to hit with a thumb, but scaling
                it up turns it into a blob. Grow the hit area instead and leave
                the chip alone. */}
            <SearchField.ClearButton className="mr-2 size-5 before:absolute before:-inset-2 before:content-['']" />
          </SearchField.Group>
        </SearchField>

        {/* Desktop: category pills (sorting is handled by column headers) */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={12} className="text-muted shrink-0" />
          <ToggleButtonGroup
            aria-label="Filter coverage by category"
            className="flex flex-wrap items-center gap-2"
            isDetached
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (next != null) setActiveCategory(String(next));
            }}
            selectedKeys={new Set([activeCategory])}
            selectionMode="single"
            size="sm"
          >
            {visibleCategories.map(cat => (
              <ToggleButton key={cat.key} className={CATEGORY_PILL} id={cat.key}>
                {cat.label}
                {cat.key !== "all" && (
                  <span className="text-[10px] font-bold opacity-60">
                    {categoryCount(cat.key)}
                  </span>
                )}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {/* Mobile: filter + sort selects (pills/headers are hidden below md) */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <MobileSelect
            icon={<SlidersHorizontal size={14} />}
            label="Filter"
            onSelectionChange={setActiveCategory}
            selectedKey={activeCategory}
          >
            {visibleCategories.map(cat => (
              <ListBoxItem
                key={cat.key}
                className="flex items-center justify-between gap-2"
                id={cat.key}
                textValue={cat.label}
              >
                <span>{cat.label}</span>
                {cat.key !== "all" && (
                  <span className="text-[11px] font-bold text-muted">
                    {categoryCount(cat.key)}
                  </span>
                )}
              </ListBoxItem>
            ))}
          </MobileSelect>

          <div className="flex min-w-0 gap-1.5">
            <div className="min-w-0 flex-1">
              <MobileSelect
                icon={<ArrowUpDown size={14} />}
                label="Sort by"
                onSelectionChange={(key) => {
                  const next = key as SortKey;
                  if (!SORT_OPTIONS.some((opt) => opt.key === next)) return;
                  // HeroUI Select does not re-fire when the current option is
                  // chosen again, so direction lives on the sibling button.
                  if (next === sortKey) return;
                  setSortKey(next);
                  setSortDir(defaultSortDir(next));
                }}
                selectedKey={sortKey}
              >
                {SORT_OPTIONS.map(opt => (
                  <ListBoxItem
                    key={opt.key}
                    className="flex items-center justify-between gap-2"
                    id={opt.key}
                    textValue={opt.label}
                  >
                    <span>{opt.label}</span>
                    <SortIndicator active={sortKey === opt.key} dir={sortDir} />
                  </ListBoxItem>
                ))}
              </MobileSelect>
            </div>
            <Button
              aria-label={sortDir === "asc" ? "Sort descending" : "Sort ascending"}
              className="self-stretch"
              isIconOnly
              onPress={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              variant="secondary"
            >
              <SortIndicator active dir={sortDir} />
            </Button>
          </div>
        </div>
      </div>

      {/* Stock list */}
      <div className="relative z-0 animate-fade-up stagger-fill-both" style={{ animationDelay: '0.16s' }}>
        {/* Column headers — desktop (sortable) */}
        <div className="hidden md:flex items-center gap-4 px-5 pb-2">
          <span className="w-5 shrink-0" />
          <span className="w-[44px] shrink-0" />
          <SortHeader
            label="Company" sortKey="name" active={sortKey === "name"} dir={sortDir}
            onSort={handleSort} className="flex-1"
          />
          <div className="flex items-center gap-5 shrink-0">
            <SortHeader label="Moat" sortKey="moat" active={sortKey === "moat"} dir={sortDir}
              onSort={handleSort} className="min-w-[40px]" justify="center" />
            <SortHeader label="Growth" sortKey="growth" active={sortKey === "growth"} dir={sortDir}
              onSort={handleSort} className="min-w-[40px]" justify="center" />
            <SortHeader label="Val" sortKey="val" active={sortKey === "val"} dir={sortDir}
              onSort={handleSort} className="min-w-[40px]" justify="center" />
          </div>
          <div className="w-px shrink-0" />
          <SortHeader label="Score" sortKey="score" active={sortKey === "score"} dir={sortDir}
            onSort={handleSort} className="w-9" justify="center" />
          <span className="w-3.5 shrink-0" />
        </div>

        {sorted.length === 0 ? (
          <Card className="px-6 py-16 text-center">
            <p className="text-sm text-foreground/30">
              {trimmed ? `No stocks match “${query.trim()}”` : "No stocks in this category"}
            </p>
            {(trimmed || activeCategory !== "all") && (
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-gold-bright transition-colors hover:text-gold"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
              >
                Clear search and filters
              </button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden divide-y divide-foreground/[0.04]">
            {sorted.map((stock, idx) => (
              <StockRow
                key={stock.ticker}
                stock={stock}
                rank={idx + 1}
                liveScore={liveScores[stock.ticker] ?? Math.round(getAverageScore(stock.scores))}
                loading={!pricesLoaded}
                sortKey={sortKey}
              />
            ))}
          </Card>
        )}

        {sorted.length > 0 && (
          <p className="text-center text-[11px] text-foreground/15 font-medium mt-3">
            {sorted.length} stock{sorted.length !== 1 ? 's' : ''}
            {activeCategory !== "all" ? ` · ${CATEGORIES.find(c => c.key === activeCategory)?.label}` : ' · All Categories'}
            {trimmed ? ` matching "${trimmed}"` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default function StocksPage() {
  return (
    <Suspense fallback={<StocksPageFallback />}>
      <StocksPageInner />
    </Suspense>
  );
}

function StocksPageFallback() {
  return (
    <div className="animate-fade-in space-y-8 md:space-y-10">
      <header>
        <p className="section-label mb-3">Coverage Universe</p>
        <h1 className="page-title gradient-text-animated mb-4">Stock Coverage</h1>
      </header>
    </div>
  );
}
