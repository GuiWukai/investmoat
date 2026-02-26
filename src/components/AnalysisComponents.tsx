import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

export function MetricCard({ title, value, label, icon, color = 'var(--primary)' }: MetricCardProps) {
  return (
    <div className="glass-card animate-fade-in" style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ background: color, padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{title}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  );
}

interface ScoreGaugeProps {
  score: number;
  label: string;
  description: string;
}

export function ScoreGauge({ score, label, description }: ScoreGaugeProps) {
  const rotation = (score / 100) * 180;
  
  return (
    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', minWidth: '240px' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{label}</h3>
      <div style={{ position: 'relative', height: '120px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '12px solid #1e293b', margin: '0 auto' }}></div>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 'calc(50% - 100px)', 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%', 
          border: '12px solid transparent',
          borderTopColor: 'var(--primary)',
          borderRightColor: score > 50 ? 'var(--primary)' : 'transparent',
          transform: `rotate(${rotation - 135}deg)`,
          transition: 'transform 1s ease-out'
        }}></div>
        <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, fontSize: '2.5rem', fontWeight: 800 }}>
          {score}
        </div>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{description}</p>
    </div>
  );
}

export function AnalysisSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section style={{ marginTop: '3.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>{title}</h2>
      {children}
    </section>
  );
}

export function ScenarioCard({ 
  type, 
  priceTarget, 
  description, 
  points 
}: { 
  type: 'Bear' | 'Base' | 'Bull', 
  priceTarget: string, 
  description: string,
  points: string[]
}) {
  const colors = {
    Bear: 'var(--destructive)',
    Base: 'var(--primary)',
    Bull: 'var(--accent)'
  };

  return (
    <div className="glass-card" style={{ flex: 1, borderTop: `4px solid ${colors[type]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: colors[type], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type} CASE</h4>
        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{priceTarget}</span>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'white', marginBottom: '1rem', fontWeight: 500 }}>{description}</p>
      <ul style={{ paddingLeft: '1rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

export function RecommendationBadge({ status }: { status: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy' }) {
  const styles = {
    'Strong Buy': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
    'Accumulate': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
    'Hold': { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' },
    'Speculative Buy': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' }
  };

  const current = styles[status];

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      padding: '0.5rem 1rem', 
      background: current.bg, 
      color: current.color, 
      border: `1px solid ${current.border}`,
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginTop: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <span style={{ marginRight: '0.5rem', opacity: 0.7 }}>Portfolio Status:</span> {status}
    </div>
  );
}
