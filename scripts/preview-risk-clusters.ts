/**
 * Shows what the two concentration controls actually do to the current book.
 *
 * Both mechanisms are invisible in normal use — one damps a number, the other
 * moves a percentage point or two between rows — so this prints their workings:
 *
 *   exposure    risk-factor exposure with and without the factor cap
 *   weights     per-holding weights the cap moved, and by how much
 *   freshness   review age → valuation credibility across the book
 *
 * Run: npm run preview:clusters -- [screen]
 *      npm run preview:clusters                       # all screens
 *      npm run preview:clusters -- freshness
 *      npm run preview:clusters -- exposure --prices prices.json
 *
 * Live prices are not available offline, so the valuation pillar defaults to
 * each stock's authored score — which makes the freshness damping the identity,
 * since divergence is what it acts on. Pass `--prices <file>` with a
 * `{"TICKER": price}` object to see it bite.
 */
import { allCoverageData, getAverageScore } from '../src/app/stockData';
import { computeLiveComposite } from '../src/lib/valuationScore';
import {
  computePortfolioWeights,
  MAX_FACTOR_PCT,
  MAX_WEIGHT_PCT,
} from '../src/lib/portfolioWeights';
import { riskFactorLabel } from '../src/lib/riskFactors';
import {
  reviewAgeDays,
  valuationCredibility,
  REVIEW_OVERDUE_DAYS,
  FULL_CREDIBILITY_DAYS,
} from '../src/lib/reviewFreshness';
import { readFileSync } from 'node:fs';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GOLD = '\x1b[33m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

const PORTFOLIO_THRESHOLD = 80;
const MAX_PORTFOLIO = 25;

const args = process.argv.slice(2);
const screen = args.find(a => !a.startsWith('--')) ?? 'all';
const pricesFlag = args.indexOf('--prices');

const prices: Record<string, number> = pricesFlag >= 0 && args[pricesFlag + 1]
  ? JSON.parse(readFileSync(args[pricesFlag + 1], 'utf-8'))
  : {};

const asOf = new Date();

const ranked = allCoverageData
  .map(s => {
    const live = computeLiveComposite({
      moat: s.scores[0],
      growth: s.scores[1],
      authoredValuation: s.scores[2],
      price: prices[s.ticker] ?? null,
      bearTarget: s.bearTarget,
      baseTarget: s.baseTarget,
      bullTarget: s.bullTarget,
      lastAnalyzed: s.lastAnalyzed,
      asOf,
    });
    return { s, ...live, authoredComposite: getAverageScore(s.scores) };
  })
  .sort((a, b) => b.composite - a.composite);

const portfolio = ranked
  .filter(r => r.composite >= PORTFOLIO_THRESHOLD)
  .slice(0, MAX_PORTFOLIO);

const result = computePortfolioWeights(
  portfolio.map(r => ({
    ticker: r.s.ticker,
    score: Math.round(r.composite),
    riskFactors: r.s.riskFactors,
  })),
);

function exposureScreen(): void {
  console.log(`\n${BOLD}Risk-factor exposure${RESET} ${DIM}(${portfolio.length} holdings, cap ${MAX_FACTOR_PCT}%)${RESET}\n`);
  console.log(`${DIM}FACTOR                        UNCAPPED    CAPPED   N  HOLDINGS${RESET}`);

  for (const e of result.exposures) {
    const bound = e.capped ? `${GOLD}▼${RESET}` : ' ';
    const flag = e.unsatisfiable ? ` ${RED}UNSATISFIABLE${RESET}` : '';
    console.log(
      `${bound} ${riskFactorLabel(e.factor).padEnd(27)}` +
      `${String(e.uncappedPct).padStart(6)}%` +
      `${String(e.pct).padStart(9)}%` +
      `${String(e.tickers.length).padStart(4)}  ` +
      `${DIM}${e.tickers.join(' ')}${RESET}${flag}`,
    );
  }

  const unlabelled = portfolio.filter(r => r.s.riskFactors.length === 0);
  if (unlabelled.length) {
    console.log(
      `\n${DIM}No shared factor (${unlabelled.length}): ${unlabelled.map(r => r.s.ticker).join(' ')}${RESET}`,
    );
  }
}

