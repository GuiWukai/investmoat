'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData, computeMoatScore } from "@/app/tenMoatsData";
import { ShieldCheck, TrendingUp, Globe, Coins } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function GoldPage() {
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          <Chip color="warning" variant="flat" size="sm">Commodity | Hard Money</Chip>
          <Chip color="success" variant="flat" size="sm">Inflation Hedge</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight text-[#FFD700]">Gold</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">XAU</strong></span>
            <span>Market Cap: <strong className="text-white">~$21T</strong></span>
            <span>Price: <strong className="text-white">~$2,900/oz</strong></span>
            <span>Annual Mine Supply: <strong className="text-white">~3,500 tonnes</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Spot Price"
          value="~$2,900/oz"
          label="Near All-Time High (Feb 2026)"
          icon={<Coins size={20} className="text-white" />}
          color="#FFD700"
        />
        <MetricCard
          title="Central Bank Buying"
          value="1,045t"
          label="3rd Consecutive Year >1,000t (2024)"
          icon={<TrendingUp size={20} className="text-white" />}
          color="#10b981"
        />
        <MetricCard
          title="Above-Ground Stock"
          value="~212,582t"
          label="Ever Mined; ~54,000t in Reserves"
          icon={<Globe size={20} className="text-white" />}
          color="#3b82f6"
        />
        <MetricCard
          title="Stock-to-Flow"
          value="~62x"
          label="Annual Production vs. Total Supply"
          icon={<ShieldCheck size={20} className="text-white" />}
          color="#8b5cf6"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ScoreGauge
          score={computeMoatScore(tenMoatsData['XAU'])}
          label="Moat Score"
          description="5,000+ years as humanity's store of value. No counterparty risk, finite supply, universally recognised across all civilisations and geopolitical systems."
        />
        <ScoreGauge
          score={50}
          label="Growth Score"
          description="Tracks long-run monetary debasement. De-dollarisation tailwinds and record central bank accumulation support structural demand, but gold does not compound like a business."
        />
        <ScoreGauge
          score={55}
          label="Valuation Score"
          description="At ~$2,900/oz gold is elevated but justified relative to M2 money supply growth. Not cheap, but not stretched given geopolitical and inflationary backdrop."
        />
      </div>

      <AnalysisSection title="The Timeless Moat">
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardBody className="p-4 md:p-8">
            <p className="mb-4">
              Gold&apos;s moat is built on <strong>Scarcity, Trust, and Zero Counterparty Risk</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-4 text-white/60">
              <li>
                <strong className="text-white">Physical Scarcity:</strong> All the gold ever mined would fit in roughly 3.5 Olympic swimming pools. Annual mine supply grows at ~1.5% — far below the rate of fiat money creation, preserving purchasing power over decades and centuries.
              </li>
              <li>
                <strong className="text-white">No Counterparty Risk:</strong> Unlike bonds, bank deposits, or equities, physical gold carries no issuer default risk. It is nobody&apos;s liability — a feature that becomes uniquely valuable during financial crises and sovereign stress events.
              </li>
              <li>
                <strong className="text-white">Universal Recognition:</strong> Gold is the only asset with a continuous 5,000-year track record as money across every major civilisation and empire. This cultural and institutional trust is impossible to replicate overnight.
              </li>
              <li>
                <strong className="text-white">Central Bank Demand:</strong> Global central banks purchased over 1,000 tonnes for the third consecutive year in 2024, driven by de-dollarisation trends and a desire to hold a reserve asset outside the US-dominated financial system.
              </li>
            </ul>
          </CardBody>
        </Card>
      </AnalysisSection>

      <AnalysisSection title="Structural Tailwinds">
        <div className="glass-card" style={{ borderLeft: '4px solid #FFD700' }}>
          <h4 className="text-lg font-bold mb-4">Why Gold Matters Now</h4>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            Gold is re-asserting itself as the foundation of the global monetary order. Several macro forces converge to support continued appreciation in real terms over the next decade.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#FFD700' }}>De-Dollarisation</span>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                BRICS+ nations are settling more bilateral trade in local currencies and gold, reducing USD reserve dominance.
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#FFD700' }}>Fiscal Deficits</span>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                G7 governments running structural deficits guarantee continued monetary expansion, eroding fiat purchasing power.
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#FFD700' }}>Geopolitical Risk</span>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                Sanctions on Russia&apos;s FX reserves demonstrated that USD assets can be frozen — accelerating diversification into gold globally.
              </div>
            </div>
          </div>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$2,200/oz"
            description="Fed pivots hawkish amid re-accelerating inflation, dollar surges, risk-off reversal."
            points={[
              "Strong USD and rising real yields pressure gold price",
              "Central bank buying slows as EM FX reserves come under strain",
              "Risk assets rally broadly, reducing safe-haven demand"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$3,200/oz"
            description="Fed easing cycle continues, central bank demand stays above 1,000t/yr, de-dollarisation accelerates."
            points={[
              "Real yields remain negative or near zero in key markets",
              "BRICS+ gold settlement mechanism gains traction",
              "Retail and institutional ETF flows resume after 2023–24 outflows"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$4,500+/oz"
            description="Sovereign debt crisis or major currency devaluation triggers flight to hard assets."
            points={[
              "US fiscal trajectory triggers a bond market dislocation",
              "One or more G20 central banks announce a gold-backed currency peg",
              "Geopolitical shock drives mass retail flight from fiat savings globally"
            ]}
          />
        </div>
      </AnalysisSection>

      <AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['XAU']} />
      </AnalysisSection>
    </div>
  );
}
