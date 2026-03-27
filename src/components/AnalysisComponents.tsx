'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, PlusCircle, Minus, Zap, ShieldCheck, ShieldX, RefreshCw, Rocket, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardBody, CardHeader, Chip, Progress, CircularProgress, Divider, Spinner } from "@heroui/react";
import type { TenMoatsAssessment, MoatStatus } from "@/app/tenMoatsData";
import type { Projection2030, ProjectionVerdict } from "@/types/stockAnalysis";

/** Animates a number from 0 to `target` over `duration` ms using easeOut. */
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
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

export function MetricCard({ title, value, label, icon, color = 'var(--primary)' }: MetricCardProps) {
  return (
    <Card className="flex-1 bg-white/5 border-none backdrop-blur-md">
      <CardBody className="p-4 md:p-5 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg" style={{ background: color }}>
            {icon}
          </div>
          <span className="text-sm font-medium text-white/60">{title}</span>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold">{value}</div>
          <div className="text-[10px] md:text-xs text-white/50">{label}</div>
        </div>
      </CardBody>
    </Card>
  );
}

interface ScoreGaugeProps {
  score: number;
  label: string;
  description: string;
}

export function ScoreGauge({ score, label, description }: ScoreGaugeProps) {
  const animated = useCountUp(score);

  const getColor = (s: number) => {
    if (s >= 90) return "success";
    if (s >= 75) return "primary";
    if (s >= 60) return "warning";
    return "danger";
  };

  return (
    <Card className="w-full lg:min-w-[240px] flex-1 bg-white/5 border-none backdrop-blur-md text-center p-4 animate-fade-in-scale stagger-fill-both" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="justify-center pb-0">
        <h3 className="text-lg font-semibold">{label}</h3>
      </CardHeader>
      <CardBody className="items-center py-6">
        <CircularProgress
          classNames={{
            svg: "w-32 h-32 drop-shadow-md",
            indicator: "stroke-primary",
            track: "stroke-white/10",
            value: "text-3xl font-extrabold text-white",
          }}
          value={animated}
          strokeWidth={4}
          showValueLabel={true}
          color={getColor(score)}
        />
      </CardBody>
      <p className="text-sm text-white/60">{description}</p>
    </Card>
  );
}

