'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PieChart, ShieldCheck, ChevronRight, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Card, Spinner } from "@heroui/react";
import {
  allCoverageData,
  getAverageScore,
  MAX_PORTFOLIO,
  MIN_AVG_SCORE,
  MIN_MOAT_SCORE,
} from "../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

// ─── Portfolio thresholds ─────────────────────────────────────────────────────
// Composite ≥ 80 ("near Strong Buy") plus moat ≥ 70 so growth/valuation cannot
// carry a weak-moat name into a moat-first book. The 25-cap still binds when
// more names clear both floors; if coverage thins or valuations get rich, the
// floors become binding and the portfolio shrinks rather than dilutes.
const PORTFOLIO_THRESHOLD = MIN_AVG_SCORE;
const NEAR_TOP_COUNT = 25;

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
  HG:    { color: "#b87333", category: "Hard Assets" },
  XAG:   { color: "#c0c0c0", category: "Hard Assets" },
  BTC:   { color: "#f7931a", category: "Digital Assets" },
  KNT:   { color: "#8b7355", category: "Hard Assets",     exclusionReason: "Composite (73) falls below the portfolio threshold. The moat score (59) is typical for a single-asset miner — strong PNG regulatory lock-in and a top-5% orebody, offset by selling a fungible, price-taking commodity to switchable smelters with no pricing power or network effects. High growth (87) reflects production-expansion upside, not the scalable, capital-light compounding this portfolio targets." },
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
  APP:   { color: "#e8341c", category: "AdTech",          exclusionReason: "Moat (69) falls below the IM25 moat floor of 70. Composite clears the ≥80 threshold on growth and valuation — AXON still compounds installs into high-80s adj. EBITDA — but the durability case rests on a single AI data flywheel (MAX mediation + in-app behavioral signal) that is execution- and model-cadence-dependent rather than structural lock-in across multiple moat sources. Growth/valuation alone cannot carry a sub-70 moat into a moat-first book." },
  ARM:   { color: "#0091bd", category: "Semiconductors" },
  AXON:  { color: "#fbbf24", category: "Industrials" },
  CCJ:   { color: "#8b5e3c", category: "Hard Assets" },
  NXE:   { color: "#0f9b8e", category: "Hard Assets",     exclusionReason: "Composite falls below the portfolio threshold. Arrow's 2.37% U3O8 grade and the March 2026 CNSC construction licence are genuinely uncopyable, but the two moats that carry a producer — demonstrated operating capability and an embedded contract book — are the two rated weakest: NexGen has never built a mine, and roughly 93% of first-five-year output is uncontracted. At ~1.0x risked NAV the market has already paid the de-risking premium four years before first pound." },
  KAP:   { color: "#00a3b4", category: "Hard Assets",     exclusionReason: "The lowest-cost, largest-volume uranium producer on earth, and it captures roughly 69% of the price it sets — Q1 2026 realized $61.33/lb against $88.49/lb spot. Growth (64) reflects deliberate volume restraint plus a high risk discount for 75% state ownership, subsoil rights granted by that same shareholder, and export routing through contested infrastructure. Cheap uranium exposure, but the discount is the jurisdiction, not an inefficiency." },
  UEC:   { color: "#2f8f4e", category: "Hard Assets",     exclusionReason: "Lowest moat score (59) of the uranium names: an ISR licence stack that direct peers match on the same trends, ordinary-grade sandstone rather than scarce geology, and a deliberately empty contract book. Roughly $4B of the ~$4.9B market cap is attributed to ~12M lbs/yr of licensed capacity currently producing at about 1% of it, with nil revenue in Q3 FY2026 — capacity option value, not a compounder." },
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
  DDOG:  { color: "#632ca6", category: "Enterprise SaaS" },
  VST:   { color: "#00a651", category: "Utilities" },
  CDNS:  { color: "#00a3e0", category: "Semiconductors" },
  UBER:  { color: "#06C167", category: "Eco-System" },
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
  const cls = CATEGORY_STYLES[category] ?? "bg-foreground/5 text-foreground/40 border-foreground/10";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {category}
    </span>
  );
}

