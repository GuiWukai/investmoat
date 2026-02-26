'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Cloud, Users, Zap, BarChart3 } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function SalesforcePage() {
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <Chip color="primary" variant="flat" size="sm">SaaS | CRM</Chip>
          <Chip color="success" variant="flat" size="sm">Market Leader</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight">Salesforce Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">CRM</strong></span>
            <span>Market Cap: <strong className="text-white">$292B</strong></span>
            <span>Price: <strong className="text-white">$301.20</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Revenue Growth" 
          value="11.2%" 
          label="Sustained Enterprise Demand" 
          icon={<Cloud size={20} className="text-white" />} 
          color="#00a1e0"
        />
        <MetricCard 
          title="Op. Margin" 
          value="32.5%" 
          label="Non-GAAP Basis" 
          icon={<BarChart3 size={20} className="text-white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="Customer Count" 
          value="150k+" 
          label="Global Enterprises" 
          icon={<Users size={20} className="text-white" />} 
          color="#17c964"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ScoreGauge score={92} label="Moat Score" description="High switching costs and 'Data Gravity' makes it the system of record for sales." />
        <ScoreGauge score={80} label="Growth Score" description="Data Cloud and AI (Einstein) are the primary expansion vectors." />
        <ScoreGauge score={68} label="Valuation Score" description="Strong FCF generation justifies a premium SaaS multiple." />
      </div>

      <AnalysisSection title="The Data Gravity Moat">
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardBody className="p-8">
            <p className="mb-4">Salesforce's moat is built on <strong>Ecosystem Stickiness</strong>:</p>
            <ul className="list-disc pl-6 space-y-4 text-white/60">
              <li><strong className="text-white">High Switching Costs:</strong> Once an enterprise integrates its entire sales workflow and data into CRM, the cost and risk of migrating to a competitor like Oracle or SAP are prohibitive.</li>
              <li><strong className="text-white">Platform Breadth:</strong> With Sales, Service, Marketing, and Slack, Salesforce offers a unified platform that individual point-solutions cannot match.</li>
              <li><strong className="text-white">Data Cloud:</strong> The ability to harmonize disparate data streams into a single customer profile creates a new layer of value for AI modeling.</li>
            </ul>
          </CardBody>
        </Card>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard 
            type="Bear" 
            priceTarget="$240" 
            description="Macro slowdown hits enterprise IT budgets and AI monetization lags."
            points={[
              "Seat growth turns flat due to global downsizing",
              "Execution issues with Data Cloud integration",
              "Increased competition from Microsoft's Dynamics 365"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$330" 
            description="Steady 10-12% growth and margin expansion via efficiency."
            points={[
              "Successful multi-cloud bundling strategies",
              "Operating margins reach 35% targets early",
              "Consistent share buyback execution"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$400" 
            description="AI Agentic workflow becomes a massive revenue driver."
            points={[
              "Agents and autonomous AI tools drive 20% growth in ARPU",
              "Data Cloud becomes the fastest-growing product in company history",
              "Major acquisition of a strategic AI-first software company"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