export function OverallScoreCard({ score, loading }: { score: number; loading?: boolean }) {
  const animatedScore = useCountUp(score, 1000);

  const getTier = (s: number): { label: string; hex: string; color: "success" | "primary" | "warning" | "danger" } => {
    if (s >= 90) return { label: 'Exceptional', hex: '#17c964', color: 'success' };
    if (s >= 80) return { label: 'Strong',      hex: '#006fee', color: 'primary' };
    if (s >= 70) return { label: 'Above Avg',   hex: '#f5a524', color: 'warning' };
    if (s >= 60) return { label: 'Average',     hex: '#f59e0b', color: 'warning' };
    return              { label: 'Weak',        hex: '#f31260', color: 'danger'  };
  };

  const { label, hex, color } = getTier(score);

  return (
    <Card className="w-full flex-1 bg-white/5 border-none backdrop-blur-md animate-fade-in-scale stagger-fill-both" style={{ animationDelay: '0s' }}>
      <CardBody className="p-5 md:p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full shrink-0" style={{ background: hex }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Composite Score</span>
            {loading && <Spinner size="sm" color="default" classNames={{ circle1: "border-b-white/30", circle2: "border-b-white/30" }} />}
          </div>
          <Chip size="sm" color={color} variant="flat" classNames={{ content: "font-bold text-[11px]" }}>
            {label}
          </Chip>
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-2">
          <span className="text-6xl md:text-7xl font-black leading-none tabular-nums" style={{ color: hex }}>
            {animatedScore}
          </span>
          <span className="text-white/25 font-bold text-2xl">/100</span>
        </div>

        {/* Horizontal bar */}
        <div className="space-y-1.5">
          <div className="relative h-3 rounded-full overflow-hidden bg-white/10">
            {/* Zone tint */}
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: 'linear-gradient(to right, #f31260 0% 25%, #f5a524 25% 60%, #006fee 60% 80%, #17c964 80% 100%)' }}
            />
            {/* Fill — animated width */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedScore}%`, background: `linear-gradient(to right, ${hex}55, ${hex})` }}
            />
            {/* Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full transition-all duration-1000 ease-out"
              style={{ left: `calc(${animatedScore}% - 1.5px)`, background: hex, boxShadow: `0 0 6px ${hex}` }}
            />
          </div>
          <div className="flex justify-between px-0.5 text-[9px] text-white/20 font-bold select-none">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>

        <p className="text-xs text-white/40 leading-relaxed">
          Combined average of Moat (AI Resilience), Growth, and Valuation scores.
        </p>
      </CardBody>
    </Card>
  );
}

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
        {/* Overall score always shown at top */}
        {hasOverall && (
          <div className="mb-4">
            <OverallScoreCard score={overallScore!} loading={overallLoading} />
          </div>
        )}
        {/* Tab strip for individual scores */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-4">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                active === i ? 'bg-white/15 text-white' : 'text-white/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div key={active} className="animate-fade-in stagger-fill-both">
          {tabs[active].gauge}
          {tabs[active].detail && (
            <div className="mt-6 space-y-4">{tabs[active].detail}</div>
          )}
        </div>
      </div>
      {/* Desktop: side by side */}
      <div className="hidden md:flex gap-6">
        {hasOverall && (
          <div className="flex-1 lg:min-w-[240px]">
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

export function AnalysisSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="mt-8 md:mt-12">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        <Divider className="flex-1 opacity-20" />
      </div>
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
  const colorMap: Record<string, "danger" | "primary" | "success"> = {
    Bear: "danger",
    Base: "primary",
    Bull: "success"
  };

  const chipColorStyle: Record<string, { background: string; color: string }> = {
    Bear: { background: 'rgba(243,18,96,0.18)', color: '#f31260' },
    Base: { background: 'rgba(0,111,238,0.18)', color: '#006fee' },
    Bull: { background: 'rgba(23,201,100,0.18)', color: '#17c964' },
  };

  return (
    <Card className={`flex-1 bg-white/5 border-none backdrop-blur-md border-t-4 border-${colorMap[type]}`} style={{ borderTopColor: type === 'Bear' ? '#f31260' : type === 'Base' ? '#006fee' : '#17c964' }}>
      <CardBody className="p-4 md:p-5 gap-4">
        <div className="flex justify-between items-center">
          <Chip color={colorMap[type]} variant="flat" className="font-bold" classNames={{ base: "px-2 py-0.5" }} style={chipColorStyle[type]}>{type} CASE</Chip>
          <span className="text-xl font-bold">{priceTarget}</span>
        </div>
        <p className="text-sm font-semibold text-white">{description}</p>
        <ul className="pl-4 text-xs text-white/60 flex flex-col gap-2 list-disc">
          {points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

const statusConfig = {
  'Strong Buy': {
    hex: "#17c964",
    dimHex: "rgba(23,201,100,0.12)",
    label: "High Conviction — Core Position",
    icon: <TrendingUp size={18} />,
  },
  'Accumulate': {
    hex: "#006fee",
    dimHex: "rgba(0,111,238,0.12)",
    label: "Adding on Dips — Active Accumulation",
    icon: <PlusCircle size={18} />,
  },
  'Hold': {
    hex: "#71717a",
    dimHex: "rgba(113,113,122,0.12)",
    label: "Hold for Long-Term Compounding",
    icon: <Minus size={18} />,
  },
  'Speculative Buy': {
    hex: "#f5a524",
    dimHex: "rgba(245,165,36,0.12)",
    label: "Higher Risk / Asymmetric Reward",
    icon: <Zap size={18} />,
  },
};

const moatStatusConfig: Record<MoatStatus, { label: string; color: string; bgColor: string; dot: string }> = {
  strong:    { label: 'STRONG',    color: '#17c964', bgColor: 'rgba(23,201,100,0.12)',  dot: '#17c964' },
  intact:    { label: 'INTACT',    color: '#006fee', bgColor: 'rgba(0,111,238,0.12)',   dot: '#006fee' },
  weakened:  { label: 'WEAKENED',  color: '#f5a524', bgColor: 'rgba(245,165,36,0.12)', dot: '#f5a524' },
  destroyed: { label: 'N/A',       color: '#71717a', bgColor: 'rgba(113,113,122,0.08)', dot: '#71717a' },
};

function MoatRow({ label, status, note }: { label: string; status: MoatStatus; note: string }) {
  const cfg = moatStatusConfig[status];
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-none">
      <div className="shrink-0 mt-1">
        <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span
            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ color: cfg.color, background: cfg.bgColor }}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{note}</p>
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
    { label: 'Proprietary Data',       key: 'proprietaryData' },
    { label: 'Regulatory Lock-In',     key: 'regulatoryLockIn' },
    { label: 'Network Effects',        key: 'networkEffects' },
    { label: 'Transaction Embedding',  key: 'transactionEmbedding' },
    { label: 'System of Record',       key: 'systemOfRecord' },
  ];

  const getResilienceColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 65) return 'primary';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Score + Verdict */}
      <Card className="bg-white/5 border-none backdrop-blur-md">
        <CardBody className="p-4 md:p-6">
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Ten Moats Verdict</p>
          <p className="text-sm text-white/70 leading-relaxed">{data.verdict}</p>
        </CardBody>
      </Card>

      {/* Moat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI-Vulnerable Column */}
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardHeader className="pb-0 pt-4 px-4 md:px-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md" style={{ background: 'rgba(243,18,96,0.15)' }}>
                <ShieldX size={14} color="#f31260" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/50">AI-Vulnerable Moats</span>
            </div>
          </CardHeader>
          <CardBody className="px-4 md:px-6 pt-3 pb-4 md:pb-6">
            {vulnerableMoats.map(({ label, key }) => {
              const item = data[key] as { status: MoatStatus; note: string };
              return <MoatRow key={key} label={label} status={item.status} note={item.note} />;
            })}
          </CardBody>
        </Card>

        {/* AI-Resilient Column */}
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardHeader className="pb-0 pt-4 px-4 md:px-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md" style={{ background: 'rgba(23,201,100,0.15)' }}>
                <ShieldCheck size={14} color="#17c964" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/50">AI-Resilient Moats</span>
            </div>
          </CardHeader>
          <CardBody className="px-4 md:px-6 pt-3 pb-4 md:pb-6">
            {resilientMoats.map(({ label, key }) => {
              const item = data[key] as { status: MoatStatus; note: string };
              return <MoatRow key={key} label={label} status={item.status} note={item.note} />;
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

const projectionConfig: Record<ProjectionVerdict, { hex: string; dimHex: string; borderHex: string; label: string }> = {
  Thrive:  { hex: '#17c964', dimHex: 'rgba(23,201,100,0.08)',  borderHex: 'rgba(23,201,100,0.30)',  label: 'Dominant Leader'   },
  Grow:    { hex: '#006fee', dimHex: 'rgba(0,111,238,0.08)',   borderHex: 'rgba(0,111,238,0.30)',   label: 'Steady Compounder' },
  Survive: { hex: '#f5a524', dimHex: 'rgba(245,165,36,0.08)',  borderHex: 'rgba(245,165,36,0.30)',  label: 'Hold Position'     },
  Struggle:{ hex: '#f31260', dimHex: 'rgba(243,18,96,0.08)',   borderHex: 'rgba(243,18,96,0.30)',   label: 'At Risk'           },
};

const confidenceConfig: Record<'High' | 'Medium' | 'Low', { color: 'success' | 'warning' | 'danger'; label: string }> = {
  High:   { color: 'success', label: 'High Confidence' },
  Medium: { color: 'warning', label: 'Medium Confidence' },
  Low:    { color: 'danger',  label: 'Low Confidence' },
};

export function Projection2030Card({ data }: { data: Projection2030 }) {
  const cfg = projectionConfig[data.verdict];
  const confCfg = confidenceConfig[data.confidence];

  return (
    <Card
      className="w-full bg-white/5 border-none backdrop-blur-md overflow-hidden animate-fade-in-scale stagger-fill-both"
      style={{ borderTop: `3px solid ${cfg.hex}` }}
    >
      <CardBody className="p-0">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4" style={{ background: cfg.dimHex }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: cfg.dimHex, border: `1px solid ${cfg.borderHex}` }}>
              <Rocket size={16} style={{ color: cfg.hex }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">2030 Outlook</p>
              <p className="text-lg font-black leading-none" style={{ color: cfg.hex }}>{data.verdict}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" color={confCfg.color} variant="flat" classNames={{ content: "font-bold text-[11px]" }}>
              {confCfg.label}
            </Chip>
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Target</p>
              <p className="text-xl font-black text-white">{data.priceTarget}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 md:px-6 py-4 border-b border-white/5">
          <p className="text-sm text-white/70 leading-relaxed">{data.summary}</p>
        </div>

        {/* Catalysts + Risks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          {/* Catalysts */}
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={13} color="#17c964" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Catalysts to 2030</p>
            </div>
            <ul className="space-y-2">
              {data.catalysts.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                  <span className="text-xs text-white/60 leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={13} color="#f5a524" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Risks to Watch</p>
            </div>
            <ul className="space-y-2">
              {data.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                  <span className="text-xs text-white/60 leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function RecommendationBadge({ status, loading }: { status: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy'; loading?: boolean }) {
  const cfg = statusConfig[status];

  return (
    <div
      className="relative mt-4 inline-flex items-center gap-4 rounded-xl border backdrop-blur-md px-5 py-3.5 overflow-hidden"
      style={{ borderColor: `${cfg.hex}30`, background: cfg.dimHex }}
    >
      {/* Colored left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: cfg.hex }} />

      {/* Pulsing dot */}
      <div className="relative shrink-0 ml-1">
        <div className="w-2 h-2 rounded-full" style={{ background: cfg.hex }} />
        <div
          className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40"
          style={{ background: cfg.hex }}
        />
      </div>

      {/* Text */}
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[10px] uppercase tracking-widest font-black text-white/40">Rating</p>
          {loading && <RefreshCw size={9} className="text-white/30 animate-spin" />}
        </div>
        <p className="font-black uppercase text-sm leading-none" style={{ color: cfg.hex }}>{status}</p>
        <p className="text-[11px] text-white/40 mt-1">{cfg.label}</p>
      </div>

      {/* Icon */}
      <div className="shrink-0 ml-2" style={{ color: cfg.hex }}>
        {cfg.icon}
      </div>
    </div>
  );
}
