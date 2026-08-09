'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  Spinner,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  convertBetweenPortfolioCurrencies,
  convertToDisplay,
  formatMoney,
  PORTFOLIO_CURRENCIES,
  roundMoney,
  type PortfolioCurrency,
} from '@/lib/portfolioCurrency';
import {
  clearUserPortfolio,
  loadUserPortfolio,
  saveUserPortfolio,
  type UserHolding,
} from '@/lib/userPortfolio';
import {
  computeValuationScore,
  parseScenarioPrice,
} from '@/lib/valuationScore';

type CoverageStock = (typeof allCoverageData)[number];

type Quote = {
  price: number | null;
  changePercent: number | null;
  currency: string | null;
};

function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** Same band colours as the IM25 holdings table. */
function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-blue-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-rose-400';
}

/** Live composite when a quote exists; otherwise the static coverage score. */
function compositeForStock(
  stock: CoverageStock | undefined,
  nativePrice: number | null
): number | null {
  if (!stock) return null;
  const [moat, growth, staticValuation] = stock.scores;
  const bear = parseScenarioPrice(stock.bearTarget);
  const base = parseScenarioPrice(stock.baseTarget);
  const bull = parseScenarioPrice(stock.bullTarget);
  const valuation =
    nativePrice != null && bear && base && bull
      ? computeValuationScore(nativePrice, bear, base, bull)
      : staticValuation;
  return Math.round(getAverageScore([moat, growth, valuation]));
}

function parsePositiveNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const FIELD_INPUT_CLASS =
  'w-full rounded-lg border border-border bg-foreground/[0.03] px-2.5 py-1.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors placeholder:text-foreground/25 focus:border-accent/40 focus:bg-foreground/[0.05] md:rounded-xl md:px-3 md:py-2 md:text-sm';

/** Local draft input that commits a positive number (or clear) on blur. */
function HoldingNumberField({
  'aria-label': ariaLabel,
  allowEmpty = false,
  className = '',
  onCommit,
  placeholder,
  value,
}: {
  'aria-label': string;
  allowEmpty?: boolean;
  className?: string;
  onCommit: (next: number | undefined) => void;
  placeholder?: string;
  value: number | undefined;
}) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');

  useEffect(() => {
    setDraft(value != null ? String(value) : '');
  }, [value]);

  return (
    <input
      aria-label={ariaLabel}
      className={`${FIELD_INPUT_CLASS} ${className}`}
      inputMode="decimal"
      onBlur={() => {
        const raw = draft.trim();
        if (!raw) {
          if (allowEmpty) {
            onCommit(undefined);
            setDraft('');
          } else {
            setDraft(value != null ? String(value) : '');
          }
          return;
        }
        const n = parsePositiveNumber(raw);
        if (n == null) {
          setDraft(value != null ? String(value) : '');
          return;
        }
        onCommit(n);
        setDraft(String(n));
      }}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={placeholder}
      value={draft}
    />
  );
}

