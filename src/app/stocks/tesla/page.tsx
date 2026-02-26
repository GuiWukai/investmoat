import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Zap, Car, Battery, Cpu } from "lucide-react";

export default function TeslaPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-warning">Automotive | Energy</span>
          <span className="badge badge-info">Growth Pioneer</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Tesla Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>TSLA</strong></span>
          <span>Market Cap: <strong>$560B</strong></span>
          <span>Price: <strong>$175.20</strong></span>
        </div>
        <RecommendationBadge status="Hold" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Vehicle Deliveries" 
          value="1.81M" 
          label="Trailing 12 Months" 
          icon={<Car size={20} color="white" />} 
          color="#cc0000"
        />
        <MetricCard 
          title="Energy Storage" 
          value="14.7 GWh" 
          label="125% YoY Growth" 
          icon={<Battery size={20} color="white" />} 
          color="#10b981"
        />
        <MetricCard 
          title="FSD Miles" 
          value="1.3B+" 
          label="Data Advantage" 
          icon={<Cpu size={20} color="white" />} 
          color="#3b82f6"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={82} label="Moat Score" description="Vertical integration and massive manufacturing cost advantages." />
        <ScoreGauge score={89} label="Growth Score" description="Robotics (Optimus) and energy storage are the next 10x frontier." />
        <ScoreGauge score={55} label="Valuation Score" description="High P/E reflects optionality, but core auto margins are pressured." />
      </div>

      <AnalysisSection title="The Vertical Integration Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Tesla's moat isn't just "selling cars", it's <strong>Manufacturing Complexity</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Cost Advantage:</strong> From battery chem to casting machines, Tesla's unit cost for EVs is unmatched by legacy OEMs.</li>
            <li><strong style={{ color: 'white' }}>Data Flywheel:</strong> Millions of cars on the road feeding data into Tesla's AI Dojo training cluster creates a gap in autonomous software.</li>
            <li><strong style={{ color: 'white' }}>Brand Authority:</strong> Zero marketing spend with 100% brand recognition creates a unique customer acquisition advantage.</li>
          </ul>
        </div>
      </AnalysisSection>
      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$100" 
            description="EV margins continue to slide and FSD timeline is pushed indefinitely."
            points={[
              "Auto gross margins fall below 12%",
              "Competition from BYD/Xiaomi erodes China share",
              "Robotaxi regulatory hurdles remain insurmountable"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$220" 
            description="Stabilizing margins and high growth in Energy Storage offset EV cyclicality."
            points={[
              "Next-gen platform ('Model 2') enters production",
              "Energy storage deployment grows 100% YoY",
              "FSD licensing talks with major OEMs begin"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$450" 
            description="Robotaxi network launch and Optimus robotics production readiness."
            points={[
              "Software revenue becomes &gt;30% of total EBIT",
              "Unsupervised FSD approved in major US cities",
              "Tesla Energy becomes as large as the Auto business"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
