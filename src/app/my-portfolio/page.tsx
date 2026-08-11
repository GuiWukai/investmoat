'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Card,
  ListBox,
  ListBoxItem,
  Select,
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

type HoldingsSortKey =
  | 'name'
  | 'score'
  | 'shares'
  | 'avgCost'
  | 'price'
  | 'change'
  | 'value'
  | 'pnl';
type SortDir = 'asc' | 'desc';

/** Full desktop column set — used for table headers / sort / mobile select. */
const HOLDINGS_SORT_OPTIONS: { key: HoldingsSortKey; label: string }[] = [
  { key: 'name', label: 'Holding' },
  { key: 'score', label: 'Score' },
  { key: 'shares', label: 'Shares' },
  { key: 'avgCost', label: 'Avg cost' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: '1D %' },
  { key: 'value', label: 'Value' },
  { key: 'pnl', label: 'P&L' },
];

/**
 * On mobile, Holding / Shares / Value / P&L stay put. Score, Avg cost, Price,
 * and 1D % share one slot — the active sort key wins; otherwise Score.
 */
const MOBILE_SLOT_KEYS: HoldingsSortKey[] = ['score', 'avgCost', 'price', 'change'];

function mobileSlotColumn(sortKey: HoldingsSortKey): HoldingsSortKey {
  return MOBILE_SLOT_KEYS.includes(sortKey) ? sortKey : 'score';
}

