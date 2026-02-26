import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Cloud, Users, Zap, BarChart3 } from "lucide-react";

export default function SalesforcePage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">SaaS | CRM</span>
          <span className="badge badge-success">Market Leader</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Salesforce Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>CRM</strong></span>
          <span>Market Cap: <strong>$292B</strong></span>
          <span>Price: <strong>$301.20</strong></span>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Revenue Growth" 
          value="11.2%" 
          label="Sustained Enterprise Demand" 
          icon={<Cloud size={20} color="white" />} 
          color="#00a1e0"
        />
        <MetricCard 
          title="Op. Margin" 
          value="32.5%" 
          label="Non-GAAP Basis" 
          icon={<BarChart3 size={20} color="white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="Customer Count" 
          value="150k+" 
          label="Global Enterprises" 
          icon={<Users size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={92} label="Moat Score" description="High switching costs and 'Data Gravity' makes it the system of record for sales." />
        <ScoreGauge score={80} label="Growth Score" description="Data Cloud and AI (Einstein) are the primary expansion vectors." />
        <ScoreGauge score={68} label="Valuation Score" description="Strong FCF generation justifies a premium SaaS multiple." />
      </div>

      <AnalysisSection title="The Data Gravity Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Salesforce's moat is built on <strong>Ecosystem Stickiness</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>High Switching Costs:</strong> Once an enterprise integrates its entire sales workflow and data into CRM, the cost and risk of migrating to a competitor like Oracle or SAP are prohibitive.</li>
            <li><strong style={{ color: 'white' }}>Platform Breadth:</strong> With Sales, Service, Marketing, and Slack, Salesforce offers a unified platform that individual point-solutions cannot match.</li>
            <li><strong style={{ color: 'white' }}>Data Cloud:</strong> The ability to harmonize disparate data streams into a single customer profile creates a new layer of value for AI modeling.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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
