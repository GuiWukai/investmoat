'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, PlusCircle, Minus, Zap, ShieldCheck, ShieldX, RefreshCw } from "lucide-react";
import { Spinner } from "@heroui/react";
import type { TenMoatsAssessment, MoatStatus } from "@/app/tenMoatsData";

// ─── Count-up animation ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

// ─── Score colour helpers ──────────────────────────────────────────────────────
function scoreHex(s: number): string {
  if (s >= 90) return '#34d399'; // emerald-400
  if (s >= 75) return '#60a5fa'; // blue-400
  if (s >= 60) return '#fbbf24'; // amber-400
  return '#fb7185';               // rose-400
}

// ─── Custom SVG arc gauge ──────────────────────────────────────────────────────
function ArcGauge({ score }: { score: number }) {
  const animated = useCountUp(score);
  const R = 50;
  const C = 2 * Math.PI * R;
  const offset = C - (animated / 100) * C;
  const hex = scoreHex(score);

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="60" cy="60" r={R}
        fill="none"
        stroke={hex}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${C}`}
        strokeDashoffset={`${offset}`}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${hex}55)` }}
      />
      <text x="60" y="56" textAnchor="middle" fill="white" fontSize="26" fontWeight="900"
        fontFamily="system-ui,-apple-system,sans-serif">{animated}</text>
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10" fontWeight="700"
        fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.5">/100</text>
    </svg>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────────────
interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

