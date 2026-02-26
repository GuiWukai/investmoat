import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard } from "@/components/AnalysisComponents";
import { Users, Cpu, Share2, DollarSign } from "lucide-react";

export default function MetaPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">Communication Services | AI</span>
          <span className="badge badge-success">Accumulate</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Meta Platforms</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>META</strong></span>
          <span>Market Cap: <strong>$1.25T</strong></span>
          <span>Current Price: <strong>$492.30</strong></span>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Daily Active People" 
          value="3.24B" 
          label="+7% YoY Reach" 
          icon={<Users size={20} color="white" />} 
          color="#1877F2"
        />
        <MetricCard 
          title="Operating Margin" 
          value="38.2%" 
          label="Efficiency Year Impact" 
          icon={<Share2 size={20} color="white" />} 
          color="#05070a"
        />
        <MetricCard 
          title="Ad Revenue" 
          value="$38.7B" 
          label="Quarterly (Q4 2024)" 
          icon={<DollarSign size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge 
          score={92} 
          label="Moat Score" 
          description="Unrivaled social graph and network effects across IG, WhatsApp, FB." 
        />
        <ScoreGauge 
          score={85} 
          label="Growth Score" 
          description="AI-driven ad targeting and Llama ecosystem monetization." 
        />
        <ScoreGauge 
          score={65} 
          label="Valuation Score" 
          description="Trading at 24x forward P/E, near historical upper bound." 
        />
      </div>

      <AnalysisSection title="The Economic Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>
            Meta's moat is built on <strong>Network Effects</strong> and <strong>Data Advantages</strong>:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong style={{ color: 'white' }}>Network Effect:</strong> Each new user on Instagram or WhatsApp increases the value for existing users. The cost to leave (social exclusion) is extremely high.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Proprietary Data:</strong> Meta possesses the world's most detailed interest graph, allowing for programmatic advertising precision that competitors cannot replicate.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Infrastructure:</strong> Massive GPU clusters (H100/B200) create a barrier to entry for AI-driven recommendation engines.
            </li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Growth catalysts (AI Focus)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem' }}>Llama Ecosystem</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              Open-sourcing Llama makes Meta the default standard for enterprise AI infrastructure, reducing their own R&D costs while commoditizing competitors' proprietary models.
            </p>
          </div>
          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem' }}>Reels & AI Creative</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              AI-generated ad creatives and video recommendations are significantly increasing time spent per user and conversion rates for advertisers.
            </p>
          </div>
        </div>
      </AnalysisSection>
      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$350" 
            description="Engagement declines due to TikTok/competition and ad market weakens."
            points={[
              "DAP growth turns negative in top markets",
              "Operating margins contract back to sub-30%",
              "Massive AI CapEx fails to yield ROI"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$550" 
            description="Steady ad revenue and AI integration improves targeting/monetization."
            points={[
              "Ad revenue grows 10-12% annually",
              "Reels reaches parity with main feed revenue",
              "Free cash flow supports significant buybacks"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$750" 
            description="Llama becomes the industry standard and Threads monetization explodes."
            points={[
              "Enterprise AI licensing becomes major revenue stream",
              "Threads captures significant X (Twitter) market share",
              "Metaverse R&D burns decrease significantly"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
