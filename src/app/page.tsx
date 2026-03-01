'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PieChart, ShieldCheck, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader, Progress, Chip } from "@heroui/react";
import { stockData } from "./stockData";
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
  children: (avg: number) => ReactNode;
}) {
  const [avg, setAvg] = useState(() =>
    Math.round((moat + growth + fallbackVal) / 3)
  );

  useEffect(() => {
    const bear = parseScenarioPrice(bearTarget);
    const base = parseScenarioPrice(baseTarget);
    const bull = parseScenarioPrice(bullTarget);
    if (!bear || !base || !bull) return;

    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || d?.price == null) return;
        const liveVal = computeValuationScore(d.price, bear, base, bull);
        setAvg(Math.round((moat + growth + liveVal) / 3));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug, moat, growth, bearTarget, baseTarget, bullTarget]);

  return <>{children(avg)}</>;
}

const portfolio = [
  { ticker: "MSFT", name: "Microsoft",  weight: 16, color: "#00a4ef", category: "Core SaaS",        href: "/stocks/msft" },
  { ticker: "AMZN", name: "Amazon",     weight: 14, color: "#f59e0b", category: "Eco-System",        href: "/stocks/amazon" },
  { ticker: "ASML", name: "ASML",       weight: 12, color: "#0071c5", category: "Lithography",       href: "/stocks/asml" },
  { ticker: "V",    name: "Visa",       weight: 12, color: "#1a1f71", category: "Payments",          href: "/stocks/visa" },
  { ticker: "MA",   name: "Mastercard", weight: 11, color: "#eb001b", category: "Payments",          href: "/stocks/mastercard" },
  { ticker: "NVDA", name: "NVIDIA",     weight: 11, color: "#76b900", category: "AI Infrastructure", href: "/stocks/nvda" },
  { ticker: "SPGI", name: "S&P Global", weight: 10, color: "#cf102d", category: "Financials",        href: "/stocks/spgi" },
  { ticker: "CRM",  name: "Salesforce", weight: 8,  color: "#00a1e0", category: "Enterprise SaaS",   href: "/stocks/crm" },
  { ticker: "INTU", name: "Intuit",     weight: 6,  color: "#2ca01c", category: "FinTech",           href: "/stocks/intuit" },
];

const excluded = [
  {
    ticker: "META",
    name: "Meta",
    href: "/stocks/meta",
    reason: "Composite of 75 now sits exactly at the portfolio threshold. Strongest PEG ratio (~1.1x) of any peer at ~25x forward P/E with 20%+ EPS growth — but near-zero FCF yield from a $60B+ capex cycle and ongoing Reality Labs losses keep conviction below a core position. Active portfolio candidate if capex normalizes and WhatsApp commerce inflects.",
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    href: "/stocks/tesla",
    reason: "Lowest valuation score (55) among active candidates — significantly overpriced on fundamentals. Brand and FSD software lead is thinning as legacy OEMs and Chinese EV makers close the gap. High execution risk and CEO concentration risk compound the valuation concern.",
  },
  {
    ticker: "PLTR",
    name: "Palantir",
    href: "/stocks/pltr",
    reason: "Among the most compelling businesses in coverage — 6 of 10 AI moats are strong, and US commercial growth of 54% YoY is category-defining. But the valuation (48) is the lowest score in the portfolio. The base case ($120) matches the current price, leaving zero margin of safety. A 54% drawdown to the bear case ($55) reflects the asymmetric risk of buying a premium AI platform at peak optimism. High-conviction watch-list addition on any significant pullback.",
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    href: "/stocks/btc",
    reason: "Growth (85) is high but the moat is narrative-based digital scarcity with no productive cash flows. Valuation (50) is the weakest in the universe. Valid as a macro hedge in a separate satellite allocation, but lacks the durable compounding characteristics of a core portfolio holding.",
  },
  {
    ticker: "ADBE",
    name: "Adobe",
    href: "/stocks/adbe",
    reason: "Second-lowest moat score (58) signals material AI disruption risk to Creative Cloud. Generative tools — Midjourney, Sora, Canva AI, and native OS features — directly attack Adobe's pricing power and switching costs. The structural moat that once defined this business is visibly weakening.",
  },
  {
    ticker: "NFLX",
    name: "Netflix",
    href: "/stocks/nflx",
    reason: "Content creation is a non-durable moat requiring perpetual capital reinvestment. Worst valuation score (52) reflects an expensive multiple for a business in an intensely competitive streaming market with no decisive technological edge. AI moat score of 63 is weak for the price paid.",
  },
  {
    ticker: "AMD",
    name: "AMD",
    href: "/stocks/amd",
    reason: "Lowest moat score (52) in the Big Tech category. AMD's competitive edge is execution excellence, not structural lock-in. NVIDIA's CUDA software ecosystem creates switching costs that AMD simply cannot replicate. Strong cyclical growth (92) but no wide moat — a momentum play, not a compounder.",
  },
  {
    ticker: "KNT",
    name: "K92 Mining",
    href: "/stocks/k92",
    reason: "Weakest moat score in the entire coverage universe (42). Mining is a commodity business with no pricing power, no network effects, and no switching costs. High growth (85) reflects production expansion upside — not the scalable, capital-light compounding this portfolio targets.",
  },
  {
    ticker: "XAU",
    name: "Gold",
    href: "/stocks/gold",
    reason: "Lowest overall score (57) driven by weak growth (50) and poor valuation basis (55). Gold produces no earnings or cash flows, making intrinsic value impossible to anchor. Valid as a macro fear hedge in a separate allocation, but has no place in a quality-focused compounder portfolio.",
  },
];

