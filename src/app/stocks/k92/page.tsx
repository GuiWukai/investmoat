import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Pickaxe, Drill, Zap, Gem } from "lucide-react";

export default function K92Page() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-warning">Materials | Gold Mining</span>
          <span className="badge badge-success">Speculative Buy</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>K92 Mining Ltd.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>KNT (TSX)</strong></span>
          <span>Market Cap: <strong>$1.45B (CAD)</strong></span>
          <span>Mine: <strong>Kainantu, PNG</strong></span>
        </div>
        <RecommendationBadge status="Speculative Buy" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Gold Grade" 
          value="10.2 g/t" 
          label="Top 5% Globally (High Grade)" 
          icon={<Gem size={20} color="white" />} 
          color="#f59e0b"
        />
        <MetricCard 
          title="All-In Sustaining Cost" 
          value="$950/oz" 
          label="Low Cost Producer" 
          icon={<Pickaxe size={20} color="white" />} 
          color="#64748b"
        />
        <MetricCard 
          title="Annual Production" 
          value="145k oz" 
          label="Targeting 300k+ by 2026" 
          icon={<Zap size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge 
          score={60} 
          label="Moat Score" 
          description="High-grade resource is the primary moat; jurisdictional risk (PNG) is the offset." 
        />
        <ScoreGauge 
          score={95} 
          label="Growth Score" 
          description="Stage 3 & 4 expansions set to more than double production profiles." 
        />
        <ScoreGauge 
          score={82} 
          label="Valuation Score" 
          description="Trading at 4x forward P/CF, significantly undervalued vs senior peers." 
        />
      </div>

      <AnalysisSection title="The Mining Moat (Asset Quality)">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>
            In mining, the "moat" is the <strong>Quality of the Orebody</strong>:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong style={{ color: 'white' }}>Exceptional Grades:</strong> K92's Kainantu mine is one of the highest-grade gold mines in the world. High grades provide a massive cushion during commodity price downturns.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Exploration Upside:</strong> The system remains open in multiple directions. They have a track record of replacing every ounce mined with multiple ounces through the drill bit.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Operational Excellence:</strong> Rapid development from explorer to producer with consistent quarterly meeting of guidance.
            </li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Stage 3 & 4 Expansion">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '1rem' }}>The Transformation Journey</h4>
          <p style={{ color: 'var(--muted-foreground)' }}>
            K92 is currently in the middle of two massive expansion phases. By 2026, the company expects to produce over <strong>350,000 gold equivalent ounces</strong> annually, transforming it from a junior producer to a mid-tier mining powerhouse.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>2024 Profile</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>145k oz AuEq</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>2026 Target</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>300k+ oz AuEq</div>
            </div>
          </div>
        </div>
      </AnalysisSection>
      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$5.50" 
            description="Gold price drops below $2000 and expansion projects face delays."
            points={[
              "PNG jurisdictional risk leads to tax/permit issues",
              "Stage 3 commissioning delayed by 12+ months",
              "Production grades underperform geological model"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$12.00" 
            description="Stage 3 expansion success with gold prices holding >$2300."
            points={[
              "Production grows to 250k+ oz annually",
              "AISC (All-In Sustaining Costs) remains in bottom quartile",
              "Continued exploration success at Kora/Judd"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$18.00" 
            description="Gold hits $3000 and Stage 4 expansion proves a world-class resource."
            points={[
              "Total production exceeds 400k oz per year",
              "Major gold producer makes an acquisition bid",
              "Massive new porphyry discovery on property"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
