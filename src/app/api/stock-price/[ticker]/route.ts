import { NextRequest, NextResponse } from 'next/server';
import { YAHOO_SYMBOL_MAP, fetchYahooPrice } from '@/lib/stockPrices';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const slug = ticker.toLowerCase();
  const symbol = YAHOO_SYMBOL_MAP[slug];

  if (!symbol) {
    return NextResponse.json({ error: 'Unknown ticker' }, { status: 404 });
  }

  const data = await fetchYahooPrice(symbol);
  if (!data) {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600' },
  });
}
