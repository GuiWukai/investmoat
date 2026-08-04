/**
 * Placing one asset's scores inside its peer group.
 *
 * The scores themselves are calibrated against all of coverage, which answers
 * "is this good?" and not "is this the better chipmaker?". Everything here is
 * about the second question: rank within the group, distance from the group's
 * median, and the moat pillars where the asset and its peers actually disagree.
 *
 * No new scoring happens here. Every number is the one the peer's own page
 * shows, read through @/lib/coverageScores — this module only sorts, ranks and
 * subtracts.
 */
import { getPeerGroup, type PeerGroup } from '@/data/peerGroups';
import { getStockData } from '@/data/stocks';
import { coverageByTicker, resolveScores, type ResolvedScores } from '@/lib/coverageScores';
import { moatPillarsFor } from '@/lib/moatPillars';
import { isMoatNotApplicable } from '@/lib/valuationScore';
import type { MoatStatus } from '@/types/stockAnalysis';

export type StandingKey = 'composite' | 'moat' | 'growth' | 'valuation';

export interface PeerStanding {
  key: StandingKey;
  label: string;
  /** The subject's score on this pillar. */
  value: number;
  /** Every group member's score, ascending — the distribution the bar draws. */
  values: number[];
  median: number;
  min: number;
  max: number;
  /** 1 = best in group. Ties share the better rank. */
  rank: number;
  /** Another member scores exactly the same, so the rank is shared. */
  tied: boolean;
  count: number;
}

export interface PeerMoatGap {
  key: string;
  label: string;
  /** The subject's status on this pillar. */
  status: MoatStatus;
  /** The middle status among peers assessed on it. */
  peerTypical: MoatStatus;
  direction: 'stronger' | 'weaker';
  peersBelow: number;
  peersAbove: number;
}

export interface PeerComparisonModel {
  group: PeerGroup;
  subject: ResolvedScores;
  /** The whole group including the subject, best composite first. */
  rows: ResolvedScores[];
  standings: PeerStanding[];
  /** Pillars where the subject parts company with its peers, widest gap first. */
  moatGaps: PeerMoatGap[];
  /** True when at least one member's valuation was recomputed from a live price. */
  hasLivePrices: boolean;
}

const STANDING_LABELS: Record<StandingKey, string> = {
  composite: 'Composite',
  moat: 'Moat',
  growth: 'Growth',
  valuation: 'Valuation',
};

const STATUS_ORDER: Record<MoatStatus, number> = {
  destroyed: 0,
  weakened: 1,
  intact: 2,
  strong: 3,
};

const STATUS_BY_ORDER: MoatStatus[] = ['destroyed', 'weakened', 'intact', 'strong'];

function median(sortedAscending: number[]): number {
  const n = sortedAscending.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sortedAscending[mid] : (sortedAscending[mid - 1] + sortedAscending[mid]) / 2;
}

function standingFor(key: StandingKey, rows: ResolvedScores[], subject: ResolvedScores): PeerStanding {
  const values = rows.map((r) => r[key]).sort((a, b) => a - b);
  return {
    key,
    label: STANDING_LABELS[key],
    value: subject[key],
    values,
    median: median(values),
    min: values[0],
    max: values[values.length - 1],
    rank: 1 + rows.filter((r) => r[key] > subject[key]).length,
    tied: rows.filter((r) => r[key] === subject[key]).length > 1,
    count: rows.length,
  };
}

/**
 * Moat pillars where the subject's status differs from its peers'.
 *
 * Only pillars both sides are actually assessed on count: an N/A moat never
 * applied to that business, so treating it as a zero would manufacture a gap
 * out of a category difference (see isMoatNotApplicable). A pillar is reported
 * only when the peers lean one way — an even split says the group disagrees
 * with itself, which tells the reader nothing about the subject.
 */
