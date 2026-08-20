'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Sunrise, Sunset, Clock } from 'lucide-react';
import { Spinner, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { stockData } from '@/app/stockData';
import { ScorePill } from '@/app/sectors/scoreUi';
import type { EarningsCalendarResult, EarningsEvent, EarningsSession } from '@/lib/earningsCalendar';
import { MetricBand } from '@/components/MetricBand';

type WindowKey = '7' | '30' | '60' | 'im25';

const WINDOW_OPTIONS: { key: WindowKey; label: string }[] = [
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '60', label: '60 days' },
  { key: 'im25', label: 'IM25' },
];

const WINDOW_PILL =
  'pill-toggle rounded-full px-3.5 py-1.5 text-xs font-semibold';

const portfolioTickers = new Set(stockData.map((s) => s.ticker));

function addUtcDays(iso: string, days: number): string {
  const [y, m, day] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function isWindowKey(value: string | null): value is WindowKey {
  return WINDOW_OPTIONS.some((opt) => opt.key === value);
}

function parseWindow(sp: URLSearchParams): WindowKey {
  const raw = sp.get('window');
  return isWindowKey(raw) ? raw : '30';
}

/** Omit the default so `/earnings` stays a clean URL. */
function earningsHref(windowKey: WindowKey): string {
  return windowKey === '30' ? '/earnings' : `/earnings?window=${windowKey}`;
}

function sessionLabel(session: EarningsSession): string {
  switch (session) {
    case 'bmo':
      return 'Before open';
    case 'amc':
      return 'After close';
    default:
      return 'Time TBA';
  }
}

function SessionIcon({ session }: { session: EarningsSession }) {
  const className = 'size-3.5 shrink-0';
  if (session === 'bmo') return <Sunrise className={`${className} text-amber-300/80`} />;
  if (session === 'amc') return <Sunset className={`${className} text-sky-300/80`} />;
  return <Clock className={`${className} text-foreground/25`} />;
}

function formatDayHeader(iso: string, today: string): { title: string; relative: string | null } {
  const date = new Date(`${iso}T12:00:00Z`);
  const title = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  if (iso === today) return { title, relative: 'Today' };
  if (iso === addUtcDays(today, 1)) return { title, relative: 'Tomorrow' };
  if (iso === addUtcDays(today, -1)) return { title, relative: 'Yesterday' };
  return { title, relative: null };
}

function EventRow({ event, inPortfolio }: { event: EarningsEvent; inPortfolio: boolean }) {
  const accent = event.sectorColor ?? '#6b7280';

  return (
    <Link
      href={event.href}
      className={`group flex w-full items-center gap-3 px-4 py-3.5 text-left no-underline transition-colors hover:bg-foreground/[0.04] sm:gap-4 sm:px-5 ${
        event.reported ? 'opacity-70 hover:opacity-100' : ''
      }`}
    >
      <div
        className="flex h-8 shrink-0 items-center justify-center rounded-lg px-2 font-mono text-[11px] font-black tracking-wider"
        style={{
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          color: accent,
          minWidth: '48px',
        }}
      >
        {event.ticker}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium text-foreground/85 group-hover:text-foreground">
            {event.name}
          </span>
          {inPortfolio && (
            <span className="rounded-md border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright">
              IM25
            </span>
          )}
          {event.reported && (
            <span className="rounded-md border border-foreground/10 bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40">
              Reported
            </span>
          )}
          {event.stale && (
            <span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-200/80">
              Needs refresh
            </span>
          )}
          {event.aging && (
            <span className="rounded-md border border-foreground/10 bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40">
              Aging
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/35">
          <span className="inline-flex items-center gap-1.5">
            <SessionIcon session={event.session} />
            {sessionLabel(event.session)}
          </span>
          {event.category && <span>{event.category}</span>}
          {event.fiscalQuarterEnding && <span>Q ends {event.fiscalQuarterEnding}</span>}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {event.epsForecast ? (
          <>
            <div className="font-mono text-sm font-semibold tabular-nums text-foreground/80">
              {event.epsForecast}
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-foreground/25">
              Cons. EPS
            </div>
          </>
        ) : (
          <div className="text-[11px] text-foreground/25">—</div>
        )}
      </div>

      {event.score != null && (
        <div className="hidden shrink-0 sm:block">
          <ScorePill value={event.score} />
        </div>
      )}

      <ChevronRight className="size-4 shrink-0 text-foreground/15 transition-colors group-hover:text-gold-bright" />
    </Link>
  );
}

export default function EarningsClient({
  initialData,
  initialError,
}: {
  initialData: EarningsCalendarResult | null;
  initialError: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const windowKey = parseWindow(searchParams);

  const [data, setData] = useState<EarningsCalendarResult | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/earnings')
      .then((r) => {
        if (!r.ok) throw new Error('Upstream fetch failed');
        return r.json() as Promise<EarningsCalendarResult>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
      })
      .catch(() => {
        if (cancelled) return;
        setError(initialError ?? 'Could not load the earnings calendar. Try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialData, initialError]);

  const today = data?.today ?? new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    if (!data) return [];
    const upcomingDays = windowKey === 'im25' ? 60 : Number(windowKey);
    const upcomingCutoff = addUtcDays(today, upcomingDays - 1);

    return data.events.filter((e) => {
      if (windowKey === 'im25' && !portfolioTickers.has(e.ticker)) return false;
      if (e.reported) return true;
      return e.date <= upcomingCutoff;
    });
  }, [data, windowKey, today]);

  const groups = useMemo(() => {
    const map = new Map<string, EarningsEvent[]>();
    for (const event of filtered) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const todayCount = useMemo(
    () => (data ? data.events.filter((e) => e.date === today).length : 0),
    [data, today],
  );

  const soonCount = useMemo(() => {
    if (!data) return 0;
    const weekEnd = addUtcDays(today, 6);
    return data.events.filter((e) => !e.reported && e.date <= weekEnd).length;
  }, [data, today]);

  const staleInView = useMemo(
    () => filtered.filter((e) => e.stale).length,
    [filtered],
  );

  function setWindowKey(next: WindowKey) {
    const href = earningsHref(next);
    router.replace(href, { scroll: false });
  }

  return (
    <div className="animate-fade-in space-y-8 md:space-y-10">
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">Coverage Universe</p>
        <h1 className="page-title gradient-text-animated mb-4">
          What&apos;s printing.
        </h1>
        <p className="page-dek">
          Upcoming reports for names we cover — session, consensus, and whether
          the analysis still predates the print.
        </p>
      </header>

      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.06s' }}>
        <MetricBand
          items={[
            {
              label: 'Reporting today',
              value: loading ? '—' : todayCount,
              hint: todayCount === 1 ? 'One name on the tape' : undefined,
            },
            { label: 'Next 7 days', value: loading ? '—' : soonCount },
            { label: 'In view', value: loading ? '—' : filtered.length },
            {
              label: 'Needs refresh',
              value: loading ? '—' : staleInView,
              hint: staleInView > 0 ? 'Print is in, analysis is not' : 'Analyses are current',
            },
          ]}
        />
      </div>

      <div
        className="relative z-20 animate-fade-up stagger-fill-both"
        style={{ animationDelay: '0.08s' }}
      >
        <ToggleButtonGroup
          aria-label="Earnings window"
          className="flex flex-wrap items-center gap-2"
          isDetached
          selectedKeys={new Set([windowKey])}
          selectionMode="single"
          size="sm"
          onSelectionChange={(keys) => {
            const key = [...keys][0];
            if (key != null) setWindowKey(String(key) as WindowKey);
          }}
        >
          {WINDOW_OPTIONS.map((opt) => (
            <ToggleButton key={opt.key} id={opt.key} className={WINDOW_PILL}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div className="fund-rule" />

      {loading && (
        <div className="flex items-center justify-center gap-3 py-20 text-sm text-foreground/40">
          <Spinner size="sm" />
          Loading upcoming reports…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] px-5 py-10 text-center">
          <p className="text-sm text-foreground/50">{error}</p>
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] px-5 py-10 text-center">
          <p className="text-sm text-foreground/50">
            No covered names report in this window.
          </p>
          <p className="mt-1.5 text-xs text-foreground/30">
            Try a longer range, or check back as the next batch of dates is published.
          </p>
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="animate-fade-up space-y-6 stagger-fill-both" style={{ animationDelay: '0.12s' }}>
          {groups.map(([date, events]) => {
            const { title, relative } = formatDayHeader(date, today);
            const isToday = relative === 'Today';
            const isReportedDay = date < today;

            return (
              <section key={date}>
                <div className="mb-2 flex items-baseline gap-2.5 px-1">
                  <h2
                    className={`text-sm font-bold tracking-wide ${
                      isToday ? 'text-gold-bright' : 'text-foreground/70'
                    }`}
                  >
                    {title}
                  </h2>
                  {relative && (
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent/70">
                      {relative}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[10px] text-foreground/25">
                    {events.length} {events.length === 1 ? 'report' : 'reports'}
                  </span>
                </div>

                <div
                  className={`overflow-hidden rounded-2xl border ${
                    isToday
                      ? 'border-accent/30 bg-accent-soft/40'
                      : isReportedDay
                        ? 'border-foreground/[0.05] bg-foreground/[0.015]'
                        : 'border-foreground/[0.06] bg-foreground/[0.02]'
                  }`}
                >
                  <div className="divide-y divide-foreground/[0.05]">
                    {events.map((event) => (
                      <EventRow
                        key={`${event.date}-${event.ticker}`}
                        event={event}
                        inPortfolio={portfolioTickers.has(event.ticker)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="pb-4 text-center font-mono text-[10px] leading-relaxed text-foreground/25">
        Dates from Nasdaq&apos;s public earnings calendar · filtered to InvestMoat coverage ·
        consensus EPS when available ·{' '}
        <Link href="/stocks" className="text-foreground/40 hover:text-gold-bright">
          full ranked universe
        </Link>
      </p>
    </div>
  );
}
