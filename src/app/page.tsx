'use client';

import { ArrowUpRight, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { stockData, getAverageScore } from "./stockData";
import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";

export default function HomePage() {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "success";
    if (s >= 80) return "primary";
    if (s >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="animate-fade-in space-y-12">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
          Investment Intelligence
        </h1>
        <p className="text-white/60 text-xl max-w-2xl">
          Deep-dive analysis of wide-moat companies, growth catalysts, and value-based entry points.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-none backdrop-blur-lg p-4">
          <CardHeader className="flex justify-between items-start">
            <div className="p-3 bg-blue-600 rounded-xl">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <Chip size="sm" variant="flat" color="primary">Strategic Asset</Chip>
          </CardHeader>
          <CardBody>
            <h3 className="text-xl font-bold mb-2">Economic Moats</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              We identify sustainable competitive advantages: Brand, Network Effects, Switching Costs, and Cost Advantages.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white/5 border-none backdrop-blur-lg p-4">
          <CardHeader className="flex justify-between items-start">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <TrendingUp size={28} className="text-white" />
            </div>
            <Chip size="sm" variant="flat" color="success">Growth Factor</Chip>
          </CardHeader>
          <CardBody>
            <h3 className="text-xl font-bold mb-2">Hyper-Growth</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Analyzing revenue expansion, margin scaling, and TAM penetration for long-term compounding.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white/5 border-none backdrop-blur-lg p-4">
          <CardHeader className="flex justify-between items-start">
            <div className="p-3 bg-amber-600 rounded-xl">
              <BarChart3 size={28} className="text-white" />
            </div>
            <Chip size="sm" variant="flat" color="warning">Value Margin</Chip>
          </CardHeader>
          <CardBody>
            <h3 className="text-xl font-bold mb-2">Valuation</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              DCF analysis and relative multiples to ensure a proper margin of safety before deployment.
            </p>
          </CardBody>
        </Card>
      </div>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold">Portfolio Coverage</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stockData.map((stock) => {
            const avg = getAverageScore(stock.scores);
            return (
              <Card 
                key={stock.ticker} 
                as={Link} 
                href={stock.href} 
                isPressable 
                className="bg-white/5 border-none hover:bg-white/10 transition-all"
              >
                <CardBody className="flex-row justify-between items-center p-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{stock.name}</h3>
                      <Chip size="sm" variant="bordered" className="text-[10px] h-5 border-white/20">{stock.ticker}</Chip>
                    </div>
                    <p className="text-white/40 text-xs italic">Wide-moat investment candidate</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="text-right">
                       <div className="text-[10px] text-white/30 uppercase font-bold">Moat Score</div>
                       <div className={`text-lg font-black text-${getScoreColor(avg)}`}>{avg}</div>
                     </div>
                     <ArrowUpRight size={20} className="text-white/40" />
                   </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
