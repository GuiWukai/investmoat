import { allCoverageData, getAverageScore } from '@/app/stockData';
import { getAllSlugs, getStockData } from '@/data/stocks';
import { getSectorByKey } from '@/lib/sectorCatalog';

/** How far ahead to scan the Nasdaq earnings calendar. */
export const EARNINGS_LOOKAHEAD_DAYS = 60;

/** Recently reported names stay on the desk for this many days. */
export const EARNINGS_LOOKBACK_DAYS = 7;

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
  category: string | null;
  sectorSlug: string | null;
  sectorColor: string | null;
  score: number | null;
  lastAnalyzed: string | null;
  lastAnalyzedISO: string | null;
  /** True when the report date is before today (UTC). */
  reported: boolean;
  /** True when the on-desk analysis predates this report date. */
  stale: boolean;
}

export interface EarningsCalendarResult {
  events: EarningsEvent[];
  asOf: string;
  from: string;
  today: string;
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

type CoverageMeta = {
  slug: string;
  name: string;
  href: string;
  category: string | null;
  sectorSlug: string | null;
  sectorColor: string | null;
  score: number | null;
  lastAnalyzed: string | null;
  lastAnalyzedISO: string | null;
};

/** Tickers that never report earnings (ETFs, private companies). */
const NON_REPORTERS = new Set(['SPCX', 'VOO', 'SOXX', 'INIO']);

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

export function isoDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addUtcDays(iso: string, days: number): string {
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

/** "August 10, 2026" or "August 2026" → YYYY-MM-DD (day defaults to 1). */
export function lastAnalyzedToISO(value: string | undefined | null): string | null {
  if (!value) return null;
  const match = value.trim().match(/^([A-Za-z]+)\s+(?:(\d{1,2}),\s+)?(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;
  const day = match[2] ? parseInt(match[2], 10) : 1;
  const year = parseInt(match[3], 10);
  return isoDateUTC(new Date(Date.UTC(year, month, day)));
}

/**
 * Coverage names that can appear on a US earnings calendar.
 * Crypto, commodities, ETFs, and private companies are excluded.
 */
export function getEarningsEligibleCoverage(): Map<string, CoverageMeta> {
  const byTicker = new Map(allCoverageData.map((row) => [row.ticker, row]));
  const map = new Map<string, CoverageMeta>();

  for (const slug of getAllSlugs()) {
    const stock = getStockData(slug);
    if (!stock) continue;

    const assetClass = stock.assetClass ?? 'equity';
    if (assetClass === 'crypto' || assetClass === 'commodity') continue;

    const ticker = stock.ticker.trim().toUpperCase();
    if (!ticker || NON_REPORTERS.has(ticker)) continue;
    // Nasdaq calendar is US-listed symbols; skip exchange-suffixed tickers.
    if (ticker.includes('.')) continue;

    const row = byTicker.get(ticker);
    const sector = row ? getSectorByKey(row.category) : undefined;
    const lastAnalyzed = stock.lastAnalyzed ?? null;

    map.set(ticker, {
      slug: stock.slug,
      name: stock.name,
      href: `/stocks/${stock.slug}`,
      category: row?.category ?? null,
      sectorSlug: sector?.slug ?? null,
      sectorColor: sector?.color ?? null,
      score: row ? Math.round(getAverageScore(row.scores)) : null,
      lastAnalyzed,
      lastAnalyzedISO: lastAnalyzedToISO(lastAnalyzed),
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
 * Upcoming (and recently reported) earnings for the InvestMoat coverage universe.
 * Sourced from Nasdaq's public earnings calendar, filtered to covered equities.
 */
export async function getEarningsCalendar(
  lookaheadDays: number = EARNINGS_LOOKAHEAD_DAYS,
  lookbackDays: number = EARNINGS_LOOKBACK_DAYS,
): Promise<EarningsCalendarResult> {
  const coverage = getEarningsEligibleCoverage();
  const today = isoDateUTC(new Date());
  const from = addUtcDays(today, -lookbackDays);
  const dates = dateRange(from, lookbackDays + lookaheadDays);
  const to = dates[dates.length - 1] ?? today;

  const dayRows = await Promise.all(dates.map((d) => fetchNasdaqDay(d)));

  const events: EarningsEvent[] = [];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    for (const row of dayRows[i]) {
      const ticker = (row.symbol ?? '').trim().toUpperCase();
      const covered = coverage.get(ticker);
      if (!covered) continue;

      const reported = date < today;
      const stale = Boolean(covered.lastAnalyzedISO && covered.lastAnalyzedISO < date);

      events.push({
        date,
        ticker,
        slug: covered.slug,
        name: covered.name,
        href: covered.href,
        session: parseSession(row.time),
        epsForecast: row.epsForecast?.trim() || null,
        fiscalQuarterEnding: row.fiscalQuarterEnding?.trim() || null,
        category: covered.category,
        sectorSlug: covered.sectorSlug,
        sectorColor: covered.sectorColor,
        score: covered.score,
        lastAnalyzed: covered.lastAnalyzed,
        lastAnalyzedISO: covered.lastAnalyzedISO,
        reported,
        stale,
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
    today,
    to,
    coverageCount: coverage.size,
  };
}
