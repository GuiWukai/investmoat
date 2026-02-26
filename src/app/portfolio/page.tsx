'use client';

import { PieChart, List, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader, Progress, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";

export default function PortfolioPage() {
  const distribution = [
    { ticker: "MSFT", name: "Microsoft", weight: 12, color: "#00a4ef", category: "Core SaaS" },
    { ticker: "AMZN", name: "Amazon", weight: 12, color: "#f59e0b", category: "Eco-System" },
    { ticker: "META", name: "Meta", weight: 10, color: "#1877F2", category: "Social Network" },
    { ticker: "NVDA", name: "NVIDIA", weight: 8, color: "#76b900", category: "AI Infrastructure" },
    { ticker: "V", name: "Visa", weight: 8, color: "#1a1f71", category: "Payments" },
    { ticker: "MA", name: "Mastercard", weight: 8, color: "#eb001b", category: "Payments" },
    { ticker: "BTC", name: "Bitcoin", weight: 8, color: "#f7931a", category: "Digital Asset" },
    { ticker: "ADBE", name: "Adobe", weight: 6, color: "#ff0000", category: "Creative SaaS" },
    { ticker: "CRM", name: "Salesforce", weight: 6, color: "#00a1e0", category: "Enterprise SaaS" },
    { ticker: "ASML", name: "ASML", weight: 6, color: "#0071c5", category: "Lithography" },
    { ticker: "NFLX", name: "Netflix", weight: 4, color: "#e50914", category: "Streaming" },
    { ticker: "SPGI", name: "S&P Global", weight: 4, color: "#cf102d", category: "Financials" },
    { ticker: "INTU", name: "Intuit", weight: 4, color: "#2ca01c", category: "FinTech" },
    { ticker: "KNT", name: "K92 Mining", weight: 4, color: "#64748b", category: "Commodities" },
  ];

  return (
    <div className="animate-fade-in space-y-12">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-4">
          Portfolio Distribution
        </h1>
        <p className="text-white/60 text-base md:text-xl max-w-2xl">
          Optimized allocation across 14 high-conviction assets based on moat durability and growth scaling.
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
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: stock.color }} />
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
              <p className="text-lg font-bold">14 Core Positions</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Alpha Generators</p>
              <p className="text-lg font-bold">ASML, NVDA, BTC (22% Total)</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Concentration</p>
              <Progress 
                value={64} 
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
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold">Allocation Breakdown</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="overflow-x-auto bg-white/5 backdrop-blur-lg rounded-2xl">
        <Table
          aria-label="Portfolio Allocation Table"
          classNames={{
            base: "overflow-visible",
            table: "min-h-[400px] min-w-[600px] lg:min-w-full",
            th: "bg-transparent text-white/40 border-b border-white/10",
            td: "py-4 text-white/80 border-b border-white/5"
          }}
          removeWrapper
        >
          <TableHeader>
            <TableColumn>ASSET</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>WEIGHT</TableColumn>
            <TableColumn>CONVICTION</TableColumn>
          </TableHeader>
          <TableBody>
            {distribution.map((stock) => (
              <TableRow key={stock.ticker}>
                <TableCell>
                  <div>
                    <div className="font-bold text-sm">{stock.name}</div>
                    <div className="text-[10px] text-white/30 tracking-widest font-black uppercase">{stock.ticker}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color="primary">{stock.category}</Chip>
                </TableCell>
                <TableCell>
                  <div className="text-lg font-black">{stock.weight}%</div>
                </TableCell>
                <TableCell>
                  <Progress 
                    value={stock.weight * 4} 
                    size="sm" 
                    color={stock.weight > 8 ? "success" : "primary"}
                    className="max-w-[100px]"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </section>
    </div>
  );
}
