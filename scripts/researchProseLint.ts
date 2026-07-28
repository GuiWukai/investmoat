/**
 * Prose lint for research articles.
 *
 * `validate-research.ts` checks structure — schema, slugs, ticker coverage,
 * group partitioning. It cannot see the editorial rule that actually protects
 * the site's credibility:
 *
 *   An article never hard-codes a score, a moat status, or a price.
 *
 * Every figure on /stocks and /portfolio is computed from a stock JSON by a
 * documented formula. The moment prose says "NOW scores 83" it freezes a
 * number the rest of the site keeps current, and the next earnings review
 * silently turns the sentence into a lie. The `scorecard`, `moat-matrix` and
 * live `stat-strip` blocks exist precisely so an article can show those
 * figures without transcribing them.
 *
 * Three severities, because the three failure modes are not equally avoidable:
 *
 *   error   — a framework output transcribed into text or a static block.
 *             Always avoidable: a live block does this correctly. Fails the build.
 *   warning — a scenario price target written into prose. Avoidable in most
 *             cases by naming the ticker and letting the scorecard carry it.
 *   note     — a moat status named in prose. Often unavoidable: a cross-read
 *             argument has to be able to say "all four pillars strong". These
 *             are not defects, they are the re-verify list for `lastReviewed`.
 *
 * Company-reported metrics (revenue, ACV, cRPO, NRR) are never flagged. They
 * are not framework outputs, and the `table` block's mandatory `asOf` stamp is
 * how those stay honest.
 */
import type { ResearchArticleSchema } from '../src/lib/researchSchema';

export type ProseSeverity = 'error' | 'warning' | 'note';

export interface ProseIssue {
  severity: ProseSeverity;
  /** Where in the article, e.g. `blocks[7] (prose)`. */
  where: string;
  message: string;
  /** The offending sentence or fragment, trimmed for the console. */
  excerpt: string;
}

/** A chunk of author-written text, tagged with its location in the article. */
interface Segment {
  where: string;
  text: string;
  /**
   * True for `table` content. A table carries a mandatory `asOf` stamp, so a
   * static figure there is sanctioned — the price-target warning is skipped.
   * The score rules still apply: a computed score is wrong in a table too.
   */
  dated: boolean;
}

/** Framework outputs, transcribed. Always avoidable — a live block does this. */
const SCORE_PATTERNS: RegExp[] = [
  // "moat score of 90", "composite score is 83", "valuation score at 41"
  /\b(?:composite|moat|growth|valuation)\s+scores?\s+(?:of\s+|is\s+|at\s+|:\s*)?\d{1,3}\b(?!\s*%|\.\d)/i,
  // "scores 83", "scores an 83", "score of 83"
  /\bscores?\s+(?:of\s+|a\s+|an\s+)?\d{1,3}\b(?!\s*%|\.\d)/i,
  // "a composite of 83" — the score word without the word "score"
  /\b(?:composite|moat|growth|valuation)\s+of\s+\d{1,3}\b(?!\s*%|\.\d|\s*(?:bps|basis))/i,
  // "an 83 composite", "a 90 moat"
  /\b(?:a|an)\s+\d{1,3}\s+(?:composite|moat|growth|valuation)\b/i,
  // "83/100"
  /\b\d{1,3}\s*\/\s*100\b/,
];

/** Recommendations are computed from the composite — never written by hand. */
const RECOMMENDATION_PATTERNS: RegExp[] = [
  // Unambiguous two-word labels; safe to match anywhere.
  /\b(?:Strong Buy|Speculative Buy)\b/,
  // "Accumulate" and "Hold" are ordinary English, so require the verb.
  /\brated\s+(?:a\s+|an\s+)?(?:Accumulate|Hold)\b/i,
];

/** Scenario targets live in the stock JSON and move on every review. */
const PRICE_TARGET_PATTERNS: RegExp[] = [
  // "$155 base case", "$310 bull target"
  /\$[\d,]+(?:\.\d+)?\s*(?:bear|base|bull)\b/i,
  // "base case of $155", "bull target sits at $310"
  /\b(?:bear|base|bull)\s+(?:case|target)[^.]{0,40}?\$[\d,]+/i,
  // "price target of $155"
  /\bprice\s+targets?[^.]{0,40}?\$[\d,]+/i,
];

/** The ten moats, as they get written in prose (hyphenated or spaced). */
const PILLAR_WORDS = [
  'pillar',
  'system of record',
  'system-of-record',
  'transaction embedding',
  'transaction-embedding',
  'regulatory lock-in',
  'regulatory lockin',
  'proprietary data',
  'proprietary-data',
  'network effects',
  'network-effects',
  'learned interfaces',
  'business logic',
  'business-logic',
  'public data access',
  'talent scarcity',
  'bundling',
];

const STATUS_WORDS = /\b(strong|intact|weakened|destroyed)\b/i;

/** Fields a `stat-strip` can resolve live — a static value here is a mistake. */
const LIVE_FIELD_WORDS = /\b(composite|moat|growth|valuation|price)\b/i;

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > 140 ? `${flat.slice(0, 137)}…` : flat;
}

