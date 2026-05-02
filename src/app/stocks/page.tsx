'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Spinner } from "@heroui/react";
import { allCoverageData, getAverageScore } from "../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

const TICKER_COLORS: Record<string, string> = {
  MSFT: "#00a4ef", AMZN: "#f59e0b", ASML: "#0071c5", V:    "#1a1f71",
  MA:   "#eb001b", NVDA: "#76b900", SPGI: "#cf102d", CRM:  "#00a1e0",
  INTU: "#2ca01c", META: "#1877f2", TSLA: "#cc0000", PLTR: "#7c3aed",
  ADBE: "#ff0000", NFLX: "#e50914", AMD:  "#ed1c24", XAU:  "#f59e0b",
  BTC:  "#f7931a", KNT:  "#6b7280", CRWD: "#e8281b", FCX:  "#b45309",
  GOOGL:"#4285f4", AAPL: "#555555", AVGO: "#cc0000", TSM:  "#0071c5",
  MU:   "#0099cc", ISRG: "#009688",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Parse a "Month YYYY" or "Month DD, YYYY" string into a monotonic integer
 * (year*384 + month*32 + day) for sorting. Day defaults to 0 when absent so
 * "May 2026" still sorts after "April 29, 2026" — month-precision dates land
 * at the start of their month.
 */
function parseAnalysisDate(s: string | undefined): number {
  if (!s) return 0;
  const tokens = s.trim().split(/\s+/);
  if (tokens.length < 2) return 0;
  const m = MONTHS.indexOf(tokens[0]);
  const y = Number(tokens[tokens.length - 1]);
  if (m < 0 || !Number.isFinite(y)) return 0;
  // Optional middle token = day (e.g. "April 29, 2026" → tokens[1] = "29,")
  let day = 0;
  if (tokens.length >= 3) {
    const d = Number(tokens[1].replace(/,/g, ""));
    if (Number.isFinite(d)) day = d;
  }
  return y * 384 + m * 32 + day;
}

type SortKey = "score-desc" | "score-asc" | "date-desc" | "date-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "score-desc", label: "Score (high → low)" },
  { value: "score-asc",  label: "Score (low → high)" },
  { value: "date-desc",  label: "Analysis Date (newest first)" },
  { value: "date-asc",   label: "Analysis Date (oldest first)" },
];

const CATEGORIES = [
  { label: "All",                  key: "all"        },
  { label: "Large Cap Tech",       key: "Big Tech"   },
  { label: "Financials & SaaS",    key: "Financials" },
  { label: "Hard Assets",          key: "Hard Assets"},
  { label: "Healthcare",           key: "Healthcare" },
  { label: "Industrials",          key: "Industrials"},
  { label: "Other",                key: "Other"      },
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

function DynamicScore({
  slug, moat, growth, fallbackVal, bearTarget, baseTarget, bullTarget,
}: {
  slug: string; moat: number; growth: number; fallbackVal: number;
  bearTarget: string; baseTarget: string; bullTarget: string;
}) {
  const [score, setScore] = useState(() => Math.round(getAverageScore([moat, growth, fallbackVal])));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bear = parseScenarioPrice(bearTarget);
    const base = parseScenarioPrice(baseTarget);
    const bull = parseScenarioPrice(bullTarget);
    if (!bear || !base || !bull) { setLoading(false); return; }

    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled) return;
        if (d?.price != null) {
          const liveVal = computeValuationScore(d.price, bear, base, bull);
          setScore(Math.round(getAverageScore([moat, growth, liveVal])));
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, moat, growth, bearTarget, baseTarget, bullTarget]);

  if (loading) return <Spinner size="sm" color="default" classNames={{ wrapper: "w-7 h-7" }} />;
  return <ScorePill value={score} />;
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
  );
}

function StockRow({ stock, rank, delay }: { stock: typeof allCoverageData[0]; rank?: number; delay?: number }) {
  const router = useRouter();
  const accentColor = TICKER_COLORS[stock.ticker] ?? '#6b7280';

  return (
    <button
      onClick={() => router.push(stock.href)}
      className="group w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
      style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}
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
        <DynamicScore
          slug={stock.slug}
          moat={stock.scores[0]}
          growth={stock.scores[1]}
          fallbackVal={stock.scores[2]}
          bearTarget={stock.bearTarget}
          baseTarget={stock.baseTarget}
          bullTarget={stock.bullTarget}
        />
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
          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
          : 'bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.07]'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold ${active ? 'text-blue-400/70' : 'text-white/20'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function StocksPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("score-desc");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim().toLowerCase();

  const allSorted = [...allCoverageData].sort((a, b) => {
    const [mode, dir] = sortKey.split("-") as ["score" | "date", "desc" | "asc"];
    const cmp = mode === "score"
      ? getAverageScore(a.scores) - getAverageScore(b.scores)
      : parseAnalysisDate(a.lastAnalyzed) - parseAnalysisDate(b.lastAnalyzed);
    return dir === "desc" ? -cmp : cmp;
  });

  const filtered = allSorted.filter(s => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const matchesQuery = !trimmed ||
      s.name.toLowerCase().includes(trimmed) ||
      s.ticker.toLowerCase().includes(trimmed);
    return matchesCategory && matchesQuery;
  });

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
      <div className="animate-fade-up stagger-fill-both space-y-3" style={{ animationDelay: '0.08s' }}>
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or ticker…"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
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

        <div className="flex items-center gap-2 flex-wrap">
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

        <div className="flex items-center gap-2">
          <ArrowUpDown size={12} className="text-white/20 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 shrink-0">Sort</span>
          <div className="relative">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              aria-label="Sort stocks by"
              className="appearance-none bg-white/[0.04] border border-white/10 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-white/70 hover:text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
            />
          </div>
        </div>
      </div>

      {/* Stock list */}
      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.16s' }}>
        {/* Column headers — desktop */}
        <div className="hidden md:flex items-center gap-4 px-5 pb-2">
          <span className="w-5 shrink-0" />
          <span className="w-[44px] shrink-0" />
          <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-white/20">Company</span>
          <div className="flex items-center gap-5 shrink-0">
            {["Moat", "Growth", "Val"].map(col => (
              <span key={col} className="text-[10px] font-bold uppercase tracking-widest text-white/20 min-w-[40px] text-center">{col}</span>
            ))}
          </div>
          <div className="w-px shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 w-9 text-center shrink-0">Score</span>
          <span className="w-3.5 shrink-0" />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-white/30 text-sm">
              {trimmed ? `No stocks match "${query.trim()}"` : "No stocks in this category"}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.025] divide-y divide-white/[0.04]">
            {filtered.map((stock, idx) => (
              <StockRow
                key={stock.ticker}
                stock={stock}
                rank={idx + 1}
                delay={0.02 * Math.min(idx, 10)}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center text-[11px] text-white/15 font-medium mt-3">
            {filtered.length} stock{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== "all" ? ` · ${CATEGORIES.find(c => c.key === activeCategory)?.label}` : ' · All Categories'}
            {trimmed ? ` matching "${trimmed}"` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