function moatGapsFor(subjectTicker: string, group: PeerGroup): PeerMoatGap[] {
  // A ticker in a group but no longer in coverage degrades to "no data" here
  // rather than throwing mid-render; validate:stocks fails the build on it.
  const dataFor = (ticker: string) => {
    const slug = coverageByTicker[ticker]?.slug;
    return slug ? getStockData(slug) : null;
  };

  const subjectData = dataFor(subjectTicker);
  if (!subjectData) return [];

  const peerData = group.tickers
    .filter((t) => t !== subjectTicker)
    .map(dataFor)
    .filter((d): d is NonNullable<typeof d> => d !== null);

  const gaps: PeerMoatGap[] = [];

  for (const pillar of moatPillarsFor(subjectData)) {
    if (isMoatNotApplicable(pillar)) continue;
    const mine = STATUS_ORDER[pillar.status];

    const peerRanks = peerData
      .map((d) => moatPillarsFor(d).find((p) => p.key === pillar.key))
      .filter((p): p is NonNullable<typeof p> => Boolean(p) && !isMoatNotApplicable(p!))
      .map((p) => STATUS_ORDER[p.status])
      .sort((a, b) => a - b);

    if (peerRanks.length === 0) continue;

    const peersBelow = peerRanks.filter((r) => r < mine).length;
    const peersAbove = peerRanks.filter((r) => r > mine).length;
    if (peersBelow === peersAbove) continue;

    gaps.push({
      key: pillar.key,
      label: pillar.label,
      status: pillar.status,
      // Halves round down, so an even split of peers is described by the weaker
      // of the two middle statuses rather than flattered upward.
      peerTypical: STATUS_BY_ORDER[Math.floor(median(peerRanks))],
      direction: peersBelow > peersAbove ? 'stronger' : 'weaker',
      peersBelow,
      peersAbove,
    });
  }

  return gaps.sort((a, b) => Math.abs(b.peersBelow - b.peersAbove) - Math.abs(a.peersBelow - a.peersAbove));
}

/**
 * Build the industry comparison for one ticker, or null when it has no peer
 * group — the stock page hides the section in that case rather than showing an
 * empty one.
 *
 * `subjectValuation` lets the caller pin the subject's valuation pillar to the
 * figure already on screen (the page's own live gauge), so the row for the
 * company the page is about cannot disagree with the gauge above it.
 */
export function buildPeerComparison(
  ticker: string,
  prices: Record<string, number | null>,
  subjectValuation?: number | null,
): PeerComparisonModel | null {
  const group = getPeerGroup(ticker);
  if (!group) return null;

  const rows = group.tickers
    .map((t) =>
      resolveScores(t, prices[t] ?? null, t === ticker ? subjectValuation : undefined),
    )
    .filter((r): r is ResolvedScores => r !== null);

  const subject = rows.find((r) => r.ticker === ticker);
  if (!subject || rows.length < 2) return null;

  const sorted = [...rows].sort((a, b) => b.composite - a.composite);
  const keys: StandingKey[] = ['composite', 'moat', 'growth', 'valuation'];

  return {
    group,
    subject,
    rows: sorted,
    standings: keys.map((key) => standingFor(key, rows, subject)),
    moatGaps: moatGapsFor(ticker, group),
    hasLivePrices: rows.some((r) => r.price != null),
  };
}

/**
 * How many peers have to fall on one side of a pillar before the difference is
 * worth printing. One peer disagreeing is a coin-flip; two is the smallest
 * majority the narrowest group in the taxonomy can produce.
 */
const NOTABLE_GAP_MARGIN = 2;

/**
 * The moat gaps worth showing a reader, split by direction and capped so the
 * section stays a summary. A company that differs from its peers on eight
 * pillars is not telling you about eight things — it is telling you the group
 * is loose.
 */
export function notableMoatGaps(
  gaps: PeerMoatGap[],
  limitPerDirection = 3,
): { stronger: PeerMoatGap[]; weaker: PeerMoatGap[] } {
  const notable = gaps.filter((g) => Math.abs(g.peersBelow - g.peersAbove) >= NOTABLE_GAP_MARGIN);
  return {
    stronger: notable.filter((g) => g.direction === 'stronger').slice(0, limitPerDirection),
    weaker: notable.filter((g) => g.direction === 'weaker').slice(0, limitPerDirection),
  };
}

/** "1st of 6", or "joint 1st of 6" when somebody else scores the same. */
export function rankLabel(standing: PeerStanding): string {
  return `${standing.tied ? 'joint ' : ''}${ordinal(standing.rank)} of ${standing.count}`;
}

/** "1st", "2nd", "3rd", "4th" … for the rank line. */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
