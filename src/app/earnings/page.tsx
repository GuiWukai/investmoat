'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Sunrise, Sunset, Clock } from 'lucide-react';
import { Spinner, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { stockData } from '@/app/stockData';
import type { EarningsCalendarResult, EarningsEvent, EarningsSession } from '@/lib/earningsCalendar';
import { MetricBand } from '@/components/MetricBand';

type WindowKey = '7' | '30' | '60' | 'im25';

const WINDOW_OPTIONS: { key: WindowKey; label: string }[] = [
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '60', label: '60 days' },
  { key: 'im25', label: 'IM25' },
];

const portfolioTickers = new Set(stockData.map((s) => s.ticker));

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

function addUtcDays(iso: string, days: number): string {
  const [y, m, day] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
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
  return { title, relative: null };
}

function EventRow({ event, inPortfolio }: { event: EarningsEvent; inPortfolio: boolean }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(event.href)}
      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-foreground/[0.04] sm:gap-4 sm:px-5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-xs font-bold tracking-wide text-gold-bright">
            {event.ticker}
          </span>
          <span className="truncate text-sm font-medium text-foreground/85 group-hover:text-foreground">
            {event.name}
          </span>
          {inPortfolio && (
            <span className="rounded-md border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright">
              IM25
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/35">
          <span className="inline-flex items-center gap-1.5">
            <SessionIcon session={event.session} />
            {sessionLabel(event.session)}
          </span>
          {event.fiscalQuarterEnding && (
            <span>Q ends {event.fiscalQuarterEnding}</span>
          )}
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

      <ChevronRight className="size-4 shrink-0 text-foreground/15 transition-colors group-hover:text-gold-bright" />
    </button>
  );
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsCalendarResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowKey, setWindowKey] = useState<WindowKey>('30');

  useEffect(() => {
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
        setError('Could not load the earnings calendar. Try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const today = data?.from ?? new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    if (!data) return [];
    const days =
      windowKey === 'im25' ? 60 : Number(windowKey);
    const cutoff = addUtcDays(today, days - 1);

    return data.events.filter((e) => {
      if (e.date > cutoff) return false;
      if (windowKey === 'im25' && !portfolioTickers.has(e.ticker)) return false;
      return true;
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

  const soonCount = useMemo(() => {
    if (!data) return 0;
    const weekEnd = addUtcDays(today, 6);
    return data.events.filter((e) => e.date <= weekEnd).length;
  }, [data, today]);

  const im25InView = useMemo(
    () => filtered.filter((e) => portfolioTickers.has(e.ticker)).length,
    [filtered]
  );

  return (
    <div className="animate-fade-in space-y-8 md:space-y-10">
      <header className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
        <p className="section-label mb-3">Coverage Universe</p>
        <h1 className="page-title gradient-text-animated mb-4">
          Earnings Calendar
        </h1>
        <p className="page-dek">
          Upcoming reports for names we cover — so you can see what&apos;s reporting soon
          without leaving the research desk.
        </p>
      </header>

      <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.06s' }}>
        <MetricBand
          items={[
            { label: 'Next 7 days', value: loading ? '—' : soonCount },
            { label: 'In view', value: loading ? '—' : filtered.length },
            { label: 'Eligible names', value: data?.coverageCount ?? '—' },
            { label: 'IM25 in view', value: loading ? '—' : im25InView },
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
          onSelectionChange={(keys) => {
            const key = [...keys][0];
            if (key != null) setWindowKey(String(key) as WindowKey);
          }}
        >
          {WINDOW_OPTIONS.map((opt) => (
            <ToggleButton
              key={opt.key}
              id={opt.key}
              className="pill-toggle rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
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
        consensus EPS when available
      </p>
    </div>
  );
}