/** Pull every author-written string out of an article, tagged with location. */
function collectSegments(article: ResearchArticleSchema): Segment[] {
  const segments: Segment[] = [
    { where: 'dek', text: article.dek, dated: false },
    { where: 'summary', text: article.summary, dated: false },
  ];

  if (article.falsifiableBy) {
    segments.push({ where: 'falsifiableBy', text: article.falsifiableBy, dated: false });
  }

  article.blocks.forEach((block, i) => {
    const at = `blocks[${i}] (${block.type})`;

    switch (block.type) {
      case 'prose':
        segments.push({ where: at, text: block.body, dated: false });
        break;

      case 'heading':
        segments.push({
          where: at,
          text: [block.eyebrow, block.text].filter(Boolean).join(' — '),
          dated: false,
        });
        break;

      case 'callout':
        segments.push({
          where: at,
          text: [block.title, block.body].filter(Boolean).join(' — '),
          dated: false,
        });
        break;

      case 'list':
        block.items.forEach((item, j) => {
          segments.push({ where: `${at}.items[${j}]`, text: item, dated: false });
        });
        break;

      case 'scorecard':
        if (block.caption) {
          segments.push({ where: `${at}.caption`, text: block.caption, dated: false });
        }
        for (const [ticker, note] of Object.entries(block.notes ?? {})) {
          segments.push({ where: `${at}.notes.${ticker}`, text: note, dated: false });
        }
        break;

      case 'moat-matrix':
        if (block.caption) {
          segments.push({ where: `${at}.caption`, text: block.caption, dated: false });
        }
        break;

      case 'stat-strip':
        block.stats.forEach((stat, j) => {
          const parts = [stat.label, stat.value, stat.note].filter(Boolean) as string[];
          segments.push({ where: `${at}.stats[${j}]`, text: parts.join(' — '), dated: false });
        });
        break;

      case 'table':
        if (block.caption) {
          segments.push({ where: `${at}.caption`, text: block.caption, dated: true });
        }
        block.rows.forEach((row, j) => {
          segments.push({ where: `${at}.rows[${j}]`, text: row.join(' — '), dated: true });
        });
        break;
    }
  });

  return segments;
}

/**
 * Structural checks the regexes can't see: a bare number in a place that
 * should have been a live lookup. `{ label: "Composite", value: "83" }`
 * contains no incriminating words at all, but it is the exact mistake the
 * live blocks exist to prevent.
 */
function structuralIssues(article: ResearchArticleSchema): ProseIssue[] {
  const issues: ProseIssue[] = [];

  article.blocks.forEach((block, i) => {
    const at = `blocks[${i}] (${block.type})`;

    if (block.type === 'stat-strip') {
      block.stats.forEach((stat, j) => {
        if (!stat.value) return;
        if (!LIVE_FIELD_WORDS.test(stat.label)) return;
        if (!/^\$?[\d,]+(\.\d+)?$/.test(stat.value.trim())) return;
        issues.push({
          severity: 'error',
          where: `${at}.stats[${j}]`,
          message:
            `static value "${stat.value}" under a "${stat.label}" label — ` +
            'use `live: { ticker, field }` so it recomputes from the stock JSON',
          excerpt: `${stat.label}: ${stat.value}`,
        });
      });
    }

    if (block.type === 'table') {
      block.rows.forEach((row, j) => {
        const label = row[0] ?? '';
        if (!/\b(composite|moat|growth|valuation)\s*(score)?\b/i.test(label)) return;
        const numeric = row.slice(1).find((cell) => /^\d{1,3}$/.test(cell.trim()));
        if (!numeric) return;
        issues.push({
          severity: 'error',
          where: `${at}.rows[${j}]`,
          message:
            `"${label}" row carries a bare score ("${numeric}") — ` +
            'framework scores belong in a `scorecard`, which resolves them live',
          excerpt: excerpt(row.join(' — ')),
        });
      });
    }
  });

  return issues;
}

/** Run every prose rule over one article. */
export function lintArticleProse(article: ResearchArticleSchema): ProseIssue[] {
  const issues: ProseIssue[] = [...structuralIssues(article)];

  for (const segment of collectSegments(article)) {
    for (const sentence of sentences(segment.text)) {
      if (SCORE_PATTERNS.some((re) => re.test(sentence))) {
        issues.push({
          severity: 'error',
          where: segment.where,
          message:
            'reads like a transcribed framework score — carry the ticker and let a ' +
            '`scorecard` or live `stat-strip` render the number',
          excerpt: excerpt(sentence),
        });
        continue;
      }

      if (RECOMMENDATION_PATTERNS.some((re) => re.test(sentence))) {
        issues.push({
          severity: 'error',
          where: segment.where,
          message:
            'names a recommendation label — it is computed from the composite, so a ' +
            '`scorecard` must render it rather than prose asserting it',
          excerpt: excerpt(sentence),
        });
        continue;
      }

      if (!segment.dated && PRICE_TARGET_PATTERNS.some((re) => re.test(sentence))) {
        issues.push({
          severity: 'warning',
          where: segment.where,
          message:
            'hard-codes a scenario price target — it moves on the next review of that ' +
            "stock, and this sentence won't. Prefer naming the ticker",
          excerpt: excerpt(sentence),
        });
        continue;
      }

      const lower = sentence.toLowerCase();
      if (STATUS_WORDS.test(sentence) && PILLAR_WORDS.some((w) => lower.includes(w))) {
        issues.push({
          severity: 'note',
          where: segment.where,
          message: 'names a moat status in prose — re-verify against the stock JSON',
          excerpt: excerpt(sentence),
        });
      }
    }
  }

  return issues;
}
