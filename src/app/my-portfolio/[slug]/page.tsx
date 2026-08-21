'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { Card, Spinner } from '@heroui/react';
import { allCoverageData } from '@/app/stockData';
import { IM25_TICKERS } from '@/lib/sectors';
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
import { HoldingNumberField } from '../holdingField';
import {
  accentForCategory,
  BackToBookLink,
  BookHero,
  compositeForStock,
  DeltaBadge,
  formatPct,
  formatShares,
  ScorePill,
  SignedMoney,
  StatCell,
  StatStrip,
  TickerBadge,
} from '../portfolioUi';

type Quote = {
  price: number | null;
  changePercent: number | null;
  currency: string | null;
};

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
  const accent = accentForCategory(stock?.category);
  const inIm25 = IM25_TICKERS.has(ticker);

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
        <BackToBookLink />
        <Card className="p-6 md:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">
            Position not found
          </h1>
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
        <BackToBookLink />
        <Card className="overflow-hidden p-6 md:p-10">
          <div className="mb-4 flex items-center gap-3">
            <TickerBadge color={accent} ticker={ticker} />
            <p className="section-label mb-0">{ticker}</p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">{name}</h1>
          <p className="mt-2 text-sm text-foreground/45">
            This name is not in your portfolio yet. Add it from My Portfolio.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/my-portfolio/add" className="btn-primary">
              Add holding
            </Link>
            <Link href={analysisHref} className="btn-secondary">
              View analysis <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const quoteNote =
    metrics?.quoteCurrency &&
    metrics.quoteCurrency.toUpperCase() !== displayCurrency
      ? metrics.quoteCurrency.toUpperCase()
      : null;

  return (
    <div className="animate-fade-in dot-pattern pb-16">
      <BookHero
        back={<BackToBookLink />}
        eyebrow={`Position · ${displayCurrency}`}
        title={name}
        dek={
          <>
            {ticker}
            {inIm25 ? ' · IM25' : ''}
            {quoteNote ? ` · quoted ${quoteNote}` : ''}
            {stock.category ? ` · ${stock.category}` : ''}
          </>
        }
        actions={
          <>
            <Link href={analysisHref} className="btn-secondary w-full sm:w-auto">
              Analysis <ArrowUpRight size={16} />
            </Link>
          </>
        }
      />

      <section
        className="relative animate-fade-up stagger-fill-both mb-8"
        style={{ animationDelay: '0.08s' }}
      >
        <Card className="overflow-hidden p-4 sm:p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <TickerBadge color={accent} ticker={ticker} />
            {metrics?.score != null && <ScorePill value={metrics.score} />}
          </div>
          <p className="section-label mb-0 mt-4">Market value</p>
          <div className="mt-3">
            {quoteLoading && metrics?.marketValue == null ? (
              <Spinner size="sm" color="current" />
            ) : (
              <p className="text-[1.85rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[40px]">
                {money(metrics?.marketValue)}
              </p>
            )}
            <div className="mt-2.5">
              <DeltaBadge loading={quoteLoading} value={metrics?.changePercent} />
            </div>
            <p className="mt-2.5 text-[12px] text-foreground/35 sm:text-[13px]">
              {quoteLoading && metrics?.price == null ? '…' : money(metrics?.price)} / sh
              {' · '}
              {formatShares(holding.shares)} shares
            </p>
          </div>

          <StatStrip>
            <StatCell label="Cost basis" shortLabel="Cost">
              <p className="text-[15px] font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
                {money(metrics?.costBasis)}
              </p>
            </StatCell>
            <StatCell label="Unrealized P&amp;L" shortLabel="P&amp;L">
              {metrics?.gain == null ? (
                <p className="text-[15px] font-semibold text-foreground/20 sm:text-xl">—</p>
              ) : (
                <div>
                  <p>
                    <SignedMoney formatted={money(metrics.gain)} size="lg" value={metrics.gain} />
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-foreground/40">
                    {formatPct(metrics.gainPct)}
                  </p>
                </div>
              )}
            </StatCell>
            <StatCell label="Today">
              {quoteLoading ? (
                <Spinner size="sm" color="current" />
              ) : metrics?.changePercent == null ? (
                <p className="text-[15px] font-semibold text-foreground/20 sm:text-xl">—</p>
              ) : (
                <p
                  className={`text-[15px] font-semibold tabular-nums tracking-tight sm:text-xl ${
                    metrics.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPct(metrics.changePercent)}
                </p>
              )}
            </StatCell>
          </StatStrip>
        </Card>
      </section>

      <section
        className="relative animate-fade-up stagger-fill-both"
        style={{ animationDelay: '0.16s' }}
      >
        <Card className="p-5 md:p-8">
          <div className="mb-6">
            <p className="section-label mb-1">Edit position</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground/90">
              Shares &amp; cost
            </h2>
            <p className="mt-2 text-sm text-foreground/42">
              Changes save in this browser when you leave a field.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-[12px] text-foreground/28">
              Book currency is set on My Portfolio ({displayCurrency}).
            </p>
            <button
              type="button"
              onClick={removeHolding}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium text-rose-400/75 transition-colors hover:text-rose-300 sm:min-h-0 sm:justify-start"
            >
              <Trash2 size={14} />
              Remove position
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}
