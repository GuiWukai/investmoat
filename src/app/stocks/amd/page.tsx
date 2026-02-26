import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Cpu, Share2, Layers, Zap } from "lucide-react";

export default function AmdPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Semiconductors | AI</span>
          <span className="badge badge-success">Growth Compounder</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Advanced Micro Devices</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>AMD</strong></span>
          <span>Market Cap: <strong>$280B</strong></span>
          <span>Price: <strong>$172.40</strong></span>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Data Center Rev" 
          value="$2.3B" 
          label="80% YoY Growth" 
          icon={<Cpu size={20} color="white" />} 
          color="#ed1c24"
        />
        <MetricCard 
          title="Instinct Pipeline" 
          value="$4.0B+" 
          label="MI300 Series Momentum" 
          icon={<Zap size={20} color="white" />} 
          color="#00a4ef"
        />
        <MetricCard 
          title="Client Segment" 
          value="46%" 
          label="Ryzen Market Share (Q4)" 
          icon={<Layers size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={88} label="Moat Score" description="Strong positioning as the primary x86 alternative and growing software (ROCm) ecosystem." />
        <ScoreGauge score={92} label="Growth Score" description="Catching up rapidly in the AI accelerator market with chiplet architectures." />
        <ScoreGauge score={58} label="Valuation Score" description="High P/E (45x) requires high execution to justify multiple." />
      </div>

      <AnalysisSection title="The Chiplet Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>AMD's advantage lies in <strong>Architectural Efficiency</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Chiplet Innovation:</strong> AMD led the transition to chiplets, allowing for higher yields and more flexible SKU creation compared to monolithic designs.</li>
            <li><strong style={{ color: 'white' }}>x86 Market Share Capture:</strong> Continues to erode Intel's dominance in the server (EPYC) and consumer (Ryzen) markets.</li>
            <li><strong style={{ color: 'white' }}>Open Ecosystem:</strong> ROCm software suite is becoming a viable open-source alternative to Nvidia's proprietary CUDA, attracting hyperscalers looking for vendor flexibility.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$120" 
            description="Intel re-captures server market and MI300 series adoption stalls."
            points={[
              "Intel's 18A process node beats expectations",
              "ROCm software fails to achieve critical developer weight",
              "PC market recovery significantly underwhelms"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$210" 
            description="Continued steady EPYC share gains and $5B+ in AI revenue."
            points={[
              "AI GPU revenue meets or exceeds raised guidance",
              "Server market share reaches 35%+",
              "Client PC segment returns to mid-single digit growth"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$280" 
            description="AMD becomes the true 'Second Source' for global AI infrastructure."
            points={[
              "MI350/400 series achieve performance parity with Nvidia",
              "Substantial licensing of ROCm by major cloud providers",
              "Strategic acquisition of a major networking or software player"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
