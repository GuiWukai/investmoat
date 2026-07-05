'use client';

import { useEffect, useState } from 'react';
import { parseScenarioPrice } from '@/lib/valuationScore';

interface ScenarioPriceBarProps {
  slug: string;
  bearTarget: string;
  baseTarget: string;
  bullTarget: string;
}

const BEAR = '#fb7185';
const BASE = '#60a5fa';
const BULL = '#34d399';

export function ScenarioPriceBar({
  slug,
  bearTarget,
  baseTarget,
  bullTarget,
}: ScenarioPriceBarProps) {
  const bear = parseScenarioPrice(bearTarget);
  const base = parseScenarioPrice(baseTarget);
  const bull = parseScenarioPrice(bullTarget);

  const [price, setPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bear || !base || !bull) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/stock-price/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled) return;
        if (d?.price != null) {
          setPrice(d.price);
          if (d.currency) setCurrency(d.currency);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, bear, base, bull]);

  if (!bear || !base || !bull) return null;

  const lo = Math.min(bear, price ?? bear) * 0.92;
  const hi = Math.max(bull, price ?? bull) * 1.08;
  const span = hi - lo;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - lo) / span) * 100));

  const fmt = (v: number) =>
    v.toLocaleString('en-US', {
      minimumFractionDigits: v < 100 ? 2 : 0,
      maximumFractionDigits: v < 100 ? 2 : 0,
    });
  const sym = currency === 'USD' ? '$' : '';

  const bearPct = pct(bear);
  const basePct = pct(base);
  const bullPct = pct(bull);
  const pricePct = price != null ? pct(price) : null;

  let bucketCopy: string | null = null;
  let bucketColor = 'rgba(255,255,255,0.5)';
  if (price != null) {
    if (price < bear) {
      const off = (((bear - price) / bear) * 100).toFixed(0);
      bucketCopy = `Trading ${off}% below the bear target (${bearTarget}) — deeply discounted vs all scenarios.`;
      bucketColor = BEAR;
    } else if (price < base) {
      const off = (((base - price) / base) * 100).toFixed(0);
      bucketCopy = `${off}% below the base case (${baseTarget}) — attractively priced.`;
      bucketColor = BEAR;
    } else if (price < bull) {
      const off = (((bull - price) / bull) * 100).toFixed(0);
      bucketCopy = `Above base, ${off}% below bull (${bullTarget}) — fairly priced.`;
      bucketColor = BASE;
    } else {
      const over = (((price - bull) / bull) * 100).toFixed(0);
      bucketCopy = `Trading ${over}% above the bull target (${bullTarget}) — pricing in upside scenarios.`;
      bucketColor = BULL;
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-base font-bold text-white/85">Where We Are vs Targets</h4>
        {price != null && (
          <span className="text-sm text-white/50">
            Current:{' '}
            <strong className="text-white">
              {sym}
              {fmt(price)}
            </strong>
          </span>
        )}
      </div>

      <div className="relative h-28 mt-6 mb-2">
        {pricePct != null && price != null && (
          <>
            {/* Floating label sits above the dot, connected by a thin line */}
            <div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{
                left: `${pricePct}%`,
                bottom: 'calc(50% + 7px)',
                transform: 'translateX(-50%)',
              }}
            >
              <span
                className="text-[11px] font-bold text-white whitespace-nowrap rounded-md px-2 py-1 border backdrop-blur"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                {sym}
                {fmt(price)}
              </span>
              <div className="w-px h-2 bg-white/50" />
            </div>

            {/* Dot sits ON the bar */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${pricePct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full bg-white"
                style={{
                  boxShadow:
                    '0 0 0 3px rgba(15,23,42,0.95), 0 0 12px rgba(255,255,255,0.45)',
                }}
              />
            </div>
          </>
        )}

        <div
          className="absolute left-0 right-0 h-2 rounded-full"
          style={{
            top: 'calc(50% - 4px)',
            background: `linear-gradient(to right,
              rgba(251,113,133,0.35) 0%,
              rgba(251,113,133,0.55) ${bearPct}%,
              rgba(96,165,250,0.55) ${basePct}%,
              rgba(52,211,153,0.55) ${bullPct}%,
              rgba(52,211,153,0.35) 100%)`,
          }}
        />

        {[
          { label: 'Bear', valStr: bearTarget, hex: BEAR, pos: bearPct },
          { label: 'Base', valStr: baseTarget, hex: BASE, pos: basePct },
          { label: 'Bull', valStr: bullTarget, hex: BULL, pos: bullPct },
        ].map(t => (
          <div
            key={t.label}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${t.pos}%`,
              top: 'calc(50% - 8px)',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-px h-4" style={{ background: t.hex }} />
            <div
              className="text-[10px] font-black uppercase tracking-widest mt-1.5"
              style={{ color: t.hex }}
            >
              {t.label}
            </div>
            <div className="text-[11px] text-white/70 mt-0.5 whitespace-nowrap">
              {t.valStr}
            </div>
          </div>
        ))}
      </div>

      {bucketCopy && (
        <p
          className="text-xs mt-3 leading-relaxed border-l-2 pl-3"
          style={{ color: 'rgba(255,255,255,0.7)', borderColor: bucketColor }}
        >
          {bucketCopy}
        </p>
      )}
      {loading && price == null && (
        <p className="text-xs text-white/40 mt-3">Loading live price…</p>
      )}
      {!loading && price == null && (
        <p className="text-xs text-white/40 mt-3">Live price unavailable — bar shows scenario range only.</p>
      )}
    </div>
  );
}
