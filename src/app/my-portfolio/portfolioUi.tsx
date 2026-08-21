'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  Plus,
} from 'lucide-react';
import { Card, Spinner, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { ScorePill } from '@/app/sectors/scoreUi';
import { getSectorByKey } from '@/lib/sectorCatalog';
import {
  PORTFOLIO_CURRENCIES,
  type PortfolioCurrency,
} from '@/lib/portfolioCurrency';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  computeValuationScore,
  parseScenarioPrice,
} from '@/lib/valuationScore';

export { ScorePill };

export type HoldingsSortKey =
  | 'name'
  | 'score'
  | 'shares'
  | 'avgCost'
  | 'price'
  | 'change'
  | 'value'
  | 'pnl';
export type SortDir = 'asc' | 'desc';

export const HOLDINGS_SORT_OPTIONS: { key: HoldingsSortKey; label: string }[] = [
  { key: 'name', label: 'Holding' },
  { key: 'score', label: 'Score' },
  { key: 'shares', label: 'Shares' },
  { key: 'avgCost', label: 'Avg cost' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: '1D %' },
  { key: 'value', label: 'Value' },
  { key: 'pnl', label: 'P&L' },
];

/** Full-row link — children are pointer-events-none so iOS taps hit the <a>. */
export const HOLDING_ROW_CLASS =
  'group relative flex w-full cursor-pointer touch-manipulation items-center gap-3 px-4 py-3.5 text-left no-underline transition-colors hover:bg-foreground/[0.035] md:gap-4 md:px-5 [&>*]:pointer-events-none';

const CURRENCY_PILL =
  'pill-toggle rounded-full px-3 py-1 text-xs font-semibold';

export function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatShares(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatWeight(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(1)}%`;
}

export function accentForCategory(category: string | undefined): string {
  if (!category) return '#6b7280';
  return getSectorByKey(category)?.color ?? '#6b7280';
}

/** Live composite when a quote exists; otherwise the static coverage score. */
export function compositeForStock(
  stock: (typeof allCoverageData)[number] | undefined,
  nativePrice: number | null
): number | null {
  if (!stock) return null;
  const [moat, growth, staticValuation] = stock.scores;
  const bear = parseScenarioPrice(stock.bearTarget);
  const base = parseScenarioPrice(stock.baseTarget);
  const bull = parseScenarioPrice(stock.bullTarget);
  const valuation =
    nativePrice != null && bear && base && bull
      ? computeValuationScore(nativePrice, bear, base, bull)
      : staticValuation;
  return Math.round(getAverageScore([moat, growth, valuation]));
}

export function TickerBadge({
  ticker,
  color,
}: {
  ticker: string;
  color: string;
}) {
  return (
    <div
      className="flex h-9 min-w-[52px] shrink-0 items-center justify-center rounded-lg px-2 font-mono text-[11px] font-black tracking-wider"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}30`,
        color,
      }}
    >
      {ticker}
    </div>
  );
}