// ─── Rank badge styling ───────────────────────────────────────────────────────
// The top three get podium colours — gold, silver, bronze — matching the metal
// hues already used for XAU/XAG/HG above. Everything else stays neutral so the
// podium reads as a distinction rather than decoration.
const RANK_BADGE_STYLES: Record<number, string> = {
  1: "bg-[#d4af37]/[0.14] border-[#d4af37]/40 text-[#e3c766]",
  2: "bg-[#c0c0c0]/[0.16] border-[#c0c0c0]/50 text-[#e2e8e8]",
  3: "bg-[#b87333]/[0.14] border-[#b87333]/40 text-[#d18a4d]",
};
const NEUTRAL_RANK_BADGE = "bg-foreground/[0.05] border-foreground/[0.07] text-foreground/45";

function RankBadge({ rank }: { rank: number }) {
  return (
    <div
      className={`w-6 h-6 md:w-7 md:h-7 rounded-full border flex items-center justify-center shrink-0 ${
        RANK_BADGE_STYLES[rank] ?? NEUTRAL_RANK_BADGE
      }`}
    >
      <span className="text-[11px] font-black tabular-nums">{rank}</span>
    </div>
  );
}

// ─── Allocation sectors ───────────────────────────────────────────────────────
// Per-name weights cluster around 4–5% under the 10% cap, so a 25-slice ticker
// pie reads as a uniform ring. Rolling the granular stockMeta categories into
// a handful of sectors makes concentration visible at a glance; individual
// weights stay in the holdings table below.
type AllocationTheme = {
  id: string;
  label: string;
  color: string;
  categories: ReadonlySet<string>;
};

const ALLOCATION_THEMES: AllocationTheme[] = [
  {
    id: "software",
    label: "Software & Platforms",
    color: "#3b82f6",
    categories: new Set([
      "Core SaaS", "Enterprise SaaS", "Enterprise Software", "Big Tech",
      "Eco-System", "E-Commerce", "AdTech", "Media", "Cybersecurity",
    ]),
  },
  {
    id: "semis",
    label: "AI & Semiconductors",
    color: "#f59e0b",
    categories: new Set([
      "AI Infrastructure", "AI Analytics", "Foundry", "Memory",
      "Semiconductors", "Lithography",
    ]),
  },
  {
    id: "financials",
    label: "Financials",
    color: "#34d399",
    categories: new Set(["Payments", "Financials", "FinTech", "Financial Data"]),
  },
  {
    id: "healthcare",
    label: "Healthcare",
    color: "#14b8a6",
    categories: new Set(["Healthcare"]),
  },
  {
    id: "energy",
    label: "Energy & Utilities",
    color: "#f43f5e",
    categories: new Set(["Utilities", "Clean Tech"]),
  },
  {
    id: "industrials",
    label: "Industrials",
    color: "#fb923c",
    categories: new Set(["Industrials", "Robotics"]),
  },
  {
    id: "hard-assets",
    label: "Hard Assets",
    color: "#c4a574",
    categories: new Set(["Hard Assets"]),
  },
  {
    id: "digital",
    label: "Digital Assets",
    color: "#8b5cf6",
    categories: new Set(["Digital Assets"]),
  },
];

const OTHER_THEME: AllocationTheme = {
  id: "other",
  label: "Other",
  color: "#64748b",
  categories: new Set(["Luxury", "Consumer Retail", "Other"]),
};

function themeForCategory(category: string): AllocationTheme {
  return ALLOCATION_THEMES.find((t) => t.categories.has(category)) ?? OTHER_THEME;
}

function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  start: number,
  end: number,
): string {
  const largeArc = end - start > Math.PI ? 1 : 0;
  const cos = Math.cos;
  const sin = Math.sin;
  return [
    `M ${cx + outerR * cos(start)} ${cy + outerR * sin(start)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${cx + outerR * cos(end)} ${cy + outerR * sin(end)}`,
    `L ${cx + innerR * cos(end)} ${cy + innerR * sin(end)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * cos(start)} ${cy + innerR * sin(start)}`,
    "Z",
  ].join(" ");
}

