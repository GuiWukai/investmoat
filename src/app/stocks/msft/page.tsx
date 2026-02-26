import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Laptop, Cloud, Database, DollarSign } from "lucide-react";

export default function MicrosoftPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Information Technology</span>
          <span className="badge badge-success">Wide Moat</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Microsoft Corp.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>MSFT</strong></span>
          <span>Market Cap: <strong>$3.1T</strong></span>
          <span>Price: <strong>$415.50</strong></span>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Azure Growth" 
          value="31%" 
          label="CC Basis (Q3 2024)" 
          icon={<Cloud size={20} color="white" />} 
          color="#00a4ef"
        />
        <MetricCard 
          title="Net Margin" 
          value="36.4%" 
          label="SaaS-level profitability" 
          icon={<Database size={20} color="white" />} 
          color="#7fba00"
        />
        <MetricCard 
          title="Return on Equity" 
          value="38.5%" 
          label="Capital Efficiency" 
          icon={<DollarSign size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={98} label="Moat Score" description="Extreme switching costs and network effects in Windows/Office/LinkedIn." />
        <ScoreGauge score={92} label="Growth Score" description="OpenAI partnership and Copilot integration across the stack." />
        <ScoreGauge score={68} label="Valuation Score" description="Trading at 32x forward P/E, a 15% premium to 5yr average." />
      </div>

      <AnalysisSection title="The Institutional Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Microsoft's dominance is built on <strong>Software Ubiquity</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>High Switching Costs:</strong> The integration of Windows, Office 365, and Azure makes it nearly impossible for an enterprise to migrate to a competitor without massive disruption.</li>
            <li><strong style={{ color: 'white' }}>Network Effects:</strong> LinkedIn's value grows with every professional user, creating a monopoly on professional networking and recruitment data.</li>
            <li><strong style={{ color: 'white' }}>Mission Critical:</strong> Their tools are not discretionary; they are the "oxygen" of the modern workplace.</li>
          </ul>
        </div>
      </AnalysisSection>
      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$320" 
            description="Cloud growth matures faster than expected and AI ROI remains elusive."
            points={[
              "Azure growth slows to sub-20%",
              "Office subscriptions hit peak saturation",
              "OpenAI partnership faces regulatory hurdles"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$460" 
            description="Robust enterprise demand for Azure and successful Copilot monetization."
            points={[
              "Azure growth stays consistently above 25%",
              "Microsoft 365 Copilot sees 15%+ adoption",
              "Steady margin expansion through operational leverage"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$580" 
            description="AI becomes the dominant operating system for all enterprise workflows."
            points={[
              "Azure becomes a $150B+ annual run-rate business",
              "GitHub Copilot dominates the developer market",
              "Massive gaming expansion post-Activision integration"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
