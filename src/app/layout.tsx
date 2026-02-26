import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "InvestMoat | Professional Stock Analysis",
  description: "Analyze stock moats, growth potential, and intrinsic valuation for long-term investing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="main-container">
          <aside className="sidebar glass">
            <div style={{ marginBottom: '2.5rem' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                  <span className="primary-gradient" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>M</span>
                  InvestMoat
                </h2>
              </Link>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
              <Link href="/" className="nav-item">Dashboard</Link>
              <Link href="/portfolio" className="nav-item">Portfolio Distribution</Link>
              
              <div style={{ marginTop: '1.25rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Large Cap Tech</div>
              <Link href="/stocks/amazon" className="nav-item">Amazon (AMZN)</Link>
              <Link href="/stocks/meta" className="nav-item">Meta (META)</Link>
              <Link href="/stocks/msft" className="nav-item">Microsoft (MSFT)</Link>
              <Link href="/stocks/tesla" className="nav-item">Tesla (TSLA)</Link>
              
              <div style={{ marginTop: '1.25rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financials & SaaS</div>
              <Link href="/stocks/intuit" className="nav-item">Intuit (INTU)</Link>
              <Link href="/stocks/spgi" className="nav-item">S&P Global (SPGI)</Link>
              
              <div style={{ marginTop: '1.25rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hard Assets & Crypto</div>
              <Link href="/stocks/btc" className="nav-item">Bitcoin (BTC)</Link>
              <Link href="/stocks/k92" className="nav-item">K92 Mining (KNT)</Link>
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
              &copy; 2026 InvestMoat
            </div>
          </aside>
          
          <main className="content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
