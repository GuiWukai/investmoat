import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { PenTool, Image, Zap, MousePointer2 } from "lucide-react";

export default function AdobePage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">SaaS | Creative</span>
          <span className="badge badge-success">Quality Compounder</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Adobe Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>ADBE</strong></span>
          <span>Market Cap: <strong>$215B</strong></span>
          <span>Price: <strong>$482.50</strong></span>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Digital Media ARR" 
          value="$15.7B" 
          label="Recurring Powerhouse" 
          icon={<PenTool size={20} color="white" />} 
          color="#ff0000"
        />
        <MetricCard 
          title="Gross Margin" 
          value="87.8%" 
          label="Software Dominance" 
          icon={<Zap size={20} color="white" />} 
          color="#f7b600"
        />
        <MetricCard 
          title="Creative Cloud Users" 
          value="30M+" 
          label="Market Standard" 
          icon={<Image size={20} color="white" />} 
          color="#3b82f6"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={96} label="Moat Score" description="The Creative Cloud is the global industry standard for design, photo, and video." />
        <ScoreGauge score={82} label="Growth Score" description="Generative AI (Firefly) integration driving higher tiers and retention." />
        <ScoreGauge score={64} label="Valuation Score" description="Reasonable multiple for a company with 30%+ net margins." />
      </div>

      <AnalysisSection title="The Creative Standard Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Adobe's moat is built on <strong>Network Effects and Professional Reliance</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Industry Standard:</strong> Photoshop, Premiere, and Illustrator are taught in universities. Hiring a designer means hiring someone who speaks "Adobe."</li>
            <li><strong style={{ color: 'white' }}>Firefly AI Advantage:</strong> Adobe's AI is trained on licensed content (Adobe Stock), making it safe for commercial use—a critical differentiator for enterprise clients.</li>
            <li><strong style={{ color: 'white' }}>Document Cloud:</strong> Acrobat and PDF standards Create a separate, massive moat in professional and business workflows.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$380" 
            description="AI disruption from startups (Midjourney/Canva) erodes the 'low-end' market."
            points={[
              "New ARR growth slows to single digits",
              "Pricing pressure from 'good enough' AI tools",
              "Integration of Figma-replacement features fails to gain traction"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$550" 
            description="Successful Firefly monetization and steady enterprise upgrades."
            points={[
              "Firefly adoption increases Creative Cloud ARPU by 5-8%",
              "Document Cloud continues to grow at high double digits",
              "Operating margins remain above 45% (non-GAAP)"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$680" 
            description="Adobe becomes the default generative AI platform for the enterprise."
            points={[
              "AI credit consumption drives massive revenue upside",
              "Complete automation of creative workflows attracts mass-market users",
              "Strategic partnership with major social media / ad platforms"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