function weightsScreen(): void {
  console.log(`\n${BOLD}Weights${RESET} ${DIM}(per-name cap ${MAX_WEIGHT_PCT}%, per-factor cap ${MAX_FACTOR_PCT}%)${RESET}\n`);
  console.log(`${DIM}TICKER  SCORE  UNCAPPED  CAPPED   Δ   FACTORS${RESET}`);

  let moved = 0;
  for (const r of portfolio) {
    const t = r.s.ticker;
    const before = result.uncappedWeights[t] ?? 0;
    const after = result.weights[t] ?? 0;
    const delta = after - before;
    if (delta !== 0) moved++;
    const colour = delta > 0 ? GREEN : delta < 0 ? GOLD : DIM;
    console.log(
      `${t.padEnd(7)}${String(Math.round(r.composite)).padStart(5)}` +
      `${String(before).padStart(9)}%${String(after).padStart(7)}%` +
      `${colour}${(delta > 0 ? `+${delta}` : String(delta)).padStart(5)}${RESET}   ` +
      `${DIM}${r.s.riskFactors.join(', ') || '—'}${RESET}`,
    );
  }
  console.log(`\n${DIM}${moved} of ${portfolio.length} holdings re-weighted by the factor cap.${RESET}`);
}

function freshnessScreen(): void {
  console.log(`\n${BOLD}Review freshness${RESET} ${DIM}(full credit ≤${FULL_CREDIBILITY_DAYS}d, overdue ≥${REVIEW_OVERDUE_DAYS}d)${RESET}\n`);
  console.log(`${DIM}TICKER  REVIEWED            AGE   CRED   AUTHORED  LIVE  DAMPED  COMPOSITE${RESET}`);

  // Largest corrections first, then oldest — the damped names are the point,
  // and an age table alone hides them among the many names that did not move.
  const rows = ranked
    .map(r => ({ r, age: reviewAgeDays(r.s.lastAnalyzed, asOf) }))
    .sort((a, b) => {
      const byDamping = Math.abs(b.r.freshness?.damped ?? 0) - Math.abs(a.r.freshness?.damped ?? 0);
      return byDamping !== 0 ? byDamping : (b.age ?? Infinity) - (a.age ?? Infinity);
    });

  for (const { r, age } of rows.slice(0, 30)) {
    const cred = valuationCredibility(age);
    const f = r.freshness;
    const overdue = age != null && age >= REVIEW_OVERDUE_DAYS;
    console.log(
      `${r.s.ticker.padEnd(7)}${(r.s.lastAnalyzed ?? '—').padEnd(20)}` +
      `${(age == null ? '—' : `${age}d`).padStart(5)}` +
      `${overdue ? GOLD : ''}${cred.toFixed(2).padStart(7)}${RESET}` +
      `${String(r.s.scores[2]).padStart(11)}` +
      `${(f ? String(f.liveScore) : '—').padStart(6)}` +
      `${(f ? f.score.toFixed(1) : '—').padStart(8)}` +
      `${r.composite.toFixed(1).padStart(11)}`,
    );
  }

  const overdue = rows.filter(({ age }) => age != null && age >= REVIEW_OVERDUE_DAYS);
  console.log(
    `\n${DIM}${overdue.length} of ${rows.length} reviews at or past ${REVIEW_OVERDUE_DAYS} days — ` +
    `damping is at its floor for these and validate-stocks asks for a re-read.${RESET}`,
  );
  if (Object.keys(prices).length === 0) {
    console.log(`${DIM}No --prices file: live == authored, so damping is the identity here by construction.${RESET}`);
  }
}

if (screen === 'all' || screen === 'exposure') exposureScreen();
if (screen === 'all' || screen === 'weights') weightsScreen();
if (screen === 'all' || screen === 'freshness') freshnessScreen();
console.log('');
