import { ArrowUpRight, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const stocks = [
    { name: "Amazon.com Inc.", ticker: "AMZN", desc: "The ultimate ecosystem moat powered by AWS and Logistics.", href: "/stocks/amazon" },
    { name: "Meta Platforms", ticker: "META", desc: "Unrivaled network effects across social media and AI infrastructure.", href: "/stocks/meta" },
    { name: "Microsoft Corp.", ticker: "MSFT", desc: "The enterprise standard with massive AI and Cloud tailwinds.", href: "/stocks/msft" },
    { name: "Tesla Inc.", ticker: "TSLA", desc: "Vertically integrated leader in EV, Energy, and Autonomy.", href: "/stocks/tesla" },
    { name: "Intuit Inc.", ticker: "INTU", desc: "High-switching cost platform for small business and tax software.", href: "/stocks/intuit" },
    { name: "S&P Global", ticker: "SPGI", desc: "Oligopoly control over global debt ratings and financial data.", href: "/stocks/spgi" },
    { name: "K92 Mining Ltd.", ticker: "KNT", desc: "High-grade gold production with massive exploration upside.", href: "/stocks/k92" },
  ];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Investment Intelligence</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.2rem', maxWidth: '600px' }}>
          Deep-dive analysis of wide-moat companies, growth catalysts, and value-based entry points.
        </p>
      </header>

      <div className="metric-grid">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div className="primary-gradient" style={{ padding: '0.75rem', borderRadius: '12px' }}>
              <ShieldCheck size={24} color="white" />
            </div>
            <span className="badge badge-info">Strategic Asset</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Economic Moats</h3>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            We identify sustainable competitive advantages: Brand, Network Effects, Switching Costs, and Cost Advantages.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ background: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
              <TrendingUp size={24} color="white" />
            </div>
            <span className="badge badge-success">Growth Factor</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hyper-Growth</h3>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            Analyzing revenue expansion, margin scaling, and TAM penetration for long-term compounding.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}>
              <BarChart3 size={24} color="white" />
            </div>
            <span className="badge badge-warning">Value Margin</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Valuation</h3>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            DCF analysis and relative multiples to ensure a proper margin of safety before deployment.
          </p>
        </div>
      </div>

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Portfolio Coverage</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {stocks.map((stock) => (
            <Link key={stock.ticker} href={stock.href} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{stock.name}</h3>
                  <span className="badge badge-info">{stock.ticker}</span>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{stock.desc}</p>
              </div>
              <ArrowUpRight size={20} color="var(--primary)" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
