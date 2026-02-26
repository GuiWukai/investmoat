import { PieChart, List, Target, ShieldCheck } from "lucide-react";

export default function PortfolioPage() {
  const distribution = [
    { ticker: "MSFT", name: "Microsoft", weight: 15, color: "#00a4ef", category: "Core SaaS" },
    { ticker: "AMZN", name: "Amazon", weight: 15, color: "#f59e0b", category: "Eco-System" },
    { ticker: "META", name: "Meta", weight: 12, color: "#1877F2", category: "Social Network" },
    { ticker: "V", name: "Visa", weight: 10, color: "#1a1f71", category: "Payments Moat" },
    { ticker: "MA", name: "Mastercard", weight: 10, color: "#eb001b", category: "Payments Moat" },
    { ticker: "BTC", name: "Bitcoin", weight: 10, color: "#f7931a", category: "Digital Asset" },
    { ticker: "SPGI", name: "S&P Global", weight: 8, color: "#cf102d", category: "Financial Duopoly" },
    { ticker: "INTU", name: "Intuit", weight: 8, color: "#2ca01c", category: "FinTech" },
    { ticker: "TSLA", name: "Tesla", weight: 7, color: "#cc0000", category: "Engineered Growth" },
    { ticker: "KNT", name: "K92 Mining", weight: 5, color: "#64748b", category: "Commodity Upside" },
  ];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Portfolio Distribution</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.2rem', maxWidth: '600px' }}>
          Optimized allocation based on moat durability, growth acceleration, and risk-adjusted valuation.
        </p>
      </header>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PieChart size={24} color="var(--primary)" />
            Visual Allocation
          </h3>
          <div style={{ display: 'flex', height: '40px', borderRadius: '10px', overflow: 'hidden', marginBottom: '2rem' }}>
            {distribution.map((stock) => (
              <div 
                key={stock.ticker} 
                style={{ 
                  width: `${stock.weight}%`, 
                  background: stock.color, 
                  height: '100%',
                  transition: 'width 1s ease-in-out'
                }} 
                title={`${stock.name}: ${stock.weight}%`}
              />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {distribution.map((stock) => (
              <div key={stock.ticker} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: stock.color, flexShrink: 0 }}></div>
                <span style={{ fontWeight: 600 }}>{stock.ticker}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>{stock.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} color="var(--accent)" />
            Strategy Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Profile</div>
              <div style={{ fontWeight: 600 }}>Wide Moat Diversification</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Concentration</div>
              <div style={{ fontWeight: 600 }}>Top 5 (Big Tech + Payments) = 62%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Network Effect Exposure</div>
              <div style={{ fontWeight: 600 }}>85% of AUM</div>
            </div>
          </div>
        </div>
      </div>

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <List size={24} color="var(--primary)" />
          Allocation Breakdown
        </h2>
        <div className="glass-card" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Asset</th>
                <th style={{ padding: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Category</th>
                <th style={{ padding: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Target Weight</th>
                <th style={{ padding: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Conviction</th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((stock) => (
                <tr key={stock.ticker} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{stock.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{stock.ticker}</div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{stock.category}</span>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stock.weight}%</div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            width: '12px', 
                            height: '4px', 
                            borderRadius: '2px', 
                            background: i < Math.ceil(stock.weight / 3.5) ? 'var(--primary)' : 'var(--glass-border)' 
                          }} 
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