function mobileSlotClass(column: HoldingsSortKey, slot: HoldingsSortKey): string {
  return column === slot ? '' : 'hidden md:table-cell';
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={11} className="text-foreground/15" />;
  return dir === 'asc' ? (
    <ArrowUp size={11} className="text-gold-bright" />
  ) : (
    <ArrowDown size={11} className="text-gold-bright" />
  );
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className,
  align = 'left',
}: {
  label: string;
  sortKey: HoldingsSortKey;
  active: boolean;
  dir: SortDir;
  onSort: (k: HoldingsSortKey) => void;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active ? 'text-gold-bright' : 'text-foreground/20 hover:text-foreground/45'
      } ${align === 'right' ? 'justify-end w-full' : ''} ${className ?? ''}`}
    >
      <span>{label}</span>
      <SortIndicator active={active} dir={dir} />
    </button>
  );
}

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
  const [sortKey, setSortKey] = useState<HoldingsSortKey>('value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const mobileSlot = mobileSlotColumn(sortKey);

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
          Track your own holdings against InvestMoat coverage. Open a position to
          edit shares or average cost — data stays in this browser only. Totals
          convert USD and CAD quotes into your book currency.
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
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {holdings.length > 0 && (
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
            )}
            <Button
              onPress={() => router.push('/my-portfolio/add')}
              size="sm"
              variant="primary"
            >
              <Plus size={14} />
              Add holding
            </Button>
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left md:min-w-[720px]">
                <thead>
                  <tr className="border-b border-foreground/[0.05] bg-foreground/[0.02]">
                    <th scope="col" className="px-4 py-2.5 md:px-5">
                      <SortHeader
                        label="Holding"
                        sortKey="name"
                        active={sortKey === 'name'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                      />
                    </th>
                    <th
                      scope="col"
                      className={`px-2 py-2.5 md:px-3 ${mobileSlotClass('score', mobileSlot)}`}
                    >
                      <SortHeader
                        label="Score"
                        sortKey="score"
                        active={sortKey === 'score'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th scope="col" className="px-2 py-2.5 md:px-3">
                      <SortHeader
                        label="Shares"
                        sortKey="shares"
                        active={sortKey === 'shares'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th
                      scope="col"
                      className={`px-2 py-2.5 md:px-3 ${mobileSlotClass('avgCost', mobileSlot)}`}
                    >
                      <SortHeader
                        label="Avg cost"
                        sortKey="avgCost"
                        active={sortKey === 'avgCost'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th
                      scope="col"
                      className={`px-2 py-2.5 md:px-3 ${mobileSlotClass('price', mobileSlot)}`}
                    >
                      <SortHeader
                        label="Price"
                        sortKey="price"
                        active={sortKey === 'price'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th
                      scope="col"
                      className={`px-2 py-2.5 md:px-3 ${mobileSlotClass('change', mobileSlot)}`}
                    >
                      <SortHeader
                        label="1D %"
                        sortKey="change"
                        active={sortKey === 'change'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th scope="col" className="px-2 py-2.5 md:px-3">
                      <SortHeader
                        label="Value"
                        sortKey="value"
                        active={sortKey === 'value'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th scope="col" className="px-2 py-2.5 md:px-3">
                      <SortHeader
                        label="P&L"
                        sortKey="pnl"
                        active={sortKey === 'pnl'}
                        dir={sortDir}
                        onSort={handleHoldingsSort}
                        align="right"
                      />
                    </th>
                    <th scope="col" className="w-8 px-2 py-2.5 md:pr-5">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {rows.map((row) => {
                    const name = row.stock?.name ?? row.slug;
                    const ticker = row.stock?.ticker ?? row.slug.toUpperCase();
                    const positionHref = `/my-portfolio/${row.slug}`;
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
                      <tr
                        key={row.slug}
                        aria-label={`Open ${ticker} position`}
                        className="cursor-pointer transition-colors hover:bg-foreground/[0.03] group"
                        onClick={() => router.push(positionHref)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(positionHref);
                          }
                        }}
                        role="link"
                        tabIndex={0}
                      >
                        <td className="px-4 py-3.5 md:px-5">
                          <div className="truncate text-sm font-bold text-foreground/90">{name}</div>
                          <div className="mt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-foreground/28">
                            {ticker}
                            {quoteNote ? ` · ${quoteNote}` : ''}
                          </div>
                        </td>
                        <td
                          className={`px-2 py-3.5 text-right md:px-3 ${mobileSlotClass('score', mobileSlot)}`}
                        >
                          {row.score == null ? (
                            <span className="font-mono text-sm text-foreground/25">—</span>
                          ) : (
                            <span
                              className={`font-mono text-sm font-black tabular-nums ${scoreColor(row.score)}`}
                            >
                              {row.score}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3.5 text-right md:px-3">
                          <span className="font-mono text-sm tabular-nums text-foreground/80">
                            {row.shares}
                          </span>
                        </td>
                        <td
                          className={`px-2 py-3.5 text-right md:px-3 ${mobileSlotClass('avgCost', mobileSlot)}`}
                        >
                          <span className="font-mono text-sm tabular-nums text-foreground/80">
                            {row.avgCost == null ? '—' : money(row.avgCost)}
                          </span>
                        </td>
                        <td
                          className={`px-2 py-3.5 text-right md:px-3 ${mobileSlotClass('price', mobileSlot)}`}
                        >
                          <span className="font-mono text-sm tabular-nums text-foreground/80">
                            {quotesLoading && row.price == null ? (
                              <Spinner size="sm" color="current" />
                            ) : (
                              money(row.price)
                            )}
                          </span>
                        </td>
                        <td
                          className={`px-2 py-3.5 text-right md:px-3 ${mobileSlotClass('change', mobileSlot)}`}
                        >
                          <span className={`font-mono text-sm tabular-nums ${dayClass}`}>
                            {formatPct(row.changePercent)}
                          </span>
                        </td>
                        <td className="px-2 py-3.5 text-right md:px-3">
                          <span className="font-mono text-sm font-semibold tabular-nums text-foreground/85">
                            {quotesLoading && row.marketValue == null ? (
                              <Spinner size="sm" color="current" />
                            ) : (
                              money(row.marketValue)
                            )}
                          </span>
                        </td>
                        <td className="px-2 py-3.5 text-right md:px-3">
                          {row.gain == null ? (
                            <span className="font-mono text-sm text-foreground/25">—</span>
                          ) : (
                            <div className={`font-mono text-sm tabular-nums ${gainClass}`}>
                              <div>{money(row.gain)}</div>
                              <div className="text-[10px] opacity-75">{formatPct(row.gainPct)}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-3.5 md:pr-5">
                          <ChevronRight
                            aria-hidden
                            className="ml-auto text-foreground/25 group-hover:text-foreground/50"
                            size={16}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
