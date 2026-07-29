/**
 * Screens the coverage universe for article ideas.
 *
 * Research articles rot toward being earnings reactions: a company prints, the
 * market moves, someone writes the piece. That pipeline is bounded by whoever
 * happened to report this week, and it systematically ignores the site's actual
 * edge — 100+ names scored by one framework, where the interesting arguments
 * live in the *comparisons* nobody had a news hook to make.
 *
 * This script asks the data where those comparisons are. Each screen answers a
 * different shape of question:
 *
 *   pillars     which names share a moat pillar status — the natural cohorts
 *   divergence  where durability and the composite disagree — mispricing candidates
 *   category    which categories the framework refuses to sort uniformly
 *   uncovered   high-scoring names no article has ever touched
 *   stale       what is fresh enough to argue from, and what needs a re-read first
 *
 * Run: npm run screen:research -- [screen] [arg]
 *      npm run screen:research                  # every screen, briefly
 *      npm run screen:research -- pillars systemOfRecord
 *      npm run screen:research -- divergence 15
 *
 * Nothing here decides anything. A screen produces candidates; the article test
 * in the `write-research` skill (cross-cutting, contested, falsifiable) decides
 * whether a candidate is a piece.
 */
import { allCoverageData, getAverageScore } from '../src/app/stockData';
import { getStockData } from '../src/data/stocks';
import { getAllResearchArticles } from '../src/data/research';
import type { TenMoatKey } from '../src/types/research';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GOLD = '\x1b[33m';
const RESET = '\x1b[0m';

const MOAT_KEYS: TenMoatKey[] = [
  'learnedInterfaces',
  'businessLogic',
  'publicDataAccess',
  'talentScarcity',
  'bundling',
  'proprietaryData',
  'regulatoryLockIn',
  'networkEffects',
  'transactionEmbedding',
  'systemOfRecord',
];

interface Name {
  ticker: string;
  name: string;
  slug: string;
  category: string;
  moat: number;
  growth: number;
  valuation: number;
  composite: number;
  lastAnalyzed?: string;
  moats: Partial<Record<TenMoatKey, string>>;
}

const universe: Name[] = allCoverageData.map((s) => {
  const data = getStockData(s.slug);
  const moats: Partial<Record<TenMoatKey, string>> = {};
  for (const key of MOAT_KEYS) {
    const status = data?.tenMoats?.[key]?.status;
    if (status) moats[key] = status;
  }
  return {
    ticker: s.ticker,
    name: s.name,
    slug: s.slug,
    category: s.category,
    moat: s.scores[0],
    growth: s.scores[1],
    valuation: s.scores[2],
    composite: Math.round(getAverageScore(s.scores)),
    lastAnalyzed: data?.lastAnalyzed,
    moats,
  };
});

function heading(text: string, subtitle?: string): void {
  console.log(`\n${BOLD}${text}${RESET}${subtitle ? ` ${DIM}— ${subtitle}${RESET}` : ''}`);
}

function tickerList(names: Name[]): string {
  return names.map((n) => `${n.ticker}(${n.composite})`).join(' ');
}

/**
 * Cohorts that share a pillar status. A cohort is only interesting when it
 * crosses categories — four software names with a strong system of record is a
 * sector note; software, an exchange and a payments network sharing it is an
 * argument about what the pillar actually means.
 */
function screenPillars(only?: string): void {
  const keys = only ? MOAT_KEYS.filter((k) => k.toLowerCase() === only.toLowerCase()) : MOAT_KEYS;
  if (keys.length === 0) {
    console.error(`Unknown pillar "${only}". One of: ${MOAT_KEYS.join(', ')}`);
    process.exit(1);
  }

  for (const key of keys) {
    const rated = universe.filter((n) => n.moats[key]);
    if (rated.length === 0) continue;

    const strong = rated.filter((n) => n.moats[key] === 'strong');
    const weakened = rated.filter((n) => n.moats[key] === 'weakened');
    const destroyed = rated.filter((n) => n.moats[key] === 'destroyed');
    const categories = new Set(strong.map((n) => n.category));

    heading(
      `${key}`,
      `${strong.length} strong across ${categories.size} categor${categories.size === 1 ? 'y' : 'ies'}`,
    );
    if (strong.length) console.log(`  ${GOLD}strong${RESET}    ${tickerList(strong)}`);
    if (weakened.length) console.log(`  ${DIM}weakened${RESET}  ${tickerList(weakened)}`);
    if (destroyed.length) console.log(`  ${DIM}destroyed${RESET} ${tickerList(destroyed)}`);
    if (categories.size >= 3 && strong.length >= 4) {
      console.log(
        `  ${DIM}↳ cross-category cohort — the pillar sorts names the sector labels don't${RESET}`,
      );
    }
  }
}

/**
 * Names where the moat rank and the composite rank disagree most.
 *
 * A durable business the composite ranks low is a valuation or growth argument
 * waiting to be made ("the market is paying for durability it already has");
 * the reverse is a quality warning inside a name the screen likes. Both are
 * contested by construction, which is what an article needs.
 */
