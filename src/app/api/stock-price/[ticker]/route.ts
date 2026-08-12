import { NextRequest, NextResponse } from 'next/server';
import { getStockData } from '@/data/stocks';

// How long a Yahoo quote stays cached (Next data cache + browser/CDN).
// 15 minutes keeps prices reasonably fresh without hammering Yahoo's
// unofficial chart endpoint (no published quota; 429s are real).
const PRICE_REVALIDATE_SECONDS = 900;

// Yahoo Finance symbol overrides, for the slugs where the Yahoo symbol differs
// from the `ticker` field in src/data/stocks/<slug>.json: commodities quoted as
// futures contracts, crypto quoted as pairs, and non-US listings.
//
// Every other slug resolves straight from the stock registry (see
// resolveSymbol below), so adding a stock needs no edit here — this file used
// to carry a hand-maintained entry per slug, and any stock added without one
// silently served 404 instead of a price.
const YAHOO_SYMBOL_OVERRIDES: Record<string, string> = {
  gold:     'GC=F',    // json ticker XAU — gold futures
  silver:   'SI=F',    // json ticker XAG — silver futures
  copper:   'HG=F',    // json ticker HG  — copper futures
  btc:      'BTC-USD',
  ethereum: 'ETH-USD',
  solana:   'SOL-USD',
  k92:      'KNT.TO',  // json ticker KNT — Toronto listing
  bdt:      'BDT.TO',  // json ticker BDT — Toronto listing
  // Kazatomprom trades as USD-denominated GDRs on the LSE International Order
  // Book; KAP.IL is that line. Not the Kazakh ordinary share, which is KZT.
  kap:      'KAP.IL',
};

// Resolves a page slug to the Yahoo Finance symbol to quote, preferring an
// explicit override and otherwise using the ticker the coverage data declares.
function resolveSymbol(slug: string): string | null {
  const override = YAHOO_SYMBOL_OVERRIDES[slug];
  if (override) return override;

  const ticker = getStockData(slug)?.ticker.trim();
  return ticker ? ticker.toUpperCase() : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const slug = ticker.toLowerCase();
  const symbol = resolveSymbol(slug);

  if (!symbol) {
    return NextResponse.json({ error: 'Unknown ticker' }, { status: 404 });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; investmoat/1.0)' },
      next: { revalidate: PRICE_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;

    if (!meta) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    const price: number | null = meta.regularMarketPrice ?? null;
    const previousClose: number | null = meta.previousClose ?? meta.chartPreviousClose ?? null;
    const change = price != null && previousClose != null ? price - previousClose : null;
    const changePercent =
      change != null && previousClose ? (change / previousClose) * 100 : null;
    const currency: string = meta.currency ?? 'USD';
    const timestamp: string | null = meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null;

    return NextResponse.json(
      { symbol, price, previousClose, change, changePercent, currency, timestamp },
      {
        headers: {
          'Cache-Control': `public, max-age=${PRICE_REVALIDATE_SECONDS}, s-maxage=${PRICE_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
