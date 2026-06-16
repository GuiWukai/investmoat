export const YAHOO_SYMBOL_MAP: Record<string, string> = {
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
  copper:     'HG=F',
  silver:     'SI=F',
  uranium:    'URA',
  btc:        'BTC-USD',
  k92:        'KNT.TO',
  pltr:       'PLTR',
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
  lng:        'LNG',
  abnb:       'ABNB',
  baba:       'BABA',
  bidu:       'BIDU',
  crdo:       'CRDO',
  de:         'DE',
  dell:       'DELL',
  el:         'EL',
  etn:        'ETN',
  hims:       'HIMS',
  keyence:    '6861.T',
  keys:       'KEYS',
  lulu:       'LULU',
  nvo:        'NVO',
  pdd:        'PDD',
  smci:       'SMCI',
  spot:       'SPOT',
  nke:        'NKE',
  uber:       'UBER',
  vrt:        'VRT',
  snow:       'SNOW',
  ddog:       'DDOG',
  mdb:        'MDB',
  snps:       'SNPS',
  cdns:       'CDNS',
  crwv:       'CRWV',
  nbis:       'NBIS',
  jpm:        'JPM',
  bx:         'BX',
  kkr:        'KKR',
  gs:         'GS',
  ms:         'MS',
  pwr:        'PWR',
  tt:         'TT',
  hon:        'HON',
  qcom:       'QCOM',
  elv:        'ELV',
  vrtx:       'VRTX',
  regn:       'REGN',
  dash:       'DASH',
  rblx:       'RBLX',
  soxx:       'SOXX',
  voo:        'VOO',
};

export type PriceData = {
  symbol: string;
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  timestamp: string | null;
};

export async function fetchYahooPrice(symbol: string): Promise<PriceData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; investmoat/1.0)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price: number | null = meta.regularMarketPrice ?? null;
    const previousClose: number | null = meta.previousClose ?? meta.chartPreviousClose ?? null;
    const change = price != null && previousClose != null ? price - previousClose : null;
    const changePercent = change != null && previousClose ? (change / previousClose) * 100 : null;

    return {
      symbol,
      price,
      previousClose,
      change,
      changePercent,
      currency: meta.currency ?? 'USD',
      timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
    };
  } catch {
    return null;
  }
}
