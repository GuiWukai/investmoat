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
import { stockData, getAverageScore } from '@/app/stockData';
import { getStockData } from '@/data/stocks';
import type { TenMoatsAssessment } from '@/app/tenMoatsData';
import type { StockAnalysisData } from '@/types/stockAnalysis';
import { Card, CardBody, Chip, Divider } from '@heroui/react';

// ─── Lucide icon registry ────────────────────────────────────────────────────
import {
  Laptop, Cloud, Database, Cpu, Zap, Share2, ShoppingCart,
  DollarSign, Users, Target, Layers, Play, TrendingUp, Car,
  Battery, Globe, CreditCard, ShieldCheck, BarChart3, PenTool,
  Image, Landmark, Shield, BarChart, Calculator, Coins, Lock,
  Pickaxe, Gem, CheckCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string; color?: string }>> = {
  Laptop, Cloud, Database, Cpu, Zap, Share2, ShoppingCart,
  DollarSign, Users, Target, Layers, Play, TrendingUp, Car,
  Battery, Globe, CreditCard, ShieldCheck, BarChart3, PenTool,
  Image, Landmark, Shield, BarChart, Calculator, Coins, Lock,
  Pickaxe, Gem, CheckCircle,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Renders a string where **bold** markers become <strong> tags. */
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

function StockIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className="text-white" />;
}

// ─── Extra section renderers ──────────────────────────────────────────────────

