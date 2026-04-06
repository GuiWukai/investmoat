'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, BarChart3, Search, X } from "lucide-react";
import { Chip, Spinner } from "@heroui/react";
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

const CATEGORIES = [
  { label: "Large Cap Tech",       key: "Big Tech"     },
  { label: "Financials & SaaS",    key: "Financials"   },
  { label: "Hard Assets & Crypto", key: "Hard Assets"  },
  { label: "Healthcare",           key: "Healthcare"   },
];

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider mb-0.5">{label}</span>
      <span className={`text-sm font-black text-${color}`}>{value}</span>
    </div>
  );
}

function DynamicOverall({
  slug, moat, growth, fallbackVal, bearTarget, baseTarget, bullTarget,
}: {
  slug: string; moat: number; growth: number; fallbackVal: number;
  bearTarget: string; baseTarget: string; bullTarget: string;
}) {
  const [avg, setAvg] = useState(() => Math.round(getAverageScore([moat, growth, fallbackVal])));
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
          setAvg(Math.round(getAverageScore([moat, growth, liveVal])));
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, moat, growth, bearTarget, baseTarget, bullTarget]);

  if (loading) return <Spinner size="sm" color="default" />;

  const color = avg >= 90 ? "success" : avg >= 80 ? "primary" : avg >= 70 ? "warning" : "danger";
  return (
    <Chip size="sm" color={color} variant="flat" classNames={{ content: "font-black text-sm tabular-nums" }}>
      {avg}
    </Chip>
  );
}

function scoreColor(s: number) {
  if (s >= 90) return "success";
  if (s >= 80) return "primary";
  if (s >= 70) return "warning";
  return "danger";
}

function StockRow({ stock, delay }: { stock: typeof allCoverageData[0]; delay?: number }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(stock.href)}
      className="w-full flex items-center gap-4 px-5 py-4 bg-[#05070a] hover:bg-white/[0.06] transition-colors group text-left animate-slide-in-left stagger-fill-both"
      style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}
    >
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: TICKER_COLORS[stock.ticker] ?? '#6b7280' }}
      />

      <div className="min-w-[150px]">
        <div className="font-bold text-sm text-white">{stock.name}</div>
        <div className="text-[10px] text-white/30 tracking-widest font-black uppercase">{stock.ticker}</div>
      </div>

      {/* Sub-scores + composite */}
      <div className="hidden sm:flex items-center gap-5 flex-1">
        <ScorePill label="Moat"   value={stock.scores[0]} color={scoreColor(stock.scores[0])} />
        <div className="w-px h-6 bg-white/10" />
        <ScorePill label="Growth" value={stock.scores[1]} color={scoreColor(stock.scores[1])} />
        <div className="w-px h-6 bg-white/10" />
        <ScorePill label="Value"  value={stock.scores[2]} color={scoreColor(stock.scores[2])} />
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col items-center min-w-[44px]">
          <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider mb-0.5">Score</span>
          <DynamicOverall
            slug={stock.slug}
            moat={stock.scores[0]}
            growth={stock.scores[1]}
            fallbackVal={stock.scores[2]}
            bearTarget={stock.bearTarget}
            baseTarget={stock.baseTarget}
            bullTarget={stock.bullTarget}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center shrink-0">
        <ChevronRight
          size={16}
          className="text-white/20 group-hover:text-white/60 transition-colors"
        />
      </div>
    </button>
  );
}

export default function StocksPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim().toLowerCase();
  const filteredStocks = trimmed
    ? allCoverageData
        .filter(s => s.name.toLowerCase().includes(trimmed) || s.ticker.toLowerCase().includes(trimmed))
        .sort((a, b) => getAverageScore(b.scores) - getAverageScore(a.scores))
    : null;

  return (
    <div className="animate-fade-in space-y-12">
      <header className="mb-8 md:mb-12 animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <h1 className="text-3xl md:text-5xl font-extrabold gradient-text-animated mb-4">
          Stock Coverage
        </h1>
        <p className="text-white/60 text-base md:text-xl max-w-2xl animate-fade-up stagger-fill-both stagger-2">
          {allCoverageData.length} stocks across four categories, scored on moat durability, growth trajectory, and live valuation.
        </p>

        {/* Search input */}
        <div className="relative mt-6 max-w-md animate-fade-up stagger-fill-both" style={{ animationDelay: '0.1s' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or ticker…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-base text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </header>

      {/* Search results */}
      {filteredStocks !== null ? (
        <section className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-4 mb-5">
            <Search size={18} className="text-white/40 shrink-0" />
            <h2 className="text-lg font-bold text-white/80">Results</h2>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/20 font-medium">{filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredStocks.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-lg px-6 py-12 text-center">
              <p className="text-white/40 text-sm">No stocks match &ldquo;{query.trim()}&rdquo;</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.08] backdrop-blur-lg grid grid-cols-1 lg:grid-cols-2 gap-px">
              {filteredStocks.map((stock, idx) => (
                <StockRow key={stock.ticker} stock={stock} delay={0.05 + idx * 0.04} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Normal category sections */
        CATEGORIES.map((cat, catIdx) => {
          const stocks = allCoverageData
            .filter(s => s.category === cat.key)
            .sort((a, b) => getAverageScore(b.scores) - getAverageScore(a.scores));
          return (
            <section key={cat.key} className="animate-fade-up stagger-fill-both" style={{ animationDelay: `${0.15 + catIdx * 0.1}s` }}>
              <div className="flex items-center gap-4 mb-5">
                <BarChart3 size={18} className="text-white/40 shrink-0" />
                <h2 className="text-lg font-bold text-white/80">{cat.label}</h2>
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/20 font-medium">{stocks.length} stocks</span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.08] backdrop-blur-lg grid grid-cols-1 lg:grid-cols-2 gap-px">
                {stocks.map((stock, idx) => (
                  <StockRow key={stock.ticker} stock={stock} delay={0.2 + catIdx * 0.1 + idx * 0.05} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
