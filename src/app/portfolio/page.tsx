'use client';

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PieChart, ShieldCheck, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { Spinner } from "@heroui/react";
import { allCoverageData, getAverageScore } from "../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

function DynamicScore({
  slug,
  moat,
  growth,
  fallbackVal,
  bearTarget,
  baseTarget,
  bullTarget,
  children,
}: {
  slug: string;
  moat: number;
  growth: number;
  fallbackVal: number;
  bearTarget: string;
  baseTarget: string;
  bullTarget: string;
  children: (avg: number, loading: boolean) => ReactNode;
}) {
  const [avg, setAvg] = useState(() =>
    Math.round(getAverageScore([moat, growth, fallbackVal]))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bear = parseScenarioPrice(bearTarget);
    const base = parseScenarioPrice(baseTarget);
    const bull = parseScenarioPrice(bullTarget);
    const fallbackAvg = Math.round(getAverageScore([moat, growth, fallbackVal]));
    if (!bear || !base || !bull) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled) return;
        if (d?.price != null) {
          const liveVal = computeValuationScore(d.price, bear, base, bull);
          setAvg(Math.round(getAverageScore([moat, growth, liveVal])));
        } else {
          setAvg(fallbackAvg);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setAvg(fallbackAvg); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [slug, moat, growth, fallbackVal, bearTarget, baseTarget, bullTarget]);

  return <>{children(avg, loading)}</>;
}

// ─── Portfolio threshold ──────────────────────────────────────────────────────
const PORTFOLIO_THRESHOLD = 75;
const MAX_PORTFOLIO = 25;

