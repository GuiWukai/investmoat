'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Plus } from 'lucide-react';
import { Card, ListBox, ListBoxItem, Select, Spinner } from '@heroui/react';
import { allCoverageData } from '@/app/stockData';
import { IM25_TICKERS } from '@/lib/sectors';
import {
  convertBetweenPortfolioCurrencies,
  convertToDisplay,
  formatMoney,
  roundMoney,
  type PortfolioCurrency,
} from '@/lib/portfolioCurrency';
import {
  loadUserPortfolio,
  saveUserPortfolio,
  type UserHolding,
} from '@/lib/userPortfolio';
import {
  accentForCategory,
  AllocationBar,
  AlertBanner,
  BookHero,
  compositeForStock,
  CurrencyToggle,
  DeltaBadge,
  EmptyBook,
  formatPct,
  formatShares,
  formatWeight,
  HOLDING_ROW_CLASS,
  HOLDINGS_SORT_OPTIONS,
  ScorePill,
  SignedMoney,
  SortHeader,
  SortIndicator,
  StatCell,
  StatStrip,
  TickerBadge,
  type AllocationSlice,
  type HoldingsSortKey,
  type SortDir,
} from './portfolioUi';

type CoverageStock = (typeof allCoverageData)[number];

type Quote = {
  price: number | null;
  changePercent: number | null;
  currency: string | null;
};

