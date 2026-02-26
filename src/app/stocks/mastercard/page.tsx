import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { CreditCard, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";

export default function MastercardPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Financial Services</span>
          <span className="badge badge-success">Wide Moat</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Mastercard Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>MA</strong></span>
          <span>Market Cap: <strong>$440B</strong></span>
          <span>Price: <strong>$472.50</strong></span>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="GDV Growth" 
          value="12%" 
          label="Gross Dollar Volume ($)" 
          icon={<CreditCard size={20} color="white" />} 
          color="#eb001b"
        />
        <MetricCard 
          title="Net Margin" 
          value="45.8%" 
          label="Consistent Profitability" 
          icon={<ShieldCheck size={20} color="white" />} 
          color="#ff5f00"
        />
        <MetricCard 
          title="EPS CAGR" 
          value="18%" 
          label="5-Year Average" 
          icon={<TrendingUp size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={98} label="Moat Score" description="Critical global infrastructure with deep brand trust and technological advantage." />
        <ScoreGauge score={88} label="Growth Score" description="Faster growth than Visa in service revenue and data analytics." />
        <ScoreGauge score={70} label="Valuation Score" description="Trades at a premium (32x P/E) but justified by higher growth profile." />
      </div>

      <AnalysisSection title="The Services Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Mastercard is more than a network; it's a <strong>Data & Services Powerhouse</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Service Diversification:</strong> MA has been more aggressive in building security, fraud, and data analytics services, which are higher margin and stickier than core processing.</li>
            <li><strong style={{ color: 'white' }}>Technological Agility:</strong> Strong focus on open banking and digital identity solutions creates new moats in the evolving fintech landscape.</li>
            <li><strong style={{ color: 'white' }}>Global Presence:</strong> Strong positioning in Europe and emerging markets where digital adoption is accelerating.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$390" 
            description="Valuation multiple contraction and regulatory headwinds in cross-border fees."
            points={[
              "P/E compresses to 25x due to growth fears",
              "New competition from domestic digital wallets (e.g., India, SE Asia)",
              "Slower than expected recovery in high-yielding travel volume"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$520" 
            description="Double-digit top and bottom line growth continues."
            points={[
              "Cross-border volume remains robust",
              "Cybersecurity and data services grow at 20%+",
              "Share buybacks continue to drive EPS growth"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$610" 
            description="Massive acceleration in commercial payments and value-added services."
            points={[
              "Commercial B2B volume exceeds $2.5T",
              "Margins expand significantly due to automation",
              "New digital currency infrastructure becomes a standard protocol"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
