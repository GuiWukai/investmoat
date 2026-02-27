'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { Laptop, Cloud, Database, DollarSign } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function MicrosoftPage() {
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          <Chip color="primary" variant="flat" size="sm">Software | Cloud | AI</Chip>
          <Chip color="success" variant="flat" size="sm">Gold Standard</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight">Microsoft Corp.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">MSFT</strong></span>
            <span>Market Cap: <strong className="text-white">$3.1T</strong></span>
            <span>Price: <strong className="text-white">$415.50</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Azure Growth" 
          value="30%" 
          label="Constant Currency (Q4)" 
          icon={<Cloud size={20} className="text-white" />} 
          color="#00a4ef"
        />
        <MetricCard 
          title="Office 365" 
          value="400M" 
          label="Commercial Seats" 
          icon={<Laptop size={20} className="text-white" />} 
          color="#ffb900"
        />
        <MetricCard 
          title="Operating Margin" 
          value="44.2%" 
          label="Unmatched Efficiency" 
          icon={<Database size={20} className="text-white" />} 
          color="#7fba00"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ScoreGauge score={tenMoatsData['MSFT'].aiResilienceScore} label="Moat Score" description="Total enterprise ubiquity and the strongest bundling power in software history." />
        <ScoreGauge score={92} label="Growth Score" description="AI Copilot integration and Azure AI services are driving massive upsell." />
        <ScoreGauge score={68} label="Valuation Score" description="Trading at 32x forward P/E, premium but fair for the quality." />
      </div>

      <AnalysisSection title="The Enterprise Moat">
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardBody className="p-4 md:p-8">
            <p className="mb-4">Microsoft's moat is built on <strong>Ubiquity and Frictionless Scaling</strong>:</p>
            <ul className="list-disc pl-6 space-y-4 text-white/60">
              <li><strong className="text-white">The Bundle Moat:</strong> By integrating Office, Teams, Azure, and Security, Microsoft creates a "sticky" ecosystem where selecting a competitor point-product adds more complexity than value.</li>
              <li><strong className="text-white">Commercial Switching Costs:</strong> Migrating a global enterprise away from the Active Directory and Office environment is an IT operation that takes years and carries immense risk.</li>
              <li><strong className="text-white">First-Mover AI Advantage:</strong> The partnership with OpenAI has allowed Microsoft to productize AI faster than any peer, securing early market share.</li>
            </ul>
          </CardBody>
        </Card>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$350"
            description="Azure growth decelerates faster than expected and margins compress."
            points={[
              "Azure growth falls below 20%",
              "Regulatory hurdles in AI and Cloud dominance",
              "Cybersecurity breach impacts enterprise trust"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$450"
            description="Steady 15% revenue growth and successful Copilot monetization."
            points={[
              "Copilot achieves 20% penetration of commercial seats",
              "Azure AI revenues contribute 500+ bps to growth",
              "Dividend growth continues at 10%+"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$550"
            description="Azure becomes the undisputed AI backbone of the global economy."
            points={[
              "Azure re-accelerates to 35%+ growth",
              "Gaming (Activision) delivers massive synergetic margins",
              "Successful expansion into Sovereign AI clouds"
            ]}
          />
        </div>
      </AnalysisSection>

      <AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['MSFT']} />
      </AnalysisSection>
    </div>
  );
}
