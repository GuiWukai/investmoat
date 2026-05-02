import { NextRequest, NextResponse } from 'next/server';

// Maps internal page slugs to Yahoo Finance symbols
const YAHOO_SYMBOL_MAP: Record<string, string> = {
  amazon:     'AMZN',
  msft:       'MSFT',
  nvda:       'NVDA',
  meta:       'META',
  asml:       'ASML',
  amd:        'AMD',
  nflx:       'NFLX',
  tesla:      'TSLA',
  visa:       'V',
  mastercard: 'MA',
  crm:        'CRM',
  adbe:       'ADBE',
  spgi:       'SPGI',
  intuit:     'INTU',
  gold:       'GC=F',
  btc:        'BTC-USD',
  k92:        'KNT.TO',
  pltr:       'PLTR',
  // Previously missing
  google:     'GOOGL',
  orcl:       'ORCL',
  now:        'NOW',
  avgo:       'AVGO',
  coin:       'COIN',
  tsm:        'TSM',
  crowdstrike:'CRWD',
  ethereum:   'ETH-USD',
  solana:     'SOL-USD',
  aapl:       'AAPL',
  costco:     'COST',
  micron:     'MU',
  mstr:       'MSTR',
  mco:        'MCO',
  msci:       'MSCI',
  meli:       'MELI',
  lly:        'LLY',
  lmt:        'LMT',
  unh:        'UNH',
  nee:        'NEE',
  isrg:       'ISRG',
  fcx:        'FCX',
  ccj:        'CCJ',
  ceg:        'CEG',
  gev:        'GEV',
  tdg:        'TDG',
  race:       'RACE',
  shop:       'SHOP',
  net:        'NET',
  axon:       'AXON',
  applovin:   'APP',
  fico:       'FICO',
  ttd:        'TTD',
  panw:       'PANW',
  arm:        'ARM',
  anet:       'ANET',
  rddt:       'RDDT',
  sea:        'SE',
  sofi:       'SOFI',
  fig:        'FIG',
  disney:     'DIS',
  fanuc:      'FANUY',
  ice:        'ICE',
  okta:       'OKTA',
  duolingo:   'DUOL',
  hood:       'HOOD',
  vst:        'VST',
  tmo:        'TMO',
  klac:       'KLAC',
};

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

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; investmoat/1.0)' },
      next: { revalidate: 3600 },
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
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
