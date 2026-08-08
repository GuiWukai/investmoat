import { NextResponse } from 'next/server';

/**
 * USD→CAD mid from Yahoo Finance (USDCAD=X).
 * Used by My Portfolio to total mixed USD/CAD quotes in one book currency.
 */
export async function GET() {
  try {
    const url =
      'https://query1.finance.yahoo.com/v8/finance/chart/USDCAD%3DX?interval=1d&range=1d';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; investmoat/1.0)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const rate: number | null = meta?.regularMarketPrice ?? null;

    if (rate == null || !Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    const timestamp: string | null = meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null;

    return NextResponse.json(
      { pair: 'USDCAD', rate, timestamp },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
