'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TrendingUp, PlusCircle, Minus, Zap, ShieldCheck, ShieldX, RefreshCw } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Card, Chip, Meter, Spinner, Tabs } from "@heroui/react";
import type { TenMoatsAssessment, MoatStatus } from "@/app/tenMoatsData";
import type { CommodityMoatsData, CryptoMoatsData, StockAnalysisData } from "@/types/stockAnalysis";
import type { DampedValuation } from "@/lib/reviewFreshness";

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
    <Card className="flex-1 p-4 md:p-5 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <span className="text-xs font-medium text-foreground/50">{title}</span>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-black text-foreground">{value}</div>
        <div className="text-[10px] text-foreground/35 mt-0.5">{label}</div>
      </div>
    </Card>
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
    <Card className="w-full lg:min-w-[200px] flex-1 p-5 items-center gap-4 text-center animate-fade-in-scale stagger-fill-both" style={{ animationDelay: '0.1s' }}>
      <p className="section-label">{label}</p>
      <ArcGauge score={score} />
      <p className="text-xs text-foreground/40 leading-relaxed">{description}</p>
    </Card>
  );
}

// ─── OverallScoreCard ──────────────────────────────────────────────────────────
export function OverallScoreCard({
  score,
  loading,
  freshness,
}: {
  score: number;
  loading?: boolean;
  freshness?: DampedValuation | null;
}) {
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
    <Card className="w-full flex-1 p-5 md:p-6 gap-5 animate-fade-in-scale stagger-fill-both" style={{ animationDelay: '0s' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full shrink-0" style={{ background: hex }} />
          <span className="section-label">Composite Score</span>
          {loading && <Spinner size="sm" color="current" />}
        </div>
        <Chip
          className="text-[11px] font-black"
          style={{ color: hex, borderColor: `${hex}30`, background: `${hex}12` }}
          variant="soft"
        >
          {label}
        </Chip>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-6xl md:text-7xl font-black leading-none tabular-nums" style={{ color: hex }}>
          {animatedScore}
        </span>
        <span className="text-foreground/20 font-bold text-2xl">/100</span>
      </div>

      {/* A real <Meter>: the score is now exposed to assistive tech with its
          value and range instead of being three anonymous divs. The banded
          track and the glowing marker are kept as fills inside it. */}
      <div className="space-y-1.5">
        <Meter aria-label="Composite score out of 100" value={score}>
          <Meter.Track className="relative h-2.5 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div
              className="absolute inset-0 opacity-15"
              style={{ background: 'linear-gradient(to right, #fb7185 0% 25%, #fbbf24 25% 60%, #60a5fa 60% 80%, #34d399 80% 100%)' }}
            />
            <Meter.Fill
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedScore}%`, background: `linear-gradient(to right, ${hex}66, ${hex})` }}
            />
            <div
              className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
              style={{ left: `calc(${animatedScore}% - 1.5px)`, background: hex, boxShadow: `0 0 8px ${hex}` }}
            />
          </Meter.Track>
        </Meter>
        <div className="flex justify-between px-0.5 text-[9px] text-foreground/18 font-bold select-none">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      <p className="text-xs text-foreground/35 leading-relaxed">
        Combined average of Moat (AI Resilience), Growth, and Valuation scores.
      </p>

      {/* The valuation gauge beside this card shows the live pillar raw — where
          the price sits in the ladder is a fact. This note covers the composite
          only, where that pillar is shrunk toward the price the analysis was
          written at because moat and growth are frozen at the review date. */}
      {freshness && Math.abs(freshness.damped) >= 0.5 && (
        <p className="text-[11px] text-amber-400/60 leading-relaxed">
          Valuation {freshness.liveScore} counted as {freshness.score.toFixed(0)} here
          {freshness.ageDays != null && <> — the review behind Moat and Growth is {freshness.ageDays} days old</>},
          so {Math.round(freshness.credibility * 100)}% of the move away from the review-date
          price is credited to the composite.
        </p>
      )}
    </Card>
  );
}

// ─── ScoreTabsRow ──────────────────────────────────────────────────────────────
interface ScoreTab {
  label: string;
  gauge: React.ReactNode;
  detail?: React.ReactNode;
}

export function ScoreTabsRow({ tabs, overallScore, overallLoading, overallFreshness }: { tabs: ScoreTab[], overallScore?: number, overallLoading?: boolean, overallFreshness?: DampedValuation | null }) {
  const hasOverall = overallScore !== undefined;
  const [active, setActive] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  const handleTabClick = useCallback((i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  }, [active]);

  const handleDragEnd = useCallback((_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 400;
    if (!swipe) return;
    if (info.offset.x < 0 && active < tabs.length - 1) {
      setDirection(1);
      setActive(active + 1);
    } else if (info.offset.x > 0 && active > 0) {
      setDirection(-1);
      setActive(active - 1);
    }
  }, [active, tabs.length]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '40%' : '-40%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-40%' : '40%', opacity: 0 }),
  };

  return (
    <>
      {/* Mobile — a real tablist, so the scores are reachable by keyboard and
          announced as tabs. The swipe gesture stays: HeroUI drives selection,
          framer-motion animates the panel between selections. */}
      <div className="md:hidden">
        {hasOverall && (
          <div className="mb-4">
            <OverallScoreCard score={overallScore!} loading={overallLoading} freshness={overallFreshness} />
          </div>
        )}
        <Tabs
          aria-label="Score breakdown"
          onSelectionChange={(key) => handleTabClick(Number(key))}
          selectedKey={String(active)}
        >
          {/* The tab strip pins under the mobile top bar (h-14) once the page
              scrolls past it, so Moat / Growth / Valuation stay switchable deep
              inside a long panel. Bled out to the viewport edges — `.content`
              carries 1.5rem of gutter on mobile — so nothing scrolls through
              beside it, and kept under the nav's z-50. */}
          <div className="sticky top-14 z-30 -mx-6 mb-4 flex border-b border-border/60 bg-background/95 px-6 py-2 backdrop-blur-xl">
            <Tabs.List className="flex-1">
              {tabs.map((tab, i) => (
                <Tabs.Tab key={tab.label} className="flex-1 font-bold" id={String(i)}>
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </div>
          {tabs.map((tab, i) => (
            <Tabs.Panel key={tab.label} className="overflow-hidden" id={String(i)}>
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={active}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragDirectionLock
                  dragElastic={0.12}
                  onDragEnd={handleDragEnd}
                  style={{ touchAction: 'pan-y' }}
                >
                  {tab.gauge}
                  {tab.detail && (
                    <div className="mt-5 space-y-4">{tab.detail}</div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Tabs.Panel>
          ))}
        </Tabs>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden md:flex gap-4">
        {hasOverall && (
          <div className="flex-1 lg:min-w-[220px]">
            <OverallScoreCard score={overallScore!} loading={overallLoading} freshness={overallFreshness} />
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
        <h2 className="text-lg md:text-xl font-bold text-foreground/85 shrink-0">{title}</h2>
        <div className="h-px flex-1 bg-foreground/[0.05]" />
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
        <span className="text-xl font-black text-foreground">{priceTarget}</span>
      </div>
      <p className="text-sm font-semibold text-foreground/80">{description}</p>
      <ul className="space-y-1.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: hex }} />
            <span className="text-xs text-foreground/50">{point}</span>
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
          {loading && <RefreshCw size={9} className="text-foreground/30 animate-spin" />}
        </div>
        <p className="font-black uppercase text-sm leading-none" style={{ color: cfg.hex }}>{status}</p>
        <p className="text-[11px] text-foreground/35 mt-1">{cfg.label}</p>
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
    <div className="flex items-start gap-3 py-2.5 border-b border-foreground/[0.04] last:border-none">
      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: cfg.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-foreground/85">{label}</span>
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ color: cfg.color, background: cfg.bgColor }}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-foreground/40 leading-relaxed">{note}</p>
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
      <Card className="p-5">
        <p className="section-label mb-2">Ten Moats Verdict</p>
        <p className="text-sm text-foreground/60 leading-relaxed">{data.verdict}</p>
      </Card>

      {/* Moat grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI-Vulnerable */}
        <div className="rounded-2xl border border-rose-500/[0.1] bg-rose-500/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <ShieldX size={13} color="#fb7185" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">AI-Vulnerable Moats</span>
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
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">AI-Resilient Moats</span>
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

// ─── CryptoMoatsCard ──────────────────────────────────────────────────────────
// Five-pillar monetary-moat framework for crypto protocols. No AI-resilience
// split (protocol moats are AI-resilient by nature); a single flat list with
// the verdict above.
export function CryptoMoatsCard({ data }: { data: CryptoMoatsData }) {
  const pillars: Array<{ label: string; key: keyof Omit<CryptoMoatsData, 'verdict' | 'primaryMoat'> }> = [
    { label: 'Network Effects',        key: 'networkEffects' },
    { label: 'Schelling Point',        key: 'schellingPoint' },
    { label: 'Credible Neutrality',    key: 'credibleNeutrality' },
    { label: 'Regulatory Incumbency',  key: 'regulatoryIncumbency' },
    { label: 'Security Budget',        key: 'securityBudget' },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="section-label mb-2">Crypto Moat Verdict</p>
        <p className="text-sm text-foreground/60 leading-relaxed">{data.verdict}</p>
      </Card>
      <div className="rounded-2xl border border-emerald-500/[0.1] bg-emerald-500/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={13} color="#34d399" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Monetary Protocol Moats</span>
        </div>
        {pillars.map(({ label, key }) => {
          const item = data[key];
          return <MoatRow key={key} label={label} status={item.status} note={item.note} />;
        })}
      </div>
    </div>
  );
}

// ─── CommodityMoatsCard ───────────────────────────────────────────────────────
export function CommodityMoatsCard({ data }: { data: CommodityMoatsData }) {
  const pillars: Array<{ label: string; key: keyof Omit<CommodityMoatsData, 'verdict' | 'primaryMoat'> }> = [
    { label: 'Absolute Scarcity',  key: 'absoluteScarcity' },
    { label: 'Monetary History',   key: 'monetaryHistory' },
    { label: 'Industrial Utility', key: 'industrialUtility' },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="section-label mb-2">Commodity Moat Verdict</p>
        <p className="text-sm text-foreground/60 leading-relaxed">{data.verdict}</p>
      </Card>
      <div className="rounded-2xl border border-emerald-500/[0.1] bg-emerald-500/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={13} color="#34d399" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Physical Asset Moats</span>
        </div>
        {pillars.map(({ label, key }) => {
          const item = data[key];
          return <MoatRow key={key} label={label} status={item.status} note={item.note} />;
        })}
      </div>
    </div>
  );
}

// ─── MoatsCard dispatcher ─────────────────────────────────────────────────────
// Single entry point used by stock pages. Picks the right framework's renderer
// based on data.assetClass.
export function MoatsCard({ data }: { data: StockAnalysisData }) {
  const ac = data.assetClass ?? 'equity';
  if (ac === 'crypto' && data.cryptoMoats)       return <CryptoMoatsCard data={data.cryptoMoats} />;
  if (ac === 'commodity' && data.commodityMoats) return <CommodityMoatsCard data={data.commodityMoats} />;
  if (data.tenMoats) return <TenMoatsCard data={data.tenMoats as unknown as TenMoatsAssessment} />;
  return null;
}