export default function MyPortfolioPage() {
  const router = useRouter();

  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<PortfolioCurrency>('USD');
  const [hydrated, setHydrated] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [usdCad, setUsdCad] = useState<number | null>(null);
  const [fxLoading, setFxLoading] = useState(true);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const state = loadUserPortfolio();
    setHoldings(state.holdings);
    setDisplayCurrency(state.displayCurrency);
    setHydrated(true);
  }, []);

  // Persist whenever holdings or book currency change post-hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveUserPortfolio(holdings, displayCurrency);
  }, [holdings, displayCurrency, hydrated]);

  // Fold legacy per-holding cost currencies into the book currency once FX is ready.
  useEffect(() => {
    if (!hydrated || usdCad == null) return;
    setHoldings((prev) => {
      let changed = false;
      const next = prev.map((h) => {
        if (h.avgCost == null) {
          if (h.avgCostCurrency) {
            changed = true;
            return { slug: h.slug, shares: h.shares };
          }
          return h;
        }
        if (!h.avgCostCurrency) return h;
        if (h.avgCostCurrency === displayCurrency) {
          changed = true;
          return { slug: h.slug, shares: h.shares, avgCost: h.avgCost };
        }
        changed = true;
        return {
          slug: h.slug,
          shares: h.shares,
          avgCost: roundMoney(
            convertBetweenPortfolioCurrencies(
              h.avgCost,
              h.avgCostCurrency,
              displayCurrency,
              usdCad
            )
          ),
        };
      });
      return changed ? next : prev;
    });
  }, [hydrated, usdCad, displayCurrency]);

  // USD/CAD mid for converting mixed-currency quotes into the book currency.
  useEffect(() => {
    let cancelled = false;
    setFxLoading(true);
    fetch('/api/fx/usd-cad')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const rate = typeof d?.rate === 'number' && d.rate > 0 ? d.rate : null;
        setUsdCad(rate);
        setFxLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setUsdCad(null);
        setFxLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live quotes for current holdings.
  useEffect(() => {
    if (!hydrated) return;
    if (holdings.length === 0) {
      setQuotes({});
      setQuotesLoading(false);
      return;
    }

    let cancelled = false;
    setQuotesLoading(true);

    Promise.all(
      holdings.map((h) =>
        fetch(`/api/stock-price/${h.slug}`)
          .then((r) => (r.ok ? r.json() : null))
          .then(
            (d) =>
              [
                h.slug,
                {
                  price: d?.price ?? null,
                  changePercent: d?.changePercent ?? null,
                  currency: typeof d?.currency === 'string' ? d.currency : null,
                },
              ] as const
          )
          .catch(
            () =>
              [
                h.slug,
                { price: null, changePercent: null, currency: null },
              ] as const
          )
      )
    ).then((entries) => {
      if (cancelled) return;
      setQuotes(Object.fromEntries(entries));
      setQuotesLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [holdings, hydrated]);

  const coverageBySlug = useMemo(() => {
    const map = new Map<string, CoverageStock>();
    for (const s of allCoverageData) map.set(s.slug, s);
    return map;
  }, []);

  const needsFx = useMemo(() => {
    if (holdings.length === 0) return false;
    return holdings.some((h) => {
      const quoteCurrency = (quotes[h.slug]?.currency ?? 'USD').toUpperCase();
      return quoteCurrency !== displayCurrency;
    });
  }, [holdings, quotes, displayCurrency]);

  const rows = useMemo(() => {
    return holdings
      .map((h) => {
        const stock = coverageBySlug.get(h.slug);
        const quote = quotes[h.slug];
        const nativePrice = quote?.price ?? null;
        const quoteCurrency = quote?.currency ?? null;
        const changePercent = quote?.changePercent ?? null;
        const price =
          nativePrice == null
            ? null
            : convertToDisplay(nativePrice, quoteCurrency, displayCurrency, usdCad);
        const marketValue = price != null ? price * h.shares : null;
        // Avg cost is book currency; convert only while a legacy denomination remains.
        const costPerShare =
          h.avgCost == null
            ? null
            : convertToDisplay(
                h.avgCost,
                h.avgCostCurrency ?? displayCurrency,
                displayCurrency,
                usdCad
              );
        const costBasis =
          costPerShare != null ? costPerShare * h.shares : null;
        const gain =
          marketValue != null && costBasis != null ? marketValue - costBasis : null;
        const gainPct =
          gain != null && costBasis != null && costBasis > 0
            ? (gain / costBasis) * 100
            : null;
        // Valuation uses the native quote (targets are in listing currency).
        const score = compositeForStock(stock, nativePrice);
        return {
          ...h,
          stock,
          quoteCurrency,
          price,
          changePercent,
          marketValue,
          costBasis,
          gain,
          gainPct,
          score,
        };
      })
      .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0));
  }, [holdings, coverageBySlug, quotes, displayCurrency, usdCad]);

  const totals = useMemo(() => {
    let marketValue = 0;
    let hasMarket = false;
    let costBasis = 0;
    let hasCost = false;
    let dayChangeWeighted = 0;
    let dayWeight = 0;

    for (const row of rows) {
      if (row.marketValue != null) {
        marketValue += row.marketValue;
        hasMarket = true;
        if (row.changePercent != null) {
          dayChangeWeighted += row.changePercent * row.marketValue;
          dayWeight += row.marketValue;
        }
      }
      if (row.costBasis != null) {
        costBasis += row.costBasis;
        hasCost = true;
      }
    }

    const gain = hasMarket && hasCost ? marketValue - costBasis : null;
    const gainPct =
      gain != null && costBasis > 0 ? (gain / costBasis) * 100 : null;
    const dayChange = dayWeight > 0 ? dayChangeWeighted / dayWeight : null;

    return {
      marketValue: hasMarket ? marketValue : null,
      costBasis: hasCost ? costBasis : null,
      gain,
      gainPct,
      dayChange,
    };
  }, [rows]);

  function updateShares(slug: string, shares: number) {
    setHoldings((prev) =>
      prev.map((h) => (h.slug === slug ? { ...h, shares } : h))
    );
  }

  function updateAvgCost(slug: string, avgCost: number | undefined) {
    setHoldings((prev) =>
      prev.map((h) => {
        if (h.slug !== slug) return h;
        if (avgCost === undefined) {
          return { slug: h.slug, shares: h.shares };
        }
        return { slug: h.slug, shares: h.shares, avgCost };
      })
    );
  }

  function removeHolding(slug: string) {
    setHoldings((prev) => prev.filter((h) => h.slug !== slug));
  }

  function clearAll() {
    setHoldings([]);
    clearUserPortfolio();
  }

  function switchDisplayCurrency(next: PortfolioCurrency) {
    if (next === displayCurrency) return;

    const hasAvgCosts = holdings.some((h) => h.avgCost != null);
    // Re-denominate stored avg costs with the live mid so P&L stays coherent.
    if (hasAvgCosts) {
      if (usdCad == null) {
        setCurrencyError(
          'Need a USD/CAD rate before switching book currency while average costs are set.'
        );
        return;
      }
      setHoldings((prev) =>
        prev.map((h) => {
          if (h.avgCost == null) return { slug: h.slug, shares: h.shares };
          const from = h.avgCostCurrency ?? displayCurrency;
          return {
            slug: h.slug,
            shares: h.shares,
            avgCost: roundMoney(
              convertBetweenPortfolioCurrencies(h.avgCost, from, next, usdCad)
            ),
          };
        })
      );
    }

    setCurrencyError(null);
    setDisplayCurrency(next);
  }

  const money = (value: number | null | undefined) =>
    formatMoney(value, displayCurrency);

  return (
    <div className="animate-fade-in dot-pattern">
      <header
        className="animate-fade-up stagger-fill-both pb-10 pt-6 md:pb-12 md:pt-12"
        style={{ animationDelay: '0s' }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="section-label">Personal</p>
          <ToggleButtonGroup
            aria-label="Portfolio currency"
            className="flex items-center gap-1.5"
            isDetached
            selectedKeys={new Set([displayCurrency])}
            onSelectionChange={(keys) => {
              const key = [...keys][0];
              if (key == null) return;
              const next = String(key);
              if (next === 'USD' || next === 'CAD') {
                switchDisplayCurrency(next);
              }
            }}
          >
            {PORTFOLIO_CURRENCIES.map((code) => (
              <ToggleButton
                key={code}
                id={code}
                className="pill-toggle rounded-full px-3 py-1 text-xs font-semibold"
              >
                {code}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        <h1 className="mb-4 text-4xl font-extrabold leading-tight gradient-text-animated md:text-6xl">
          My Portfolio
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/45 md:text-lg">
          Track your own holdings against InvestMoat coverage. Shares and average
          cost are saved in this browser only — nothing is uploaded. Totals convert
          USD and CAD quotes into your book currency.
        </p>
        {currencyError && (
          <p className="mt-3 text-sm text-rose-400">{currencyError}</p>
        )}
        {needsFx && !fxLoading && usdCad == null && (
          <p className="mt-3 text-sm text-rose-400">
            FX rate unavailable — mixed-currency positions show as — until the
            USD/CAD mid loads.
          </p>
        )}
        {usdCad != null && (
          <p className="mt-3 text-xs text-foreground/28">
            USDCAD {usdCad.toFixed(4)}
            {needsFx ? ' · converting quote currencies into book currency' : ''}
          </p>
        )}
      </header>

      {/* Summary */}
      <section
        className="animate-fade-up stagger-fill-both mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        style={{ animationDelay: '0.1s' }}
      >
        <Card className="p-4">
          <p className="section-label mb-1.5">Market value</p>
          {!hydrated || (quotesLoading && holdings.length > 0 && totals.marketValue == null) ? (
            <Spinner size="sm" color="current" />
          ) : (
            <p className="text-2xl font-black tabular-nums text-foreground">
              {money(totals.marketValue)}
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-foreground/28">
            {holdings.length} position{holdings.length === 1 ? '' : 's'} · {displayCurrency}
          </p>
        </Card>

        <Card className="p-4">
          <p className="section-label mb-1.5">Today</p>
          {!hydrated || quotesLoading ? (
            <Spinner size="sm" color="current" />
          ) : totals.dayChange == null ? (
            <p className="text-2xl font-black text-foreground/20">—</p>
          ) : (
            <div
              className={`flex items-center gap-2 ${
                totals.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totals.dayChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="text-2xl font-black tabular-nums">
                {formatPct(totals.dayChange)}
              </span>
            </div>
          )}
          <p className="mt-0.5 text-[10px] text-foreground/28">Value-weighted</p>
        </Card>

        <Card className="p-4">
          <p className="section-label mb-1.5">Cost basis</p>
          <p className="text-2xl font-black tabular-nums text-foreground">
            {money(totals.costBasis)}
          </p>
          <p className="mt-0.5 text-[10px] text-foreground/28">Optional · from avg cost</p>
        </Card>

        <Card className="p-4">
          <p className="section-label mb-1.5">Unrealized P&amp;L</p>
          {totals.gain == null ? (
            <p className="text-2xl font-black text-foreground/20">—</p>
          ) : (
            <div
              className={`${
                totals.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <p className="text-2xl font-black tabular-nums">{money(totals.gain)}</p>
              <p className="mt-0.5 text-[10px] tabular-nums opacity-80">
                {formatPct(totals.gainPct)}
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Holdings */}
      <section
        className="animate-fade-up stagger-fill-both pb-16"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="mb-5 flex flex-wrap items-center gap-3 md:gap-4">
          <div>
            <p className="section-label mb-1">Holdings</p>
            <h2 className="text-xl font-bold text-foreground/85">Your book</h2>
          </div>
          <div className="hidden h-px flex-1 bg-foreground/[0.05] md:block" />
          <div className="ml-auto flex items-center gap-2">
            <Button
              onPress={() => router.push('/my-portfolio/add')}
              size="sm"
              variant="primary"
            >
              <Plus size={14} />
              Add holding
            </Button>
            {holdings.length > 0 && (
              <Button
                onPress={clearAll}
                size="sm"
                variant="ghost"
              >
                <Trash2 size={14} />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {!hydrated ? (
          <Card className="flex items-center justify-center p-6 md:p-10">
            <Spinner color="current" />
          </Card>
        ) : holdings.length === 0 ? (
          <Card className="p-6 text-center md:p-10">
            <p className="text-sm text-foreground/45">
              No holdings yet. Add a covered name to get started — data stays in
              local storage.
            </p>
            <div className="mt-5">
              <Button
                onPress={() => router.push('/my-portfolio/add')}
                variant="primary"
              >
                <Plus size={16} />
                Add holding
              </Button>
            </div>
            <p className="mt-4 text-xs text-foreground/28">
              Browse the{' '}
              <Link className="text-gold-bright underline-offset-2 hover:underline" href="/stocks">
                coverage universe
              </Link>{' '}
              or the{' '}
              <Link className="text-gold-bright underline-offset-2 hover:underline" href="/portfolio">
                IM25
              </Link>
              .
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden items-center gap-3 border-b border-foreground/[0.05] bg-foreground/[0.02] px-4 py-2.5 md:flex md:gap-4 md:px-5">
              <div className="section-label min-w-[140px]">Holding</div>
              <div className="section-label w-14 text-right">Score</div>
              <div className="section-label w-24 text-right">Shares</div>
              <div className="section-label w-28 text-right">Avg cost</div>
              <div className="section-label w-28 text-right">Price</div>
              <div className="section-label w-16 text-right">1D %</div>
              <div className="section-label w-28 text-right">Value</div>
              <div className="section-label w-28 text-right">P&amp;L</div>
              <div className="w-9 shrink-0" />
            </div>

            <div className="divide-y divide-foreground/[0.04]">
              {rows.map((row) => {
                const name = row.stock?.name ?? row.slug;
                const ticker = row.stock?.ticker ?? row.slug.toUpperCase();
                const href = row.stock?.href ?? `/stocks/${row.slug}`;
                const quoteNote =
                  row.quoteCurrency &&
                  row.quoteCurrency.toUpperCase() !== displayCurrency
                    ? row.quoteCurrency.toUpperCase()
                    : null;
                const dayClass =
                  row.changePercent == null
                    ? 'text-foreground/25'
                    : row.changePercent >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400';
                const gainClass =
                  row.gain == null
                    ? 'text-foreground/25'
                    : row.gain >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400';

                return (
                  <div key={row.slug}>
                    {/* Compact mobile card */}
                    <div className="px-3 py-2.5 md:hidden">
                      <div className="flex items-start gap-2">
                        <button
                          className="min-w-0 flex-1 text-left"
                          onClick={() => router.push(href)}
                          type="button"
                        >
                          <div className="flex min-w-0 items-baseline gap-1.5">
                            <span className="truncate text-sm font-bold text-foreground/90">
                              {name}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] font-black uppercase tracking-[0.1em] text-foreground/28">
                              {ticker}
                              {quoteNote ? ` · ${quoteNote}` : ''}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[11px] tabular-nums">
                            {row.score != null ? (
                              <span className={`font-black ${scoreColor(row.score)}`}>
                                {row.score}
                              </span>
                            ) : (
                              <span className="text-foreground/25">—</span>
                            )}
                            <span className={dayClass}>{formatPct(row.changePercent)}</span>
                            {row.gain != null ? (
                              <span className={gainClass}>
                                {money(row.gain)}
                                {row.gainPct != null ? (
                                  <span className="ml-1 opacity-75">{formatPct(row.gainPct)}</span>
                                ) : null}
                              </span>
                            ) : null}
                          </div>
                        </button>
                        <div className="shrink-0 pt-0.5 text-right">
                          <p className="font-mono text-sm font-semibold tabular-nums text-foreground/85">
                            {money(row.marketValue)}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] tabular-nums text-foreground/28">
                            {quotesLoading && row.price == null ? (
                              <Spinner size="sm" color="current" />
                            ) : (
                              money(row.price)
                            )}
                          </p>
                        </div>
                        <button
                          aria-label={`Remove ${ticker}`}
                          className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1.5 text-foreground/35 transition-colors hover:bg-foreground/[0.06] hover:text-foreground/60"
                          onClick={() => removeHolding(row.slug)}
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <label className="flex min-w-0 items-center gap-1.5">
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground/30">
                            Sh
                          </span>
                          <HoldingNumberField
                            aria-label={`${ticker} shares`}
                            className="text-right"
                            onCommit={(n) => {
                              if (n != null && n !== row.shares) updateShares(row.slug, n);
                            }}
                            value={row.shares}
                          />
                        </label>
                        <label className="flex min-w-0 items-center gap-1.5">
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground/30">
                            Avg
                          </span>
                          <HoldingNumberField
                            allowEmpty
                            aria-label={`${ticker} average cost in ${displayCurrency}`}
                            className="text-right"
                            onCommit={(n) => {
                              if (n !== row.avgCost) updateAvgCost(row.slug, n);
                            }}
                            placeholder="—"
                            value={row.avgCost}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Desktop table row */}
                    <div className="hidden items-center gap-3 px-4 py-3.5 md:flex md:gap-4 md:px-5">
                      <button
                        className="min-w-0 text-left md:min-w-[140px]"
                        onClick={() => router.push(href)}
                        type="button"
                      >
                        <div className="truncate text-sm font-bold text-foreground/90 hover:text-foreground">
                          {name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-foreground/28">
                          {ticker}
                          {quoteNote ? ` · ${quoteNote}` : ''}
                        </div>
                      </button>

                      <div className="w-14 text-right">
                        {row.score == null ? (
                          <p className="font-mono text-sm text-foreground/25">—</p>
                        ) : (
                          <p
                            className={`font-mono text-sm font-black tabular-nums ${scoreColor(row.score)}`}
                          >
                            {row.score}
                          </p>
                        )}
                      </div>

                      <label className="block w-24">
                        <HoldingNumberField
                          aria-label={`${ticker} shares`}
                          className="text-right"
                          onCommit={(n) => {
                            if (n != null && n !== row.shares) updateShares(row.slug, n);
                          }}
                          value={row.shares}
                        />
                      </label>

                      <label className="block w-28">
                        <HoldingNumberField
                          allowEmpty
                          aria-label={`${ticker} average cost in ${displayCurrency}`}
                          className="text-right"
                          onCommit={(n) => {
                            if (n !== row.avgCost) updateAvgCost(row.slug, n);
                          }}
                          placeholder="—"
                          value={row.avgCost}
                        />
                      </label>

                      <div className="w-28 text-right">
                        <p className="font-mono text-sm tabular-nums text-foreground/80">
                          {quotesLoading && row.price == null ? (
                            <Spinner size="sm" color="current" />
                          ) : (
                            money(row.price)
                          )}
                        </p>
                      </div>

                      <div className="w-16 text-right">
                        <p className={`font-mono text-sm tabular-nums ${dayClass}`}>
                          {formatPct(row.changePercent)}
                        </p>
                      </div>

                      <div className="w-28 text-right">
                        <p className="font-mono text-sm font-semibold tabular-nums text-foreground/85">
                          {money(row.marketValue)}
                        </p>
                      </div>

                      <div className="w-28 text-right">
                        {row.gain == null ? (
                          <p className="font-mono text-sm text-foreground/25">—</p>
                        ) : (
                          <div className={`font-mono text-sm tabular-nums ${gainClass}`}>
                            <div>{money(row.gain)}</div>
                            <div className="text-[10px] opacity-75">{formatPct(row.gainPct)}</div>
                          </div>
                        )}
                      </div>

                      <div className="w-9 shrink-0">
                        <Button
                          aria-label={`Remove ${ticker}`}
                          isIconOnly
                          onPress={() => removeHolding(row.slug)}
                          size="sm"
                          variant="ghost"
                        >
                          <X size={16} className="text-foreground/35" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
