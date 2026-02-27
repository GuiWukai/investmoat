'use client';

import React from 'react';
import { TrendingUp, PlusCircle, Minus, Zap, ShieldCheck, ShieldX } from "lucide-react";
import { Card, CardBody, CardHeader, Chip, Progress, CircularProgress, Divider } from "@heroui/react";
import type { TenMoatsAssessment, MoatStatus } from "@/app/tenMoatsData";

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
      <CardBody className="gap-4">
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
  const getColor = (s: number) => {
    if (s >= 90) return "success";
    if (s >= 75) return "primary";
    if (s >= 60) return "warning";
    return "danger";
  };

  return (
    <Card className="w-full lg:min-w-[240px] flex-1 bg-white/5 border-none backdrop-blur-md text-center p-4">
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
          value={score}
          strokeWidth={4}
          showValueLabel={true}
          color={getColor(score)}
        />
      </CardBody>
      <p className="text-sm text-white/60">{description}</p>
    </Card>
  );
}

interface ScoreTab {
  label: string;
  gauge: React.ReactNode;
  detail?: React.ReactNode;
}

export function ScoreTabsRow({ tabs, overallScore }: { tabs: ScoreTab[], overallScore?: number }) {
  const hasOverall = overallScore !== undefined;
  const [active, setActive] = React.useState(0);

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        {/* Overall score always shown at top */}
        {hasOverall && (
          <div className="mb-4">
            <ScoreGauge
              score={overallScore!}
              label="Overall Score"
              description="Combined average of Moat, Growth & Valuation scores."
            />
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
        {tabs[active].gauge}
        {tabs[active].detail && (
          <div className="mt-6 space-y-4">{tabs[active].detail}</div>
        )}
      </div>
      {/* Desktop: side by side */}
      <div className="hidden md:flex gap-6">
        {hasOverall && (
          <div className="relative flex-1 lg:min-w-[240px]" style={{ borderRadius: '12px', outline: '1.5px solid rgba(139,92,246,0.35)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[9px] font-black uppercase tracking-widest rounded px-2 py-0.5 whitespace-nowrap" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)' }}>
              Overall Score
            </div>
            <ScoreGauge
              score={overallScore!}
              label="Overall Score"
              description="Combined average of Moat, Growth & Valuation."
            />
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

  return (
    <Card className={`flex-1 bg-white/5 border-none backdrop-blur-md border-t-4 border-${colorMap[type]}`} style={{ borderTopColor: type === 'Bear' ? '#f31260' : type === 'Base' ? '#006fee' : '#17c964' }}>
      <CardBody className="gap-4">
        <div className="flex justify-between items-center">
          <Chip color={colorMap[type]} variant="flat" className="font-bold">{type} CASE</Chip>
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
          <CardBody className="px-4 md:px-6 pt-3">
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
          <CardBody className="px-4 md:px-6 pt-3">
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

export function RecommendationBadge({ status }: { status: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy' }) {
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
        <p className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-0.5">Portfolio Status</p>
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
