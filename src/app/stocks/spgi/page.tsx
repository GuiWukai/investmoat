'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { Landmark, TrendingUp, Shield } from "lucide-react";
import { Chip } from "@heroui/react";

export default function SPGlobalPage() {
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="primary" variant="flat" size="sm">Financial Services</Chip>
          <Chip color="success" variant="flat" size="sm">Oligopoly Moat</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">S&amp;P Global</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">SPGI</strong></span>
            <span>Market Cap: <strong className="text-white">$142B</strong></span>
            <span>Price: <strong className="text-white">$448.20</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Hold" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard
          title="Ratings Revenue"
          value="$3.4B"
          label="Recurring Market Lead"
          icon={<Landmark size={20} color="white" />}
          color="#cf102d"
        />
        <MetricCard
          title="EBITDA Margin"
          value="48.5%"
          label="Scalable Capital Markets"
          icon={<TrendingUp size={20} color="white" />}
          color="#3b82f6"
        />
        <MetricCard
          title="Dividend Growth"
          value="10%"
          label="Consistent 5yr CAGR"
          icon={<Shield size={20} color="white" />}
          color="#10b981"
        />
      </div>

      <ScoreTabsRow tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge score={tenMoatsData['SPGI'].aiResilienceScore} label="Moat Score" description="A global duopoly with Moody's in debt ratings. Regulatory and brand moat." />),
          detail: (
            <div className="space-y-4">
              <div className="glass-card">
                <p style={{ marginBottom: '1rem' }}>S&amp;P Global operates a <strong>Financial Toll Bridge</strong>:</p>
                <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li><strong style={{ color: 'white' }}>Regulatory Oligopoly:</strong> You cannot issue global debt without a rating from S&amp;P or Moody&apos;s. It is a legally-embedded requirement for institutional investors.</li>
                  <li><strong style={{ color: 'white' }}>IP Moat:</strong> The S&amp;P 500 brand is the most licensed index in the world. Asset managers pay SPGI every time a new ETF is created.</li>
                  <li><strong style={{ color: 'white' }}>Low Capex:</strong> Once the rating methodologies and data platforms are built, every additional dollar of revenue flows straight to the bottom line.</li>
                </ul>
              </div>
              <TenMoatsCard data={tenMoatsData['SPGI']} />
            </div>
          ),
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge score={78} label="Growth Score" description="Index licensing (S&P 500) and ESG data integration." />),
          detail: (
            <div className="space-y-4">
              <MetricCard
          title="Ratings Revenue"
          value="$3.4B"
          label="Recurring Market Lead"
          icon={<Landmark size={20} color="white" />}
          color="#cf102d"
        />
              <MetricCard
          title="EBITDA Margin"
          value="48.5%"
          label="Scalable Capital Markets"
          icon={<TrendingUp size={20} color="white" />}
          color="#3b82f6"
        />
              <MetricCard
          title="Dividend Growth"
          value="10%"
          label="Consistent 5yr CAGR"
          icon={<Shield size={20} color="white" />}
          color="#10b981"
        />
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge score={75} label="Valuation Score" description="Trading at a premium but justified by the 'toll bridge' business model." />),
          detail: (
            <div className="space-y-4">
              <ScenarioCard
            type="Bear"
            priceTarget="$350"
            description="Global debt issuance freezes and market data subscription churn."
            points={[
              "High interest rates kill new corporate bond issuance",
              "Consolidation in the financial sector reduces terminal counts",
              "ESG revenue faces political and regulatory backlash"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$480"
            description="Steady 7-9% revenue growth and ratings recovery post-2024."
            points={[
              "Refinancing 'wall' leads to steady ratings demand",
              "Index licensing grows with equity market appreciation",
              "Operating margins remain above 45%"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$560"
            description="Massive expansion into private market data and ESG dominance."
            points={[
              "Acquisition integration creates significant cost synergies",
              "Private credit ratings become a standard requirement",
              "Dividend growth re-accelerates to >15%"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <div className="hidden md:block"><AnalysisSection title="The Toll-Bridge Moat">
        <div className="space-y-6">
          <div className="glass-card">
            <p style={{ marginBottom: '1rem' }}>S&amp;P Global operates a <strong>Financial Toll Bridge</strong>:</p>
            <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong style={{ color: 'white' }}>Regulatory Oligopoly:</strong> You cannot issue global debt without a rating from S&amp;P or Moody&apos;s. It is a legally-embedded requirement for institutional investors.</li>
              <li><strong style={{ color: 'white' }}>IP Moat:</strong> The S&amp;P 500 brand is the most licensed index in the world. Asset managers pay SPGI every time a new ETF is created.</li>
              <li><strong style={{ color: 'white' }}>Low Capex:</strong> Once the rating methodologies and data platforms are built, every additional dollar of revenue flows straight to the bottom line.</li>
            </ul>
          </div>
          <TenMoatsCard data={tenMoatsData['SPGI']} />
        </div>
      </AnalysisSection></div>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$350"
            description="Global debt issuance freezes and market data subscription churn."
            points={[
              "High interest rates kill new corporate bond issuance",
              "Consolidation in the financial sector reduces terminal counts",
              "ESG revenue faces political and regulatory backlash"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$480"
            description="Steady 7-9% revenue growth and ratings recovery post-2024."
            points={[
              "Refinancing 'wall' leads to steady ratings demand",
              "Index licensing grows with equity market appreciation",
              "Operating margins remain above 45%"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$560"
            description="Massive expansion into private market data and ESG dominance."
            points={[
              "Acquisition integration creates significant cost synergies",
              "Private credit ratings become a standard requirement",
              "Dividend growth re-accelerates to >15%"
            ]}
          />
        </div>
      </AnalysisSection></div>

    </div>
  );
}
