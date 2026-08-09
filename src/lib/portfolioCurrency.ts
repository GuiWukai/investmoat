/**
 * Portfolio book currency helpers — My Portfolio can total in USD or CAD.
 * Quotes keep their listing denomination; average costs are stored in book currency.
 * Values convert via USDCAD.
 */

export type PortfolioCurrency = 'USD' | 'CAD';

export const PORTFOLIO_CURRENCIES: readonly PortfolioCurrency[] = ['USD', 'CAD'];

export function isPortfolioCurrency(value: unknown): value is PortfolioCurrency {
  return value === 'USD' || value === 'CAD';
}

/** Round to cents for persisted average costs after an FX conversion. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Convert an amount from a quote currency into the portfolio display currency.
 * Returns null when the pair is unsupported or the FX rate is missing.
 */
export function convertToDisplay(
  amount: number,
  fromCurrency: string | null | undefined,
  display: PortfolioCurrency,
  usdCad: number | null
): number | null {
  if (!Number.isFinite(amount)) return null;

  const from = (fromCurrency ?? 'USD').toUpperCase();
  if (from === display) return amount;

  // Yahoo sometimes quotes sterling as GBp (pence). We don't FX those yet.
  if (from !== 'USD' && from !== 'CAD') return null;
  if (usdCad == null || !Number.isFinite(usdCad) || usdCad <= 0) return null;

  if (from === 'USD' && display === 'CAD') return amount * usdCad;
  if (from === 'CAD' && display === 'USD') return amount / usdCad;
  return null;
}

/** Convert a book-currency amount when the user flips USD ↔ CAD. */
export function convertBetweenPortfolioCurrencies(
  amount: number,
  from: PortfolioCurrency,
  to: PortfolioCurrency,
  usdCad: number
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'CAD') return amount * usdCad;
  return amount / usdCad;
}

export function formatMoney(
  value: number | null | undefined,
  currency: PortfolioCurrency
): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString(currency === 'CAD' ? 'en-CA' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
