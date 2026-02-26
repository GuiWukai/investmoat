import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { CreditCard, Globe, Zap, DollarSign } from "lucide-react";

export default function VisaPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Financial Services</span>
          <span className="badge badge-success">Wide Moat</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Visa Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>V</strong></span>
          <span>Market Cap: <strong>$550B</strong></span>
          <span>Price: <strong>$282.10</strong></span>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={99} label="Moat Score" description="The world's largest payment network with massive barriers to entry and network effects." />
        <ScoreGauge score={82} label="Growth Score" description="Ongoing shift from cash to digital and expansion into B2B payments." />
        <ScoreGauge score={75} label="Valuation Score" description="Trading at 28x forward P/E, reasonable for a consistent 15%+ EPS compounder." />
      </div>

      <AnalysisSection title="The Duopoly Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Visa operates a <strong>Global Toll Bridge</strong> for commerce:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Network Effect:</strong> More merchants accept Visa because more consumers carry the card. More consumers carry the card because more merchants accept it. A classic winner-take-all flywheel.</li>
            <li><strong style={{ color: 'white' }}>High Barriers to Entry:</strong> The infrastructure required to process 250+ billion transactions annually with zero downtime is nearly impossible to replicate.</li>
            <li><strong style={{ color: 'white' }}>Operating Leverage:</strong> Once code is written, an additional transaction costs virtually nothing, leading to industry-leading margins.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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
    </div>
  );
}
