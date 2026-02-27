'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { Play, Users, TrendingUp } from "lucide-react";
import { Chip } from "@heroui/react";

export default function NetflixPage() {
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="primary" variant="flat" size="sm">Tech | Media</Chip>
          <Chip color="success" variant="flat" size="sm">Scaling Leader</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Netflix Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">NFLX</strong></span>
            <span>Market Cap: <strong className="text-white">$265B</strong></span>
            <span>Price: <strong className="text-white">$612.40</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Hold" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard
          title="Paid Members"
          value="270M"
          label="Global Scale"
          icon={<Users size={20} color="white" />}
          color="#e50914"
        />
        <MetricCard
          title="FCF Generation"
          value="$6.5B"
          label="Expected 2024"
          icon={<TrendingUp size={20} color="white" />}
          color="#10b981"
        />
        <MetricCard
          title="Content Spend"
          value="$17B"
          label="Annual Budget"
          icon={<Play size={20} color="white" />}
          color="#3b82f6"
        />
      </div>

      <ScoreTabsRow tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge score={tenMoatsData['NFLX'].aiResilienceScore} label="Moat Score" description="Massive scale allows for better unit economics on content than any competitor." />),
          detail: <TenMoatsCard data={tenMoatsData['NFLX']} />,
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge score={88} label="Growth Score" description="Ad-tier expansion and paid sharing crackdown continue to drive ARPU and sub growth." />),
          detail: (
            <div className="space-y-4">
              <MetricCard
          title="Paid Members"
          value="270M"
          label="Global Scale"
          icon={<Users size={20} color="white" />}
          color="#e50914"
        />
              <MetricCard
          title="FCF Generation"
          value="$6.5B"
          label="Expected 2024"
          icon={<TrendingUp size={20} color="white" />}
          color="#10b981"
        />
              <MetricCard
          title="Content Spend"
          value="$17B"
          label="Annual Budget"
          icon={<Play size={20} color="white" />}
          color="#3b82f6"
        />
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge score={52} label="Valuation Score" description="Trading at 35x P/E, requires high execution on ad-revenue targets." />),
          detail: (
            <div className="space-y-4">
              <ScenarioCard
            type="Bear"
            priceTarget="$450"
            description="Ad-tier adoption cannibalizes higher price plans and churn rises."
            points={[
              "ARM (Average Revenue per Member) growth stagnates",
              "Major competitors (YouTube/Disney) win more 'watch time' share",
              "Increase in content production costs due to inflation"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$680"
            description="Successful monetization of ad-tier and steady subscriber gains."
            points={[
              "Ad-revenue becomes a meaningful 10% portion of total top-line",
              "Operating margins expand beyond 25% target",
              "Continued success in non-English content exports"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$850"
            description="Netflix becomes the default 'Live TV' replacement including sports."
            points={[
              "Live sports (WWE/NFL) drive a new massive wave of ad-inventory",
              "Gaming integration leads to material improvement in churn and engagement",
              "ARM exceeds $20 in core US/EU markets"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <AnalysisSection title="The Scale Moat">
        <div className="space-y-6">
          <div className="glass-card">
            <p style={{ marginBottom: '1rem' }}>Netflix&apos;s advantage is its <strong>Content Efficiency</strong>:</p>
            <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong style={{ color: 'white' }}>Unit Economics of Joy:</strong> With 270M subs, a $100M show costs Netflix $0.37 per subscriber. For a competitor with 50M subs, that same show costs $2.00. This is the ultimate barrier.</li>
              <li><strong style={{ color: 'white' }}>Data Flywheel:</strong> Their recommendation engine reduces churn and ensures that content spend is targeted at the highest-probability hits.</li>
              <li><strong style={{ color: 'white' }}>Global Reach:</strong> Unlike US-centric platforms, Netflix is truly global, with local language content driving growth in EMEA, APAC, and LATAM.</li>
            </ul>
          </div>
          <div className="hidden md:block">
            <TenMoatsCard data={tenMoatsData['NFLX']} />
          </div>
        </div>
      </AnalysisSection>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$450"
            description="Ad-tier adoption cannibalizes higher price plans and churn rises."
            points={[
              "ARM (Average Revenue per Member) growth stagnates",
              "Major competitors (YouTube/Disney) win more 'watch time' share",
              "Increase in content production costs due to inflation"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$680"
            description="Successful monetization of ad-tier and steady subscriber gains."
            points={[
              "Ad-revenue becomes a meaningful 10% portion of total top-line",
              "Operating margins expand beyond 25% target",
              "Continued success in non-English content exports"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$850"
            description="Netflix becomes the default 'Live TV' replacement including sports."
            points={[
              "Live sports (WWE/NFL) drive a new massive wave of ad-inventory",
              "Gaming integration leads to material improvement in churn and engagement",
              "ARM exceeds $20 in core US/EU markets"
            ]}
          />
        </div>
      </AnalysisSection></div>

    </div>
  );
}