function wrapSectorLabel(label: string): string[] {
  if (label.includes(" & ")) {
    const [head, tail] = label.split(" & ");
    return [`${head} &`, tail];
  }
  return [label];
}

function contrastFill(hex: string): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.55 ? "#0a0b0d" : "#f4f1ea";
}

export default function PortfolioPage() {
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

  const ranked = useMemo(() => {
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
      .map(({ s, composite }) => ({
        ticker:   s.ticker,
        name:     s.name,
        slug:     s.slug,
        href:     s.href,
        color:    stockMeta[s.ticker]?.color    ?? "#888888",
        category: stockMeta[s.ticker]?.category ?? s.category ?? "Other",
        stock:    s,
        composite,
      }));
  }, [allPrices]);

  const portfolio = useMemo(
    () => ranked
      .filter(r =>
        r.composite >= PORTFOLIO_THRESHOLD &&
        r.stock.scores[0] >= MIN_MOAT_SCORE
      )
      .slice(0, MAX_PORTFOLIO),
    [ranked]
  );

  const nearTop = useMemo(() => {
    const inPortfolio = new Set(portfolio.map(p => p.ticker));
    return ranked.filter(r => !inPortfolio.has(r.ticker)).slice(0, NEAR_TOP_COUNT);
  }, [ranked, portfolio]);

  // Live composite score per ticker, already computed in `ranked` from the
  // prices fetched once on mount. Covers both the portfolio and the watchlist,
  // so rows read from here instead of each re-fetching the same price.
  const scoreByTicker = useMemo(
    () => Object.fromEntries(ranked.map(r => [r.ticker, Math.round(r.composite)])),
    [ranked]
  );

  const liveScores: Record<string, number> = {};
  portfolio.forEach(p => { liveScores[p.ticker] = scoreByTicker[p.ticker]; });

  const [activeTheme, setActiveTheme] = useState<string | null>(null);
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

  const themeBuckets = [...ALLOCATION_THEMES, OTHER_THEME]
    .map((theme) => {
      const holdings = portfolio
        .filter((p) => themeForCategory(p.category).id === theme.id)
        .sort((a, b) => (dynamicWeights[b.ticker] ?? 0) - (dynamicWeights[a.ticker] ?? 0));
      const weight = holdings.reduce((sum, p) => sum + (dynamicWeights[p.ticker] ?? 0), 0);
      return { ...theme, holdings, weight };
    })
    .filter((t) => t.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  const activeBucket = themeBuckets.find((t) => t.id === activeTheme) ?? null;

  const DONUT = { cx: 100, cy: 100, outerR: 88, innerR: 56, gap: 0.024, labelMinPct: 12 } as const;
  const donutSlices = (() => {
    let cumAngle = -Math.PI / 2;
    return themeBuckets.map((theme) => {
      const sliceAngle = (theme.weight / 100) * 2 * Math.PI;
      const sa = cumAngle + DONUT.gap / 2;
      const ea = cumAngle + sliceAngle - DONUT.gap / 2;
      const mid = (sa + ea) / 2;
      cumAngle += sliceAngle;
      return { ...theme, sa, ea, mid };
    });
  })();

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
      <header className="pt-6 md:pt-10 pb-8 animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">IM25</p>
        <h1 className="page-title gradient-text-animated mb-4">
          The IM25
        </h1>
        <p className="page-dek">
          {portfolio.length} high-conviction positions selected for moat durability, growth scaling,
          and valuation discipline. Higher-scoring positions receive proportionally larger allocations
          (max 10% per position).
        </p>
      </header>

      {/* ── Allocation (full width) + compact strategy strip ─────────────── */}
      <div className="flex flex-col gap-4 mb-5 animate-fade-up stagger-fill-both" style={{ animationDelay: '0.15s' }}>

        {/* Visual Allocation — sectors, not 25 near-equal ticker slices */}
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <PieChart size={16} className="text-accent" />
              <h3 className="font-bold text-foreground/85">Visual Allocation</h3>
            </div>
            <p className="section-label">By sector</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="flex justify-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-52 h-52 sm:w-44 sm:h-44 lg:w-48 lg:h-48">
                {donutSlices.map((slice, idx) => {
                  const isActive = activeTheme === slice.id;
                  return (
                    <path
                      key={slice.id}
                      d={donutSlicePath(DONUT.cx, DONUT.cy, DONUT.outerR, DONUT.innerR, slice.sa, slice.ea)}
                      fill={slice.color}
                      opacity={activeTheme && !isActive ? 0.18 : isActive ? 1 : 0.9}
                      className="transition-opacity duration-200 cursor-pointer"
                      style={{ animation: `fade-in-scale 0.6s ease-out ${0.1 + idx * 0.05}s both` }}
                      onPointerEnter={(e) => {
                        if (e.pointerType === "mouse") setActiveTheme(slice.id);
                      }}
                      onPointerLeave={(e) => {
                        if (e.pointerType === "mouse") setActiveTheme(null);
                      }}
                      onClick={() => setActiveTheme((id) => (id === slice.id ? null : slice.id))}
                    />
                  );
                })}
                {donutSlices.map((slice) => {
                  if (slice.weight < DONUT.labelMinPct) return null;
                  const labelR = (DONUT.innerR + DONUT.outerR) / 2;
                  const x = DONUT.cx + labelR * Math.cos(slice.mid);
                  const y = DONUT.cy + labelR * Math.sin(slice.mid);
                  return (
                    <text
                      key={`${slice.id}-label`}
                      x={x}
                      y={y}
                      dy="0.35em"
                      textAnchor="middle"
                      fill={contrastFill(slice.color)}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="system-ui,sans-serif"
                      pointerEvents="none"
                      className="tabular-nums"
                    >
                      {slice.weight}%
                    </text>
                  );
                })}
                {activeBucket ? (() => {
                  const lines = wrapSectorLabel(activeBucket.label);
                  const twoLine = lines.length > 1;
                  return (
                    <>
                      {lines.map((line, i) => (
                        <text
                          key={line}
                          x="100"
                          y={twoLine ? 78 + i * 11 : 86}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.5)"
                          fontSize="8"
                          fontFamily="system-ui,sans-serif"
                        >
                          {line}
                        </text>
                      ))}
                      <text
                        x="100"
                        y={twoLine ? 110 : 108}
                        textAnchor="middle"
                        fill="white"
                        fontSize="15"
                        fontWeight="bold"
                        fontFamily="system-ui,sans-serif"
                      >
                        {activeBucket.weight}%
                      </text>
                    </>
                  );
                })() : (
                  <>
                    <text x="100" y="88" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="7.5" fontFamily="system-ui,sans-serif" letterSpacing="2.5">PORTFOLIO</text>
                    <text x="100" y="108" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui,sans-serif">{themeBuckets.length} Sectors</text>
                  </>
                )}
              </svg>
            </div>

            <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-6 xl:gap-x-5 gap-y-0.5">
              {themeBuckets.map((theme) => {
                const isActive = activeTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`rounded-xl px-2 py-1.5 cursor-pointer transition-colors ${
                      isActive ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.03]"
                    }`}
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setActiveTheme(theme.id);
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType === "mouse") setActiveTheme(null);
                    }}
                    onClick={() => setActiveTheme((id) => (id === theme.id ? null : theme.id))}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: theme.color }} />
                      <span className="text-xs font-bold text-foreground/80 leading-tight">{theme.label}</span>
                      {scoresLoading
                        ? <Spinner size="sm" color="current" className="ml-auto" />
                        : <span className="text-xs font-mono text-foreground/45 ml-auto tabular-nums">{theme.weight}%</span>
                      }
                    </div>
                    <div className="h-1 bg-foreground/10 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${theme.weight}%`,
                          background: theme.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {theme.holdings.map((stock) => (
                        <Link
                          key={stock.ticker}
                          href={stock.href}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold text-foreground/60 no-underline transition-colors hover:text-foreground"
                        >
                          {stock.ticker}
                          <span className="text-foreground/35 font-medium"> {dynamicWeights[stock.ticker] ?? 0}%</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Strategy Summary — full-width strip on desktop so it doesn't leave a dead column */}
        <Card className="gap-4 p-4 md:p-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-2.5 lg:shrink-0">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="font-bold text-foreground/85">Strategy Summary</h3>
          </div>

          {/* Gates + today */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-y border-foreground/[0.06] py-2.5 sm:grid-cols-4 sm:gap-0 lg:flex-1 lg:border-y-0 lg:border-x lg:px-5 lg:py-0">
            <div className="min-w-0 sm:border-r sm:border-foreground/[0.06] sm:pr-3">
              <p className="section-label mb-0.5">Positions</p>
              <p className="text-lg font-black tabular-nums text-foreground">{portfolio.length}</p>
            </div>
            <div className="min-w-0 sm:border-r sm:border-foreground/[0.06] sm:px-3">
              <p className="section-label mb-0.5">Composite</p>
              <p className="text-lg font-black tabular-nums text-foreground">≥ {PORTFOLIO_THRESHOLD}</p>
            </div>
            <div className="min-w-0 sm:border-r sm:border-foreground/[0.06] sm:px-3">
              <p className="section-label mb-0.5">Moat floor</p>
              <p className="text-lg font-black tabular-nums text-foreground">≥ {MIN_MOAT_SCORE}</p>
            </div>
            <div className="min-w-0 sm:pl-3">
              <p className="section-label mb-0.5">Today</p>
              {!allPricesLoaded ? (
                <Spinner size="sm" color="current" />
              ) : weightedDailyChange == null ? (
                <p className="text-lg font-black text-foreground/20">—</p>
              ) : (
                <div className={`flex items-center gap-1 ${weightedDailyChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {weightedDailyChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span className="text-lg font-black tabular-nums">
                    {weightedDailyChange >= 0 ? "+" : ""}{weightedDailyChange.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Est. 1-year returns */}
          <div className="lg:w-80 lg:shrink-0">
            <div className="mb-2 flex items-baseline justify-between gap-2 lg:mb-1.5">
              <p className="section-label">Est. 1-Year Return</p>
              <p className="text-[10px] text-foreground/22">Weighted avg</p>
            </div>
            {!allPricesLoaded ? (
              <Spinner size="sm" color="current" />
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { label: "Bear", value: weightedScenarioReturns.bear, border: "border-rose-500/15" },
                  { label: "Base", value: weightedScenarioReturns.base, border: "border-blue-500/15" },
                  { label: "Bull", value: weightedScenarioReturns.bull, border: "border-emerald-500/15" },
                ] as const).map(({ label, value, border }) => (
                  <div key={label} className={`rounded-lg border ${border} bg-foreground/[0.02] px-2 py-1.5 text-center`}>
                    <p className="section-label mb-0.5">{label}</p>
                    {value != null ? (
                      <p className={`text-base font-black tabular-nums ${value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {value >= 0 ? "+" : ""}{value.toFixed(1)}%
                      </p>
                    ) : (
                      <p className="text-base font-black text-foreground/20">—</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Allocation Breakdown ──────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both pb-12" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-4 mb-5">
          <div>
            <p className="section-label mb-1">Holdings</p>
            <h2 className="text-xl font-bold text-foreground/85">Allocation Breakdown</h2>
          </div>
          <div className="h-px flex-1 bg-foreground/[0.05]" />
          {/* Toggle only visible on mobile — desktop shows both columns */}
          <div className="flex lg:hidden items-center gap-1 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg p-1 shrink-0">
            {([['score', 'Score'], ['change', '1D %']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setScoreColumn(val)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                  scoreColumn === val ? 'bg-foreground/[0.12] text-foreground' : 'text-foreground/30 hover:text-foreground/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 border-b border-foreground/[0.05] bg-foreground/[0.02]">
            <div className="section-label w-6 md:w-7 text-center shrink-0">#</div>
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
          <div className="divide-y divide-foreground/[0.04]">
            {portfolioWithScores.map((stock, idx) => (
              <Link
                key={stock.ticker}
                href={stock.href}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-left no-underline transition-colors hover:bg-foreground/[0.04] md:gap-4 md:px-5"
              >
                {/* Position in the IM25, not universe composite rank */}
                <RankBadge rank={idx + 1} />

                {/* Color accent */}
                <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: stock.color }} />

                {/* Name + ticker */}
                <div className="min-w-[110px] md:min-w-[140px]">
                  <div className="font-bold text-sm text-foreground/90 leading-tight">{stock.name}</div>
                  <div className="text-[10px] text-foreground/28 tracking-[0.12em] font-black uppercase mt-0.5">{stock.ticker}</div>
                </div>

                {/* Category badge */}
                <div className="hidden sm:block shrink-0 w-24">
                  <CategoryBadge category={stock.category} />
                </div>

                <div className="flex-1" />

                {/* Per-stock bear/base/bull */}
                <div className="hidden lg:flex items-center justify-end shrink-0 w-36">
                  {!allPricesLoaded
                    ? <Spinner size="sm" color="current" />
                    : (() => {
                        const price = allPrices[stock.ticker];
                        const bear  = parseScenarioPrice(stock.stock.bearTarget);
                        const base  = parseScenarioPrice(stock.stock.baseTarget);
                        const bull  = parseScenarioPrice(stock.stock.bullTarget);
                        if (price == null || !bear || !base || !bull || price <= 0)
                          return <span className="text-xs text-foreground/25">—</span>;
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
                                <div className="text-[9px] text-foreground/20 uppercase">{label}</div>
                                <div className={`text-xs font-black ${pos ? "text-emerald-400" : "text-rose-400"}`}>{str}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                  }
                </div>

                {/* Score — always on desktop, toggle-gated on mobile */}
                <div className={`text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>
                  {scoresLoading
                    ? <Spinner size="sm" color="current" />
                    : <span className={`text-sm font-black ${getScoreColor(scoreByTicker[stock.ticker] ?? 0)}`}>{scoreByTicker[stock.ticker] ?? 0}</span>
                  }
                </div>

                {/* 1D% — always on desktop, toggle-gated on mobile */}
                <div className={`text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>
                  {!allPricesLoaded
                    ? <Spinner size="sm" color="current" />
                    : (() => {
                        const cp = allChangePercents[stock.ticker];
                        if (cp == null) return <span className="text-xs text-foreground/25">—</span>;
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
                    ? <Spinner size="sm" color="current" />
                    : <span className="text-base font-black text-foreground">{dynamicWeights[stock.ticker] ?? 0}%</span>
                  }
                </div>

                <ChevronRight
                  size={15}
                  className="text-foreground/15 group-hover:text-foreground/50 transition-colors shrink-0"
                />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* ── Watchlist (next-best, not in portfolio) ──────────────────────── */}
      {nearTop.length > 0 && (
        <section className="animate-fade-up stagger-fill-both pb-12" style={{ animationDelay: '0.45s' }}>
          <div className="flex items-center gap-4 mb-5">
            <div>
              <p className="section-label mb-1">Watchlist</p>
              <h2 className="text-xl font-bold text-foreground/85">Near the Top {MAX_PORTFOLIO}</h2>
            </div>
            <div className="h-px flex-1 bg-foreground/[0.05]" />
            <div className="flex items-center gap-1.5 text-foreground/30 shrink-0">
              <Eye size={13} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{nearTop.length}</span>
            </div>
          </div>

          <p className="text-foreground/40 text-xs md:text-sm mb-4 max-w-2xl leading-relaxed">
            The next {nearTop.length} highest-ranked names that fell outside the {MAX_PORTFOLIO}-position
            portfolio. Worth tracking — a moat upgrade, growth re-acceleration, or valuation reset could
            promote them.
          </p>

          <Card className="overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 border-b border-foreground/[0.05] bg-foreground/[0.02]">
              <div className="section-label w-6 md:w-7 text-center shrink-0">#</div>
              <div className="w-0.5 shrink-0" />
              <div className="section-label min-w-[110px] md:min-w-[140px]">Holding</div>
              <div className="section-label hidden sm:block shrink-0 w-24">Category</div>
              <div className="flex-1" />
              <div className="hidden lg:block section-label text-right shrink-0 w-36">1-Yr Return</div>
              <div className={`section-label text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>Score</div>
              <div className={`section-label text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>1D %</div>
              <div className="w-[15px] shrink-0" />
            </div>

            {/* Data rows */}
            <div className="divide-y divide-foreground/[0.04]">
              {nearTop.map((stock, idx) => (
                <Link
                  key={stock.ticker}
                  href={stock.href}
                  className="group flex w-full animate-slide-in-left items-center gap-3 px-4 py-3.5 text-left no-underline stagger-fill-both transition-colors hover:bg-foreground/[0.04] md:gap-4 md:px-5"
                  style={{ animationDelay: `${0.5 + idx * 0.035}s` }}
                >
                  {/* Continues after the IM25 so a gated #2 is not still marked 2 */}
                  <RankBadge rank={portfolio.length + idx + 1} />

                  {/* Color accent */}
                  <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: stock.color }} />

                  {/* Name + ticker */}
                  <div className="min-w-[110px] md:min-w-[140px]">
                    <div className="font-bold text-sm text-foreground/90 leading-tight">{stock.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="text-[10px] text-foreground/28 tracking-[0.12em] font-black uppercase">{stock.ticker}</div>
                      {stock.stock.scores[0] < MIN_MOAT_SCORE && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400/65">
                          Moat floor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="hidden sm:block shrink-0 w-24">
                    <CategoryBadge category={stock.category} />
                  </div>

                  <div className="flex-1" />

                  {/* Per-stock bear/base/bull */}
                  <div className="hidden lg:flex items-center justify-end shrink-0 w-36">
                    {!allPricesLoaded
                      ? <Spinner size="sm" color="current" />
                      : (() => {
                          const price = allPrices[stock.ticker];
                          const bear  = parseScenarioPrice(stock.stock.bearTarget);
                          const base  = parseScenarioPrice(stock.stock.baseTarget);
                          const bull  = parseScenarioPrice(stock.stock.bullTarget);
                          if (price == null || !bear || !base || !bull || price <= 0)
                            return <span className="text-xs text-foreground/25">—</span>;
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
                                  <div className="text-[9px] text-foreground/20 uppercase">{label}</div>
                                  <div className={`text-xs font-black ${pos ? "text-emerald-400" : "text-rose-400"}`}>{str}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })()
                    }
                  </div>

                  {/* Score */}
                  <div className={`text-right shrink-0 w-12 ${scoreColumn !== 'score' ? 'hidden lg:block' : ''}`}>
                    {scoresLoading
                      ? <Spinner size="sm" color="current" />
                      : <span className={`text-sm font-black ${getScoreColor(scoreByTicker[stock.ticker] ?? 0)}`}>{scoreByTicker[stock.ticker] ?? 0}</span>
                    }
                  </div>

                  {/* 1D% */}
                  <div className={`text-right shrink-0 w-14 ${scoreColumn !== 'change' ? 'hidden lg:block' : ''}`}>
                    {!allPricesLoaded
                      ? <Spinner size="sm" color="current" />
                      : (() => {
                          const cp = allChangePercents[stock.ticker];
                          if (cp == null) return <span className="text-xs text-foreground/25">—</span>;
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

                  <ChevronRight
                    size={15}
                    className="text-foreground/15 group-hover:text-foreground/50 transition-colors shrink-0"
                  />
                </Link>
              ))}
            </div>
          </Card>
        </section>
      )}

    </div>
  );
}