export default function MyPortfolioPage() {
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<PortfolioCurrency>('USD');
  const [hydrated, setHydrated] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [usdCad, setUsdCad] = useState<number | null>(null);
  const [fxLoading, setFxLoading] = useState(true);
  const [sortKey, setSortKey] = useState<HoldingsSortKey>('value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

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
    const mapped = holdings.map((h) => {
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
        accent: accentForCategory(stock?.category),
      };
    });

    const valueOf = (row: (typeof mapped)[number]): number | string => {
      switch (sortKey) {
        case 'name':
          return (row.stock?.name ?? row.slug).toLowerCase();
        case 'score':
          return row.score ?? Number.NEGATIVE_INFINITY;
        case 'shares':
          return row.shares;
        case 'avgCost':
          return row.avgCost ?? Number.NEGATIVE_INFINITY;
        case 'price':
          return row.price ?? Number.NEGATIVE_INFINITY;
        case 'change':
          return row.changePercent ?? Number.NEGATIVE_INFINITY;
        case 'value':
          return row.marketValue ?? Number.NEGATIVE_INFINITY;
        case 'pnl':
          return row.gain ?? Number.NEGATIVE_INFINITY;
      }
    };

    return [...mapped].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      let cmp: number;
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
      else cmp = (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [holdings, coverageBySlug, quotes, displayCurrency, usdCad, sortKey, sortDir]);

  function handleHoldingsSort(key: HoldingsSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

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

  const rowsWithWeight = useMemo(() => {
    const total = totals.marketValue;
    return rows.map((row) => ({
      ...row,
      weight:
        total != null && total > 0 && row.marketValue != null
          ? (row.marketValue / total) * 100
          : null,
    }));
  }, [rows, totals.marketValue]);

  const allocationSlices = useMemo<AllocationSlice[]>(() => {
    return rowsWithWeight
      .filter((row) => row.weight != null && row.weight > 0)
      .map((row) => ({
        slug: row.slug,
        ticker: row.stock?.ticker ?? row.slug.toUpperCase(),
        color: row.accent,
        weight: row.weight as number,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [rowsWithWeight]);

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

  const quotesPending =
    !hydrated || (quotesLoading && holdings.length > 0 && totals.marketValue == null);

  return (
    <div className="animate-fade-in dot-pattern">
      <BookHero
        compact={hydrated && holdings.length > 0}
        title="Your book."
        dek="Track your own holdings against InvestMoat coverage. Open a position to edit shares or average cost — data stays in this browser only."
        end={
          !hydrated || holdings.length === 0 ? (
            <CurrencyToggle
              value={displayCurrency}
              onChange={switchDisplayCurrency}
            />
          ) : null
        }
        actions={
          <>
            <Link href="/my-portfolio/add" className="btn-primary w-full sm:w-auto">
              Add holding <Plus size={16} />
            </Link>
            <Link href="/stocks" className="btn-secondary w-full sm:w-auto">
              Browse coverage
            </Link>
            <Link href="/portfolio" className="text-link justify-center sm:ml-1 sm:justify-start">
              Compare with the IM25 <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      {currencyError && <AlertBanner>{currencyError}</AlertBanner>}
      {needsFx && !fxLoading && usdCad == null && (
        <AlertBanner>
          FX rate unavailable — mixed-currency positions show as — until the USD/CAD
          mid loads.
        </AlertBanner>
      )}

      {/* Balance */}
      {hydrated && holdings.length > 0 && (
        <section
          className="animate-fade-up stagger-fill-both mb-8"
          style={{ animationDelay: '0.08s' }}
        >
          <Card className="overflow-hidden p-4 sm:p-5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="section-label mb-0">Market value</p>
              <CurrencyToggle
                value={displayCurrency}
                onChange={switchDisplayCurrency}
              />
            </div>
            <div className="mt-3">
              {quotesPending ? (
                <Spinner size="sm" color="current" />
              ) : (
                <p className="text-[1.85rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[40px] md:text-[44px]">
                  {money(totals.marketValue)}
                </p>
              )}
              <div className="mt-2.5">
                <DeltaBadge
                  loading={!hydrated || quotesLoading}
                  value={totals.dayChange}
                />
              </div>
              <p className="mt-2.5 text-[12px] text-foreground/35 sm:text-[13px]">
                {holdings.length} position{holdings.length === 1 ? '' : 's'}
                {usdCad != null ? ` · USDCAD ${usdCad.toFixed(4)}` : ''}
              </p>
            </div>

            <div className="mt-5 sm:mt-6">
              <p className="section-label mb-2.5">Allocation</p>
              <AllocationBar
                slices={allocationSlices}
                activeSlug={activeSlug}
                onActiveChange={setActiveSlug}
              />
            </div>

            <StatStrip>
              <StatCell hint="Optional · from avg cost" label="Cost basis" shortLabel="Cost">
                <p className="text-[15px] font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
                  {money(totals.costBasis)}
                </p>
              </StatCell>
              <StatCell label="Unrealized P&amp;L" shortLabel="P&amp;L">
                {totals.gain == null ? (
                  <p className="text-[15px] font-semibold text-foreground/20 sm:text-xl">—</p>
                ) : (
                  <div>
                    <p>
                      <SignedMoney formatted={money(totals.gain)} size="lg" value={totals.gain} />
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-foreground/40">
                      {formatPct(totals.gainPct)}
                    </p>
                  </div>
                )}
              </StatCell>
              <StatCell hint="Value-weighted" label="Today">
                {!hydrated || quotesLoading ? (
                  <Spinner size="sm" color="current" />
                ) : totals.dayChange == null ? (
                  <p className="text-[15px] font-semibold text-foreground/20 sm:text-xl">—</p>
                ) : (
                  <p
                    className={`text-[15px] font-semibold tabular-nums tracking-tight sm:text-xl ${
                      totals.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPct(totals.dayChange)}
                  </p>
                )}
              </StatCell>
            </StatStrip>
          </Card>
        </section>
      )}

      {!hydrated && (
        <Card className="mb-8 flex items-center justify-center p-10">
          <Spinner color="current" />
        </Card>
      )}

      {/* Holdings */}
      <section
        className="animate-fade-up stagger-fill-both pb-16"
        style={{ animationDelay: '0.16s' }}
      >
        {hydrated && holdings.length === 0 ? (
          <EmptyBook />
        ) : hydrated ? (
          <>
            <div className="mb-4 flex items-center gap-3 md:mb-5">
              <div>
                <p className="section-label mb-1">Holdings</p>
                <h2 className="text-xl font-semibold tracking-tight text-foreground/90">
                  Positions
                </h2>
              </div>
              <div className="hidden h-px flex-1 bg-foreground/[0.05] md:block" />
              <div className="ml-auto flex items-center gap-2">
                <Select
                  aria-label="Sort holdings"
                  className="w-[9.75rem] md:hidden"
                  onSelectionChange={(key) => {
                    if (key == null) return;
                    handleHoldingsSort(String(key) as HoldingsSortKey);
                  }}
                  selectedKey={sortKey}
                >
                  <Select.Trigger className="h-8 min-h-8 items-center gap-1.5 rounded-lg border border-foreground/[0.06] bg-foreground/[0.04] px-2.5 text-left">
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">
                        Sort
                      </span>
                      <span className="flex min-w-0 items-center gap-1">
                        <Select.Value className="truncate text-[11px] font-bold text-foreground/85">
                          {({ isPlaceholder, selectedText, defaultChildren }) =>
                            isPlaceholder ? defaultChildren : selectedText
                          }
                        </Select.Value>
                        <SortIndicator active dir={sortDir} />
                      </span>
                    </span>
                    <Select.Indicator className="ml-auto shrink-0" />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {HOLDINGS_SORT_OPTIONS.map((opt) => (
                        <ListBoxItem
                          key={opt.key}
                          className="flex items-center justify-between gap-2"
                          id={opt.key}
                          textValue={opt.label}
                        >
                          <span>{opt.label}</span>
                          <SortIndicator active={sortKey === opt.key} dir={sortDir} />
                        </ListBoxItem>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Link
                  href="/my-portfolio/add"
                  className="btn-secondary h-8 min-h-8 px-3 text-[13px]"
                >
                  <Plus size={14} />
                  Add
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="hidden items-center gap-3 border-b border-foreground/[0.05] bg-foreground/[0.02] px-4 py-2.5 md:flex md:gap-4 md:px-5">
                <div className="min-w-0 flex-1">
                  <SortHeader
                    label="Holding"
                    sortKey="name"
                    active={sortKey === 'name'}
                    dir={sortDir}
                    onSort={handleHoldingsSort}
                  />
                </div>
                <div className="hidden w-11 shrink-0 lg:block">
                  <SortHeader
                    label="Score"
                    sortKey="score"
                    active={sortKey === 'score'}
                    dir={sortDir}
                    onSort={handleHoldingsSort}
                    align="right"
                  />
                </div>
                <div className="hidden w-16 shrink-0 lg:block">
                  <SortHeader
                    label="1D %"
                    sortKey="change"
                    active={sortKey === 'change'}
                    dir={sortDir}
                    onSort={handleHoldingsSort}
                    align="right"
                  />
                </div>
                <div className="w-[7.5rem] shrink-0">
                  <SortHeader
                    label="Value"
                    sortKey="value"
                    active={sortKey === 'value'}
                    dir={sortDir}
                    onSort={handleHoldingsSort}
                    align="right"
                  />
                </div>
                <div className="hidden w-[7.25rem] shrink-0 sm:block">
                  <SortHeader
                    label="P&L"
                    sortKey="pnl"
                    active={sortKey === 'pnl'}
                    dir={sortDir}
                    onSort={handleHoldingsSort}
                    align="right"
                  />
                </div>
                <div className="hidden w-14 shrink-0 md:block">
                  <span className="block w-full text-right text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                    Wt.
                  </span>
                </div>
                <div className="w-[15px] shrink-0" />
              </div>

              <div className="divide-y divide-foreground/[0.04]">
                {rowsWithWeight.map((row) => {
                  const name = row.stock?.name ?? row.slug;
                  const ticker = row.stock?.ticker ?? row.slug.toUpperCase();
                  const inIm25 = IM25_TICKERS.has(ticker);
                  const quoteNote =
                    row.quoteCurrency &&
                    row.quoteCurrency.toUpperCase() !== displayCurrency
                      ? row.quoteCurrency.toUpperCase()
                      : null;
                  const highlighted = activeSlug === row.slug;
                  const showScoreOnMobile = sortKey === 'score';
                  const showChangeOnMobile = sortKey === 'change';

                  return (
                    <Link
                      key={row.slug}
                      href={`/my-portfolio/${row.slug}`}
                      aria-label={`Open ${ticker} position`}
                      className={`${HOLDING_ROW_CLASS} ${
                        highlighted ? 'bg-foreground/[0.04]' : ''
                      }`}
                      onPointerEnter={(e) => {
                        if (e.pointerType === 'mouse') setActiveSlug(row.slug);
                      }}
                      onPointerLeave={(e) => {
                        if (e.pointerType === 'mouse') setActiveSlug(null);
                      }}
                    >
                      <span
                        className={`absolute inset-y-2 left-0 w-0.5 rounded-full transition-opacity ${
                          highlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        style={{ background: row.accent }}
                        aria-hidden
                      />

                      <TickerBadge color={row.accent} ticker={ticker} />

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-foreground">
                            {name}
                          </span>
                          {inIm25 && (
                            <span className="hidden shrink-0 rounded-md border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold-bright md:inline">
                              IM25
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-foreground/35">
                          {formatShares(row.shares)} sh
                          {row.avgCost != null ? ` · ${money(row.avgCost)} avg` : ''}
                          {row.weight != null ? ` · ${formatWeight(row.weight)}` : ''}
                          {inIm25 ? <span className="md:hidden"> · IM25</span> : null}
                          {quoteNote ? ` · ${quoteNote}` : ''}
                        </div>
                      </div>

                      <div
                        className={`shrink-0 ${showScoreOnMobile ? 'flex' : 'hidden'} lg:flex`}
                      >
                        {row.score == null ? (
                          <span className="w-11 text-right font-mono text-sm text-foreground/25">
                            —
                          </span>
                        ) : (
                          <ScorePill value={row.score} />
                        )}
                      </div>

                      <div
                        className={`w-16 shrink-0 text-right ${
                          showChangeOnMobile ? 'block' : 'hidden'
                        } lg:block`}
                      >
                        <span
                          className={`font-mono text-[13px] font-semibold tabular-nums ${
                            row.changePercent == null
                              ? 'text-foreground/25'
                              : row.changePercent >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {formatPct(row.changePercent)}
                        </span>
                      </div>

                      <div className="min-w-[5.25rem] shrink-0 text-right sm:w-[7.5rem]">
                        <div className="font-mono text-sm font-semibold tabular-nums text-foreground/90">
                          {quotesLoading && row.marketValue == null ? (
                            <Spinner size="sm" color="current" />
                          ) : (
                            money(row.marketValue)
                          )}
                        </div>
                        <div className="mt-0.5 sm:hidden">
                          {row.gain == null ? (
                            <span className="text-[11px] text-foreground/25">—</span>
                          ) : (
                            <span
                              className={`font-mono text-[11px] tabular-nums ${
                                row.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {money(row.gain)} · {formatPct(row.gainPct)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden w-[7.25rem] shrink-0 text-right sm:block">
                        {row.gain == null ? (
                          <span className="font-mono text-sm text-foreground/25">—</span>
                        ) : (
                          <div>
                            <SignedMoney formatted={money(row.gain)} value={row.gain} />
                            <div className="mt-0.5 font-mono text-[11px] tabular-nums text-foreground/35">
                              {formatPct(row.gainPct)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="hidden w-14 shrink-0 text-right md:block">
                        <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground/70">
                          {formatWeight(row.weight)}
                        </span>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, row.weight ?? 0))}%`,
                              background: row.accent,
                            }}
                          />
                        </div>
                      </div>

                      <ChevronRight
                        aria-hidden
                        className="ml-0.5 hidden shrink-0 text-foreground/15 transition-colors group-hover:text-gold-bright sm:block"
                        size={15}
                      />
                    </Link>
                  );
                })}
              </div>
            </Card>
          </>
        ) : null}
      </section>
    </div>
  );
}