// ─── Per-ticker metadata (display color, category, exclusion reason) ──────────
const stockMeta: Record<string, { color: string; category: string; exclusionReason?: string }> = {
  AMZN: { color: "#f59e0b", category: "Eco-System" },
  GOOGL: { color: "#4285f4", category: "Big Tech" },
  META:  { color: "#0082fb", category: "Big Tech" },
  MSFT:  { color: "#00a4ef", category: "Core SaaS" },
  NVDA:  { color: "#76b900", category: "AI Infrastructure" },
  AMD:   { color: "#ed1c24", category: "Big Tech",        exclusionReason: "Lowest moat score (52) in the Big Tech category. AMD's competitive edge is execution excellence, not structural lock-in. NVIDIA's CUDA software ecosystem creates switching costs that AMD simply cannot replicate. Strong cyclical growth (92) but no wide moat — a momentum play, not a compounder." },
  ASML:  { color: "#0071c5", category: "Lithography" },
  NFLX:  { color: "#e50914", category: "Big Tech",        exclusionReason: "Content creation is a non-durable moat requiring perpetual capital reinvestment. Worst valuation score (52) reflects an expensive multiple for a business in an intensely competitive streaming market with no decisive technological edge. AI moat score of 63 is weak for the price paid." },
  TSLA:  { color: "#e82127", category: "Clean Tech" },
  V:     { color: "#1a1f71", category: "Payments" },
  MA:    { color: "#eb001b", category: "Payments" },
  PLTR:  { color: "#7b5ea7", category: "AI Analytics" },
  CRWD:  { color: "#e8281b", category: "Cybersecurity" },
  CRM:   { color: "#00a1e0", category: "Enterprise SaaS" },
  ADBE:  { color: "#f44336", category: "Big Tech",        exclusionReason: "Second-lowest moat score (58) signals material AI disruption risk to Creative Cloud. Generative tools — Midjourney, Sora, Canva AI, and native OS features — directly attack Adobe's pricing power and switching costs. The structural moat that once defined this business is visibly weakening." },
  SPGI:  { color: "#cf102d", category: "Financials" },
  INTU:  { color: "#2ca01c", category: "FinTech" },
  XAU:   { color: "#ffd700", category: "Hard Assets",     exclusionReason: "Lowest overall score (57) driven by weak growth (50) and poor valuation basis (55). Gold produces no earnings or cash flows, making intrinsic value impossible to anchor. Valid as a macro fear hedge in a separate allocation, but has no place in a quality-focused compounder portfolio." },
  BTC:   { color: "#f7931a", category: "Digital Assets" },
  KNT:   { color: "#8b7355", category: "Hard Assets",     exclusionReason: "Weakest moat score in the entire coverage universe (42). Mining is a commodity business with no pricing power, no network effects, and no switching costs. High growth (85) reflects production expansion upside — not the scalable, capital-light compounding this portfolio targets." },
  FCX:   { color: "#b8732d", category: "Hard Assets",     exclusionReason: "Commodity copper producer with no pricing power — FCX sells at LME spot price regardless of asset quality. Indonesia sovereign risk at Grasberg, competition from major miners (Codelco, BHP, Glencore), and earnings volatility disqualify it from a portfolio targeting structural moats and durable compounding." },
  TSM:   { color: "#0071c5", category: "Foundry" },
  MU:    { color: "#0099cc", category: "Memory" },
  ISRG:  { color: "#009688", category: "Healthcare" },
  AVGO:  { color: "#cc0000", category: "Semiconductors" },
  COST:  { color: "#005DAA", category: "Consumer Retail", exclusionReason: "Composite score falls below the portfolio threshold. Costco is a world-class business with an exceptional membership flywheel and 92.9% renewal rates, but a valuation score of 60 (48x+ forward P/E) reflects near-perfection already priced in, and a growth score of 70 is constrained by the pace of physical warehouse expansion. It ranks behind 20 higher-scoring compounders on a risk-adjusted basis." },
  ORCL:  { color: "#C74634", category: "Enterprise Software" },
  TDG:   { color: "#1a5276", category: "Industrials" },
  MSCI:  { color: "#c0392b", category: "Financial Data" },
  UNH:   { color: "#003087", category: "Healthcare" },
  MCO:   { color: "#23539A", category: "Financials" },
  MELI:  { color: "#ffe600", category: "Eco-System" },
  RACE:  { color: "#D40000", category: "Luxury" },
  CEG:   { color: "#0057a8", category: "Utilities" },
  SHOP:  { color: "#96bf48", category: "E-Commerce" },
  LLY:   { color: "#c8102e", category: "Healthcare" },
  ETH:   { color: "#627eea", category: "Digital Assets" },
  SOL:   { color: "#9945ff", category: "Digital Assets" },
  SOFI:  { color: "#6366f1", category: "FinTech" },
  FANUY: { color: "#f59e0b", category: "Robotics" },
  // Previously missing colors
  AAPL:  { color: "#a8a8a8", category: "Big Tech" },
  ANET:  { color: "#ff6900", category: "AI Infrastructure" },
  APP:   { color: "#e8341c", category: "AdTech" },
  ARM:   { color: "#0091bd", category: "Semiconductors" },
  AXON:  { color: "#fbbf24", category: "Industrials" },
  CCJ:   { color: "#8b5e3c", category: "Hard Assets" },
  COIN:  { color: "#0052ff", category: "Digital Assets" },
  DIS:   { color: "#1f3572", category: "Media" },
  FICO:  { color: "#c0392b", category: "Financial Data" },
  FIG:   { color: "#f24e1e", category: "Enterprise SaaS" },
  GEV:   { color: "#0066b1", category: "Utilities" },
  ICE:   { color: "#1a3a6b", category: "Financials" },
  LMT:   { color: "#1d4b8f", category: "Industrials" },
  MSTR:  { color: "#ff8c00", category: "Digital Assets" },
  NEE:   { color: "#00aeef", category: "Utilities" },
  NET:   { color: "#f38020", category: "Cybersecurity" },
  NOW:   { color: "#62d84e", category: "Enterprise SaaS" },
  PANW:  { color: "#00c1d5", category: "Cybersecurity" },
  RDDT:  { color: "#ff4500", category: "Big Tech" },
  SE:    { color: "#ee2537", category: "Eco-System" },
  TTD:   { color: "#3363ff", category: "AdTech" },
};

