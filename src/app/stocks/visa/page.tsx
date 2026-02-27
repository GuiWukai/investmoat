'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { Globe, Zap, DollarSign } from "lucide-react";
import { Chip } from "@heroui/react";

export default function VisaPage() {
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="primary" variant="flat" size="sm">Financial Services</Chip>
          <Chip color="success" variant="flat" size="sm">Wide Moat</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Visa Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">V</strong></span>
            <span>Market Cap: <strong className="text-white">$550B</strong></span>
            <span>Price: <strong className="text-white">$282.10</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Payment Volume"
          value="$15.1T"
          label="Trailing 12 Months"
          icon={<DollarSign size={20} color="white" />}
          color="#1a1f71"
        />
        <MetricCard
          title="Operating Margin"
          value="67.2%"
          label="Incredible Scalability"
          icon={<Zap size={20} color="white" />}
          color="#f7b600"
        />
        <MetricCard
          title="Countries"
          value="200+"
          label="Global Acceptance"
          icon={<Globe size={20} color="white" />}
          color="#3b82f6"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <ScoreGauge score={tenMoatsData['V'].aiResilienceScore} label="Moat Score" description="The world's largest payment network with massive barriers to entry and network effects." />
        <ScoreGauge score={82} label="Growth Score" description="Ongoing shift from cash to digital and expansion into B2B payments." />
        <ScoreGauge score={75} label="Valuation Score" description="Trading at 28x forward P/E, reasonable for a consistent 15%+ EPS compounder." />
      </div>

      <AnalysisSection title="The Duopoly Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Visa operates a <strong>Global Toll Bridge</strong> for commerce:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Network Effect:</strong> More merchants accept Visa because more consumers carry the card. More consumers carry the card because more merchants accept it. A classic winner-take-all flywheel.</li>
            <li><strong style={{ color: 'white' }}>High Barriers to Entry:</strong> The infrastructure required to process 250+ billion transactions annually with zero downtime is nearly impossible to replicate.</li>
            <li><strong style={{ color: 'white' }}>Operating Leverage:</strong> Once code is written, an additional transaction costs virtually nothing, leading to industry-leading margins.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$240"
            description="Global recession leads to cross-border travel slump and lower consumer spending."
            points={[
              "Cross-border volume growth slows to low single digits",
              "Regulatory caps on interchange fees in major markets",
              "Adoption of government-led real-time payment rails"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$320"
            description="Steady growth in PCE and continued digitization of payments."
            points={[
              "International volume grows 10-12%",
              "Value-added services revenue grows 20%+",
              "Consistent 10%+ dividend growth"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$380"
            description="B2B and 'Visa Direct' capture massive share of non-card payments."
            points={[
              "Successful expansion into account-to-account payments",
              "Major reduction in operating expenses via AI automation",
              "New cross-border corridors open in emerging markets"
            ]}
          />
        </div>
      </AnalysisSection>

      <AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['V']} />
      </AnalysisSection>
    </div>
  );
}
