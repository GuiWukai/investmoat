'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
} from '@heroui/react';
import { allCoverageData } from '@/app/stockData';
import {
  loadUserPortfolio,
  saveUserPortfolio,
  type UserHolding,
} from '@/lib/userPortfolio';
import type { PortfolioCurrency } from '@/lib/portfolioCurrency';
import { parsePositiveNumber } from '../holdingField';
import {
  accentForCategory,
  AlertBanner,
  BackToBookLink,
  BookHero,
  TickerBadge,
} from '../portfolioUi';

type CoverageStock = (typeof allCoverageData)[number];
type StockOption = CoverageStock & { id: string };

export default function AddHoldingPage() {
  const router = useRouter();

  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<PortfolioCurrency>('USD');
  const [hydrated, setHydrated] = useState(false);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sharesInput, setSharesInput] = useState('');
  const [avgCostInput, setAvgCostInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const state = loadUserPortfolio();
    setHoldings(state.holdings);
    setDisplayCurrency(state.displayCurrency);
    setHydrated(true);
  }, []);

  const coverageBySlug = useMemo(() => {
    const map = new Map<string, CoverageStock>();
    for (const s of allCoverageData) map.set(s.slug, s);
    return map;
  }, []);

  const heldSlugs = useMemo(() => new Set(holdings.map((h) => h.slug)), [holdings]);

  const selectedStock = selectedSlug ? coverageBySlug.get(selectedSlug) : undefined;

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
      router.push(`/my-portfolio/${slug}`);
      return;
    }

    const next: UserHolding = { slug, shares };
    if (avgCost != null) next.avgCost = avgCost;

    const nextHoldings = [...holdings, next];
    setHoldings(nextHoldings);
    saveUserPortfolio(nextHoldings, displayCurrency);
    router.push('/my-portfolio');
  }

  return (
    <div className="animate-fade-in dot-pattern">
      <BookHero
        back={<BackToBookLink />}
        title="Add a holding."
        dek={
          <>
            Pick a covered name, set shares, and optionally average cost in{' '}
            {hydrated ? displayCurrency : 'your book currency'}. Saved in this browser
            only.
          </>
        }
      />

      <section
        className="relative animate-fade-up stagger-fill-both pb-16"
        style={{ animationDelay: '0.08s' }}
      >
        <Card className="overflow-hidden p-5 md:p-8">
          {selectedStock && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-foreground/[0.025] px-4 py-3">
              <TickerBadge
                color={accentForCategory(selectedStock.category)}
                ticker={selectedStock.ticker}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground/90">
                  {selectedStock.name}
                </p>
                <p className="mt-0.5 text-[11px] text-foreground/35">
                  {selectedStock.category ?? 'Coverage'}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] md:items-end">
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
                        {query.trim()
                          ? 'No stocks found'
                          : 'Type to search by name or ticker…'}
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
              <p className="section-label mb-2">
                Avg cost ({hydrated ? displayCurrency : '…'})
              </p>
              <Input
                aria-label={`Average cost in ${displayCurrency}`}
                inputMode="decimal"
                onChange={(e) => {
                  setAvgCostInput(e.target.value);
                  setFormError(null);
                }}
                placeholder="Optional"
                value={avgCostInput}
              />
            </div>
          </div>

          {formError && <AlertBanner>{formError}</AlertBanner>}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button onPress={addHolding} variant="primary">
              <Plus size={16} />
              Add holding
            </Button>
            <Link href="/my-portfolio" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
