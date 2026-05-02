'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import {
  MetricCard,
  ScoreGauge,
  ScoreTabsRow,
  AnalysisSection,
  ScenarioCard,
  RecommendationBadge,
  TenMoatsCard,
} from '@/components/AnalysisComponents';
import { LivePriceWidget } from '@/components/LivePriceWidget';
import { DynamicValuationGauge } from '@/components/DynamicValuationGauge';
import { ScenarioPriceBar } from '@/components/ScenarioPriceBar';
import { stockData, getAverageScore } from '@/app/stockData';
import { getStockData } from '@/data/stocks';
import type { TenMoatsAssessment } from '@/app/tenMoatsData';
import { computeMoatScore } from '@/lib/valuationScore';
import type { StockAnalysisData } from '@/types/stockAnalysis';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Lucide icon registry ────────────────────────────────────────────────────
import {
  Laptop, Cloud, Database, Cpu, Zap, Share2, ShoppingCart,
  DollarSign, Users, Target, Layers, Play, Car,
  Battery, Globe, CreditCard, ShieldCheck, BarChart3, PenTool,
  Image, Landmark, Shield, BarChart, Calculator, Coins, Lock,
  Pickaxe, Gem, CheckCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string; color?: string }>> = {
  Laptop, Cloud, Database, Cpu, Zap, Share2, ShoppingCart,
  DollarSign, Users, Target, Layers, Play, TrendingUp: TrendingUp as React.FC<{ size?: number; className?: string; color?: string }>, Car,
  Battery, Globe, CreditCard, ShieldCheck, BarChart3, PenTool,
  Image, Landmark, Shield, BarChart, Calculator, Coins, Lock,
  Pickaxe, Gem, CheckCircle,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
      )}
    </>
  );
}

function StockIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}

// ─── Live price in header ─────────────────────────────────────────────────────

