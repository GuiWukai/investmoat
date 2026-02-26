import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Cpu, Zap, Target, Layers } from "lucide-react";

export default function AsmlPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Semiconductors</span>
          <span className="badge badge-success">Monopoly Moat</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>ASML Holding</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>ASML</strong></span>
          <span>Market Cap: <strong>$380B</strong></span>
          <span>Price: <strong>$945.80</strong></span>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="EUV Monopoly" 
          value="100%" 
          label="Market Share" 
          icon={<Target size={20} color="white" />} 
          color="#00a1e0"
        />
        <MetricCard 
          title="Gross Margin" 
          value="51.3%" 
          label="Sustained High Quality" 
          icon={<Zap size={20} color="white" />} 
          color="#10b981"
        />
        <MetricCard 
          title="R&D Intensity" 
          value="€4.0B" 
          label="Annual Investment" 
          icon={<Cpu size={20} color="white" />} 
          color="#3b82f6"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={99} label="Moat Score" description="The only company in the world capable of producing EUV machines required for &lt;7nm chips." />
        <ScoreGauge score={85} label="Growth Score" description="Moore's Law continues to drive demand for High-NA EUV and increased wafer capacity." />
        <ScoreGauge score={72} label="Valuation Score" description="High multiple but justified by being the bottleneck of the entire AI economy." />
      </div>

      <AnalysisSection title="The Strategic Bottleneck Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>ASML is the <strong>Sole Provider</strong> of the world's most complex machines:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>EUV Monopoly:</strong> Extreme Ultraviolet (EUV) lithography is required for every advanced chip from Apple, Nvidia, and Intel. ASML is the only company that can build them.</li>
            <li><strong style={{ color: 'white' }}>Technological Barrier:</strong> Developing EUV took 20+ years and billions in funding. A competitor would need decades to catch up.</li>
            <li><strong style={{ color: 'white' }}>Service Ecosystem:</strong> Once a machine is installed (costing $200M+), ASML generates recurring service revenue for 20+ years.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$750" 
            description="Geopolitical restrictions on China revenue tighten further."
            points={[
              "Banning of older DUV machine exports to China",
              "Slowdown in capacity expansion from major foundries (TSMC/Intel/Samsung)",
              "Cyclical downturn in consumer electronics demand"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$1,100" 
            description="Continued 2nm/3nm capacity buildout and High-NA rollout."
            points={[
              "Successful scaling of High-NA EUV production",
              "China revenue stabilized at lower but steady levels",
              "Consistent 15%+ EPS growth"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$1,400" 
            description="Massive acceleration in global foundry building (Sovereign Foundries)."
            points={[
              "Nations building domestic chip capacity significantly increases demand",
              "AI-driven demand for HBM and advanced logic exceeds all forecasts",
              "Substantial margin expansion from 'high-end' product mix shift"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