function screenDivergence(limitArg?: string): void {
  const limit = Number(limitArg ?? 12);
  const byMoat = [...universe].sort((a, b) => b.moat - a.moat);
  const byComposite = [...universe].sort((a, b) => b.composite - a.composite);
  const moatRank = new Map(byMoat.map((n, i) => [n.ticker, i + 1]));
  const compositeRank = new Map(byComposite.map((n, i) => [n.ticker, i + 1]));

  const spread = universe
    .map((n) => ({
      ...n,
      moatRank: moatRank.get(n.ticker)!,
      compositeRank: compositeRank.get(n.ticker)!,
      gap: (compositeRank.get(n.ticker) ?? 0) - (moatRank.get(n.ticker) ?? 0),
    }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, limit);

  heading('Moat rank vs. composite rank', `widest ${limit} disagreements in the universe`);
  for (const n of spread) {
    const direction = n.gap > 0 ? 'durable, ranked down' : 'ranked up, thinner moat';
    console.log(
      `  ${n.ticker.padEnd(6)} ${DIM}moat #${String(n.moatRank).padStart(3)} → composite #${String(
        n.compositeRank,
      ).padStart(3)}${RESET}  ${n.gap > 0 ? '+' : ''}${n.gap}  ${DIM}${direction} · ${n.category}${RESET}`,
    );
  }
}

/**
 * Categories the framework refuses to sort uniformly. A wide internal spread
 * means the label is doing less work than the market thinks it is — which is
 * the ServiceNow piece's move, generalised.
 */
function screenCategory(): void {
  const groups = new Map<string, Name[]>();
  for (const n of universe) {
    groups.set(n.category, [...(groups.get(n.category) ?? []), n]);
  }

  const rows = [...groups.entries()]
    .filter(([, names]) => names.length >= 3)
    .map(([category, names]) => {
      const sorted = [...names].sort((a, b) => b.composite - a.composite);
      return {
        category,
        count: names.length,
        spread: sorted[0].composite - sorted[sorted.length - 1].composite,
        best: sorted[0],
        worst: sorted[sorted.length - 1],
      };
    })
    .sort((a, b) => b.spread - a.spread);

  heading('Internal spread by category', 'where one label covers very different businesses');
  for (const r of rows) {
    console.log(
      `  ${r.category.padEnd(18)} ${DIM}n=${String(r.count).padStart(2)}${RESET}  spread ${String(
        r.spread,
      ).padStart(2)}  ${GOLD}${r.best.ticker}(${r.best.composite})${RESET} ${DIM}…${RESET} ${
        r.worst.ticker
      }(${r.worst.composite})`,
    );
  }
}

/** Strong names no article has argued about yet. */
function screenUncovered(limitArg?: string): void {
  const limit = Number(limitArg ?? 20);
  const written = new Set(
    getAllResearchArticles().flatMap((a) => a.tickers.map((t) => t.toUpperCase())),
  );

  const gap = universe
    .filter((n) => !written.has(n.ticker.toUpperCase()))
    .sort((a, b) => b.composite - a.composite)
    .slice(0, limit);

  heading(
    'Never cited by an article',
    `${written.size} of ${universe.length} names covered by research so far`,
  );
  for (const n of gap) {
    console.log(
      `  ${n.ticker.padEnd(6)} ${String(n.composite).padStart(3)}  ${DIM}${n.category.padEnd(
        16,
      )} ${n.name}${RESET}`,
    );
  }
}

/**
 * Analysis age. An article argues from stock JSONs; arguing from one nobody has
 * re-read since two earnings ago is how a piece ships already stale.
 */
function screenStale(limitArg?: string): void {
  const limit = Number(limitArg ?? 15);
  const MONTHS: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };

  const parse = (value?: string): number => {
    const match = value?.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
    if (!match) return 0;
    const month = MONTHS[match[1].toLowerCase()];
    if (month === undefined) return 0;
    return Date.UTC(Number(match[3]), month, Number(match[2]));
  };

  const dated = universe
    .map((n) => ({ ...n, at: parse(n.lastAnalyzed) }))
    .sort((a, b) => a.at - b.at)
    .slice(0, limit);

  heading('Oldest analyses in the universe', 're-run /update-stock before building on these');
  for (const n of dated) {
    // A month-precision `lastAnalyzed` doesn't parse, and sorts first on
    // purpose: an analysis that won't say which day it was written is exactly
    // as trustworthy as an old one.
    const stamp = n.at === 0 ? `${n.lastAnalyzed ?? 'undated'} (no day)` : n.lastAnalyzed!;
    console.log(
      `  ${n.ticker.padEnd(6)} ${DIM}${stamp.padEnd(22)}${RESET} ${String(n.composite).padStart(
        3,
      )}  ${DIM}${n.name}${RESET}`,
    );
  }
}

const [screen, arg] = process.argv.slice(2);

switch (screen) {
  case 'pillars':
    screenPillars(arg);
    break;
  case 'divergence':
    screenDivergence(arg);
    break;
  case 'category':
    screenCategory();
    break;
  case 'uncovered':
    screenUncovered(arg);
    break;
  case 'stale':
    screenStale(arg);
    break;
  case undefined:
    screenCategory();
    screenDivergence('8');
    screenUncovered('10');
    console.log(
      `\n${DIM}Also: npm run screen:research -- pillars [${MOAT_KEYS[9]}] · stale${RESET}\n`,
    );
    break;
  default:
    console.error(
      `Unknown screen "${screen}". One of: pillars, divergence, category, uncovered, stale`,
    );
    process.exit(1);
}
