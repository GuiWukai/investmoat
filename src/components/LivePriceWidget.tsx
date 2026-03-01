'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Divider } from '@heroui/react';
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
  /** Page slug used to resolve the Yahoo Finance symbol */
  slug: string;
  /** Optional fair value string, e.g. "$215/share". Used to compute live margin of safety. */
  fairValue?: string;
}

/** Parse a dollar amount from strings like "$215/share" or "$590/share". */
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
        // silently fail — static data still visible on the page
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPrice();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <Card className="bg-white/5 border-none backdrop-blur-md">
        <CardBody className="p-4 flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin text-white/40" />
          <span className="text-sm text-white/40">Fetching live price…</span>
        </CardBody>
      </Card>
    );
  }

  if (!data || data.price == null) return null;

  const isPositive = (data.change ?? 0) >= 0;
  const priceStr = formatPrice(data.price, data.currency);

  // Live margin of safety vs. analyst fair value
  const fairNum = fairValue ? parseFairValue(fairValue) : null;
  const liveMoS = fairNum && data.price ? ((fairNum - data.price) / fairNum) * 100 : null;

  const timeStr = data.timestamp
    ? new Date(data.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null;

  return (
    <Card className="bg-white/5 border-none backdrop-blur-md">
      <CardBody className="p-4 md:p-6">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
            Live Market Price
          </span>
          {timeStr && (
            <span className="text-[10px] text-white/25 ml-auto">as of {timeStr}</span>
          )}
        </div>

        {/* Price + change */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-black">{priceStr}</span>
          {data.change != null && data.changePercent != null && (
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? '+' : ''}
              {data.change.toFixed(2)} ({isPositive ? '+' : ''}
              {data.changePercent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* Live margin of safety */}
        {liveMoS !== null && (
          <>
            <Divider className="my-4 bg-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-white/40">
                Live Margin of Safety
              </span>
              <Chip
                color={liveMoS >= 15 ? 'success' : liveMoS >= 0 ? 'warning' : 'danger'}
                variant="flat"
                className="font-bold"
              >
                {liveMoS >= 0
                  ? `${liveMoS.toFixed(1)}% discount`
                  : `${Math.abs(liveMoS).toFixed(1)}% premium`}
              </Chip>
            </div>
            <p className="text-xs text-white/30 mt-1">vs. fair value of {fairValue}</p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
