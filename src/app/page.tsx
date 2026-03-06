'use client';

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PieChart, ShieldCheck, ChevronRight, ChevronDown, AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader, Progress, Chip, Spinner } from "@heroui/react";
import { stockData, excludedStockData, getAverageScore } from "./stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

function DynamicScore({
  slug,
  moat,
  growth,
  fallbackVal,
  bearTarget,
  baseTarget,
  bullTarget,
  onScore,
  children,
}: {
  slug: string;
  moat: number;
  growth: number;
  fallbackVal: number;
  bearTarget: string;
  baseTarget: string;
  bullTarget: string;
  onScore?: (score: number) => void;
  children: (avg: number, loading: boolean) => ReactNode;
}) {
  const [avg, setAvg] = useState(() =>
    getAverageScore([moat, growth, fallbackVal])
  );
  const [loading, setLoading] = useState(true);
  const onScoreRef = useRef(onScore);
  useEffect(() => { onScoreRef.current = onScore; });

  useEffect(() => {
    const bear = parseScenarioPrice(bearTarget);
    const base = parseScenarioPrice(baseTarget);
    const bull = parseScenarioPrice(bullTarget);
    const fallbackAvg = getAverageScore([moat, growth, fallbackVal]);
    if (!bear || !base || !bull) {
      onScoreRef.current?.(fallbackAvg);
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
          const newAvg = getAverageScore([moat, growth, liveVal]);
          setAvg(newAvg);
          onScoreRef.current?.(newAvg);
        } else {
          onScoreRef.current?.(fallbackAvg);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { onScoreRef.current?.(fallbackAvg); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [slug, moat, growth, fallbackVal, bearTarget, baseTarget, bullTarget]);

  return <>{children(avg, loading)}</>;
}

// ─── Portfolio threshold ──────────────────────────────────────────────────────
const PORTFOLIO_THRESHOLD = 75;

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
  COST:  { color: "#005DAA", category: "Consumer Retail", exclusionReason: "Composite score (71) falls below the portfolio threshold. Costco is a world-class business with an exceptional membership flywheel and 92.9% renewal rates, but a valuation score of 60 (48x+ forward P/E) reflects near-perfection already priced in, and a growth score of 70 is constrained by the pace of physical warehouse expansion. It ranks behind 20 higher-scoring compounders on a risk-adjusted basis." },
  ORCL:  { color: "#C74634", category: "Enterprise Software" },
};

// ─── Dynamic portfolio / excluded — derived from composite scores ─────────────
const portfolio = stockData
  .filter(s => getAverageScore(s.scores) >= PORTFOLIO_THRESHOLD)
  .map(s => ({
    ticker:   s.ticker,
    name:     s.name,
    slug:     s.slug,
    href:     s.href,
    color:    stockMeta[s.ticker]?.color    ?? "#888888",
    category: stockMeta[s.ticker]?.category ?? "Other",
    stock:    s,
  }));

const excluded = excludedStockData
  .map(s => ({
    ticker: s.ticker,
    name:   s.name,
    href:   s.href,
    reason: stockMeta[s.ticker]?.exclusionReason ?? `Overall composite score below ${PORTFOLIO_THRESHOLD}.`,
    stock:  s,
  }))
  .sort((a, b) => getAverageScore(b.stock.scores) - getAverageScore(a.stock.scores));

// ─── Category colour helper ───────────────────────────────────────────────────
function categoryColor(category: string): "primary" | "success" | "warning" | "secondary" | "danger" | "default" {
  if (["Core SaaS", "Enterprise SaaS", "Big Tech"].includes(category)) return "primary";
  if (["Payments", "Financials", "FinTech"].includes(category)) return "success";
  if (["AI Infrastructure", "Lithography", "AI Analytics", "Cybersecurity", "Foundry", "Memory"].includes(category)) return "warning";
  if (["Eco-System", "Clean Tech", "Digital Assets"].includes(category)) return "secondary";
  if (category === "Hard Assets") return "danger";
  return "default";
}

// ─── Sector sets for concentration display ────────────────────────────────────
const TECH_CATEGORIES = new Set([
  "Core SaaS", "Enterprise SaaS", "Big Tech",
  "AI Infrastructure", "Lithography", "AI Analytics",
  "Clean Tech", "Eco-System", "Cybersecurity", "Digital Assets", "Foundry", "Memory",
]);
const FIN_CATEGORIES = new Set(["Payments", "Financials", "FinTech"]);

export default function HomePage() {
  const router = useRouter();

  // Track live composite scores for each portfolio stock so we can compute dynamic weights
  const [liveScores, setLiveScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    portfolio.forEach((p) => { init[p.ticker] = getAverageScore(p.stock.scores); });
    return init;
  });
  const [loadedTickers, setLoadedTickers] = useState<Set<string>>(new Set());
  const [hoveredPie, setHoveredPie] = useState<string | null>(null);
  const [expandedExcluded, setExpandedExcluded] = useState<Set<string>>(new Set());

  const toggleExcluded = (ticker: string) => {
    setExpandedExcluded(prev => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });
  };
  const scoresLoading = loadedTickers.size < portfolio.length;

  const handleScore = (ticker: string, score: number) => {
    setLiveScores((prev) => ({ ...prev, [ticker]: score }));
    setLoadedTickers((prev) => new Set([...prev, ticker]));
  };

  // Compute weights with amplified spread — subtract a baseline so score
  // differences translate into meaningful allocation gaps; cap at 10% per position.
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

  // Round weights while keeping sum at 100 (largest-remainder method)
  const floors = Object.fromEntries(portfolio.map((p) => [p.ticker, Math.floor(rawWeights[p.ticker])]));
  const remainder = 100 - Object.values(floors).reduce((a, b) => a + b, 0);
  const sorted = [...portfolio].sort((a, b) => (rawWeights[b.ticker] % 1) - (rawWeights[a.ticker] % 1));
  sorted.slice(0, remainder).forEach((p) => { floors[p.ticker]++; });
  const dynamicWeights = floors;

  const maxWeight = Math.max(...portfolio.map((p) => dynamicWeights[p.ticker] ?? 0));

  // Sector concentrations derived from category metadata
  const techWeight = portfolio.reduce(
    (s, p) => TECH_CATEGORIES.has(p.category) ? s + (dynamicWeights[p.ticker] ?? 0) : s, 0
  );
  const finWeight = portfolio.reduce(
    (s, p) => FIN_CATEGORIES.has(p.category) ? s + (dynamicWeights[p.ticker] ?? 0) : s, 0
  );

  const portfolioWithScores = [...portfolio].sort(
    (a, b) => (liveScores[b.ticker] ?? 0) - (liveScores[a.ticker] ?? 0)
  );

  const getScoreColor = (s: number): "success" | "primary" | "warning" | "danger" => {
    if (s >= 90) return "success";
    if (s >= 80) return "primary";
    if (s >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="animate-fade-in space-y-12">
      <header className="mb-8 md:mb-12 animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <h1 className="text-3xl md:text-5xl font-extrabold gradient-text-animated mb-4">
          Portfolio Distribution
        </h1>
        <p className="text-white/60 text-base md:text-xl max-w-2xl animate-fade-up stagger-fill-both stagger-2">
          {portfolio.length} high-conviction positions selected for moat durability, growth scaling, and valuation discipline.
          Higher-scoring positions receive proportionally larger allocations (max 10% per position).
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-up stagger-fill-both stagger-3">
        <Card className="bg-white/5 border-none backdrop-blur-lg">
          <CardHeader className="flex gap-3 p-6 pb-0">
            <PieChart className="text-primary" />
            <h3 className="text-xl font-bold">Visual Allocation</h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="flex justify-center mb-4">
              <svg viewBox="0 0 200 200" className="w-52 h-52">
                {(() => {
                  const cx = 100, cy = 100, outerR = 88, innerR = 54;
                  const sorted = [...portfolio].sort((a, b) => (dynamicWeights[b.ticker] ?? 0) - (dynamicWeights[a.ticker] ?? 0));
                  const GAP = 0.018;
                  let cumAngle = -Math.PI / 2;
                  return sorted.map((stock) => {
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
                        opacity={hoveredPie && !isHov ? 0.3 : 1}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          transformOrigin: '100px 100px',
                          animation: `fade-in-scale 0.6s ease-out ${0.1 + sorted.indexOf(stock) * 0.04}s both`,
                          transform: isHov ? 'scale(1.04)' : 'scale(1)',
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
                      <text x="100" y="97" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui,sans-serif">{s.ticker}</text>
                      <text x="100" y="114" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontFamily="system-ui,sans-serif">{dynamicWeights[s.ticker] ?? 0}%</text>
                    </>
                  );
                })() : (
                  <>
                    <text x="100" y="97" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="system-ui,sans-serif" letterSpacing="2">PORTFOLIO</text>
                    <text x="100" y="114" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui,sans-serif">{portfolio.length} Holdings</text>
                  </>
                )}
              </svg>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...portfolio].sort((a, b) => (dynamicWeights[b.ticker] ?? 0) - (dynamicWeights[a.ticker] ?? 0)).map((stock) => (
                <div key={stock.ticker} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: stock.color }} />
                  <span className="text-xs font-bold text-white/80">{stock.ticker}</span>
                  {scoresLoading
                    ? <Spinner size="sm" color="default" classNames={{ wrapper: "w-3 h-3" }} />
                    : <span className="text-xs text-white/40">{dynamicWeights[stock.ticker] ?? 0}%</span>
                  }
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white/5 border-none backdrop-blur-lg">
          <CardHeader className="flex gap-3 p-6 pb-0">
            <ShieldCheck className="text-success" />
            <h3 className="text-xl font-bold">Strategy Summary</h3>
          </CardHeader>
          <CardBody className="p-6 gap-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Positions</p>
              <p className="text-lg font-bold">{portfolio.length} High-Conviction Holdings</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Selection Threshold</p>
              <p className="text-lg font-bold">Overall Score ≥ {PORTFOLIO_THRESHOLD} / 100</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Concentration</p>
              <Progress
                value={techWeight}
                label="Tech & SaaS"
                size="sm"
                color="primary"
                showValueLabel={true}
                classNames={{ base: "max-w-md", label: "text-xs font-bold", value: "text-xs" }}
              />
              <Progress
                value={finWeight}
                label="Financials & Payments"
                size="sm"
                color="success"
                showValueLabel={true}
                className="mt-2"
                classNames={{ base: "max-w-md", label: "text-xs font-bold", value: "text-xs" }}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Curated Holdings */}
      <section className="animate-fade-up stagger-fill-both stagger-5">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Allocation Breakdown</h2>
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 font-medium">Click to view analysis</span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-lg divide-y divide-white/5">
          {portfolioWithScores.map((stock, idx) => (
            <button
              key={stock.ticker}
              onClick={() => router.push(stock.href)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.06] transition-colors group text-left animate-slide-in-left stagger-fill-both"
              style={{ animationDelay: `${0.3 + idx * 0.04}s` }}
            >
              <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: stock.color }} />

              <div className="min-w-[130px]">
                <div className="font-bold text-sm text-white">{stock.name}</div>
                <div className="text-[10px] text-white/30 tracking-widest font-black uppercase">{stock.ticker}</div>
              </div>

              <div className="hidden sm:block">
                <Chip
                  size="sm"
                  variant="flat"
                  color={categoryColor(stock.category)}
                  classNames={{ content: "font-semibold text-[11px]" }}
                >
                  {stock.category}
                </Chip>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <Progress
                  value={maxWeight > 0 ? ((dynamicWeights[stock.ticker] ?? 0) / maxWeight) * 100 : 0}
                  size="sm"
                  color="primary"
                  className="flex-1 max-w-[200px]"
                />
              </div>

              <DynamicScore
                slug={stock.stock.slug}
                moat={stock.stock.scores[0]}
                growth={stock.stock.scores[1]}
                fallbackVal={stock.stock.scores[2]}
                bearTarget={stock.stock.bearTarget}
                baseTarget={stock.stock.baseTarget}
                bullTarget={stock.stock.bullTarget}
                onScore={(score) => handleScore(stock.ticker, score)}
              >
                {(avg, loading) => (
                  <div className="text-right mr-2 shrink-0 w-12">
                    <div className="text-[10px] text-white/30 uppercase font-bold">Score</div>
                    {loading
                      ? <Spinner size="sm" color="default" className="mt-0.5" />
                      : <div className={`text-sm font-black text-${getScoreColor(avg)}`}>{avg}</div>
                    }
                  </div>
                )}
              </DynamicScore>

              <div className="tabular-nums w-10 text-right">
                {scoresLoading
                  ? <Spinner size="sm" color="default" />
                  : <span className="text-base font-black text-white">{dynamicWeights[stock.ticker] ?? 0}%</span>
                }
              </div>

              <ChevronRight
                size={16}
                className="text-white/20 group-hover:text-white/60 transition-colors shrink-0"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Excluded Stocks */}
      <section className="animate-fade-up stagger-fill-both stagger-7">
        <div className="flex items-center gap-4 mb-6">
          <AlertTriangle size={20} className="text-warning shrink-0" />
          <h2 className="text-2xl font-bold">Not in Portfolio</h2>
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 font-medium">Overall score below {PORTFOLIO_THRESHOLD}</span>
        </div>

        <div className="flex flex-col gap-2">
          {excluded.map((stock, idx) => {
            const isOpen = expandedExcluded.has(stock.ticker);
            return (
              <div
                key={stock.ticker}
                className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden animate-fade-up stagger-fill-both"
                style={{ animationDelay: `${0.5 + idx * 0.06}s` }}
              >
                {/* Header row — toggles accordion */}
                <button
                  onClick={() => toggleExcluded(stock.ticker)}
                  className="w-full text-left flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronDown
                      size={15}
                      className={`text-white/30 group-hover:text-white/60 transition-all shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    />
                    <span className="font-bold text-white truncate">{stock.name}</span>
                    <span className="text-[10px] text-white/30 tracking-widest font-black uppercase border border-white/10 rounded px-1.5 py-0.5 shrink-0">
                      {stock.ticker}
                    </span>
                  </div>
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
                      <div className="text-right shrink-0 ml-4 min-w-[52px]">
                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Overall</div>
                        {loading
                          ? <Spinner size="sm" color="default" />
                          : <Chip
                              size="sm"
                              color={getScoreColor(avg)}
                              variant="flat"
                              classNames={{ content: "font-black text-sm" }}
                            >
                              {avg}
                            </Chip>
                        }
                      </div>
                    )}
                  </DynamicScore>
                </button>

                {/* Expandable justification */}
                {isOpen && (
                  <div className="px-5 pb-4 border-t border-white/5">
                    <p className="text-white/50 text-sm leading-relaxed pt-4">{stock.reason}</p>
                    <button
                      onClick={() => router.push(stock.href)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors"
                    >
                      View full analysis <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
