'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { stockData, getAverageScore } from "@/app/stockData";
import { Cpu, Zap, Target, Layers } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function AsmlPage() {
  const overallScore = getAverageScore(stockData.find(s => s.ticker === 'ASML')!.scores);
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          <Chip color="primary" variant="flat" size="sm">Semiconductors | Lithography</Chip>
          <Chip color="success" variant="flat" size="sm">Monopoly Moat</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight">ASML Holding</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">ASML</strong></span>
            <span>Market Cap: <strong className="text-white">$380B</strong></span>
            <span>Price: <strong className="text-white">$945.80</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard 
          title="EUV Monopoly" 
          value="100%" 
          label="Market Share" 
          icon={<Target size={20} className="text-white" />} 
          color="#00a1e0"
        />
        <MetricCard 
          title="Gross Margin" 
          value="51.3%" 
          label="Sustained High Quality" 
          icon={<Zap size={20} className="text-white" />} 
          color="#17c964"
        />
        <MetricCard 
          title="R&D Intensity" 
          value="€4.0B" 
          label="Annual Investment" 
          icon={<Cpu size={20} className="text-white" />} 
          color="#3b82f6"
        />
      </div>

      <ScoreTabsRow overallScore={overallScore} tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge score={tenMoatsData['ASML'].aiResilienceScore} label="Moat Score" description="The only company in the world capable of producing EUV machines required for &lt;7nm chips." />),
          detail: (
            <div className="space-y-4">
              <Card className="bg-white/5 border-none backdrop-blur-md">
                <CardBody className="p-4 md:p-8">
                  <p className="mb-4">ASML is the <strong>Sole Provider</strong> of the world's most complex machines:</p>
                  <ul className="list-disc pl-6 space-y-4 text-white/60">
                    <li><strong className="text-white">EUV Monopoly:</strong> Extreme Ultraviolet (EUV) lithography is required for every advanced chip from Apple, Nvidia, and Intel. ASML is the only company that can build them.</li>
                    <li><strong className="text-white">Technological Barrier:</strong> Developing EUV took 20+ years and billions in funding. A competitor would need decades to catch up.</li>
                    <li><strong className="text-white">Service Ecosystem:</strong> Once a machine is installed (costing $200M+), ASML generates recurring service revenue for 20+ years.</li>
                  </ul>
                </CardBody>
              </Card>
              <TenMoatsCard data={tenMoatsData['ASML']} />
            </div>
          ),
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge score={85} label="Growth Score" description="Moore's Law continues to drive demand for High-NA EUV and increased wafer capacity." />),
          detail: (
            <div className="space-y-4">
              <MetricCard 
          title="EUV Monopoly" 
          value="100%" 
          label="Market Share" 
          icon={<Target size={20} className="text-white" />} 
          color="#00a1e0"
        />
              <MetricCard 
          title="Gross Margin" 
          value="51.3%" 
          label="Sustained High Quality" 
          icon={<Zap size={20} className="text-white" />} 
          color="#17c964"
        />
              <MetricCard 
          title="R&D Intensity" 
          value="€4.0B" 
          label="Annual Investment" 
          icon={<Cpu size={20} className="text-white" />} 
          color="#3b82f6"
        />
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge score={72} label="Valuation Score" description="High multiple but justified by being the bottleneck of the entire AI economy." />),
          detail: (
            <div className="space-y-4">
              <ScenarioCard
            type="Bear"
            priceTarget="$750"
            description="Geopolitical restrictions on China revenue tighten further."
            points={[
              "Banning of older DUV machine exports to China",
              "Slowdown in capacity expansion from major foundries (TSMC/Intel/Samsung)",
              "Cyclical downturn in consumer electronics demand"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$1,100"
            description="Continued 2nm/3nm capacity buildout and High-NA rollout."
            points={[
              "Successful scaling of High-NA EUV production",
              "China revenue stabilized at lower but steady levels",
              "Consistent 15%+ EPS growth"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$1,400"
            description="Massive acceleration in global foundry building (Sovereign Foundries)."
            points={[
              "Nations building domestic chip capacity significantly increases demand",
              "AI-driven demand for HBM and advanced logic exceeds all forecasts",
              "Substantial margin expansion from 'high-end' product mix shift"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <div className="hidden md:block"><AnalysisSection title="The Strategic Bottleneck Moat">
        <div className="space-y-6">
          <Card className="bg-white/5 border-none backdrop-blur-md">
            <CardBody className="p-4 md:p-8">
              <p className="mb-4">ASML is the <strong>Sole Provider</strong> of the world's most complex machines:</p>
              <ul className="list-disc pl-6 space-y-4 text-white/60">
                <li><strong className="text-white">EUV Monopoly:</strong> Extreme Ultraviolet (EUV) lithography is required for every advanced chip from Apple, Nvidia, and Intel. ASML is the only company that can build them.</li>
                <li><strong className="text-white">Technological Barrier:</strong> Developing EUV took 20+ years and billions in funding. A competitor would need decades to catch up.</li>
                <li><strong className="text-white">Service Ecosystem:</strong> Once a machine is installed (costing $200M+), ASML generates recurring service revenue for 20+ years.</li>
              </ul>
            </CardBody>
          </Card>
          <TenMoatsCard data={tenMoatsData['ASML']} />
        </div>
      </AnalysisSection></div>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$750"
            description="Geopolitical restrictions on China revenue tighten further."
            points={[
              "Banning of older DUV machine exports to China",
              "Slowdown in capacity expansion from major foundries (TSMC/Intel/Samsung)",
              "Cyclical downturn in consumer electronics demand"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$1,100"
            description="Continued 2nm/3nm capacity buildout and High-NA rollout."
            points={[
              "Successful scaling of High-NA EUV production",
              "China revenue stabilized at lower but steady levels",
              "Consistent 15%+ EPS growth"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$1,400"
            description="Massive acceleration in global foundry building (Sovereign Foundries)."
            points={[
              "Nations building domestic chip capacity significantly increases demand",
              "AI-driven demand for HBM and advanced logic exceeds all forecasts",
              "Substantial margin expansion from 'high-end' product mix shift"
            ]}
          />
        </div>
      </AnalysisSection></div>

    </div>
  );
}
