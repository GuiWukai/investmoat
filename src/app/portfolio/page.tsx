'use client';

import { useRouter } from "next/navigation";
import { PieChart, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardBody, CardHeader, Progress, Chip } from "@heroui/react";

const distribution = [
  { ticker: "MSFT", name: "Microsoft",  weight: 11, color: "#00a4ef", category: "Core SaaS",       href: "/stocks/msft" },
  { ticker: "AMZN", name: "Amazon",     weight: 11, color: "#f59e0b", category: "Eco-System",       href: "/stocks/amazon" },
  { ticker: "META", name: "Meta",       weight: 9,  color: "#1877F2", category: "Social Network",   href: "/stocks/meta" },
  { ticker: "V",    name: "Visa",       weight: 8,  color: "#1a1f71", category: "Payments",         href: "/stocks/visa" },
  { ticker: "MA",   name: "Mastercard", weight: 8,  color: "#eb001b", category: "Payments",         href: "/stocks/mastercard" },
  { ticker: "NVDA", name: "NVIDIA",     weight: 7,  color: "#76b900", category: "AI Infrastructure",href: "/stocks/nvda" },
  { ticker: "XAU",  name: "Gold",       weight: 4,  color: "#FFD700", category: "Commodities",      href: "/stocks/gold" },
  { ticker: "BTC",  name: "Bitcoin",    weight: 5,  color: "#f7931a", category: "Digital Asset",    href: "/stocks/btc" },
  { ticker: "CRM",  name: "Salesforce", weight: 6,  color: "#00a1e0", category: "Enterprise SaaS",  href: "/stocks/crm" },
  { ticker: "ASML", name: "ASML",       weight: 6,  color: "#0071c5", category: "Lithography",      href: "/stocks/asml" },
  { ticker: "ADBE", name: "Adobe",      weight: 5,  color: "#ff0000", category: "Creative SaaS",    href: "/stocks/adbe" },
  { ticker: "TSLA", name: "Tesla",      weight: 4,  color: "#e31937", category: "Autonomous EV",    href: "/stocks/tesla" },
  { ticker: "NFLX", name: "Netflix",    weight: 4,  color: "#e50914", category: "Streaming",        href: "/stocks/nflx" },
  { ticker: "SPGI", name: "S&P Global", weight: 4,  color: "#cf102d", category: "Financials",       href: "/stocks/spgi" },
  { ticker: "INTU", name: "Intuit",     weight: 4,  color: "#2ca01c", category: "FinTech",          href: "/stocks/intuit" },
  { ticker: "KNT",  name: "K92 Mining", weight: 3,  color: "#64748b", category: "Commodities",      href: "/stocks/k92" },
  { ticker: "AMD",  name: "AMD",        weight: 1,  color: "#007db8", category: "AI Chips",         href: "/stocks/amd" },
];

function categoryColor(category: string): "primary" | "success" | "warning" | "secondary" | "danger" | "default" {
  if (["Core SaaS", "Creative SaaS", "Enterprise SaaS"].includes(category)) return "primary";
  if (["Payments", "Financials", "FinTech"].includes(category)) return "success";
  if (["AI Infrastructure", "AI Chips", "Lithography"].includes(category)) return "warning";
  if (["Digital Asset", "Commodities"].includes(category)) return "secondary";
  if (["Social Network", "Streaming", "Autonomous EV"].includes(category)) return "danger";
  return "default";
}

export default function PortfolioPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in space-y-12">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-4">
          Portfolio Distribution
        </h1>
        <p className="text-white/60 text-base md:text-xl max-w-2xl">
          Optimized allocation across 17 high-conviction assets based on moat durability and growth scaling.
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
              {distribution.map((stock) => (
                <div
                  key={stock.ticker}
                  style={{ width: `${stock.weight}%`, background: stock.color }}
                  title={`${stock.name}: ${stock.weight}%`}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {distribution.map((stock) => (
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
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Diversification</p>
              <p className="text-lg font-bold">17 Core Positions</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Alpha Generators</p>
              <p className="text-lg font-bold">ASML, NVDA, AMD, BTC, XAU (24% Total)</p>
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
                value={24}
                label="Financials"
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

      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Allocation Breakdown</h2>
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 font-medium">Click to view analysis</span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-lg divide-y divide-white/5">
          {distribution.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => router.push(stock.href)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.06] transition-colors group text-left"
            >
              {/* Color swatch */}
              <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ background: stock.color }}
              />

              {/* Name & ticker */}
              <div className="min-w-[130px]">
                <div className="font-bold text-sm text-white">{stock.name}</div>
                <div className="text-[10px] text-white/30 tracking-widest font-black uppercase">{stock.ticker}</div>
              </div>

              {/* Category chip */}
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

              {/* Allocation bar */}
              <div className="flex-1 flex items-center gap-3">
                <Progress
                  value={(stock.weight / 11) * 100}
                  size="sm"
                  color={stock.weight >= 9 ? "success" : stock.weight >= 6 ? "primary" : "default"}
                  className="flex-1 max-w-[200px]"
                />
              </div>

              {/* Weight */}
              <span className="text-base font-black text-white tabular-nums w-10 text-right">{stock.weight}%</span>

              {/* Chevron */}
              <ChevronRight
                size={16}
                className="text-white/20 group-hover:text-white/60 transition-colors shrink-0"
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
