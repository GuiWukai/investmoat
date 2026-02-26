import { ArrowUpRight, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { stockData } from "./stockData";

export default function HomePage() {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {stockData.map((stock) => (
            <Link key={stock.ticker} href={stock.href} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{stock.name}</h3>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{stock.ticker}</span>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', lineHeight: '1.4' }}>Wide-moat investment candidates.</p>
              </div>
              <ArrowUpRight size={18} color="var(--primary)" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
