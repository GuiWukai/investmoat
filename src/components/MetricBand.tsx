import type { ReactNode } from 'react';

/**
 * Stripe-style metrics strip: large figures, quiet labels, hairline grid.
 * Used on marketing-adjacent pages (home, sectors, coverage, earnings).
 */
export function MetricBand({
  items,
}: {
  items: { label: string; value: ReactNode; hint?: string }[];
}) {
  const cols =
    items.length >= 6
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
      : items.length === 5
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        : items.length === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className={`grid -mb-px -mr-px ${cols}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1.5 border-b border-r border-border px-5 py-5 sm:px-6 sm:py-6"
          >
            <span className="text-[32px] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[36px]">
              {item.value}
            </span>
            <span className="text-[13px] leading-snug text-foreground/40">{item.label}</span>
            {item.hint ? (
              <span className="text-[11px] leading-snug text-foreground/25">{item.hint}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