function LiveHeaderPrice({ slug }: { slug: string }) {
  const [price, setPrice] = useState<string | null>(null);
  const [changePercent, setChangePercent] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || d?.price == null) return;
        const fmt = d.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setPrice(d.currency === 'USD' ? `$${fmt}` : `${fmt} ${d.currency}`);
        if (d.changePercent != null) setChangePercent(d.changePercent);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  if (!price) return <strong className="text-white">—</strong>;
  const positive = changePercent == null || changePercent >= 0;
  return (
    <>
      <strong className="text-white">{price}</strong>
      {changePercent != null && (
        <span className={`text-xs ml-1.5 font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          ({positive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      )}
    </>
  );
}

// ─── Growth Analysis Card ─────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: 'accelerating' | 'stable' | 'decelerating' }) {
  if (trend === 'accelerating') return <TrendingUp size={13} className="text-emerald-400 shrink-0 mt-0.5" />;
  if (trend === 'decelerating') return <TrendingDown size={13} className="text-rose-400 shrink-0 mt-0.5" />;
  return <Minus size={13} className="text-white/35 shrink-0 mt-0.5" />;
}

function GrowthAnalysisCard({ ga }: { ga: NonNullable<StockAnalysisData['growth']['growthAnalysis']> }) {
  const marginColor =
    ga.marginTrend === 'expanding' ? { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' } :
    ga.marginTrend === 'compressing' ? { color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)' } :
    { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 space-y-5">
      {/* Chips row */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: `${ga.cagrEstimate} est. CAGR`, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
          { label: ga.primaryType, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
          { label: `${ga.marginTrend} margins`, ...marginColor },
        ].map(({ label, color, bg, border }) => (
          <span key={label} className="text-[11px] font-bold px-2.5 py-1 rounded-lg border"
            style={{ color, background: bg, borderColor: border }}>
            {label}
          </span>
        ))}
      </div>

      {/* Drivers */}
      <div>
        <p className="section-label mb-3">Growth Drivers</p>
        <div className="space-y-2">
          {ga.drivers.map((d, i) => (
            <div key={i} className="flex items-start gap-2">
              <TrendIcon trend={d.trend} />
              <div className="min-w-0">
                <span className="text-sm font-medium text-white/85">{d.name}</span>
                <span className="text-xs text-white/40 ml-2">{d.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.05]" />

      <div>
        <p className="section-label mb-1.5">Key Risk</p>
        <p className="text-sm text-white/60">{ga.keyRisk}</p>
      </div>

      <div className="h-px bg-white/[0.05]" />

      <div>
        <p className="section-label mb-1.5">Score Derivation</p>
        <p className="text-xs text-white/35 font-mono">{ga.scoreDerivation}</p>
      </div>
    </div>
  );
}

// ─── Forward PE / Valuation multiples card ────────────────────────────────────

function ForwardPECard({ data }: { data: NonNullable<StockAnalysisData['valuation']['peAnalysis']> }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
      <h4 className="text-base font-bold text-white/85 mb-4">Valuation Multiples</h4>
      <table className="w-full text-sm">
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04] last:border-0">
              <td className="py-2.5 text-white/45">{row.label}</td>
              <td className="py-2.5 font-bold text-white text-right">{row.value}</td>
              {row.note && (
                <td className="py-2.5 text-white/28 text-right text-xs pl-4 hidden sm:table-cell">{row.note}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-white/40 text-xs mt-4 leading-relaxed">{data.summary}</p>
      {data.asOf && <p className="text-white/25 text-xs mt-1">Approximate figures as of {data.asOf}.</p>}
    </div>
  );
}

// ─── Extra section renderers ──────────────────────────────────────────────────

function GridCardsSection({ section }: { section: NonNullable<StockAnalysisData['extraSections']>[number] }) {
  const accent = section.accentColor ?? 'var(--accent)';
  return (
    <AnalysisSection title={section.title}>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6"
        style={{ borderLeftWidth: '3px', borderLeftColor: accent }}>
        {section.gridHeader && <h4 className="text-base font-bold text-white/85 mb-3">{section.gridHeader}</h4>}
        <p className="text-white/50 mb-5 text-sm leading-relaxed">{section.intro}</p>
        {section.cards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.cards.map((card, i) => (
              <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <span className="text-[11px] font-bold" style={{ color: accent }}>{card.label}</span>
                <div className="text-sm mt-1.5 text-white/60 leading-relaxed">{card.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnalysisSection>
  );
}

function ProductionTimelineSection({ section }: { section: NonNullable<StockAnalysisData['extraSections']>[number] }) {
  const accent = section.accentColor ?? 'var(--accent)';
  return (
    <AnalysisSection title={section.title}>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6"
        style={{ borderLeftWidth: '3px', borderLeftColor: accent }}>
        <h4 className="text-base font-bold text-white/85 mb-3">The Transformation Journey</h4>
        <p className="text-white/50 mb-5 text-sm leading-relaxed">{section.intro}</p>
        {section.stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {section.stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <span className="text-[11px] font-bold" style={{ color: accent }}>{stat.label}</span>
                <div className="text-xl font-black text-white mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        )}
        {section.closing && <p className="text-white/50 mt-5 text-sm leading-relaxed">{section.closing}</p>}
      </div>
    </AnalysisSection>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function StockPageClient({ ticker }: { ticker: string }) {
  const data = getStockData(ticker);
  if (!data) notFound();

  const stockEntry = stockData.find(s => s.ticker === data.ticker);
  const [liveValScore, setLiveValScore] = useState<number>(data.valuation.score);
  const [valLoading, setValLoading] = useState(true);
  const liveMoatScore = computeMoatScore(data.tenMoats);
  const dynamicOverallScore = Math.round(getAverageScore([liveMoatScore, data.growth.score, liveValScore]));

  const dynamicRecommendation: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy' =
    dynamicOverallScore >= 85 ? 'Strong Buy' :
    dynamicOverallScore >= 75 ? 'Accumulate' :
    dynamicOverallScore >= 65 ? 'Hold' :
    'Speculative Buy';

  const metricsCount = data.metrics.length;
  const gridCols = metricsCount === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3';

  const MoatAnalysisCard = (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
      <p className="text-sm text-white/65 leading-relaxed mb-5">
        <BoldText text={data.moat.analysisSummary} />
      </p>
      <ul className="space-y-4">
        {data.moat.analysisPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-1 h-1 rounded-full bg-blue-400/60 shrink-0 mt-2" />
            <span className="text-sm text-white/55 leading-relaxed">
              <strong className="text-white/85 font-semibold">{point.title}:</strong>{' '}{point.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="animate-fade-in dot-pattern pb-16">

      {/* ── Header ── */}
      <header className="pt-6 md:pt-12 pb-10">
        {/* Ambient glow using title color */}
        {data.titleColor && (
          <div className="pointer-events-none absolute left-0 top-0 w-96 h-64 rounded-full blur-[100px] opacity-10"
            style={{ background: data.titleColor }} />
        )}

        {/* Chip tags */}
        {data.chips.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6 relative">
            {data.chips.map((chip, i) => (
              <span
                key={i}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg border animate-fade-in stagger-fill-both"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  color: chip.color === 'primary' ? '#60a5fa' :
                         chip.color === 'success' ? '#34d399' :
                         chip.color === 'warning' ? '#fbbf24' :
                         chip.color === 'secondary' ? '#a78bfa' :
                         chip.color === 'danger' ? '#fb7185' : '#94a3b8',
                  background: chip.color === 'primary' ? 'rgba(96,165,250,0.1)' :
                              chip.color === 'success' ? 'rgba(52,211,153,0.1)' :
                              chip.color === 'warning' ? 'rgba(251,191,36,0.1)' :
                              chip.color === 'secondary' ? 'rgba(167,139,250,0.1)' :
                              chip.color === 'danger' ? 'rgba(251,113,133,0.1)' : 'rgba(148,163,184,0.08)',
                  borderColor: chip.color === 'primary' ? 'rgba(96,165,250,0.2)' :
                               chip.color === 'success' ? 'rgba(52,211,153,0.2)' :
                               chip.color === 'warning' ? 'rgba(251,191,36,0.2)' :
                               chip.color === 'secondary' ? 'rgba(167,139,250,0.2)' :
                               chip.color === 'danger' ? 'rgba(251,113,133,0.2)' : 'rgba(148,163,184,0.15)',
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="relative animate-fade-up stagger-fill-both stagger-2 mb-5">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-4"
            style={data.titleColor ? { color: data.titleColor } : { color: 'white' }}
          >
            {data.name}
          </h1>

          {/* Header stats strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/40">
            {data.headerStats.map((stat, i) => (
              <span key={i}>
                {stat.label}:{' '}
                {stat.label === 'Price'
                  ? <LiveHeaderPrice slug={data.slug} />
                  : <strong className="text-white/80">{stat.value}</strong>
                }
              </span>
            ))}
            {data.lastAnalyzed && (
              <span>Analysis: <strong className="text-white/50">{data.lastAnalyzed}</strong></span>
            )}
          </div>
        </div>

        <div className="animate-fade-up stagger-fill-both stagger-3">
          <RecommendationBadge status={dynamicRecommendation} loading={valLoading} />
        </div>
      </header>

      {/* ── Key metrics (desktop) ── */}
      <div className={`hidden md:grid ${gridCols} gap-4 mb-10`}>
        {data.metrics.map((metric, i) => (
          <div key={i} className="animate-fade-up stagger-fill-both" style={{ animationDelay: `${0.2 + i * 0.07}s` }}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              label={metric.label}
              icon={<StockIcon name={metric.icon} />}
              color={metric.color}
            />
          </div>
        ))}
      </div>

      {/* ── Score gauges ── */}
      <ScoreTabsRow
        overallScore={dynamicOverallScore}
        overallLoading={valLoading}
        tabs={[
          {
            label: 'Moat',
            gauge: (
              <ScoreGauge
                score={liveMoatScore}
                label="Moat Score"
                description={data.moat.description}
              />
            ),
            detail: (
              <div className="space-y-4">
                {MoatAnalysisCard}
                <TenMoatsCard data={data.tenMoats as unknown as TenMoatsAssessment} />
              </div>
            ),
          },
          {
            label: 'Growth',
            gauge: (
              <ScoreGauge
                score={data.growth.score}
                label="Growth Score"
                description={data.growth.description}
              />
            ),
            detail: (
              <div className="space-y-4">
                {data.metrics.map((metric, i) => (
                  <MetricCard
                    key={i}
                    title={metric.title}
                    value={metric.value}
                    label={metric.label}
                    icon={<StockIcon name={metric.icon} />}
                    color={metric.color}
                  />
                ))}
                {data.growth.growthAnalysis && (
                  <GrowthAnalysisCard ga={data.growth.growthAnalysis} />
                )}
                {data.growth.additionalNote && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
                    <h4 className="text-base font-bold text-white/85 mb-4">{data.growth.additionalNote.title}</h4>
                    <div className="space-y-3">
                      {data.growth.additionalNote.points.map((point, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-1 h-1 rounded-full bg-emerald-400/60 shrink-0 mt-2" />
                          <span className="text-sm text-white/60 leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: 'Value',
            gauge: (
              <DynamicValuationGauge
                slug={data.slug}
                bearTarget={data.scenarios.bear.priceTarget}
                baseTarget={data.scenarios.base.priceTarget}
                bullTarget={data.scenarios.bull.priceTarget}
                fallbackScore={data.valuation.score}
                fallbackDescription={data.valuation.description}
                onScoreChange={setLiveValScore}
                onLoadingEnd={() => setValLoading(false)}
              />
            ),
            detail: (
              <div className="space-y-4">
                <LivePriceWidget
                  slug={data.slug}
                  fairValue={data.valuation.valuationNote?.fairValue}
                />
                {data.valuation.valuationNote && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
                    <h4 className="text-base font-bold text-white/85 mb-3">Valuation Analysis</h4>
                    <p className="text-sm text-white/55 leading-relaxed">
                      {data.valuation.valuationNote.text}{' '}
                      <strong className="text-white text-lg">{data.valuation.valuationNote.fairValue}</strong>.
                    </p>
                  </div>
                )}
                {data.valuation.peAnalysis && <ForwardPECard data={data.valuation.peAnalysis} />}
                <ScenarioPriceBar
                  slug={data.slug}
                  bearTarget={data.scenarios.bear.priceTarget}
                  baseTarget={data.scenarios.base.priceTarget}
                  bullTarget={data.scenarios.bull.priceTarget}
                />
                <ScenarioCard type="Bear" priceTarget={data.scenarios.bear.priceTarget} description={data.scenarios.bear.description} points={data.scenarios.bear.points} />
                <ScenarioCard type="Base" priceTarget={data.scenarios.base.priceTarget} description={data.scenarios.base.description} points={data.scenarios.base.points} />
                <ScenarioCard type="Bull" priceTarget={data.scenarios.bull.priceTarget} description={data.scenarios.bull.description} points={data.scenarios.bull.points} />
              </div>
            ),
          },
        ]}
      />

      {/* ── Desktop: Moat analysis ── */}
      <div className="hidden md:block">
        <AnalysisSection title={data.moat.analysisTitle}>
          <div className="space-y-5">
            {MoatAnalysisCard}
            <TenMoatsCard data={data.tenMoats as unknown as TenMoatsAssessment} />
          </div>
        </AnalysisSection>
      </div>

      {/* ── Desktop: Growth detail ── */}
      <div className="hidden md:block">
        {(data.growth.growthAnalysis || data.growth.additionalNote) && (
          <AnalysisSection title="Growth Analysis">
            <div className="space-y-4">
              {data.growth.growthAnalysis && <GrowthAnalysisCard ga={data.growth.growthAnalysis} />}
              {data.growth.additionalNote && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
                  <h4 className="text-base font-bold text-white/85 mb-4">{data.growth.additionalNote.title}</h4>
                  <div className="space-y-3">
                    {data.growth.additionalNote.points.map((point, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1 h-1 rounded-full bg-emerald-400/60 shrink-0 mt-2" />
                        <span className="text-sm text-white/60 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnalysisSection>
        )}
      </div>

      {/* ── Extra sections ── */}
      {data.extraSections?.map((section, i) => (
        <React.Fragment key={i}>
          {section.type === 'grid-cards' && <GridCardsSection section={section} />}
          {section.type === 'production-timeline' && <ProductionTimelineSection section={section} />}
        </React.Fragment>
      ))}

      {/* ── Desktop: Price scenarios ── */}
      <div className="hidden md:block">
        <AnalysisSection title="Price Scenarios (12–24 Months)">
          <div className="space-y-5">
            <LivePriceWidget
              slug={data.slug}
              fairValue={data.valuation.valuationNote?.fairValue}
            />
            {data.valuation.valuationNote && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
                <h4 className="text-base font-bold text-white/85 mb-3">Valuation Analysis</h4>
                <p className="text-sm text-white/55 leading-relaxed">
                  {data.valuation.valuationNote.text}{' '}
                  <strong className="text-white text-lg">{data.valuation.valuationNote.fairValue}</strong>.
                </p>
              </div>
            )}
            {data.valuation.peAnalysis && <ForwardPECard data={data.valuation.peAnalysis} />}
            <ScenarioPriceBar
              slug={data.slug}
              bearTarget={data.scenarios.bear.priceTarget}
              baseTarget={data.scenarios.base.priceTarget}
              bullTarget={data.scenarios.bull.priceTarget}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScenarioCard type="Bear" priceTarget={data.scenarios.bear.priceTarget} description={data.scenarios.bear.description} points={data.scenarios.bear.points} />
              <ScenarioCard type="Base" priceTarget={data.scenarios.base.priceTarget} description={data.scenarios.base.description} points={data.scenarios.base.points} />
              <ScenarioCard type="Bull" priceTarget={data.scenarios.bull.priceTarget} description={data.scenarios.bull.description} points={data.scenarios.bull.points} />
            </div>
          </div>
        </AnalysisSection>
      </div>

    </div>
  );
}
