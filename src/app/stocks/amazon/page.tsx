'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { stockData, getAverageScore } from "@/app/stockData";
import { ShoppingCart, Cloud, Truck, DollarSign } from "lucide-react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";

export default function AmazonPage() {
  const overallScore = getAverageScore(stockData.find(s => s.ticker === 'AMZN')!.scores);
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          <Chip color="primary" variant="flat" size="sm">Consumer Discretionary | Tech</Chip>
          <Chip color="success" variant="flat" size="sm">Strong Buy</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight">Amazon.com Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">AMZN</strong></span>
            <span>Market Cap: <strong className="text-white">$1.92T</strong></span>
            <span>Price: <strong className="text-white">$185.20</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard 
          title="Revenue Growth" 
          value="13.2%" 
          label="YoY vs 11.5% Industry" 
          icon={<ShoppingCart size={20} className="text-white" />} 
          color="#f59e0b"
        />
        <MetricCard 
          title="AWS Margin" 
          value="31.8%" 
          label="Best-in-class profitability" 
          icon={<Cloud size={20} className="text-white" />} 
          color="#006fee"
        />
        <MetricCard 
          title="Free Cash Flow" 
          value="$50.1B" 
          label="TTM Expansion +400%" 
          icon={<DollarSign size={20} className="text-white" />} 
          color="#17c964"
        />
      </div>

      <ScoreTabsRow overallScore={overallScore} tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge 
          score={tenMoatsData['AMZN'].aiResilienceScore}
          label="Moat Score" 
          description="Dominant scale, switching costs (Prime), and cost advantage (Logistics)." 
        />),
          detail: (
            <div className="space-y-4">
              <Card className="bg-white/5 border-none backdrop-blur-md">
                <CardBody className="p-4 md:p-8">
                  <p className="mb-6 text-lg">
                    Amazon possesses a <strong className="text-primary italic">Wide Economic Moat</strong> driven by three primary pillars:
                  </p>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Cost Advantage
                      </h4>
                      <p className="text-sm text-white/50 leading-relaxed">Its massive fulfillment infrastructure creates unit costs that no competitor can match, allowing for faster delivery and lower prices.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Switching Costs
                      </h4>
                      <p className="text-sm text-white/50 leading-relaxed">The Prime ecosystem locks in consumers. Once a household is integrated into Prime, the convenience makes shopping elsewhere a "costly" friction.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Network Effect
                      </h4>
                      <p className="text-sm text-white/50 leading-relaxed">The 3rd party marketplace creates a flywheel where more sellers attract more buyers, which attracts more sellers.</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <TenMoatsCard data={tenMoatsData['AMZN']} />
            </div>
          ),
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge
          score={88}
          label="Growth Score"
          description="Cloud (AWS) and Advertising continue to outpace e-commerce growth."
        />),
          detail: (
            <div className="space-y-4">
              <MetricCard
          title="Revenue Growth"
          value="13.2%"
          label="YoY vs 11.5% Industry"
          icon={<ShoppingCart size={20} className="text-white" />}
          color="#f59e0b"
        />
              <MetricCard
          title="AWS Margin"
          value="31.8%"
          label="Best-in-class profitability"
          icon={<Cloud size={20} className="text-white" />}
          color="#006fee"
        />
              <MetricCard
          title="Free Cash Flow"
          value="$50.1B"
          label="TTM Expansion +400%"
          icon={<DollarSign size={20} className="text-white" />}
          color="#17c964"
        />
              <Card className="bg-white/5 border-none backdrop-blur-md p-6">
                <h4 className="text-xl font-bold mb-6">Financial Outlook</h4>
                <div className="space-y-4">
                  {[
                    "Generative AI demand driving AWS infrastructure refresh.",
                    "Ad revenue margin expansion exceeding retail growth.",
                    "International retail segments turning profitable."
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                      <span className="text-sm text-white/70">{text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge
          score={72}
          label="Valuation Score"
          description="Trading at 14x forward Cash Flow, slightly above historical mean."
        />),
          detail: (
            <div className="space-y-4">
              <Card className="bg-white/5 border-none backdrop-blur-md p-6">
                <h4 className="text-xl font-bold mb-6">Valuation Analysis</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Using a 10-year DCF with a 9% WACC and a 3.5% terminal growth rate, our fair value estimate for AMZN is <strong className="text-white text-lg">$215/share</strong>.
                </p>
                <Divider className="my-4 bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-white/40">Margin of Safety</span>
                  <Chip color="success" variant="flat" className="font-bold">14%</Chip>
                </div>
              </Card>
              <ScenarioCard
            type="Bear"
            priceTarget="$140"
            description="Macro slowdown hits consumer spending and AWS margins compress."
            points={[
              "E-commerce growth falls below 5%",
              "AWS revenue decelerates to mid-teens",
              "Regulatory pressure on marketplace fees"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$210"
            description="Continued efficiency gains in fulfillment and steady AWS growth."
            points={[
              "AWS growth stays in 17-20% range",
              "Advertising revenue remains major margin driver",
              "International retail reaches sustainable profit"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$265"
            description="AI demand triggers massive AWS expansion and logistics monetization."
            points={[
              "AWS growth re-accelerates above 25%",
              "Logistics-as-a-service becomes 4th pillar",
              "Massive FCF generation leads to buybacks"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <div className="hidden md:block"><AnalysisSection title="The Economic Moat">
        <div className="space-y-6">
          <Card className="bg-white/5 border-none backdrop-blur-md">
            <CardBody className="p-4 md:p-8">
              <p className="mb-6 text-lg">
                Amazon possesses a <strong className="text-primary italic">Wide Economic Moat</strong> driven by three primary pillars:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Cost Advantage
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed">Its massive fulfillment infrastructure creates unit costs that no competitor can match, allowing for faster delivery and lower prices.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Switching Costs
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed">The Prime ecosystem locks in consumers. Once a household is integrated into Prime, the convenience makes shopping elsewhere a "costly" friction.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Network Effect
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed">The 3rd party marketplace creates a flywheel where more sellers attract more buyers, which attracts more sellers.</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <TenMoatsCard data={tenMoatsData['AMZN']} />
        </div>
      </AnalysisSection></div>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$140"
            description="Macro slowdown hits consumer spending and AWS margins compress."
            points={[
              "E-commerce growth falls below 5%",
              "AWS revenue decelerates to mid-teens",
              "Regulatory pressure on marketplace fees"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$210"
            description="Continued efficiency gains in fulfillment and steady AWS growth."
            points={[
              "AWS growth stays in 17-20% range",
              "Advertising revenue remains major margin driver",
              "International retail reaches sustainable profit"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$265"
            description="AI demand triggers massive AWS expansion and logistics monetization."
            points={[
              "AWS growth re-accelerates above 25%",
              "Logistics-as-a-service becomes 4th pillar",
              "Massive FCF generation leads to buybacks"
            ]}
          />
        </div>
      </AnalysisSection></div>

    </div>
  );
}
