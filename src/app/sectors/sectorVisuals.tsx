import {
  Cpu,
  Factory,
  Gem,
  HeartPulse,
  Landmark,
  Layers,
  Coins,
  ShoppingBag,
  Code2,
  Share2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { SectorSlug } from '@/lib/sectorCatalog';
import { scoreColor } from './scoreUi';

export { MetricBand } from '@/components/MetricBand';

const SECTOR_ICONS: Record<SectorSlug, LucideIcon> = {
  platforms: Share2,
  software: Code2,
  semiconductors: Cpu,
  financials: Landmark,
  healthcare: HeartPulse,
  industrials: Factory,
  energy: Zap,
  consumer: ShoppingBag,
  'hard-assets': Gem,
  crypto: Coins,
  other: Layers,
};

export function SectorIconTile({
  slug,
  color,
  size = 'md',
}: {
  slug: SectorSlug;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const Icon = SECTOR_ICONS[slug];
  const box =
    size === 'lg' ? 'h-14 w-14 rounded-2xl' : size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-xl';
  const iconSize = size === 'lg' ? 26 : size === 'sm' ? 16 : 20;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${box}`}
      style={{
        background: `linear-gradient(160deg, ${color}38 0%, ${color}10 100%)`,
        boxShadow: `inset 0 0 0 1px ${color}45, 0 10px 24px -12px ${color}80`,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.7} style={{ color }} aria-hidden />
    </span>
  );
}

export function PillarMeter({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading?: boolean;
}) {
  const color = scoreColor(value);
  const width = Math.max(4, Math.min(100, value));

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-11 shrink-0 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
        {label}
      </span>
      <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-foreground/[0.08]" />
        ) : (
          <div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
            }}
          />
        )}
      </div>
      <span
        className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums"
        style={{ color: loading ? 'rgba(244,241,234,0.2)' : color }}
      >
        {loading ? '—' : value}
      </span>
    </div>
  );
}

export function VsBookRow({
  label,
  sectorValue,
  bookValue,
}: {
  label: string;
  sectorValue: number;
  bookValue: number;
}) {
  const delta = sectorValue - bookValue;
  const color = scoreColor(sectorValue);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
          {label}
        </span>
        <span className="text-[12px] tabular-nums text-foreground/45">
          <span className="font-semibold text-foreground/80">{sectorValue}</span>
          <span className="mx-1.5 text-foreground/20">vs</span>
          {bookValue} book
          {delta !== 0 && (
            <span className={`ml-1.5 font-medium ${delta > 0 ? 'text-success' : 'text-danger'}`}>
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
        </span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(4, Math.min(100, sectorValue))}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
        <span
          className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-foreground/40"
          style={{ left: `${Math.max(1, Math.min(99, bookValue))}%` }}
          title={`Coverage average ${bookValue}`}
        />
      </div>
    </div>
  );
}
