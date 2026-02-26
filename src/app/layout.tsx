import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { stockData, getAverageScore } from "./stockData";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "InvestMoat | Professional Stock Analysis",
  description: "Analyze stock moats, growth potential, and intrinsic valuation for long-term investing.",
};

function NavStockItem({ stock }: { stock: typeof stockData[0] }) {
  const avg = getAverageScore(stock.scores);
  const getScoreColor = (s: number) => {
    if (s >= 90) return '#10b981';
    if (s >= 80) return '#3b82f6';
    if (s >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Link href={stock.href} className="nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{stock.name} ({stock.ticker})</span>
      <span style={{ 
        fontSize: '0.7rem', 
        fontWeight: 800, 
        background: 'rgba(255,255,255,0.05)', 
        padding: '2px 6px', 
        borderRadius: '4px',
        color: getScoreColor(avg),
        border: `1px solid ${getScoreColor(avg)}33`
      }}>
        {avg}
      </span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <div className="main-container">
            <aside className="sidebar glass">
              <div style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                    <span className="primary-gradient" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>M</span>
                    InvestMoat
                  </h2>
                </Link>
              </div>
              
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
                <Link href="/" className="nav-item">Dashboard</Link>
                <Link href="/portfolio" className="nav-item">Portfolio Distribution</Link>
                
                <div style={{ marginTop: '1rem', marginBottom: '0.4rem', fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Large Cap Tech</div>
                {stockData.filter(s => s.category === 'Big Tech').map(s => <NavStockItem key={s.ticker} stock={s} />)}
                
                <div style={{ marginTop: '1rem', marginBottom: '0.4rem', fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financials & SaaS</div>
                {stockData.filter(s => s.category === 'Financials').map(s => <NavStockItem key={s.ticker} stock={s} />)}
                
                <div style={{ marginTop: '1rem', marginBottom: '0.4rem', fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hard Assets & Crypto</div>
                {stockData.filter(s => s.category === 'Hard Assets').map(s => <NavStockItem key={s.ticker} stock={s} />)}
              </nav>

              <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                &copy; 2026 InvestMoat
              </div>
            </aside>
            
            <main className="content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
