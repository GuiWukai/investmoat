import { getAllSlugs, getStockData } from '@/data/stocks';

/** How far ahead to scan the Nasdaq earnings calendar. */
export const EARNINGS_LOOKAHEAD_DAYS = 60;

/** Cache window for upstream day fetches and the aggregated calendar. */
export const EARNINGS_REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours

export type EarningsSession = 'bmo' | 'amc' | 'unknown';

export interface EarningsEvent {
  date: string; // YYYY-MM-DD
  ticker: string;
  slug: string;
  name: string;
  href: string;
  session: EarningsSession;
  epsForecast: string | null;
  fiscalQuarterEnding: string | null;
}

export interface EarningsCalendarResult {
  events: EarningsEvent[];
  asOf: string;
  from: string;
  to: string;
  coverageCount: number;
}

type NasdaqRow = {
  symbol?: string;
  name?: string;
  time?: string;
  epsForecast?: string;
  fiscalQuarterEnding?: string;
};

type NasdaqDayResponse = {
  data?: {
    rows?: NasdaqRow[] | null;
  } | null;
};

/** Tickers that never report earnings (ETFs, private companies). */
const NON_REPORTERS = new Set(['SPCX', 'VOO', 'SOXX', 'INIO']);

function isoDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addUtcDays(iso: string, days: number): string {
  const [y, m, day] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  dt.setUTCDate(dt.getUTCDate() + days);
  return isoDateUTC(dt);
}

function dateRange(from: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addUtcDays(from, i));
}

function parseSession(time: string | undefined): EarningsSession {
  switch (time) {
    case 'time-pre-market':
      return 'bmo';
    case 'time-after-hours':
      return 'amc';
    default:
      return 'unknown';
  }
}

/**
 * Coverage names that can appear on a US earnings calendar.
 * Crypto, commodities, ETFs, and private companies are excluded.
 */
export function getEarningsEligibleCoverage(): Map<
  string,
  { slug: string; name: string; href: string }
> {
  const map = new Map<string, { slug: string; name: string; href: string }>();

  for (const slug of getAllSlugs()) {
    const stock = getStockData(slug);
    if (!stock) continue;

    const assetClass = stock.assetClass ?? 'equity';
    if (assetClass === 'crypto' || assetClass === 'commodity') continue;

    const ticker = stock.ticker.trim().toUpperCase();
    if (!ticker || NON_REPORTERS.has(ticker)) continue;
    // Nasdaq calendar is US-listed symbols; skip exchange-suffixed tickers.
    if (ticker.includes('.')) continue;

    map.set(ticker, {
      slug: stock.slug,
      name: stock.name,
      href: `/stocks/${stock.slug}`,
    });
  }

  return map;
}

async function fetchNasdaqDay(date: string): Promise<NasdaqRow[]> {
  const url = `https://api.nasdaq.com/api/calendar/earnings?date=${date}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; investmoat/1.0)',
      Accept: 'application/json',
    },
    next: { revalidate: EARNINGS_REVALIDATE_SECONDS },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as NasdaqDayResponse;
  return json.data?.rows ?? [];
}

/**
 * Upcoming earnings for the InvestMoat coverage universe.
 * Sourced from Nasdaq's public earnings calendar, filtered to covered equities.
 */
export async function getEarningsCalendar(
  lookaheadDays: number = EARNINGS_LOOKAHEAD_DAYS,
): Promise<EarningsCalendarResult> {
  const coverage = getEarningsEligibleCoverage();
  const from = isoDateUTC(new Date());
  const dates = dateRange(from, lookaheadDays);
  const to = dates[dates.length - 1] ?? from;

  const dayRows = await Promise.all(dates.map((d) => fetchNasdaqDay(d)));

  const events: EarningsEvent[] = [];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    for (const row of dayRows[i]) {
      const ticker = (row.symbol ?? '').trim().toUpperCase();
      const covered = coverage.get(ticker);
      if (!covered) continue;

      events.push({
        date,
        ticker,
        slug: covered.slug,
        name: covered.name,
        href: covered.href,
        session: parseSession(row.time),
        epsForecast: row.epsForecast?.trim() || null,
        fiscalQuarterEnding: row.fiscalQuarterEnding?.trim() || null,
      });
    }
  }

  events.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.ticker.localeCompare(b.ticker);
  });

  return {
    events,
    asOf: new Date().toISOString(),
    from,
    to,
    coverageCount: coverage.size,
  };
}
