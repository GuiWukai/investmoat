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
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  convertToDisplay,
  formatMoney,
  PORTFOLIO_CURRENCIES,
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
type StockOption = CoverageStock & { id: string };

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
  'w-full rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 font-mono text-sm tabular-nums text-foreground outline-none transition-colors placeholder:text-foreground/25 focus:border-accent/40 focus:bg-foreground/[0.05]';

/** Compact USD/CAD toggle for average-cost denomination. */
function CostCurrencyToggle({
  'aria-label': ariaLabel,
  className = '',
  onChange,
  value,
}: {
  'aria-label': string;
  className?: string;
  onChange: (next: PortfolioCurrency) => void;
  value: PortfolioCurrency;
}) {
  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      className={`flex items-center gap-1 ${className}`}
      isDetached
      selectedKeys={new Set([value])}
      onSelectionChange={(keys) => {
        const key = [...keys][0];
        if (key == null) return;
        const next = String(key);
        if (next === 'USD' || next === 'CAD') onChange(next);
      }}
    >
      {PORTFOLIO_CURRENCIES.map((code) => (
        <ToggleButton
          key={code}
          id={code}
          className="pill-toggle rounded-full px-2 py-0.5 text-[10px] font-semibold"
        >
          {code}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

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

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sharesInput, setSharesInput] = useState('');
  const [avgCostInput, setAvgCostInput] = useState('');
  const [avgCostCurrency, setAvgCostCurrency] = useState<PortfolioCurrency>('USD');
  const [formError, setFormError] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [usdCad, setUsdCad] = useState<number | null>(null);
  const [fxLoading, setFxLoading] = useState(true);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const state = loadUserPortfolio();
    setHoldings(state.holdings);
    setDisplayCurrency(state.displayCurrency);
    setAvgCostCurrency(state.displayCurrency);
    setHydrated(true);
  }, []);

  // Persist whenever holdings or book currency change post-hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveUserPortfolio(holdings, displayCurrency);
  }, [holdings, displayCurrency, hydrated]);

  // Keep the add-form cost currency aligned with the book when the field is empty.
  useEffect(() => {
    if (!avgCostInput.trim()) setAvgCostCurrency(displayCurrency);
  }, [displayCurrency, avgCostInput]);

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

  const needsFx = useMemo(() => {
    if (holdings.length === 0) return false;
    return holdings.some((h) => {
      const quoteCurrency = (quotes[h.slug]?.currency ?? 'USD').toUpperCase();
      if (quoteCurrency !== displayCurrency) return true;
      if (h.avgCost == null) return false;
      const costCurrency = h.avgCostCurrency ?? displayCurrency;
      return costCurrency !== displayCurrency;
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
        const costCurrency = h.avgCostCurrency ?? displayCurrency;
        const costPerShare =
          h.avgCost == null
            ? null
            : convertToDisplay(h.avgCost, costCurrency, displayCurrency, usdCad);
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
          costCurrency,
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

  function resolveSelectedSlug(): string | null {
    if (selectedSlug && coverageBySlug.has(selectedSlug)) return selectedSlug;

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return null;

    const exactTicker = allCoverageData.find((s) => s.ticker.toLowerCase() === trimmed);
    if (exactTicker) return exactTicker.slug;

    const exactName = allCoverageData.find((s) => s.name.toLowerCase() === trimmed);
    if (exactName) return exactName.slug;

    const labelMatch = allCoverageData.find(
      (s) => `${s.name} (${s.ticker})`.toLowerCase() === trimmed
    );
    if (labelMatch) return labelMatch.slug;

    return null;
  }

  function addHolding() {
    setFormError(null);
    const slug = resolveSelectedSlug();
    if (!slug) {
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
    if (heldSlugs.has(slug)) {
      setFormError('Already in your portfolio — edit the row instead.');
      return;
    }

    const next: UserHolding = { slug, shares };
    if (avgCost != null) {
      next.avgCost = avgCost;
      next.avgCostCurrency = avgCostCurrency;
    }

    setHoldings((prev) => [...prev, next]);
    setSelectedSlug(null);
    setQuery('');
    setSharesInput('');
    setAvgCostInput('');
    setAvgCostCurrency(displayCurrency);
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
        return {
          ...h,
          avgCost,
          avgCostCurrency: h.avgCostCurrency ?? displayCurrency,
        };
      })
    );
  }

  function updateAvgCostCurrency(slug: string, currency: PortfolioCurrency) {
    // Declares the denomination of the stored number — does not convert it.
    setHoldings((prev) =>
      prev.map((h) => (h.slug === slug ? { ...h, avgCostCurrency: currency } : h))
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
    // Legacy costs without a denomination were entered in the prior book currency —
    // stamp that so flipping the book no longer silently reinterprets the number.
    setHoldings((prev) =>
      prev.map((h) => {
        if (h.avgCost == null || h.avgCostCurrency) return h;
        return { ...h, avgCostCurrency: displayCurrency };
      })
    );
    // Avg costs keep their own denomination; only book totals / quotes re-FX.
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
          cost are saved in this browser only — nothing is uploaded. Enter each
          average cost in USD or CAD; totals convert into your book currency.
        </p>
        {needsFx && !fxLoading && usdCad == null && (
          <p className="mt-3 text-sm text-rose-400">
            FX rate unavailable — mixed-currency positions show as — until the
            USD/CAD mid loads.
          </p>
        )}
        {usdCad != null && (
          <p className="mt-3 text-xs text-foreground/28">
            USDCAD {usdCad.toFixed(4)}
            {needsFx ? ' · converting quotes and costs into book currency' : ''}
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
                  setFormError(null);
                  // Clearing on every input change races with onSelectionChange:
                  // selecting an item updates the input label, which would wipe
                  // selectedSlug before Add can see it. Only clear when the typed
                  // value no longer matches the selected stock's label.
                  setSelectedSlug((prev) => {
                    if (!prev) return null;
                    const stock = coverageBySlug.get(prev);
                    if (!stock) return null;
                    const label = `${stock.name} (${stock.ticker})`;
                    return value === label || value === stock.ticker || value === stock.name
                      ? prev
                      : null;
                  });
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
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="section-label">Avg cost</p>
                <CostCurrencyToggle
                  aria-label="Average cost currency"
                  onChange={setAvgCostCurrency}
                  value={avgCostCurrency}
                />
              </div>
              <Input
                aria-label={`Average cost in ${avgCostCurrency}`}
                inputMode="decimal"
                onChange={(e) => {
                  setAvgCostInput(e.target.value);
                  setFormError(null);
                }}
                placeholder={`e.g. 185.50 ${avgCostCurrency}`}
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
              <div className="section-label w-14 text-right">Score</div>
              <div className="section-label w-24 text-right">Shares</div>
              <div className="section-label w-36 text-right">Avg cost</div>
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
                        {quoteNote ? ` · ${quoteNote}` : ''}
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:contents">
                      <div className="md:w-14 md:text-right">
                        <span className="section-label mb-1 block md:hidden">Score</span>
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

                      <label className="block md:w-24">
                        <span className="section-label mb-1 block md:hidden">Shares</span>
                        <HoldingNumberField
                          aria-label={`${ticker} shares`}
                          className="text-right"
                          onCommit={(n) => {
                            if (n != null && n !== row.shares) updateShares(row.slug, n);
                          }}
                          value={row.shares}
                        />
                      </label>

                      <div className="md:w-36">
                        <div className="mb-1 flex items-center justify-between gap-2 md:justify-end">
                          <span className="section-label md:hidden">Avg cost</span>
                          <CostCurrencyToggle
                            aria-label={`${ticker} average cost currency`}
                            onChange={(next) => {
                              if (next !== row.costCurrency) {
                                updateAvgCostCurrency(row.slug, next);
                              }
                            }}
                            value={row.costCurrency}
                          />
                        </div>
                        <HoldingNumberField
                          allowEmpty
                          aria-label={`${ticker} average cost in ${row.costCurrency}`}
                          className="text-right"
                          onCommit={(n) => {
                            if (n !== row.avgCost) updateAvgCost(row.slug, n);
                          }}
                          placeholder="—"
                          value={row.avgCost}
                        />
                      </div>

                      <div className="md:w-28 md:text-right">
                        <span className="section-label mb-1 block md:hidden">Price</span>
                        <p className="font-mono text-sm tabular-nums text-foreground/80">
                          {quotesLoading && row.price == null ? (
                            <Spinner size="sm" color="current" />
                          ) : (
                            money(row.price)
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
                          {money(row.marketValue)}
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
                            <div>{money(row.gain)}</div>
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
