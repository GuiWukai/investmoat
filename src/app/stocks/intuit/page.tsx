import { MetricCard, ScoreGauge, AnalysisSection } from "@/components/AnalysisComponents";
import { Calculator, Wallet, BarChart, DollarSign } from "lucide-react";

export default function IntuitPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-info">FinTech | SaaS</span>
          <span className="badge badge-success">Quality Compounder</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Intuit Inc.</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>INTU</strong></span>
          <span>Market Cap: <strong>$185B</strong></span>
          <span>Price: <strong>$658.10</strong></span>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Subscriber Growth" 
          value="12%" 
          label="SBCB Segment Expansion" 
          icon={<Calculator size={20} color="white" />} 
          color="#2ca01c"
        />
        <MetricCard 
          title="Op. Margin" 
          value="24.5%" 
          label="GAAP Basis" 
          icon={<BarChart size={20} color="white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="Free Cash Flow" 
          value="$4.8B" 
          label="Strong Cash Conversion" 
          icon={<DollarSign size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={94} label="Moat Score" description="Extreme switching costs; once a SMB has QuickBooks, they almost never leave." />
        <ScoreGauge score={84} label="Growth Score" description="Credit Karma integration and AI-assisted tax filing driving ARPU." />
        <ScoreGauge score={62} label="Valuation Score" description="Consistent mid-20s P/E, fair for a high-quality compounder." />
      </div>

      <AnalysisSection title="The Ecosystem Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Intuit owns the <strong>Financial Workflow</strong> for small businesses and individuals:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Mission-Critical Software:</strong> QuickBooks is the system of record for millions. Migrating accounting data is a nightmare, creating a "sticky" moat.</li>
            <li><strong style={{ color: 'white' }}>Regulatory Tailwinds:</strong> Tax complexity ensures TurboTax remains a necessity for the consumer segment.</li>
            <li><strong style={{ color: 'white' }}>Data Advantage:</strong> Intuit sees more SMB transaction data than almost any bank, allowing for superior credit underwriting.</li>
          </ul>
        </div>
      </AnalysisSection>
    </div>
  );
}