function GridCardsSection({ section }: { section: NonNullable<StockAnalysisData['extraSections']>[number] }) {
  const accent = section.accentColor ?? 'var(--accent)';
  return (
    <AnalysisSection title={section.title}>
      <div className="glass-card" style={{ borderLeft: `4px solid ${accent}` }}>
        {section.gridHeader && (
          <h4 className="text-lg font-bold mb-4">{section.gridHeader}</h4>
        )}
        <p className="text-white/60 mb-6 text-sm leading-relaxed">{section.intro}</p>
        {section.cards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.cards.map((card, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: accent }}>{card.label}</span>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                  {card.text}
                </div>
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
      <div className="glass-card" style={{ borderLeft: `4px solid ${accent}` }}>
        <h4 className="text-lg font-bold mb-4">The Transformation Journey</h4>
        <p className="text-white/60 mb-6 text-sm leading-relaxed">{section.intro}</p>
        {section.stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {section.stats.map((stat, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: accent }}>{stat.label}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
        {section.closing && (
          <p className="text-white/60 mt-6 text-sm leading-relaxed">{section.closing}</p>
        )}
      </div>
    </AnalysisSection>
  );
}

// ─── Inline live price for the page header ───────────────────────────────────

function LiveHeaderPrice({ slug }: { slug: string }) {
  const [price, setPrice] = useState<string | null>(null);
  const [changePercent, setChangePercent] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || d?.price == null) return;
        const fmt = d.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
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
        <span className={`text-xs ml-1 ${positive ? 'text-success' : 'text-danger'}`}>
          ({positive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      )}
    </>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = React.use(params);
  const data = getStockData(ticker);
  if (!data) notFound();

  const stockEntry = stockData.find(s => s.ticker === data.ticker);
  const [liveValScore, setLiveValScore] = useState<number>(data.valuation.score);
  const [valLoading, setValLoading] = useState(true);
  const dynamicOverallScore = Math.round((data.moat.score + data.growth.score + liveValScore) / 3);

  const metricsCount = data.metrics.length;
  const gridCols = metricsCount === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3';

  // Moat analysis card content (shared between mobile tab and desktop section)
  const MoatAnalysisCard = (
    <Card className="bg-white/5 border-none backdrop-blur-md">
      <CardBody className="p-4 md:p-8">
        <p className="mb-4">
          <BoldText text={data.moat.analysisSummary} />
        </p>
        <ul className="list-disc pl-6 space-y-4 text-white/60">
          {data.moat.analysisPoints.map((point, i) => (
            <li key={i}>
              <strong className="text-white">{point.title}:</strong> {point.text}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      {/* ── Header ── */}
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          {data.chips.map((chip, i) => (
            <Chip key={i} color={chip.color as 'primary' | 'secondary' | 'success' | 'warning' | 'danger'} variant="flat" size="sm">
              {chip.label}
            </Chip>
          ))}
        </div>
        <div>
          <h1
            className="text-3xl md:text-6xl font-black mb-2 tracking-tight"
            style={data.titleColor ? { color: data.titleColor } : undefined}
          >
            {data.name}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            {data.headerStats.map((stat, i) => (
              <span key={i}>
                {stat.label}:{' '}
                {stat.label === 'Price'
                  ? <LiveHeaderPrice slug={data.slug} />
                  : <strong className="text-white">{stat.value}</strong>
                }
              </span>
            ))}
          </div>
        </div>
        <RecommendationBadge status={data.recommendation} />
      </header>

      {/* ── Key metrics (desktop) ── */}
      <div className={`hidden md:grid ${gridCols} gap-6`}>
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
      </div>

      {/* ── Score tabs ── */}
      <ScoreTabsRow
        overallScore={dynamicOverallScore}
        overallLoading={valLoading}
        tabs={[
          {
            label: 'Moat',
            gauge: (
              <ScoreGauge
                score={data.moat.score}
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
                {data.growth.additionalNote && (
                  <Card className="bg-white/5 border-none backdrop-blur-md p-6">
                    <h4 className="text-xl font-bold mb-6">{data.growth.additionalNote.title}</h4>
                    <div className="space-y-4">
                      {data.growth.additionalNote.points.map((point, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                          <span className="text-sm text-white/70">{point}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
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
                  <Card className="bg-white/5 border-none backdrop-blur-md p-6">
                    <h4 className="text-xl font-bold mb-6">Valuation Analysis</h4>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {data.valuation.valuationNote.text}{' '}
                      <strong className="text-white text-lg">{data.valuation.valuationNote.fairValue}</strong>.
                    </p>
                    <Divider className="my-4 bg-white/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-widest text-white/40">Margin of Safety</span>
                      <Chip color="success" variant="flat" className="font-bold">
                        {data.valuation.valuationNote.marginOfSafety}
                      </Chip>
                    </div>
                  </Card>
                )}
                <ScenarioCard
                  type="Bear"
                  priceTarget={data.scenarios.bear.priceTarget}
                  description={data.scenarios.bear.description}
                  points={data.scenarios.bear.points}
                />
                <ScenarioCard
                  type="Base"
                  priceTarget={data.scenarios.base.priceTarget}
                  description={data.scenarios.base.description}
                  points={data.scenarios.base.points}
                />
                <ScenarioCard
                  type="Bull"
                  priceTarget={data.scenarios.bull.priceTarget}
                  description={data.scenarios.bull.description}
                  points={data.scenarios.bull.points}
                />
              </div>
            ),
          },
        ]}
      />

      {/* ── Moat analysis section (desktop only) ── */}
      <div className="hidden md:block">
        <AnalysisSection title={data.moat.analysisTitle}>
          <div className="space-y-6">
            {MoatAnalysisCard}
            <TenMoatsCard data={data.tenMoats as unknown as TenMoatsAssessment} />
          </div>
        </AnalysisSection>
      </div>

      {/* ── Extra sections (Gold tailwinds, K92 timeline, etc.) ── */}
      {data.extraSections?.map((section, i) => (
        <React.Fragment key={i}>
          {section.type === 'grid-cards' && <GridCardsSection section={section} />}
          {section.type === 'production-timeline' && <ProductionTimelineSection section={section} />}
        </React.Fragment>
      ))}

      {/* ── Price scenarios (desktop only) ── */}
      <div className="hidden md:block">
        <AnalysisSection title="Price Scenarios (12-24 Months)">
          <LivePriceWidget
            slug={data.slug}
            fairValue={data.valuation.valuationNote?.fairValue}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <ScenarioCard
              type="Bear"
              priceTarget={data.scenarios.bear.priceTarget}
              description={data.scenarios.bear.description}
              points={data.scenarios.bear.points}
            />
            <ScenarioCard
              type="Base"
              priceTarget={data.scenarios.base.priceTarget}
              description={data.scenarios.base.description}
              points={data.scenarios.base.points}
            />
            <ScenarioCard
              type="Bull"
              priceTarget={data.scenarios.bull.priceTarget}
              description={data.scenarios.bull.description}
              points={data.scenarios.bull.points}
            />
          </div>
        </AnalysisSection>
      </div>
    </div>
  );
}