// ─── Category colour helper ───────────────────────────────────────────────────
const CATEGORY_STYLES: Record<string, string> = {
  "Core SaaS":           "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Enterprise SaaS":     "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Big Tech":            "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Enterprise Software": "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Payments":            "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "Financials":          "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "FinTech":             "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "Financial Data":      "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "AI Infrastructure":   "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Lithography":         "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "AI Analytics":        "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Cybersecurity":       "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Foundry":             "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Memory":              "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Semiconductors":      "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Robotics":            "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Digital Assets":      "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Eco-System":          "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Clean Tech":          "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "E-Commerce":          "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Hard Assets":         "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "Luxury":              "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "Utilities":           "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "Industrials":         "bg-orange-500/10 text-orange-400 border-orange-500/15",
  "Healthcare":          "bg-teal-500/10 text-teal-400 border-teal-500/15",
  "AdTech":              "bg-orange-500/10 text-orange-400 border-orange-500/15",
  "Media":               "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Consumer Retail":     "bg-teal-500/10 text-teal-400 border-teal-500/15",
};

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_STYLES[category] ?? "bg-white/5 text-white/40 border-white/10";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {category}
    </span>
  );
}

// ─── Sector sets for concentration display ────────────────────────────────────
const TECH_CATEGORIES = new Set([
  "Core SaaS", "Enterprise SaaS", "Big Tech",
  "AI Infrastructure", "Lithography", "AI Analytics",
  "Clean Tech", "Eco-System", "Cybersecurity", "Digital Assets", "Foundry", "Memory", "Semiconductors", "E-Commerce", "Enterprise Software",
]);
const FIN_CATEGORIES = new Set(["Payments", "Financials", "FinTech", "Financial Data"]);

