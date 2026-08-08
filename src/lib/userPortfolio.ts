/**
 * Personal portfolio holdings persisted in localStorage.
 * Kept intentionally small — slug + shares + optional average cost.
 */

export type UserHolding = {
  slug: string;
  shares: number;
  /** Average cost per share in USD. Optional. */
  avgCost?: number;
};

export type UserPortfolioState = {
  holdings: UserHolding[];
  updatedAt: string;
};

export const USER_PORTFOLIO_STORAGE_KEY = 'investmoat:user-portfolio:v1';

const EMPTY: UserPortfolioState = {
  holdings: [],
  updatedAt: new Date(0).toISOString(),
};

function isFinitePositive(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function normalizeHolding(raw: unknown): UserHolding | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const slug = typeof obj.slug === 'string' ? obj.slug.trim().toLowerCase() : '';
  const shares = typeof obj.shares === 'number' ? obj.shares : Number(obj.shares);
  if (!slug || !isFinitePositive(shares)) return null;

  const holding: UserHolding = { slug, shares };
  const avgCost =
    obj.avgCost === undefined || obj.avgCost === null || obj.avgCost === ''
      ? undefined
      : typeof obj.avgCost === 'number'
        ? obj.avgCost
        : Number(obj.avgCost);
  if (avgCost !== undefined && isFinitePositive(avgCost)) {
    holding.avgCost = avgCost;
  }
  return holding;
}

export function loadUserPortfolio(): UserPortfolioState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(USER_PORTFOLIO_STORAGE_KEY);
    if (!raw) return { ...EMPTY, holdings: [] };

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY, holdings: [] };

    const holdingsRaw = (parsed as { holdings?: unknown }).holdings;
    if (!Array.isArray(holdingsRaw)) return { ...EMPTY, holdings: [] };

    const bySlug = new Map<string, UserHolding>();
    for (const item of holdingsRaw) {
      const holding = normalizeHolding(item);
      if (!holding) continue;
      bySlug.set(holding.slug, holding);
    }

    const updatedAt =
      typeof (parsed as { updatedAt?: unknown }).updatedAt === 'string'
        ? (parsed as { updatedAt: string }).updatedAt
        : new Date().toISOString();

    return { holdings: Array.from(bySlug.values()), updatedAt };
  } catch {
    return { ...EMPTY, holdings: [] };
  }
}

export function saveUserPortfolio(holdings: UserHolding[]): UserPortfolioState {
  const state: UserPortfolioState = {
    holdings,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window === 'undefined') return state;
  try {
    window.localStorage.setItem(USER_PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / private mode — keep in-memory state only.
  }
  return state;
}

export function clearUserPortfolio(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(USER_PORTFOLIO_STORAGE_KEY);
  } catch {
    // ignore
  }
}