function categoryColor(category: string): "primary" | "success" | "warning" | "secondary" | "danger" | "default" {
  if (["Core SaaS", "Enterprise SaaS"].includes(category)) return "primary";
  if (["Payments", "Financials", "FinTech"].includes(category)) return "success";
  if (["AI Infrastructure", "Lithography"].includes(category)) return "warning";
  if (["Eco-System"].includes(category)) return "secondary";
  return "default";
}

export default function HomePage() {
  const router = useRouter();

  const portfolioWithScores = portfolio.map((p) => {
    const stock = stockData.find((s) => s.ticker === p.ticker);
    return { ...p, stock };
  });

  const excludedWithScores = excluded.map((e) => {
    const stock = stockData.find((s) => s.ticker === e.ticker);
    return { ...e, stock };
  });

  const getScoreColor = (s: number): "success" | "primary" | "warning" | "danger" => {
    if (s >= 90) return "success";
    if (s >= 80) return "primary";
    if (s >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="animate-fade-in space-y-12">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-4">
          Portfolio Distribution
        </h1>
        <p className="text-white/60 text-base md:text-xl max-w-2xl">
          9 high-conviction positions selected for moat durability, growth scaling, and valuation discipline.
          Minimum overall score of 75 required for inclusion.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-none backdrop-blur-lg">
          <CardHeader className="flex gap-3 p-6 pb-0">
            <PieChart className="text-primary" />
            <h3 className="text-xl font-bold">Visual Allocation</h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="flex h-12 rounded-xl overflow-hidden mb-8 border border-white/10">
              {portfolio.map((stock) => (
                <div
                  key={stock.ticker}
                  style={{ width: `${stock.weight}%`, background: stock.color }}
                  title={`${stock.name}: ${stock.weight}%`}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {portfolio.map((stock) => (
                <div key={stock.ticker} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: stock.color }} />
                  <span className="text-xs font-bold text-white/80">{stock.ticker}</span>
                  <span className="text-xs text-white/40">{stock.weight}%</span>
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
              <p className="text-lg font-bold">9 High-Conviction Holdings</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Selection Threshold</p>
              <p className="text-lg font-bold">Overall Score ≥ 75 / 100</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Concentration</p>
              <Progress
                value={61}
                label="Tech & SaaS"
                size="sm"
                color="primary"
                showValueLabel={true}
                classNames={{ base: "max-w-md", label: "text-xs font-bold", value: "text-xs" }}
              />
              <Progress
                value={39}
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
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Allocation Breakdown</h2>
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 font-medium">Click to view analysis</span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-lg divide-y divide-white/5">
          {portfolioWithScores.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => router.push(stock.href)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.06] transition-colors group text-left"
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
                  value={(stock.weight / 16) * 100}
                  size="sm"
                  color={stock.weight >= 12 ? "success" : stock.weight >= 8 ? "primary" : "default"}
                  className="flex-1 max-w-[200px]"
                />
              </div>

              {stock.stock ? (
                <DynamicScore
                  slug={stock.stock.slug}
                  moat={stock.stock.scores[0]}
                  growth={stock.stock.scores[1]}
                  fallbackVal={stock.stock.scores[2]}
                  bearTarget={stock.stock.bearTarget}
                  baseTarget={stock.stock.baseTarget}
                  bullTarget={stock.stock.bullTarget}
                >
                  {(avg) => (
                    <div className="text-right mr-2 shrink-0">
                      <div className="text-[10px] text-white/30 uppercase font-bold">Score</div>
                      <div className={`text-sm font-black text-${getScoreColor(avg)}`}>{avg}</div>
                    </div>
                  )}
                </DynamicScore>
              ) : null}

              <span className="text-base font-black text-white tabular-nums w-10 text-right">{stock.weight}%</span>

              <ChevronRight
                size={16}
                className="text-white/20 group-hover:text-white/60 transition-colors shrink-0"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Excluded Stocks */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <AlertTriangle size={20} className="text-warning shrink-0" />
          <h2 className="text-2xl font-bold">Not in Portfolio</h2>
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 font-medium">Overall score below 75 or risk concerns</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {excludedWithScores.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => router.push(stock.href)}
              className="text-left rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{stock.name}</span>
                  <span className="text-[10px] text-white/30 tracking-widest font-black uppercase border border-white/10 rounded px-1.5 py-0.5">
                    {stock.ticker}
                  </span>
                </div>
                {stock.stock ? (
                  <DynamicScore
                    slug={stock.stock.slug}
                    moat={stock.stock.scores[0]}
                    growth={stock.stock.scores[1]}
                    fallbackVal={stock.stock.scores[2]}
                    bearTarget={stock.stock.bearTarget}
                    baseTarget={stock.stock.baseTarget}
                    bullTarget={stock.stock.bullTarget}
                  >
                    {(avg) => (
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Overall</div>
                        <Chip
                          size="sm"
                          color={getScoreColor(avg)}
                          variant="flat"
                          classNames={{ content: "font-black text-sm" }}
                        >
                          {avg}
                        </Chip>
                      </div>
                    )}
                  </DynamicScore>
                ) : null}
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{stock.reason}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