export default function PortfolioPage() {
  const router = useRouter();

  const [allPrices, setAllPrices] = useState<Record<string, number | null>>({});
  const [allChangePercents, setAllChangePercents] = useState<Record<string, number | null>>({});
  const [allPricesLoaded, setAllPricesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      allCoverageData.map(s =>
        fetch(`/api/stock-price/${s.slug}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => [s.ticker, d?.price ?? null, d?.changePercent ?? null] as const)
          .catch(() => [s.ticker, null, null] as const)
      )
    ).then(entries => {
      if (cancelled) return;
      setAllPrices(Object.fromEntries(entries.map(([t, p]) => [t, p])));
      setAllChangePercents(Object.fromEntries(entries.map(([t, , c]) => [t, c])));
      setAllPricesLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  const portfolio = useMemo(() => {
    return [...allCoverageData]
      .map(s => {
        const price = allPrices[s.ticker];
        const bear = parseScenarioPrice(s.bearTarget);
        const base = parseScenarioPrice(s.baseTarget);
        const bull = parseScenarioPrice(s.bullTarget);
        const composite = (price != null && bear && base && bull)
          ? getAverageScore([s.scores[0], s.scores[1], computeValuationScore(price, bear, base, bull)])
          : getAverageScore(s.scores);
        return { s, composite };
      })
      .sort((a, b) => b.composite - a.composite)
      .filter(({ composite }) => composite >= PORTFOLIO_THRESHOLD)
      .slice(0, MAX_PORTFOLIO)
      .map(({ s, composite }) => ({
        ticker:   s.ticker,
        name:     s.name,
        slug:     s.slug,
        href:     s.href,
        color:    stockMeta[s.ticker]?.color    ?? "#888888",
        category: stockMeta[s.ticker]?.category ?? "Other",
        stock:    s,
        composite,
      }));
  }, [allPrices]);

  const liveScores: Record<string, number> = {};
  portfolio.forEach(p => { liveScores[p.ticker] = Math.round(p.composite); });

  const [hoveredPie, setHoveredPie] = useState<string | null>(null);
  const [scoreColumn, setScoreColumn] = useState<'score' | 'change'>('score');
  const scoresLoading = !allPricesLoaded;

  const SCORE_BASELINE = 70;
  const MAX_WEIGHT_PCT = 10;

  const adjusted = Object.fromEntries(
    portfolio.map((p) => [p.ticker, Math.max((liveScores[p.ticker] ?? 0) - SCORE_BASELINE, 1)])
  );

  const rawWeights: Record<string, number> = {};
  const capped = new Set<string>();
  let uncappedTickers = portfolio.map((p) => p.ticker);
  let budget = 100;

  while (uncappedTickers.length > 0) {
    const poolScore = uncappedTickers.reduce((s, t) => s + adjusted[t], 0);
    let anyCapped = false;
    for (const t of uncappedTickers) {
      const w = poolScore > 0 ? (adjusted[t] / poolScore) * budget : 0;
      if (w > MAX_WEIGHT_PCT) {
        rawWeights[t] = MAX_WEIGHT_PCT;
        capped.add(t);
        budget -= MAX_WEIGHT_PCT;
        anyCapped = true;
      }
    }
    if (!anyCapped) {
      const poolTotal = uncappedTickers.reduce((s, t) => s + adjusted[t], 0);
      for (const t of uncappedTickers) {
        rawWeights[t] = poolTotal > 0 ? (adjusted[t] / poolTotal) * budget : 0;
      }
      break;
    }
    uncappedTickers = uncappedTickers.filter((t) => !capped.has(t));
  }

  const floors = Object.fromEntries(portfolio.map((p) => [p.ticker, Math.floor(rawWeights[p.ticker])]));
  const remainder = 100 - Object.values(floors).reduce((a, b) => a + b, 0);
  const sorted = [...portfolio].sort((a, b) => (rawWeights[b.ticker] % 1) - (rawWeights[a.ticker] % 1));
  sorted.slice(0, remainder).forEach((p) => { floors[p.ticker]++; });
  const dynamicWeights = floors;


  const weightedDailyChange: number | null = (() => {
    if (!allPricesLoaded) return null;
    let acc = 0;
    let totalW = 0;
    portfolio.forEach(p => {
      const cp = allChangePercents[p.ticker];
      const w = dynamicWeights[p.ticker] ?? 0;
      if (cp != null && w > 0) {
        acc += cp * w;
        totalW += w;
      }
    });
    return totalW === 0 ? null : acc / totalW;
  })();

  const weightedScenarioReturns: { bear: number | null; base: number | null; bull: number | null } = (() => {
    if (!allPricesLoaded) return { bear: null, base: null, bull: null };
    const acc = { bear: 0, base: 0, bull: 0, w: 0 };
    portfolio.forEach(p => {
      const price = allPrices[p.ticker];
      const bear = parseScenarioPrice(p.stock.bearTarget);
      const base = parseScenarioPrice(p.stock.baseTarget);
      const bull = parseScenarioPrice(p.stock.bullTarget);
      const w = dynamicWeights[p.ticker] ?? 0;
      if (price != null && price > 0 && bear && base && bull && w > 0) {
        acc.bear += ((bear - price) / price) * 100 * w;
        acc.base += ((base - price) / price) * 100 * w;
        acc.bull += ((bull - price) / price) * 100 * w;
        acc.w    += w;
      }
    });
    if (acc.w === 0) return { bear: null, base: null, bull: null };
    return { bear: acc.bear / acc.w, base: acc.base / acc.w, bull: acc.bull / acc.w };
  })();

  const techWeight = portfolio.reduce(
    (s, p) => TECH_CATEGORIES.has(p.category) ? s + (dynamicWeights[p.ticker] ?? 0) : s, 0
  );
  const finWeight = portfolio.reduce(
    (s, p) => FIN_CATEGORIES.has(p.category) ? s + (dynamicWeights[p.ticker] ?? 0) : s, 0
  );

  const portfolioWithScores = [...portfolio].sort(
    (a, b) => (liveScores[b.ticker] ?? 0) - (liveScores[a.ticker] ?? 0)
  );

  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-emerald-400";
    if (s >= 80) return "text-blue-400";
    if (s >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="animate-fade-in dot-pattern">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="pt-6 md:pt-12 pb-12 animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">Portfolio</p>
        <h1 className="text-4xl md:text-6xl font-extrabold gradient-text-animated leading-tight mb-4">
          Portfolio Distribution
        </h1>
        <p className="text-white/45 text-base md:text-lg max-w-2xl leading-relaxed">
          {portfolio.length} high-conviction positions selected for moat durability, growth scaling,
          and valuation discipline. Higher-scoring positions receive proportionally larger allocations
          (max 10% per position).
        </p>
      </header>

      {/* ── Allocation chart + Strategy summary ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 animate-fade-up stagger-fill-both" style={{ animationDelay: '0.15s' }}>

        {/* Visual Allocation */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <PieChart size={16} className="text-blue-400" />
            <h3 className="font-bold text-white/85">Visual Allocation</h3>
          </div>

          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 200 200" className="w-56 h-56">
              {(() => {
                const cx = 100, cy = 100, outerR = 88, innerR = 56;
                const pieSorted = [...portfolio].sort((a, b) => (dynamicWeights[b.ticker] ?? 0) - (dynamicWeights[a.ticker] ?? 0));
                const GAP = 0.016;
                let cumAngle = -Math.PI / 2;
                return pieSorted.map((stock) => {
                  const w = dynamicWeights[stock.ticker] ?? 0;
                  const sliceAngle = (w / 100) * 2 * Math.PI;
                  const sa = cumAngle + GAP / 2;
                  const ea = cumAngle + sliceAngle - GAP / 2;
                  cumAngle += sliceAngle;
                  const largeArc = (ea - sa) > Math.PI ? 1 : 0;
                  const c = Math.cos, s = Math.sin;
                  const d = [
                    `M ${cx + outerR * c(sa)} ${cy + outerR * s(sa)}`,
                    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${cx + outerR * c(ea)} ${cy + outerR * s(ea)}`,
                    `L ${cx + innerR * c(ea)} ${cy + innerR * s(ea)}`,
                    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * c(sa)} ${cy + innerR * s(sa)}`,
                    'Z',
                  ].join(' ');
                  const isHov = hoveredPie === stock.ticker;
                  return (
                    <path
                      key={stock.ticker}
                      d={d}
                      fill={stock.color}
                      opacity={hoveredPie && !isHov ? 0.2 : isHov ? 1 : 0.85}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        transformOrigin: '100px 100px',
                        animation: `fade-in-scale 0.6s ease-out ${0.1 + pieSorted.indexOf(stock) * 0.04}s both`,
                        transform: isHov ? 'scale(1.05)' : 'scale(1)',
                      }}
                      onMouseEnter={() => setHoveredPie(stock.ticker)}
                      onMouseLeave={() => setHoveredPie(null)}
                    />
                  );
                });
              })()}
              {hoveredPie ? (() => {
                const s = portfolio.find(p => p.ticker === hoveredPie)!;
                return (
                  <>
                    <text x="100" y="95" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui,sans-serif">{s.ticker}</text>
                    <text x="100" y="113" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="system-ui,sans-serif">{dynamicWeights[s.ticker] ?? 0}%</text>
                  </>
                );
              })() : (
                <>
                  <text x="100" y="95" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="7.5" fontFamily="system-ui,sans-serif" letterSpacing="2.5">PORTFOLIO</text>
                  <text x="100" y="114" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui,sans-serif">{portfolio.length} Holdings</text>
                </>
              )}
            </svg>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
            {[...portfolio].sort((a, b) => (dynamicWeights[b.ticker] ?? 0) - (dynamicWeights[a.ticker] ?? 0)).map((stock) => (
              <div key={stock.ticker} className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: stock.color }} />
                <span className="text-xs font-bold text-white/70 truncate">{stock.ticker}</span>
                {scoresLoading
                  ? <Spinner size="sm" color="default" classNames={{ wrapper: "w-3 h-3" }} />
                  : <span className="text-xs text-white/30 ml-auto">{dynamicWeights[stock.ticker] ?? 0}%</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Summary */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="font-bold text-white/85">Strategy Summary</h3>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="section-label mb-1.5">Positions</p>
              <p className="text-2xl font-black text-white">{portfolio.length}</p>
              <p className="text-white/28 text-[10px] mt-0.5">High-conviction holdings</p>
            </div>
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="section-label mb-1.5">Threshold</p>
              <p className="text-2xl font-black text-white">≥ {PORTFOLIO_THRESHOLD}</p>
              <p className="text-white/28 text-[10px] mt-0.5">Score required / 100</p>
            </div>
          </div>

          {/* Today's change */}
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <p className="section-label mb-2">Today&apos;s Portfolio Change</p>
            {!allPricesLoaded ? (
              <Spinner size="sm" color="default" />
            ) : weightedDailyChange == null ? (
              <p className="text-3xl font-black text-white/20">—</p>
            ) : (
              <div className={`flex items-center gap-2 ${weightedDailyChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {weightedDailyChange >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                <span className="text-3xl font-black tabular-nums">
                  {weightedDailyChange >= 0 ? "+" : ""}{weightedDailyChange.toFixed(2)}%
                </span>
              </div>
            )}
            <p className="text-white/25 text-[10px] mt-1.5">Position-weighted · {portfolio.length} holdings</p>
          </div>

          {/* Est. 1-year returns */}
          <div>
            <p className="section-label mb-3">Est. 1-Year Return</p>
            {!allPricesLoaded ? (
              <Spinner size="sm" color="default" />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {([
                  { label: "Bear", value: weightedScenarioReturns.bear, border: "border-rose-500/15" },
                  { label: "Base", value: weightedScenarioReturns.base, border: "border-blue-500/15" },
                  { label: "Bull", value: weightedScenarioReturns.bull, border: "border-emerald-500/15" },
                ] as const).map(({ label, value, border }) => (
                  <div key={label} className={`rounded-xl border ${border} bg-white/[0.02] py-3 px-2 text-center`}>
                    <p className="section-label mb-1.5">{label}</p>
                    {value != null ? (
                      <p className={`text-lg font-black ${value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {value >= 0 ? "+" : ""}{value.toFixed(1)}%
                      </p>
                    ) : (
                      <p className="text-lg font-black text-white/20">—</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-white/22 text-[10px] mt-2">Weighted avg · allocation-adjusted</p>
          </div>

          {/* Concentration bars */}
          <div>
            <p className="section-label mb-3">Sector Concentration</p>
            <div className="space-y-3">
              {[
                { label: "Tech & SaaS", value: techWeight, color: "bg-blue-500" },
                { label: "Financials & Payments", value: finWeight, color: "bg-emerald-500" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-white/45 text-xs font-medium">{label}</span>
                    <span className="text-white/45 text-xs font-mono">{Math.round(value)}%</span>
                  </div>
                  <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Allocation Breakdown ──────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both pb-12" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-4 mb-5">
          <div>
            <p className="section-label mb-1">Holdings</p>
            <h2 className="text-xl font-bold text-white/85">Allocation Breakdown</h2>
          </div>
          <div className="h-px flex-1 bg-white/[0.05]" />
          {/* Toggle only visible on mobile — desktop shows both columns */}
          <div className="flex lg:hidden items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1 shrink-0">
            {([['score', 'Score'], ['change', '1D %']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setScoreColumn(val)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                  scoreColumn === val ? 'bg-white/[0.12] text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">
          {/* Table header */}
          <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 border-b border-white/[0.05] bg-white/[0.02]">
            <div className="w-0.5 shrink-0" />
            <div className="section-label min-w-[110px] md:min-w-[140px]">Holding</div>
            <div className="section-label hidden sm:block shrink-0 w-24">Category</div>
            <div className="flex-1" />
            {/* 1-Yr Return header — lg only */}
            <div className="hidden lg:block section-label text-right shrink-0 w-36">1-Yr Return</div>
            {/* Score header */}
            <div className={`section-label text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>Score</div>
            {/* 1D header */}
            <div className={`section-label text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>1D %</div>
            <div className="section-label text-right shrink-0 w-9">Wt.</div>
            <div className="w-[15px] shrink-0" />
          </div>

          {/* Data rows */}
          <div className="divide-y divide-white/[0.04]">
            {portfolioWithScores.map((stock, idx) => (
              <button
                key={stock.ticker}
                onClick={() => router.push(stock.href)}
                className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-white/[0.04] transition-colors group text-left animate-slide-in-left stagger-fill-both"
                style={{ animationDelay: `${0.3 + idx * 0.035}s` }}
              >
                {/* Color accent */}
                <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: stock.color }} />

                {/* Name + ticker */}
                <div className="min-w-[110px] md:min-w-[140px]">
                  <div className="font-bold text-sm text-white/90 leading-tight">{stock.name}</div>
                  <div className="text-[10px] text-white/28 tracking-[0.12em] font-black uppercase mt-0.5">{stock.ticker}</div>
                </div>

                {/* Category badge */}
                <div className="hidden sm:block shrink-0 w-24">
                  <CategoryBadge category={stock.category} />
                </div>

                <div className="flex-1" />

                {/* Per-stock bear/base/bull */}
                <div className="hidden lg:flex items-center justify-end shrink-0 w-36">
                  {!allPricesLoaded
                    ? <Spinner size="sm" color="default" />
                    : (() => {
                        const price = allPrices[stock.ticker];
                        const bear  = parseScenarioPrice(stock.stock.bearTarget);
                        const base  = parseScenarioPrice(stock.stock.baseTarget);
                        const bull  = parseScenarioPrice(stock.stock.bullTarget);
                        if (price == null || !bear || !base || !bull || price <= 0)
                          return <span className="text-xs text-white/25">—</span>;
                        const fmt = (t: number) => {
                          const r = ((t - price) / price) * 100;
                          return { r, str: `${r >= 0 ? "+" : ""}${r.toFixed(0)}%`, pos: r >= 0 };
                        };
                        const b = fmt(bear), m = fmt(base), u = fmt(bull);
                        return (
                          <div className="flex gap-2.5 text-center">
                            {[
                              { label: "Bear", ...b },
                              { label: "Base", ...m },
                              { label: "Bull", ...u },
                            ].map(({ label, str, pos }) => (
                              <div key={label}>
                                <div className="text-[9px] text-white/20 uppercase">{label}</div>
                                <div className={`text-xs font-black ${pos ? "text-emerald-400" : "text-rose-400"}`}>{str}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                  }
                </div>

                {/* Score — always on desktop, toggle-gated on mobile */}
                <DynamicScore
                  slug={stock.stock.slug}
                  moat={stock.stock.scores[0]}
                  growth={stock.stock.scores[1]}
                  fallbackVal={stock.stock.scores[2]}
                  bearTarget={stock.stock.bearTarget}
                  baseTarget={stock.stock.baseTarget}
                  bullTarget={stock.stock.bullTarget}
                >
                  {(avg, loading) => (
                    <div className={`text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>
                      {loading
                        ? <Spinner size="sm" color="default" />
                        : <span className={`text-sm font-black ${getScoreColor(avg)}`}>{avg}</span>
                      }
                    </div>
                  )}
                </DynamicScore>

                {/* 1D% — always on desktop, toggle-gated on mobile */}
                <div className={`text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>
                  {!allPricesLoaded
                    ? <Spinner size="sm" color="default" />
                    : (() => {
                        const cp = allChangePercents[stock.ticker];
                        if (cp == null) return <span className="text-xs text-white/25">—</span>;
                        const pos = cp >= 0;
                        return (
                          <div className={`flex items-center justify-end gap-0.5 ${pos ? "text-emerald-400" : "text-rose-400"}`}>
                            {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            <span className="text-xs font-black tabular-nums">{pos ? "+" : ""}{cp.toFixed(2)}%</span>
                          </div>
                        );
                      })()
                  }
                </div>

                {/* Weight */}
                <div className="tabular-nums w-9 text-right shrink-0">
                  {scoresLoading
                    ? <Spinner size="sm" color="default" />
                    : <span className="text-base font-black text-white">{dynamicWeights[stock.ticker] ?? 0}%</span>
                  }
                </div>

                <ChevronRight
                  size={15}
                  className="text-white/15 group-hover:text-white/50 transition-colors shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
