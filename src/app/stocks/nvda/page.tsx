import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Cpu, Zap, HardDrive, Share2 } from "lucide-react";

export default function NvidiaPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Semiconductors | AI</span>
          <span className="badge badge-success">Wide Moat</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>NVIDIA Corp.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>NVDA</strong></span>
          <span>Market Cap: <strong>$2.2T</strong></span>
          <span>Price: <strong>$890.30</strong></span>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Data Center Growth" 
          value="409%" 
          label="YoY Expansion" 
          icon={<Cpu size={20} color="white" />} 
          color="#76b900"
        />
        <MetricCard 
          title="Gross Margin" 
          value="76.0%" 
          label="Best-in-class pricing power" 
          icon={<Zap size={20} color="white" />} 
          color="#10b981"
        />
        <MetricCard 
          title="Free Cash Flow" 
          value="$27.0B" 
          label="Trailing 12 Months" 
          icon={<HardDrive size={20} color="white" />} 
          color="#3b82f6"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={97} label="Moat Score" description="CUDA software ecosystem and Blackwell architecture lead create nearly insurmountable barriers." />
        <ScoreGauge score={95} label="Growth Score" description="Generative AI infrastructure cycle is only in the early innings." />
        <ScoreGauge score={65} label="Valuation Score" description="Trading at 35x forward P/E, which is reasonable given hyper-growth profile." />
      </div>

      <AnalysisSection title="The Ecosystem Moat (CUDA)">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Nvidia's moat isn't just "fast chips", it's the <strong>Full-Stack Software Advantage</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>CUDA Software Ecosystem:</strong> With over 4 million developers, CUDA is the industry standard. Moving to another hardware provider requires rewriting massive amounts of code.</li>
            <li><strong style={{ color: 'white' }}>Innovation Velocity:</strong> Nvidia has moved to a 1-year product cycle (Hopper -> Blackwell -> Rubin), staying ahead of competitors who are still catching up to the last generation.</li>
            <li><strong style={{ color: 'white' }}>Infiniband Networking:</strong> Their integration of networking (Mellanox) allows them to sell high-margin full-racks, not just individual GPUs.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$650" 
            description="Hyperscaler 'digestion' period and supply chain glut."
            points={[
              "Cloud providers slow down data center buildouts",
              "ASIC competition (internal chips from Google/Amazon) takes share",
              "Geopolitical tensions further restrict China revenue"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$950" 
            description="Continued Blackwell demand and transition to sovereign AI."
            points={[
              "Data center revenue remains above $25B per quarter",
              "Sovereign AI (nations building own clusters) becomes new growth vector",
              "Strong double-digit growth in Automotive and Robotics"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$1,200+" 
            description="Enterprise AI boom and CUDA-as-a-service monetization."
            points={[
              "Every Fortune 500 company builds proprietary AI models",
              "Software revenue becomes a material part of the bottom line",
              "Dominance in the humanoid robotics (Optimus/Figure) supply chain"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
