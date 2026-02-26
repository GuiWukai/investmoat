'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { Calculator, BarChart, DollarSign } from "lucide-react";
import { Chip } from "@heroui/react";

export default function IntuitPage() {
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="primary" variant="flat" size="sm">FinTech | SaaS</Chip>
          <Chip color="success" variant="flat" size="sm">Quality Compounder</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Intuit Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">INTU</strong></span>
            <span>Market Cap: <strong className="text-white">$185B</strong></span>
            <span>Price: <strong className="text-white">$658.10</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Subscriber Growth"
          value="12%"
          label="SBCB Segment Expansion"
          icon={<Calculator size={20} color="white" />}
          color="#2ca01c"
        />
        <MetricCard
          title="Op. Margin"
          value="24.5%"
          label="GAAP Basis"
          icon={<BarChart size={20} color="white" />}
          color="#3b82f6"
        />
        <MetricCard
          title="Free Cash Flow"
          value="$4.8B"
          label="Strong Cash Conversion"
          icon={<DollarSign size={20} color="white" />}
          color="#10b981"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <ScoreGauge score={94} label="Moat Score" description="Extreme switching costs; once a SMB has QuickBooks, they almost never leave." />
        <ScoreGauge score={84} label="Growth Score" description="Credit Karma integration and AI-assisted tax filing driving ARPU." />
        <ScoreGauge score={62} label="Valuation Score" description="Consistent mid-20s P/E, fair for a high-quality compounder." />
      </div>

      <AnalysisSection title="The Ecosystem Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Intuit owns the <strong>Financial Workflow</strong> for small businesses and individuals:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Mission-Critical Software:</strong> QuickBooks is the system of record for millions. Migrating accounting data is a nightmare, creating a &quot;sticky&quot; moat.</li>
            <li><strong style={{ color: 'white' }}>Regulatory Tailwinds:</strong> Tax complexity ensures TurboTax remains a necessity for the consumer segment.</li>
            <li><strong style={{ color: 'white' }}>Data Advantage:</strong> Intuit sees more SMB transaction data than almost any bank, allowing for superior credit underwriting.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$520"
            description="IRS Direct File impacts TurboTax market share and SMB churn rises."
            points={[
              "TurboTax units decline as government option gains traction",
              "SMB bankruptcy rates increase in high-rate environment",
              "Credit Karma segment continues to face lending headwinds"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$700"
            description="Strong QuickBooks pricing power and AI-driven efficiency gains."
            points={[
              "Mid-market QuickBooks expansion continues",
              "Successful monetization of 'Intuit Assist' AI tools",
              "Operating margins expand by 100-200 bps"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$850"
            description="Complete automation of accounting flow for 10M+ SMBs globally."
            points={[
              "International expansion reaches critical mass",
              "B2B payments volume through QuickBooks doubles",
              "Credit Karma becomes a leading financial super-app"
            ]}
          />
        </div>
      </AnalysisSection>

      <AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['INTU']} />
      </AnalysisSection>
    </div>
  );
}
