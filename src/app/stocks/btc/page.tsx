import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard } from "@/components/AnalysisComponents";
import { Coins, Shield, Globe, Lock } from "lucide-react";

export default function BitcoinPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-warning">Digital Asset</span>
          <span className="badge badge-success">Digital Gold</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Bitcoin</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
          <span>Ticker: <strong>BTC</strong></span>
          <span>Market Cap: <strong>$1.3T</strong></span>
          <span>Circulating Supply: <strong>19.7M / 21M</strong></span>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <MetricCard 
          title="Hash Rate" 
          value="650 EH/s" 
          label="Network Security Standard" 
          icon={<Lock size={20} color="white" />} 
          color="#f7931a"
        />
        <MetricCard 
          title="Exchange Balance" 
          value="1.8M BTC" 
          label="Multi-year Lows (Illicit Supply)" 
          icon={<Shield size={20} color="white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="Address Count" 
          value="52.4M" 
          label="Unique Holders Worldwide" 
          icon={<Globe size={20} color="white" />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        <ScoreGauge score={99} label="Moat Score" description="Absolute scarcity and the largest decentralized network effect in history." />
        <ScoreGauge score={85} label="Growth Score" description="Institutional adoption via ETFs and sovereign treasury integration." />
        <ScoreGauge score={50} label="Valuation Score" description="Relative to M2 money supply and gold market cap parity." />
      </div>

      <AnalysisSection title="The Scarcity Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>Bitcoin's moat is built on <strong>Math and Decentralization</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Absolute Scarcity:</strong> Only 21 million will ever exist. Unlike fiat or even gold, the supply curve is perfectly inelastic to demand.</li>
            <li><strong style={{ color: 'white' }}>Network Effect:</strong> As the first and largest crypto asset, Bitcoin has the most liquidity, securest chain, and widest institutional support.</li>
            <li><strong style={{ color: 'white' }}>Property Rights:</strong> A global, permissionless system for storing value that is independent of any central bank or government.</li>
          </ul>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScenarioCard 
            type="Bear" 
            priceTarget="$45,000" 
            description="Severe regulatory crackdown and a mass-market risk-off event."
            points={[
              "Banning of self-custody wallets in major jurisdictions",
              "Major ETF provider liquidation due to insolvency",
              "Recession leads to liquidations across all risk assets"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$95,000" 
            description="Continued ETF inflows and steady adoption as a gold alternative."
            points={[
              "Institutional weighting increases to 1-2% in traditional portfolios",
              "Inflation remains sticky, driving demand for hard assets",
              "Development of Bitcoin Layer 2s increases network utility"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$250,000+" 
            description="Sovereign nation adoption and global currency volatility."
            points={[
              "Global central banks begin adding BTC to reserves",
              "Major Fortune 500 companies follow MicroStrategy's treasury model",
              "Hyper-inflation in G7 currencies triggers global flight to safety"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
