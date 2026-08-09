'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button, Card, Spinner } from '@heroui/react';
import { allCoverageData, getAverageScore } from '@/app/stockData';
import {
  convertToDisplay,
  formatMoney,
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
import { HoldingNumberField } from '../holdingField';

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

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-blue-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-rose-400';
}

function compositeForStock(
  stock: (typeof allCoverageData)[number] | undefined,
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

export default function PositionPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = (params?.slug ?? '').toString().trim().toLowerCase();

  const stock = useMemo(
    () => allCoverageData.find((s) => s.slug === slug),
    [slug]
  );

  const [hydrated, setHydrated] = useState(false);
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<PortfolioCurrency>('USD');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [usdCad, setUsdCad] = useState<number | null>(null);
  const [removed, setRemoved] = useState(false);

  const holding = useMemo(
    () => holdings.find((h) => h.slug === slug) ?? null,
    [holdings, slug]
  );

  useEffect(() => {
    const state = loadUserPortfolio();
    setHoldings(state.holdings);
    setDisplayCurrency(state.displayCurrency);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || removed) return;
    saveUserPortfolio(holdings, displayCurrency);
  }, [holdings, displayCurrency, hydrated, removed]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/fx/usd-cad')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const rate = typeof d?.rate === 'number' && d.rate > 0 ? d.rate : null;
        setUsdCad(rate);
      })
      .catch(() => {
        if (!cancelled) setUsdCad(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !slug || !holding) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);
    fetch(`/api/stock-price/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setQuote({
          price: d?.price ?? null,
          changePercent: d?.changePercent ?? null,
          currency: typeof d?.currency === 'string' ? d.currency : null,
        });
        setQuoteLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setQuote({ price: null, changePercent: null, currency: null });
        setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, slug, holding]);

  const metrics = useMemo(() => {
    if (!holding) return null;
    const nativePrice = quote?.price ?? null;
    const quoteCurrency = quote?.currency ?? null;
    const changePercent = quote?.changePercent ?? null;
    const price =
      nativePrice == null
        ? null
        : convertToDisplay(nativePrice, quoteCurrency, displayCurrency, usdCad);
    const marketValue = price != null ? price * holding.shares : null;
    const costPerShare = holding.avgCost ?? null;
    const costBasis =
      costPerShare != null ? costPerShare * holding.shares : null;
    const gain =
      marketValue != null && costBasis != null ? marketValue - costBasis : null;
    const gainPct =
      gain != null && costBasis != null && costBasis > 0
        ? (gain / costBasis) * 100
        : null;
    const score = compositeForStock(stock, nativePrice);
    return {
      price,
      quoteCurrency,
      changePercent,
      marketValue,
      costBasis,
      gain,
      gainPct,
      score,
    };
  }, [holding, quote, displayCurrency, usdCad, stock]);

  function updateShares(shares: number) {
    setHoldings((prev) =>
      prev.map((h) => (h.slug === slug ? { ...h, shares } : h))
    );
  }

  function updateAvgCost(avgCost: number | undefined) {
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

  function removeHolding() {
    const next = holdings.filter((h) => h.slug !== slug);
    setRemoved(true);
    setHoldings(next);
    saveUserPortfolio(next, displayCurrency);
    router.push('/my-portfolio');
  }

  const money = (value: number | null | undefined) =>
    formatMoney(value, displayCurrency);

  const name = stock?.name ?? slug;
  const ticker = stock?.ticker ?? slug.toUpperCase();
  const analysisHref = stock?.href ?? `/stocks/${slug}`;

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner color="current" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="animate-fade-in pb-16 pt-8">
        <Link
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground/45 transition-colors hover:text-foreground/70"
          href="/my-portfolio"
        >
          <ArrowLeft size={14} />
          My Portfolio
        </Link>
        <Card className="p-6 md:p-10">
          <h1 className="text-2xl font-bold text-foreground/85">Position not found</h1>
          <p className="mt-2 text-sm text-foreground/45">
            <span className="font-mono">{slug || '—'}</span> is not in InvestMoat coverage.
          </p>
        </Card>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="animate-fade-in pb-16 pt-8">
        <Link
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground/45 transition-colors hover:text-foreground/70"
          href="/my-portfolio"
        >
          <ArrowLeft size={14} />
          My Portfolio
        </Link>
        <Card className="p-6 md:p-10">
          <p className="section-label mb-2">{ticker}</p>
          <h1 className="text-2xl font-bold text-foreground/85">{name}</h1>
          <p className="mt-2 text-sm text-foreground/45">
            This name is not in your portfolio yet. Add it from My Portfolio.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onPress={() => router.push('/my-portfolio')} variant="primary">
              Back to My Portfolio
            </Button>
            <Button onPress={() => router.push(analysisHref)} variant="ghost">
              View analysis
              <ExternalLink size={14} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const dayClass =
    metrics?.changePercent == null
      ? 'text-foreground/25'
      : metrics.changePercent >= 0
        ? 'text-emerald-400'
        : 'text-rose-400';
  const gainClass =
    metrics?.gain == null
      ? 'text-foreground/25'
      : metrics.gain >= 0
        ? 'text-emerald-400'
        : 'text-rose-400';
  const quoteNote =
    metrics?.quoteCurrency &&
    metrics.quoteCurrency.toUpperCase() !== displayCurrency
      ? metrics.quoteCurrency.toUpperCase()
      : null;

  return (
    <div className="animate-fade-in dot-pattern pb-16">
      <header
        className="animate-fade-up stagger-fill-both pb-8 pt-6 md:pb-10 md:pt-12"
        style={{ animationDelay: '0s' }}
      >
        <Link
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-foreground/45 transition-colors hover:text-foreground/70"
          href="/my-portfolio"
        >
          <ArrowLeft size={14} />
          My Portfolio
        </Link>
        <p className="section-label mb-2">Position · {displayCurrency}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
              {name}
            </h1>
            <p className="mt-2 font-mono text-xs font-black uppercase tracking-[0.14em] text-foreground/35">
              {ticker}
              {quoteNote ? ` · quoted ${quoteNote}` : ''}
            </p>
          </div>
          <Button onPress={() => router.push(analysisHref)} size="sm" variant="ghost">
            Analysis
            <ExternalLink size={14} />
          </Button>
        </div>
      </header>

      <section
        className="animate-fade-up stagger-fill-both mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        style={{ animationDelay: '0.1s' }}
      >
        <Card className="p-4">
          <p className="section-label mb-1.5">Market value</p>
          {quoteLoading && metrics?.marketValue == null ? (
            <Spinner size="sm" color="current" />
          ) : (
            <p className="text-2xl font-black tabular-nums text-foreground">
              {money(metrics?.marketValue)}
            </p>
          )}
          <p className="mt-0.5 font-mono text-[10px] tabular-nums text-foreground/28">
            {quoteLoading && metrics?.price == null ? '…' : money(metrics?.price)} / sh
          </p>
        </Card>

        <Card className="p-4">
          <p className="section-label mb-1.5">Today</p>
          {quoteLoading ? (
            <Spinner size="sm" color="current" />
          ) : metrics?.changePercent == null ? (
            <p className="text-2xl font-black text-foreground/20">—</p>
          ) : (
            <div className={`flex items-center gap-2 ${dayClass}`}>
              {metrics.changePercent >= 0 ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
              <span className="text-2xl font-black tabular-nums">
                {formatPct(metrics.changePercent)}
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="section-label mb-1.5">Score</p>
          {metrics?.score == null ? (
            <p className="text-2xl font-black text-foreground/20">—</p>
          ) : (
            <p
              className={`text-2xl font-black tabular-nums ${scoreColor(metrics.score)}`}
            >
              {metrics.score}
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-foreground/28">Live composite</p>
        </Card>

        <Card className="p-4">
          <p className="section-label mb-1.5">Unrealized P&amp;L</p>
          {metrics?.gain == null ? (
            <p className="text-2xl font-black text-foreground/20">—</p>
          ) : (
            <div className={gainClass}>
              <p className="text-2xl font-black tabular-nums">{money(metrics.gain)}</p>
              <p className="mt-0.5 text-[10px] tabular-nums opacity-80">
                {formatPct(metrics.gainPct)}
              </p>
            </div>
          )}
        </Card>
      </section>

      <section
        className="animate-fade-up stagger-fill-both"
        style={{ animationDelay: '0.2s' }}
      >
        <Card className="p-5 md:p-6">
          <div className="mb-5">
            <p className="section-label mb-1">Edit position</p>
            <h2 className="text-xl font-bold text-foreground/85">Shares &amp; cost</h2>
            <p className="mt-1 text-sm text-foreground/40">
              Changes save in this browser when you leave a field.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="section-label mb-2 block">Shares</span>
              <HoldingNumberField
                aria-label={`${ticker} shares`}
                onCommit={(n) => {
                  if (n != null && n !== holding.shares) updateShares(n);
                }}
                value={holding.shares}
              />
            </label>
            <label className="block">
              <span className="section-label mb-2 block">
                Avg cost ({displayCurrency})
              </span>
              <HoldingNumberField
                allowEmpty
                aria-label={`${ticker} average cost in ${displayCurrency}`}
                onCommit={(n) => {
                  if (n !== holding.avgCost) updateAvgCost(n);
                }}
                placeholder="Optional"
                value={holding.avgCost}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-foreground/[0.03] px-4 py-3">
              <p className="section-label mb-1">Cost basis</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-foreground/80">
                {money(metrics?.costBasis)}
              </p>
            </div>
            <div className="rounded-xl bg-foreground/[0.03] px-4 py-3">
              <p className="section-label mb-1">Market value</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-foreground/80">
                {money(metrics?.marketValue)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/[0.05] pt-5">
            <p className="text-xs text-foreground/28">
              Book currency is set on My Portfolio ({displayCurrency}).
            </p>
            <Button onPress={removeHolding} variant="danger">
              <Trash2 size={14} />
              Remove position
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
