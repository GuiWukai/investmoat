'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface LivePriceData {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  timestamp: string | null;
}

interface LivePriceWidgetProps {
  slug: string;
  fairValue?: string;
}

function parseFairValue(fv: string): number | null {
  const match = fv.match(/\$?([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ''));
}

function formatPrice(price: number, currency: string): string {
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'USD' ? `$${formatted}` : `${formatted} ${currency}`;
}

export function LivePriceWidget({ slug, fairValue }: LivePriceWidgetProps) {
  const [data, setData] = useState<LivePriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrice() {
      try {
        const res = await fetch(`/api/stock-price/${slug}`);
        if (!res.ok) throw new Error('fetch failed');
        const json: LivePriceData = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPrice();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex items-center gap-2">
        <RefreshCw size={13} className="animate-spin text-white/30" />
        <span className="text-sm text-white/35">Fetching live price…</span>
      </div>
    );
  }

  if (!data || data.price == null) return null;

  const isPositive = (data.change ?? 0) >= 0;
  const priceStr = formatPrice(data.price, data.currency);
  const fairNum = fairValue ? parseFairValue(fairValue) : null;
  const liveMoS = fairNum && data.price ? ((fairNum - data.price) / fairNum) * 100 : null;
  const timeStr = data.timestamp
    ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
    : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="section-label">Live Market Price</span>
        {timeStr && <span className="text-[10px] text-white/22 ml-auto">as of {timeStr}</span>}
      </div>

      {/* Price + change */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl font-black text-white">{priceStr}</span>
        {data.change != null && data.changePercent != null && (
          <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{data.change.toFixed(2)}{' '}
            ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </span>
        )}
      </div>

      {/* Live margin of safety */}
      {liveMoS !== null && (
        <>
          <div className="h-px bg-white/[0.05] my-4" />
          <div className="flex justify-between items-center">
            <span className="section-label">Live Margin of Safety</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg border"
              style={
                liveMoS >= 15
                  ? { color: '#34d399', borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.08)' }
                  : liveMoS >= 0
                  ? { color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.08)' }
                  : { color: '#fb7185', borderColor: 'rgba(251,113,133,0.2)', background: 'rgba(251,113,133,0.08)' }
              }>
              {liveMoS >= 0 ? `${liveMoS.toFixed(1)}% discount` : `${Math.abs(liveMoS).toFixed(1)}% premium`}
            </span>
          </div>
          <p className="text-[10px] text-white/25 mt-1.5">vs. fair value of {fairValue}</p>
        </>
      )}
    </div>
  );
}
