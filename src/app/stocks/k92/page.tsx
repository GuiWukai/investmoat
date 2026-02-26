import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Pickaxe, Drill, Zap, Gem, CheckCircle } from "lucide-react";

export default function K92Page() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-warning">Materials | Gold Mining</span>
          <span className="badge badge-success">Speculative Buy</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>K92 Mining Ltd.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)', flexWrap: 'wrap' }}>
          <span>Ticker: <strong>KNT (TSX)</strong></span>
          <span>Market Cap: <strong>~$3.9B (CAD)</strong></span>
          <span>Price: <strong>~$27 CAD</strong></span>
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
          value="~$1,010/oz"
          label="2025 Actual (By-Product Basis)"
          icon={<Pickaxe size={20} color="white" />}
          color="#64748b"
        />
        <MetricCard
          title="2025 Annual Production"
          value="174k oz AuEq"
          label="Record; 2026E: 190k–225k oz"
          icon={<Zap size={20} color="white" />}
          color="#10b981"
        />
        <MetricCard
          title="Stage 3 Plant"
          value="Commissioned"
          label="Completed December 2025"
          icon={<CheckCircle size={20} color="white" />}
          color="#6366f1"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge
          score={65}
          label="Moat Score"
          description="World-class high-grade orebody; Stage 3 execution proves operational quality. PNG jurisdictional risk remains the key offset."
        />
        <ScoreGauge
          score={90}
          label="Growth Score"
          description="Stage 3 plant commissioned (Dec 2025); Stage 4 expansion underway targeting 400k+ oz run-rate. 2026 guidance implies 9–29% YoY production growth."
        />
        <ScoreGauge
          score={60}
          label="Valuation Score"
          description="Stock up ~164% YoY, now trading near analyst consensus (~$27–33 CAD target). Meaningful upside only on Stage 4 execution or gold price re-rating."
        />
      </div>

      <AnalysisSection title="The Mining Moat (Asset Quality)">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>
            In mining, the &quot;moat&quot; is the <strong>Quality of the Orebody</strong>:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong style={{ color: 'white' }}>Exceptional Grades:</strong> K92&apos;s Kainantu mine averages ~10.2 g/t gold — top 5% globally. High grades provide a massive margin cushion during gold price downturns and justify the PNG risk premium.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Proven Execution:</strong> Stage 3 1.2 Mtpa process plant commissioned in December 2025, hitting daily throughput records within weeks. Record 2025 annual production of 174k oz AuEq came in at the upper end of guidance — the fourth consecutive year of beating targets.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Exploration Engine:</strong> The Kora and Judd vein systems remain open in multiple directions. A record $31–35M exploration program is planned for 2026, including two additional drill rigs arriving in Q1. The Blue Lake Porphyry could be a company-defining discovery.
            </li>
            <li>
              <strong style={{ color: 'white' }}>Strong Balance Sheet:</strong> Record cash position of $183M (including $124M net cash) entering 2026 provides full funding for Stage 4 without dilutive equity raises.
            </li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Stage 3 Complete — Stage 4 Now Underway">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '1rem' }}>The Transformation Journey</h4>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
            The Stage 3 milestone has been achieved. The new 1.2 Mtpa process plant completed commissioning in December 2025, with ~95% of Stage 3 growth capital spent or committed. Attention now turns to Stage 4, which will push run-rate production toward <strong>400,000+ oz AuEq annually</strong>. K92 is allocating $75–80M in Stage 4 growth capital in 2026 alone.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>2024 Actual</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>150k oz AuEq</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>2025 Actual (Record)</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>174k oz AuEq</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>2026 Guidance</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>190–225k oz</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Stage 4 Run-Rate</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>400k+ oz AuEq</div>
            </div>
          </div>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            Production is expected to be weighted to H2 2026, as key enabler projects (pastefill plant, fleet expansion, power upgrade to 15.3 MW, 60-tonne truck river crossings) complete mostly in H1 2026.
          </p>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard
            type="Bear"
            priceTarget="$16.00"
            description="Gold falls below $2,200 and Stage 4 faces significant delays."
            points={[
              "PNG jurisdictional risk leads to tax/permit disruptions",
              "Stage 4 commissioning pushed back 12+ months",
              "Rising costs squeeze margins if gold price drops"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$30.00"
            description="Stage 4 ramp-up proceeds on schedule with gold holding above $2,700."
            points={[
              "2026 production reaches the top half of 190–225k oz guidance",
              "Stage 4 DFS confirms 400k+ oz pathway, re-rates the stock",
              "Analysts upgrade targets to the $33–38 CAD range"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$45.00"
            description="Gold surges above $3,500 and Stage 4 delivers ahead of schedule."
            points={[
              "Total production exceeds 350k oz in 2027, 400k+ by 2028",
              "Major gold producer tables an acquisition bid",
              "Blue Lake Porphyry emerges as a world-class discovery"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