export function MetricCard({ title, value, label, icon, color = 'var(--primary)' }: MetricCardProps) {
  return (
    <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <span className="text-xs font-medium text-white/50">{title}</span>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
        <div className="text-[10px] text-white/35 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── ScoreGauge ────────────────────────────────────────────────────────────────
interface ScoreGaugeProps {
  score: number;
  label: string;
  description: string;
}

export function ScoreGauge({ score, label, description }: ScoreGaugeProps) {
  const hex = scoreHex(score);
  return (
    <div className="w-full lg:min-w-[200px] flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col items-center gap-4 text-center animate-fade-in-scale stagger-fill-both" style={{ animationDelay: '0.1s' }}>
      <p className="section-label">{label}</p>
      <ArcGauge score={score} />
      <p className="text-xs text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── OverallScoreCard ──────────────────────────────────────────────────────────
export function OverallScoreCard({ score, loading }: { score: number; loading?: boolean }) {
  const animatedScore = useCountUp(score, 1000);

  const getTier = (s: number): { label: string; hex: string } => {
    if (s >= 90) return { label: 'Exceptional', hex: '#34d399' };
    if (s >= 80) return { label: 'Strong',      hex: '#60a5fa' };
    if (s >= 70) return { label: 'Above Avg',   hex: '#fbbf24' };
    if (s >= 60) return { label: 'Average',     hex: '#fbbf24' };
    return              { label: 'Weak',        hex: '#fb7185' };
  };

  const { label, hex } = getTier(score);

  return (
    <div className="w-full flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 flex flex-col gap-5 animate-fade-in-scale stagger-fill-both" style={{ animationDelay: '0s' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full shrink-0" style={{ background: hex }} />
          <span className="section-label">Composite Score</span>
          {loading && <Spinner size="sm" color="default" classNames={{ circle1: "border-b-white/30", circle2: "border-b-white/30" }} />}
        </div>
        <span className="text-[11px] font-black px-2.5 py-1 rounded-lg border"
          style={{ color: hex, borderColor: `${hex}30`, background: `${hex}12` }}>
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-6xl md:text-7xl font-black leading-none tabular-nums" style={{ color: hex }}>
          {animatedScore}
        </span>
        <span className="text-white/20 font-bold text-2xl">/100</span>
      </div>

      <div className="space-y-1.5">
        <div className="relative h-2.5 rounded-full overflow-hidden bg-white/[0.06]">
          <div className="absolute inset-0 opacity-15"
            style={{ background: 'linear-gradient(to right, #fb7185 0% 25%, #fbbf24 25% 60%, #60a5fa 60% 80%, #34d399 80% 100%)' }} />
          <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedScore}%`, background: `linear-gradient(to right, ${hex}66, ${hex})` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ left: `calc(${animatedScore}% - 1.5px)`, background: hex, boxShadow: `0 0 8px ${hex}` }} />
        </div>
        <div className="flex justify-between px-0.5 text-[9px] text-white/18 font-bold select-none">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      <p className="text-xs text-white/35 leading-relaxed">
        Combined average of Moat (AI Resilience), Growth, and Valuation scores.
      </p>
    </div>
  );
}

// ─── ScoreTabsRow ──────────────────────────────────────────────────────────────
interface ScoreTab {
  label: string;
  gauge: React.ReactNode;
  detail?: React.ReactNode;
}

export function ScoreTabsRow({ tabs, overallScore, overallLoading }: { tabs: ScoreTab[], overallScore?: number, overallLoading?: boolean }) {
  const hasOverall = overallScore !== undefined;
  const [active, setActive] = React.useState(0);

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        {hasOverall && (
          <div className="mb-4">
            <OverallScoreCard score={overallScore!} loading={overallLoading} />
          </div>
        )}
        <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 mb-4 gap-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                active === i ? 'bg-white/[0.12] text-white' : 'text-white/35 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div key={active} className="animate-fade-in stagger-fill-both">
          {tabs[active].gauge}
          {tabs[active].detail && (
            <div className="mt-5 space-y-4">{tabs[active].detail}</div>
          )}
        </div>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden md:flex gap-4">
        {hasOverall && (
          <div className="flex-1 lg:min-w-[220px]">
            <OverallScoreCard score={overallScore!} loading={overallLoading} />
          </div>
        )}
        {tabs.map(tab => (
          <React.Fragment key={tab.label}>{tab.gauge}</React.Fragment>
        ))}
      </div>
    </>
  );
}

// ─── AnalysisSection ───────────────────────────────────────────────────────────
export function AnalysisSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="mt-10 md:mt-14">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-white/85 shrink-0">{title}</h2>
        <div className="h-px flex-1 bg-white/[0.05]" />
      </div>
      {children}
    </section>
  );
}

// ─── ScenarioCard ──────────────────────────────────────────────────────────────
const scenarioCfg = {
  Bear: { hex: '#fb7185', dimHex: 'rgba(251,113,133,0.08)', borderHex: 'rgba(251,113,133,0.2)' },
  Base: { hex: '#60a5fa', dimHex: 'rgba(96,165,250,0.08)',  borderHex: 'rgba(96,165,250,0.2)'  },
  Bull: { hex: '#34d399', dimHex: 'rgba(52,211,153,0.08)',  borderHex: 'rgba(52,211,153,0.2)'  },
};

export function ScenarioCard({
  type, priceTarget, description, points
}: {
  type: 'Bear' | 'Base' | 'Bull';
  priceTarget: string;
  description: string;
  points: string[];
}) {
  const { hex, dimHex, borderHex } = scenarioCfg[type];
  return (
    <div className="flex-1 rounded-2xl border p-5 flex flex-col gap-4"
      style={{ borderColor: borderHex, background: dimHex }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
          style={{ color: hex, background: `${hex}18`, border: `1px solid ${hex}25` }}>
          {type} Case
        </span>
        <span className="text-xl font-black text-white">{priceTarget}</span>
      </div>
      <p className="text-sm font-semibold text-white/80">{description}</p>
      <ul className="space-y-1.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: hex }} />
            <span className="text-xs text-white/50">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── RecommendationBadge ───────────────────────────────────────────────────────
const statusConfig = {
  'Strong Buy': {
    hex: '#34d399',
    dimHex: 'rgba(52,211,153,0.1)',
    label: 'High Conviction — Core Position',
    icon: <TrendingUp size={18} />,
  },
  'Accumulate': {
    hex: '#60a5fa',
    dimHex: 'rgba(96,165,250,0.1)',
    label: 'Adding on Dips — Active Accumulation',
    icon: <PlusCircle size={18} />,
  },
  'Hold': {
    hex: '#71717a',
    dimHex: 'rgba(113,113,122,0.1)',
    label: 'Hold for Long-Term Compounding',
    icon: <Minus size={18} />,
  },
  'Speculative Buy': {
    hex: '#fbbf24',
    dimHex: 'rgba(251,191,36,0.1)',
    label: 'Higher Risk / Asymmetric Reward',
    icon: <Zap size={18} />,
  },
};

export function RecommendationBadge({ status, loading }: { status: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy'; loading?: boolean }) {
  const cfg = statusConfig[status];
  return (
    <div
      className="relative mt-4 inline-flex items-center gap-4 rounded-xl border backdrop-blur-md px-5 py-3.5 overflow-hidden"
      style={{ borderColor: `${cfg.hex}28`, background: cfg.dimHex }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: cfg.hex }} />
      <div className="relative shrink-0 ml-1">
        <div className="w-2 h-2 rounded-full" style={{ background: cfg.hex }} />
        <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40" style={{ background: cfg.hex }} />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="section-label">Rating</p>
          {loading && <RefreshCw size={9} className="text-white/30 animate-spin" />}
        </div>
        <p className="font-black uppercase text-sm leading-none" style={{ color: cfg.hex }}>{status}</p>
        <p className="text-[11px] text-white/35 mt-1">{cfg.label}</p>
      </div>
      <div className="shrink-0 ml-2" style={{ color: cfg.hex }}>
        {cfg.icon}
      </div>
    </div>
  );
}

// ─── TenMoatsCard ──────────────────────────────────────────────────────────────
const moatStatusConfig: Record<MoatStatus, { label: string; color: string; bgColor: string }> = {
  strong:    { label: 'STRONG',   color: '#34d399', bgColor: 'rgba(52,211,153,0.1)'  },
  intact:    { label: 'INTACT',   color: '#60a5fa', bgColor: 'rgba(96,165,250,0.1)'  },
  weakened:  { label: 'WEAKENED', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.1)'  },
  destroyed: { label: 'N/A',      color: '#71717a', bgColor: 'rgba(113,113,122,0.08)' },
};

function MoatRow({ label, status, note }: { label: string; status: MoatStatus; note: string }) {
  const cfg = moatStatusConfig[status];
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-none">
      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: cfg.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white/85">{label}</span>
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ color: cfg.color, background: cfg.bgColor }}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">{note}</p>
      </div>
    </div>
  );
}

export function TenMoatsCard({ data }: { data: TenMoatsAssessment }) {
  const vulnerableMoats: Array<{ label: string; key: keyof TenMoatsAssessment }> = [
    { label: 'Learned Interfaces',  key: 'learnedInterfaces' },
    { label: 'Business Logic',      key: 'businessLogic' },
    { label: 'Public Data Access',  key: 'publicDataAccess' },
    { label: 'Talent Scarcity',     key: 'talentScarcity' },
    { label: 'Bundling',            key: 'bundling' },
  ];

  const resilientMoats: Array<{ label: string; key: keyof TenMoatsAssessment }> = [
    { label: 'Proprietary Data',      key: 'proprietaryData' },
    { label: 'Regulatory Lock-In',    key: 'regulatoryLockIn' },
    { label: 'Network Effects',       key: 'networkEffects' },
    { label: 'Transaction Embedding', key: 'transactionEmbedding' },
    { label: 'System of Record',      key: 'systemOfRecord' },
  ];

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
        <p className="section-label mb-2">Ten Moats Verdict</p>
        <p className="text-sm text-white/60 leading-relaxed">{data.verdict}</p>
      </div>

      {/* Moat grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI-Vulnerable */}
        <div className="rounded-2xl border border-rose-500/[0.1] bg-rose-500/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <ShieldX size={13} color="#fb7185" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">AI-Vulnerable Moats</span>
          </div>
          {vulnerableMoats.map(({ label, key }) => {
            const item = data[key] as { status: MoatStatus; note: string };
            return <MoatRow key={key} label={label} status={item.status} note={item.note} />;
          })}
        </div>

        {/* AI-Resilient */}
        <div className="rounded-2xl border border-emerald-500/[0.1] bg-emerald-500/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={13} color="#34d399" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">AI-Resilient Moats</span>
          </div>
          {resilientMoats.map(({ label, key }) => {
            const item = data[key] as { status: MoatStatus; note: string };
            return <MoatRow key={key} label={label} status={item.status} note={item.note} />;
          })}
        </div>
      </div>
    </div>
  );
}
