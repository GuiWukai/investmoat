'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData, computeMoatScore } from "@/app/tenMoatsData";
import { Cpu, Zap, Share2, DollarSign } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function NvidiaPage() {
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          <Chip color="primary" variant="flat" size="sm">Semiconductors | AI Infrastructure</Chip>
          <Chip color="success" variant="flat" size="sm">Market Monopoly</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight">NVIDIA Corp.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">NVDA</strong></span>
            <span>Market Cap: <strong className="text-white">$2.2T</strong></span>
            <span>Current Price: <strong className="text-white">$885.20</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Data Center Rev" 
          value="$18.4B" 
          label="409% YoY Growth" 
          icon={<Cpu size={20} className="text-white" />} 
          color="#76b900"
        />
        <MetricCard 
          title="Gross Margin" 
          value="76.7%" 
          label="Software-like Profitability" 
          icon={<Zap size={20} className="text-white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="H100 Demand" 
          value="Infinite" 
          label="Supply Constraint Era" 
          icon={<Share2 size={20} className="text-white" />} 
          color="#10b981"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ScoreGauge score={computeMoatScore(tenMoatsData['NVDA'])} label="Moat Score" description="CUDA software ecosystem and 10-year hardware lead in AI compute." />
        <ScoreGauge score={95} label="Growth Score" description="Generative AI spend is still in the 'Build-out' phase globally." />
        <ScoreGauge score={65} label="Valuation Score" description="High expectation hurdle; every earnings must be a massive beat." />
      </div>

      <AnalysisSection title="The Ecosystem Moat (CUDA)">
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardBody className="p-4 md:p-8">
            <p className="mb-4">Nvidia's moat isn't just "fast chips", it's the <strong>Full-Stack Software Advantage</strong>:</p>
            <ul className="list-disc pl-6 space-y-4 text-white/60">
              <li><strong className="text-white">CUDA Software Ecosystem:</strong> With over 4 million developers, CUDA is the industry standard. Moving to another hardware provider requires rewriting massive amounts of code.</li>
              <li><strong className="text-white">Innovation Velocity:</strong> Nvidia has moved to a 1-year product cycle (Hopper -&gt; Blackwell -&gt; Rubin), staying ahead of competitors who are still catching up to the last generation.</li>
              <li><strong className="text-white">Infiniband Networking:</strong> Their integration of networking (Mellanox) allows them to sell high-margin full-racks, not just individual GPUs.</li>
            </ul>
          </CardBody>
        </Card>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$600"
            description="Hyperscaler demand peaks and transitions to internal silicon (ASICs)."
            points={[
              "Major cloud providers reduce H100 orders by 30%+",
              "Competition from AMD MI300 series gains 15% share",
              "China export restrictions bite harder than expected"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$950"
            description="Blackwell cycle maintains ASPs and software revenue starts to scale."
            points={[
              "Data center growth stays above 50% throughout 2025",
              "Software subscriptions (AI Enterprise) reach $1B+ ARR",
              "High margins are maintained through product mix shift"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$1,200+"
            description="Sovereign AI demand and Blackwell architectural dominance."
            points={[
              "Nations building domestic AI capacity creates a new $50B market",
              "Omniverse becomes the backbone for industrial robotics",
              "Dividend hike and massive share buyback program"
            ]}
          />
        </div>
      </AnalysisSection>

      <AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['NVDA']} />
      </AnalysisSection>
    </div>
  );
}
