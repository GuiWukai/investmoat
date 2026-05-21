import { NextRequest, NextResponse } from 'next/server';
import { YAHOO_SYMBOL_MAP, fetchYahooPrice, type PriceData } from '@/lib/stockPrices';

const MAX_TICKERS = 200;

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get('tickers');
  if (!param) {
    return NextResponse.json({ error: 'Missing tickers parameter' }, { status: 400 });
  }

  const slugs = Array.from(
    new Set(
      param.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    )
  ).slice(0, MAX_TICKERS);

  if (slugs.length === 0) {
    return NextResponse.json({ prices: {} });
  }

  const results = await Promise.all(
    slugs.map(async slug => {
      const symbol = YAHOO_SYMBOL_MAP[slug];
      if (!symbol) return [slug, null] as const;
      const data = await fetchYahooPrice(symbol);
      return [slug, data] as const;
    })
  );

  const prices: Record<string, PriceData | null> = Object.fromEntries(results);

  return NextResponse.json(
    { prices },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600' } },
  );
}
