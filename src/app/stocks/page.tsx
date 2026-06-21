'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, X, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react";
import { Spinner } from "@heroui/react";
import { allCoverageData, getAverageScore } from "../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

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
  { label: "All",                  key: "all"        },
  { label: "Large Cap Tech",       key: "Big Tech"   },
  { label: "Financials & SaaS",    key: "Financials" },
  { label: "Hard Assets",          key: "Hard Assets"},
  { label: "Healthcare",           key: "Healthcare" },
  { label: "Industrials",          key: "Industrials"},
  { label: "Other",                key: "Other"      },
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
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
  );
}

// ─── Sort affordances ──────────────────────────────────────────────────────────
function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={11} className="text-white/15" />;
  return dir === "asc"
    ? <ArrowUp size={11} className="text-[#e4c98a]" />
    : <ArrowDown size={11} className="text-[#e4c98a]" />;
}

function SortHeader({
  label, sortKey, active, dir, onSort, className, justify = "start",
}: {
  label: string; sortKey: SortKey; active: boolean; dir: SortDir;
  onSort: (k: SortKey) => void; className?: string; justify?: "start" | "center";
}) {
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active ? "text-[#e4c98a]" : "text-white/20 hover:text-white/45"
      } ${justify === "center" ? "justify-center" : ""} ${className ?? ""}`}
    >
      <span>{label}</span>
      <SortIndicator active={active} dir={dir} />
    </button>
  );
}

function StockRow({
  stock, rank, liveScore, loading,
}: {
  stock: typeof allCoverageData[0]; rank?: number; liveScore: number; loading: boolean;
}) {
  const router = useRouter();
  const accentColor = TICKER_COLORS[stock.ticker] ?? '#6b7280';

  return (
    <button
      onClick={() => router.push(stock.href)}
      className="group w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
    >
      {/* Rank */}
      {rank !== undefined && (
        <span className="hidden sm:block text-[11px] font-bold text-white/15 tabular-nums w-5 shrink-0 text-right">
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
        <div className="font-semibold text-sm text-white/90 group-hover:text-white transition-colors truncate leading-tight">
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
      <div className="hidden md:block w-px h-6 bg-white/[0.07] shrink-0" />

      {/* Overall score */}
      <div className="shrink-0">
        {loading
          ? <Spinner size="sm" color="default" classNames={{ wrapper: "w-7 h-7" }} />
          : <ScorePill value={liveScore} />
        }
      </div>

      <ChevronRight
        size={14}
        className="shrink-0 text-white/15 group-hover:text-white/50 transition-colors"
      />
    </button>
  );
}

function CategoryPill({
  label, count, active, onClick,
}: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-[#c9a96a]/15 border border-[#c9a96a]/40 text-[#e4c98a]'
          : 'bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.07]'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold ${active ? 'text-[#c9a96a]/70' : 'text-white/20'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Mobile dropdown shell ──────────────────────────────────────────────────────
function MobileDropdown({
  label, value, icon, children,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span className="text-white/30 shrink-0">{icon}</span>
        <span className="flex flex-col min-w-0 leading-tight">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">{label}</span>
          <span className="text-xs font-semibold text-white/85 truncate">{value}</span>
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-xl border border-white/10 bg-[#0c0e13] shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors border-b border-white/[0.04] last:border-0 ${
        active ? "bg-[#c9a96a]/10 text-[#e4c98a]" : "text-white/65 hover:bg-white/[0.04]"
      }`}
    >
      {children}
    </button>
  );
}

export default function StocksPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const inputRef = useRef<HTMLInputElement>(null);

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
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const categoryCount = (key: string) =>
    key === "all" ? allCoverageData.length : allCoverageData.filter(s => s.category === key).length;

  const visibleCategories = CATEGORIES.filter(c => categoryCount(c.key) > 0);

  const avgScore = Math.round(
    allCoverageData.reduce((sum, s) => sum + getAverageScore(s.scores), 0) / allCoverageData.length
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-2">Coverage Universe</p>
        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text-animated mb-3">
          Stock Coverage
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-xl">
          {allCoverageData.length} stocks scored on moat durability, growth trajectory, and live valuation.
        </p>

        {/* Quick stats */}
        <div className="flex items-center gap-6 mt-5">
          {[
            { label: "Avg Score", value: avgScore },
            { label: "Total Stocks", value: allCoverageData.length },
            { label: "Categories", value: visibleCategories.length - 1 },
          ].map(stat => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tabular-nums">{stat.value}</span>
              <span className="text-[11px] text-white/25 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Controls */}
      <div className="relative z-30 animate-fade-up stagger-fill-both space-y-3" style={{ animationDelay: '0.08s' }}>
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or ticker…"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#c9a96a]/30 focus:bg-white/[0.06] transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              aria-label="Clear"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Desktop: category pills (sorting is handled by column headers) */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={12} className="text-white/20 shrink-0" />
          {visibleCategories.map(cat => (
            <CategoryPill
              key={cat.key}
              label={cat.label}
              count={cat.key !== "all" ? categoryCount(cat.key) : undefined}
              active={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
            />
          ))}
        </div>

        {/* Mobile: filter + sort dropdowns (pills/headers are hidden below md) */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <MobileDropdown
            label="Filter"
            value={CATEGORIES.find(c => c.key === activeCategory)?.label ?? "All"}
            icon={<SlidersHorizontal size={14} />}
          >
            {(close) =>
              visibleCategories.map(cat => (
                <DropdownItem
                  key={cat.key}
                  active={activeCategory === cat.key}
                  onClick={() => { setActiveCategory(cat.key); close(); }}
                >
                  <span>{cat.label}</span>
                  {cat.key !== "all" && (
                    <span className="text-[11px] font-bold text-white/25">{categoryCount(cat.key)}</span>
                  )}
                </DropdownItem>
              ))
            }
          </MobileDropdown>

          <MobileDropdown
            label="Sort by"
            value={`${SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? "Score"} · ${sortDir === "asc" ? "Asc" : "Desc"}`}
            icon={<ArrowUpDown size={14} />}
          >
            {(close) =>
              SORT_OPTIONS.map(opt => {
                const active = sortKey === opt.key;
                return (
                  <DropdownItem
                    key={opt.key}
                    active={active}
                    onClick={() => { const wasActive = active; handleSort(opt.key); if (!wasActive) close(); }}
                  >
                    <span>{opt.label}</span>
                    <SortIndicator active={active} dir={sortDir} />
                  </DropdownItem>
                );
              })
            }
          </MobileDropdown>
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
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-white/30 text-sm">
              {trimmed ? `No stocks match "${query.trim()}"` : "No stocks in this category"}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.025] divide-y divide-white/[0.04]">
            {sorted.map((stock, idx) => (
              <StockRow
                key={stock.ticker}
                stock={stock}
                rank={idx + 1}
                liveScore={liveScores[stock.ticker] ?? Math.round(getAverageScore(stock.scores))}
                loading={!pricesLoaded}
              />
            ))}
          </div>
        )}

        {sorted.length > 0 && (
          <p className="text-center text-[11px] text-white/15 font-medium mt-3">
            {sorted.length} stock{sorted.length !== 1 ? 's' : ''}
            {activeCategory !== "all" ? ` · ${CATEGORIES.find(c => c.key === activeCategory)?.label}` : ' · All Categories'}
            {trimmed ? ` matching "${trimmed}"` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
