'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData, computeMoatScore } from "@/app/tenMoatsData";
import { Zap, Car, Battery, Cpu } from "lucide-react";
import { Chip } from "@heroui/react";

export default function TeslaPage() {
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="warning" variant="flat" size="sm">Automotive | Energy</Chip>
          <Chip color="primary" variant="flat" size="sm">Growth Pioneer</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Tesla Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">TSLA</strong></span>
            <span>Market Cap: <strong className="text-white">$560B</strong></span>
            <span>Price: <strong className="text-white">$175.20</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Hold" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Vehicle Deliveries"
          value="1.81M"
          label="Trailing 12 Months"
          icon={<Car size={20} color="white" />}
          color="#cc0000"
        />
        <MetricCard
          title="Energy Storage"
          value="14.7 GWh"
          label="125% YoY Growth"
          icon={<Battery size={20} color="white" />}
          color="#10b981"
        />
        <MetricCard
          title="FSD Miles"
          value="1.3B+"
          label="Data Advantage"
          icon={<Cpu size={20} color="white" />}
          color="#3b82f6"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <ScoreGauge score={computeMoatScore(tenMoatsData['TSLA'])} label="Moat Score" description="Vertical integration and massive manufacturing cost advantages." />
        <ScoreGauge score={89} label="Growth Score" description="Robotics (Optimus) and energy storage are the next 10x frontier." />
        <ScoreGauge score={55} label="Valuation Score" description="High P/E reflects optionality, but core auto margins are pressured." />
      </div>

      <AnalysisSection title="The Vertical Integration Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Tesla&apos;s moat isn&apos;t just &quot;selling cars&quot;, it&apos;s <strong>Manufacturing Complexity</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Cost Advantage:</strong> From battery chem to casting machines, Tesla&apos;s unit cost for EVs is unmatched by legacy OEMs.</li>
            <li><strong style={{ color: 'white' }}>Data Flywheel:</strong> Millions of cars on the road feeding data into Tesla&apos;s AI Dojo training cluster creates a gap in autonomous software.</li>
            <li><strong style={{ color: 'white' }}>Brand Authority:</strong> Zero marketing spend with 100% brand recognition creates a unique customer acquisition advantage.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$100"
            description="EV margins continue to slide and FSD timeline is pushed indefinitely."
            points={[
              "Auto gross margins fall below 12%",
              "Competition from BYD/Xiaomi erodes China share",
              "Robotaxi regulatory hurdles remain insurmountable"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$220"
            description="Stabilizing margins and high growth in Energy Storage offset EV cyclicality."
            points={[
              "Next-gen platform ('Model 2') enters production",
              "Energy storage deployment grows 100% YoY",
              "FSD licensing talks with major OEMs begin"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$450"
            description="Robotaxi network launch and Optimus robotics production readiness."
            points={[
              "Software revenue becomes >30% of total EBIT",
              "Unsupervised FSD approved in major US cities",
              "Tesla Energy becomes as large as the Auto business"
            ]}
          />
        </div>
      </AnalysisSection>

      <AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['TSLA']} />
      </AnalysisSection>
    </div>
  );
}
