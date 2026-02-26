import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Play, Users, Globe, TrendingUp } from "lucide-react";

export default function NetflixPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Tech | Media</span>
          <span className="badge badge-success">Scaling Leader</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Netflix Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>NFLX</strong></span>
          <span>Market Cap: <strong>$265B</strong></span>
          <span>Price: <strong>$612.40</strong></span>
        </div>
        <RecommendationBadge status="Hold" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Paid Members" 
          value="270M" 
          label="Global Scale" 
          icon={<Users size={20} color="white" />} 
          color="#e50914"
        />
        <MetricCard 
          title="FCF Generation" 
          value="$6.5B" 
          label="Expected 2024" 
          icon={<TrendingUp size={20} color="white" />} 
          color="#10b981"
        />
        <MetricCard 
          title="Content Spend" 
          value="$17B" 
          label="Annual Budget" 
          icon={<Play size={20} color="white" />} 
          color="#3b82f6"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={85} label="Moat Score" description="Massive scale allows for better unit economics on content than any competitor." />
        <ScoreGauge score={88} label="Growth Score" description="Ad-tier expansion and paid sharing crackdown continue to drive ARPU and sub growth." />
        <ScoreGauge score={52} label="Valuation Score" description="Trading at 35x P/E, requires high execution on ad-revenue targets." />
      </div>

      <AnalysisSection title="The Scale Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Netflix's advantage is its <strong>Content Efficiency</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Unit Economics of Joy:</strong> With 270M subs, a $100M show costs Netflix $0.37 per subscriber. For a competitor with 50M subs, that same show costs $2.00. This is the ultimate barrier.</li>
            <li><strong style={{ color: 'white' }}>Data Flywheel:</strong> Their recommendation engine reduces churn and ensures that content spend is targeted at the highest-probability hits.</li>
            <li><strong style={{ color: 'white' }}>Global Reach:</strong> Unlike US-centric platforms, Netflix is truly global, with local language content driving growth in EMEA, APAC, and LATAM.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$450" 
            description="Ad-tier adoption cannibalizes higher price plans and churn rises."
            points={[
              "ARM (Average Revenue per Member) growth stagnates",
              "Major competitors (YouTube/Disney) win more 'watch time' share",
              "Increase in content production costs due to inflation"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$680" 
            description="Successful monetization of ad-tier and steady subscriber gains."
            points={[
              "Ad-revenue becomes a meaningful 10% portion of total top-line",
              "Operating margins expand beyond 25% target",
              "Continued success in non-English content exports"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$850" 
            description="Netflix becomes the default 'Live TV' replacement including sports."
            points={[
              "Live sports (WWE/NFL) drive a new massive wave of ad-inventory",
              "Gaming integration leads to material improvement in churn and engagement",
              "ARM exceeds $20 in core US/EU markets"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
