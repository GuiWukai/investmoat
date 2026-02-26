import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Landmark, TrendingUp, Shield, BarChart3 } from "lucide-react";

export default function SPGlobalPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Financial Services</span>
          <span className="badge badge-success">Oligopoly Moat</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>S&P Global</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>SPGI</strong></span>
          <span>Market Cap: <strong>$142B</strong></span>
          <span>Price: <strong>$448.20</strong></span>
        </div>
        <RecommendationBadge status="Hold" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={97} label="Moat Score" description="A global duopoly with Moody's in debt ratings. Regulatory and brand moat." />
        <ScoreGauge score={78} label="Growth Score" description="Index licensing (S&P 500) and ESG data integration." />
        <ScoreGauge score={75} label="Valuation Score" description="Trading at a premium but justified by the 'toll bridge' business model." />
      </div>

      <AnalysisSection title="The Toll-Bridge Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>S&P Global operates a <strong>Financial Toll Bridge</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Regulatory Oligopoly:</strong> You cannot issue global debt without a rating from S&P or Moody's. It is a legally-embedded requirement for institutional investors.</li>
            <li><strong style={{ color: 'white' }}>IP Moat:</strong> The S&P 500 brand is the most licensed index in the world. Asset managers pay SPGI every time a new ETF is created.</li>
            <li><strong style={{ color: 'white' }}>Low Capex:</strong> Once the rating methodologies and data platforms are built, every additional dollar of revenue flows straight to the bottom line.</li>
          </ul>
        </div>
      </AnalysisSection>
      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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
      </AnalysisSection>
    </div>
  );
}