export function DeltaBadge({
  value,
  loading,
}: {
  value: number | null | undefined;
  loading?: boolean;
}) {
  if (loading) return <Spinner size="sm" color="current" />;
  if (value == null || !Number.isFinite(value)) {
    return (
      <span className="text-sm font-semibold tabular-nums text-foreground/25">—</span>
    );
  }
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[13px] font-semibold tabular-nums ${
        up
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
      }`}
    >
      {up ? <ArrowUp size={12} strokeWidth={2.4} /> : <ArrowDown size={12} strokeWidth={2.4} />}
      {formatPct(value)}
    </span>
  );
}

export function SignedMoney({
  value,
  formatted,
  size = 'md',
}: {
  value: number | null | undefined;
  formatted: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (value == null || !Number.isFinite(value)) {
    return (
      <span className="font-mono tabular-nums text-foreground/25">{formatted}</span>
    );
  }
  const up = value >= 0;
  const cls = up ? 'text-emerald-400' : 'text-rose-400';
  const text =
    size === 'lg' ? 'text-xl tracking-tight' : size === 'sm' ? 'text-[13px]' : 'text-sm';
  return (
    <span className={`font-mono font-semibold tabular-nums ${text} ${cls}`}>
      {formatted}
    </span>
  );
}

export function BackToBookLink({
  href = '/my-portfolio',
  label = 'My Portfolio',
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link className="text-link mb-6 text-[13px]" href={href}>
      <ArrowLeft size={14} />
      {label}
    </Link>
  );
}

export function CurrencyToggle({
  value,
  onChange,
}: {
  value: PortfolioCurrency;
  onChange: (next: PortfolioCurrency) => void;
}) {
  return (
    <ToggleButtonGroup
      aria-label="Portfolio currency"
      className="flex items-center gap-1.5"
      isDetached
      selectedKeys={new Set([value])}
      selectionMode="single"
      size="sm"
      onSelectionChange={(keys) => {
        const key = [...keys][0];
        if (key == null) return;
        const next = String(key);
        if (next === 'USD' || next === 'CAD') onChange(next);
      }}
    >
      {PORTFOLIO_CURRENCIES.map((code) => (
        <ToggleButton key={code} id={code} className={CURRENCY_PILL}>
          {code}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function AlertBanner({
  tone = 'danger',
  children,
}: {
  tone?: 'danger' | 'muted';
  children: ReactNode;
}) {
  if (tone === 'muted') {
    return (
      <p className="mt-4 font-mono text-[11px] text-foreground/28">{children}</p>
    );
  }
  return (
    <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300">
      {children}
    </div>
  );
}

export function BookHero({
  eyebrow = 'Personal',
  title,
  dek,
  actions,
  back,
  end,
}: {
  eyebrow?: string;
  title: ReactNode;
  dek: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <header className="relative pb-10 pt-6 md:pb-12 md:pt-10">
      <div className="hero-mesh" aria-hidden />
      <div className="relative animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        {back}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="icon-tile">
              <Briefcase size={18} strokeWidth={1.7} />
            </span>
            <p className="section-label mb-0">{eyebrow}</p>
          </div>
          {end}
        </div>
        <h1 className="page-title gradient-text-animated mb-4">{title}</h1>
        <p className="page-dek">{dek}</p>
        {actions ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

export function EmptyBook() {
  return (
    <Card className="product-card flex flex-col items-center overflow-hidden px-6 py-12 text-center md:px-12 md:py-16">
      <span className="icon-tile mb-6">
        <Briefcase size={18} strokeWidth={1.7} />
      </span>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
        Start your book
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-foreground/42">
        Add a covered name, set shares, and optionally average cost. Totals
        convert USD and CAD quotes into your book currency. Everything stays in
        this browser.
      </p>
      <div className="mt-8">
        <Link href="/my-portfolio/add" className="btn-primary">
          <Plus size={16} />
          Add holding
        </Link>
      </div>
      <p className="mt-5 text-[13px] text-foreground/32">
        Browse the{' '}
        <Link className="text-gold-bright underline-offset-2 hover:underline" href="/stocks">
          coverage universe
        </Link>{' '}
        or the{' '}
        <Link className="text-gold-bright underline-offset-2 hover:underline" href="/portfolio">
          IM25
        </Link>
        .
      </p>
    </Card>
  );
}

export function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={11} className="text-foreground/15" />;
  return dir === 'asc' ? (
    <ArrowUp size={11} className="text-gold-bright" />
  ) : (
    <ArrowDown size={11} className="text-gold-bright" />
  );
}

export function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className,
  align = 'left',
}: {
  label: string;
  sortKey: HoldingsSortKey;
  active: boolean;
  dir: SortDir;
  onSort: (k: HoldingsSortKey) => void;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active ? 'text-gold-bright' : 'text-foreground/20 hover:text-foreground/45'
      } ${align === 'right' ? 'w-full justify-end' : ''} ${className ?? ''}`}
    >
      <span>{label}</span>
      <SortIndicator active={active} dir={dir} />
    </button>
  );
}

export type AllocationSlice = {
  slug: string;
  ticker: string;
  color: string;
  weight: number;
};

export function AllocationBar({
  slices,
  activeSlug,
  onActiveChange,
}: {
  slices: AllocationSlice[];
  activeSlug: string | null;
  onActiveChange: (slug: string | null) => void;
}) {
  if (slices.length === 0) {
    return (
      <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-foreground/[0.08]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-2.5 gap-0.5">
        {slices.map((slice) => {
          const dimmed = activeSlug != null && activeSlug !== slice.slug;
          return (
            <button
              key={slice.slug}
              type="button"
              aria-label={`${slice.ticker} ${formatWeight(slice.weight)} of book`}
              className="h-full min-w-[3px] rounded-full transition-opacity duration-200"
              style={{
                flexGrow: Math.max(slice.weight, 0.8),
                flexBasis: 0,
                background: slice.color,
                opacity: dimmed ? 0.22 : 0.95,
              }}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') onActiveChange(slice.slug);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') onActiveChange(null);
              }}
              onClick={() =>
                onActiveChange(activeSlug === slice.slug ? null : slice.slug)
              }
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {slices.slice(0, 8).map((slice) => {
          const active = activeSlug === slice.slug;
          return (
            <button
              key={slice.slug}
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition-colors ${
                active ? 'bg-foreground/[0.07] text-foreground' : 'text-foreground/45 hover:text-foreground/75'
              }`}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') onActiveChange(slice.slug);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') onActiveChange(null);
              }}
              onClick={() =>
                onActiveChange(activeSlug === slice.slug ? null : slice.slug)
              }
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: slice.color }}
              />
              {slice.ticker}
              <span className="font-mono tabular-nums text-foreground/30">
                {formatWeight(slice.weight)}
              </span>
            </button>
          );
        })}
        {slices.length > 8 && (
          <span className="self-center text-[11px] text-foreground/28">
            +{slices.length - 8}
          </span>
        )}
      </div>
    </div>
  );
}
