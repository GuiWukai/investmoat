'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Spinner,
} from '@heroui/react';
import { allCoverageData } from '@/app/stockData';
import {
  clearUserPortfolio,
  loadUserPortfolio,
  saveUserPortfolio,
  type UserHolding,
} from '@/lib/userPortfolio';

type CoverageStock = (typeof allCoverageData)[number];
type StockOption = CoverageStock & { id: string };

type Quote = {
  price: number | null;
  changePercent: number | null;
};

function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function parsePositiveNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function MyPortfolioPage() {
  const router = useRouter();

  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sharesInput, setSharesInput] = useState('');
  const [avgCostInput, setAvgCostInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const state = loadUserPortfolio();
    setHoldings(state.holdings);
    setHydrated(true);
  }, []);

  // Persist whenever holdings change post-hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveUserPortfolio(holdings);
  }, [holdings, hydrated]);

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
          .then((d) => [h.slug, { price: d?.price ?? null, changePercent: d?.changePercent ?? null }] as const)
          .catch(() => [h.slug, { price: null, changePercent: null }] as const)
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

  const heldSlugs = useMemo(() => new Set(holdings.map((h) => h.slug)), [holdings]);

  const searchResults = useMemo<StockOption[]>(() => {
    const trimmed = query.trim().toLowerCase();
    const pool = allCoverageData.filter((s) => !heldSlugs.has(s.slug));
    const matched = !trimmed
      ? pool.slice(0, 8)
      : pool
          .filter(
            (s) =>
              s.name.toLowerCase().includes(trimmed) ||
              s.ticker.toLowerCase().includes(trimmed) ||
              s.slug.toLowerCase().includes(trimmed)
          )
          .slice(0, 8);
    return matched.map((s) => ({ ...s, id: s.slug }));
  }, [query, heldSlugs]);

  const rows = useMemo(() => {
    return holdings
      .map((h) => {
        const stock = coverageBySlug.get(h.slug);
        const quote = quotes[h.slug];
        const price = quote?.price ?? null;
        const changePercent = quote?.changePercent ?? null;
        const marketValue = price != null ? price * h.shares : null;
        const costBasis =
          h.avgCost != null ? h.avgCost * h.shares : null;
        const gain =
          marketValue != null && costBasis != null ? marketValue - costBasis : null;
        const gainPct =
          gain != null && costBasis != null && costBasis > 0
            ? (gain / costBasis) * 100
            : null;
        return {
          ...h,
          stock,
          price,
          changePercent,
          marketValue,
          costBasis,
          gain,
          gainPct,
        };
      })
      .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0));
  }, [holdings, coverageBySlug, quotes]);

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
    const dayChange =
      dayWeight > 0 ? dayChangeWeighted / dayWeight : null;

    return {
      marketValue: hasMarket ? marketValue : null,
      costBasis: hasCost ? costBasis : null,
      gain,
      gainPct,
      dayChange,
    };
  }, [rows]);

  function addHolding() {
    setFormError(null);
    if (!selectedSlug) {
      setFormError('Pick a stock from coverage.');
      return;
    }
    const shares = parsePositiveNumber(sharesInput);
    if (shares == null) {
      setFormError('Enter a positive share count.');
      return;
    }
    const avgCostRaw = avgCostInput.trim();
    const avgCost = avgCostRaw ? parsePositiveNumber(avgCostRaw) : undefined;
    if (avgCostRaw && avgCost == null) {
      setFormError('Average cost must be a positive number.');
      return;
    }
    if (heldSlugs.has(selectedSlug)) {
      setFormError('Already in your portfolio — edit the row instead.');
      return;
    }

    const next: UserHolding = { slug: selectedSlug, shares };
    if (avgCost != null) next.avgCost = avgCost;

    setHoldings((prev) => [...prev, next]);
    setSelectedSlug(null);
    setQuery('');
    setSharesInput('');
    setAvgCostInput('');
  }

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
        return { ...h, avgCost };
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

  return (
    <div className="animate-fade-in dot-pattern">
      <header
        className="animate-fade-up stagger-fill-both pb-10 pt-6 md:pb-12 md:pt-12"
        style={{ animationDelay: '0s' }}
      >
        <p className="section-label mb-3">Personal</p>
        <h1 className="mb-4 text-4xl font-extrabold leading-tight gradient-text-animated md:text-6xl">
          My Portfolio
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/45 md:text-lg">
          Track your own holdings against InvestMoat coverage. Shares and average
          cost are saved in this browser only — nothing is uploaded.
        </p>
      </header>

      {/* Summary */}
      <section
        className="animate-fade-up stagger-fill-both mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        style={{ animationDelay: '0.1s' }}
      >
        <Card className="p-4">
          <p className="section-label mb-1.5">Market value</p>
          {!hydrated || (quotesLoading && holdings.length > 0 && totals.marketValue == null) ? (
            <Spinner size="sm" color="current" />
          ) : (
            <p className="text-2xl font-black tabular-nums text-foreground">
              {formatMoney(totals.marketValue)}
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-foreground/28">
            {holdings.length} position{holdings.length === 1 ? '' : 's'}
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
            {formatMoney(totals.costBasis)}
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
              <p className="text-2xl font-black tabular-nums">{formatMoney(totals.gain)}</p>
              <p className="mt-0.5 text-[10px] tabular-nums opacity-80">
                {formatPct(totals.gainPct)}
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Add holding */}
      <section
        className="animate-fade-up stagger-fill-both mb-10"
        style={{ animationDelay: '0.2s' }}
      >
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Briefcase size={16} className="text-gold-bright" />
            <h2 className="font-bold text-foreground/85">Add holding</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] md:items-end">
            <div>
              <p className="section-label mb-2">Stock</p>
              <ComboBox
                aria-label="Select stock"
                allowsEmptyCollection
                fullWidth
                inputValue={query}
                items={searchResults}
                menuTrigger="input"
                onInputChange={(value) => {
                  setQuery(value);
                  setSelectedSlug(null);
                  setFormError(null);
                }}
                onSelectionChange={(key) => {
                  if (key == null) {
                    setSelectedSlug(null);
                    return;
                  }
                  const slug = String(key);
                  const stock = coverageBySlug.get(slug);
                  setSelectedSlug(slug);
                  setQuery(stock ? `${stock.name} (${stock.ticker})` : slug);
                  setFormError(null);
                }}
                selectedKey={selectedSlug}
              >
                <ComboBox.InputGroup>
                  <Input placeholder="Search name or ticker…" />
                </ComboBox.InputGroup>
                <ComboBox.Popover>
                  <ListBox
                    items={searchResults}
                    renderEmptyState={() => (
                      <p className="px-3 py-3 text-sm text-muted">
                        {query.trim() ? 'No stocks found' : 'Type to search by name or ticker…'}
                      </p>
                    )}
                  >
                    {(item: StockOption) => (
                      <ListBoxItem
                        className="group flex items-center justify-between gap-3"
                        id={item.slug}
                        key={item.slug}
                        textValue={`${item.name} ${item.ticker}`}
                      >
                        <span className="truncate text-sm">{item.name}</span>
                        <span className="ml-auto font-mono text-xs font-bold text-muted">
                          {item.ticker}
                        </span>
                      </ListBoxItem>
                    )}
                  </ListBox>
                </ComboBox.Popover>
              </ComboBox>
            </div>

            <div>
              <p className="section-label mb-2">Shares</p>
              <Input
                aria-label="Shares"
                inputMode="decimal"
                onChange={(e) => {
                  setSharesInput(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. 10"
                value={sharesInput}
              />
            </div>

            <div>
              <p className="section-label mb-2">Avg cost (opt.)</p>
              <Input
                aria-label="Average cost"
                inputMode="decimal"
                onChange={(e) => {
                  setAvgCostInput(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. 185.50"
                value={avgCostInput}
              />
            </div>

            <Button
              className="mt-1 md:mt-0"
              onPress={addHolding}
              variant="primary"
            >
              <Plus size={16} />
              Add
            </Button>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-rose-400">{formError}</p>
          )}
        </Card>
      </section>

      {/* Holdings */}
      <section
        className="animate-fade-up stagger-fill-both pb-16"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="mb-5 flex items-center gap-4">
          <div>
            <p className="section-label mb-1">Holdings</p>
            <h2 className="text-xl font-bold text-foreground/85">Your book</h2>
          </div>
          <div className="h-px flex-1 bg-foreground/[0.05]" />
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

        {!hydrated ? (
          <Card className="flex items-center justify-center p-10">
            <Spinner color="current" />
          </Card>
        ) : holdings.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm text-foreground/45">
              No holdings yet. Add a covered name above — data stays in local storage.
            </p>
            <p className="mt-3 text-xs text-foreground/28">
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

                return (
                  <div
                    key={row.slug}
                    className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:gap-4 md:px-5 md:py-3.5"
                  >
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
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:contents">
                      <label className="block md:w-24">
                        <span className="section-label mb-1 block md:hidden">Shares</span>
                        <Input
                          aria-label={`${ticker} shares`}
                          className="text-right"
                          defaultValue={String(row.shares)}
                          inputMode="decimal"
                          key={`${row.slug}-shares`}
                          onBlur={(e) => {
                            const n = parsePositiveNumber(e.target.value);
                            if (n == null) {
                              e.target.value = String(row.shares);
                              return;
                            }
                            if (n !== row.shares) updateShares(row.slug, n);
                          }}
                        />
                      </label>

                      <label className="block md:w-28">
                        <span className="section-label mb-1 block md:hidden">Avg cost</span>
                        <Input
                          aria-label={`${ticker} average cost`}
                          className="text-right"
                          defaultValue={row.avgCost != null ? String(row.avgCost) : ''}
                          inputMode="decimal"
                          key={`${row.slug}-cost`}
                          onBlur={(e) => {
                            const raw = e.target.value.trim();
                            if (!raw) {
                              if (row.avgCost != null) updateAvgCost(row.slug, undefined);
                              e.target.value = '';
                              return;
                            }
                            const n = parsePositiveNumber(raw);
                            if (n == null) {
                              e.target.value =
                                row.avgCost != null ? String(row.avgCost) : '';
                              return;
                            }
                            if (n !== row.avgCost) updateAvgCost(row.slug, n);
                          }}
                          placeholder="—"
                        />
                      </label>

                      <div className="md:w-28 md:text-right">
                        <span className="section-label mb-1 block md:hidden">Price</span>
                        <p className="font-mono text-sm tabular-nums text-foreground/80">
                          {quotesLoading && row.price == null ? (
                            <Spinner size="sm" color="current" />
                          ) : (
                            formatMoney(row.price)
                          )}
                        </p>
                      </div>

                      <div className="md:w-16 md:text-right">
                        <span className="section-label mb-1 block md:hidden">1D %</span>
                        <p
                          className={`font-mono text-sm tabular-nums ${
                            row.changePercent == null
                              ? 'text-foreground/25'
                              : row.changePercent >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {formatPct(row.changePercent)}
                        </p>
                      </div>

                      <div className="md:w-28 md:text-right">
                        <span className="section-label mb-1 block md:hidden">Value</span>
                        <p className="font-mono text-sm font-semibold tabular-nums text-foreground/85">
                          {formatMoney(row.marketValue)}
                        </p>
                      </div>

                      <div className="md:w-28 md:text-right">
                        <span className="section-label mb-1 block md:hidden">P&amp;L</span>
                        {row.gain == null ? (
                          <p className="font-mono text-sm text-foreground/25">—</p>
                        ) : (
                          <div
                            className={`font-mono text-sm tabular-nums ${
                              row.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <div>{formatMoney(row.gain)}</div>
                            <div className="text-[10px] opacity-75">{formatPct(row.gainPct)}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end md:w-9 md:shrink-0">
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
                );
              })}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
