import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { ShoppingCart, Cloud, Truck, DollarSign } from "lucide-react";

export default function AmazonPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Consumer Discretionary | Tech</span>
          <span className="badge badge-success">Strong Buy</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Amazon.com Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>AMZN</strong></span>
          <span>Market Cap: <strong>$1.92T</strong></span>
          <span>Current Price: <strong>$185.20</strong></span>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Revenue Growth" 
          value="13.2%" 
          label="YoY vs 11.5% Industry" 
          icon={<ShoppingCart size={20} color="white" />} 
          color="#f59e0b"
        />
        <MetricCard 
          title="AWS Margin" 
          value="31.8%" 
          label="Best-in-class profitability" 
          icon={<Cloud size={20} color="white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="Free Cash Flow" 
          value="$50.1B" 
          label="TTM Expansion +400%" 
          icon={<DollarSign size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge 
          score={95} 
          label="Moat Score" 
          description="Dominant scale, switching costs (Prime), and cost advantage (Logistics)." 
        />
        <ScoreGauge 
          score={88} 
          label="Growth Score" 
          description="Cloud (AWS) and Advertising continue to outpace e-commerce growth." 
        />
        <ScoreGauge 
          score={72} 
          label="Valuation Score" 
          description="Trading at 14x forward Cash Flow, slightly above historical mean." 
        />
      </div>

      <AnalysisSection title="The Economic Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>
            Amazon possesses a <strong>Wide Economic Moat</strong> driven by three primary pillars:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong style={{ color: 'white' }}>Cost Advantage:</strong> Its massive fulfillment infrastructure creates unit costs that no competitor can match, allowing for faster delivery and lower prices.
            </li>
            <li>
              <strong style={{ color: 'white' }}>High Switching Costs:</strong> The Prime ecosystem locks in consumers. Once a household is integrated into Prime, the convenience makes shopping elsewhere a "costly" friction.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Network Effect:</strong> The 3rd party marketplace creates a flywheel where more sellers attract more buyers, which attracts more sellers.
            </li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Financial Outlook">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem' }}>Growth Catalysts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                <span>Generative AI demand driving AWS infrastructure refresh.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                <span>Ad revenue margin expansion exceeding retail growth.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                <span>International retail segments turning profitable.</span>
              </div>
            </div>
          </div>
          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem' }}>Valuation Analysis</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              Using a 10-year DCF with a 9% WACC and a 3.5% terminal growth rate, our fair value estimate for AMZN is <strong>$215/share</strong>. With current trading at $185, this provides a 14% margin of safety.
            </p>
          </div>
        </div>
      </AnalysisSection>
      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$140" 
            description="Macro slowdown hits consumer spending and AWS margins compress."
            points={[
              "E-commerce growth falls below 5%",
              "AWS revenue decelerates to mid-teens",
              "Regulatory pressure on marketplace fees"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$210" 
            description="Continued efficiency gains in fulfillment and steady AWS growth."
            points={[
              "AWS growth stays in 17-20% range",
              "Advertising revenue remains major margin driver",
              "International retail reaches sustainable profit"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$265" 
            description="AI demand triggers massive AWS expansion and logistics monetization."
            points={[
              "AWS growth re-accelerates above 25%",
              "Logistics-as-a-service becomes 4th pillar",
              "Massive FCF generation leads to buybacks"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
