/**
 * Prototype: bottleneck-aware composite.
 *
 *   currentComposite = m·0.40 + g·0.35 + v·0.25
 *   newComposite     = currentComposite − max(0, 50 − min(m,g,v)) × 0.6
 *
 * Shows recommendation-tier movement for every stock under the live
 * thresholds: ≥85 Strong Buy / ≥75 Accumulate / ≥65 Hold / else Speculative
 * Buy. No files modified.
 *
 *   npx tsx scripts/preview-bottleneck-composite.ts
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeMoatScore,
  computeGrowthScore,
  computeValuationScore,
  type GrowthAnalysisInput,
} from '../src/lib/valuationScore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STOCKS = join(__dirname, '..', 'src', 'data', 'stocks');

function parsePrice(s: string): number {
  const m = s.match(/[\d,.]+/);
  return m ? parseFloat(m[0].replace(/,/g, '')) : NaN;
}

function tier(c: number): string {
  if (c >= 85) return 'Strong Buy';
  if (c >= 75) return 'Accumulate';
  if (c >= 65) return 'Hold';
  return 'Speculative Buy';
}

const PENALTY_K = 0.6;
const PENALTY_FLOOR = 50;

function penalty(m: number, g: number, v: number): number {
  return Math.max(0, PENALTY_FLOOR - Math.min(m, g, v)) * PENALTY_K;
}

interface Row {
  ticker: string;
  m: number; g: number; v: number;
  oldComp: number; newComp: number; delta: number;
  oldTier: string; newTier: string;
  bottleneck: string;
}

const rows: Row[] = [];
const skipped: string[] = [];

for (const file of readdirSync(STOCKS).sort()) {
  if (!file.endsWith('.json')) continue;
  const d = JSON.parse(readFileSync(join(STOCKS, file), 'utf-8'));

  const m = computeMoatScore(d.tenMoats);
  const g = computeGrowthScore(d.growth.growthAnalysis as GrowthAnalysisInput);
  if (g == null) { skipped.push(d.ticker); continue; }

  // Use the static valuation.score from JSON (the live UI computes from price+scenarios).
  const v = d.valuation.score;

  const oldComp = m * 0.40 + g * 0.35 + v * 0.25;
  const newComp = oldComp - penalty(m, g, v);
  const oldTier = tier(oldComp);
  const newTier = tier(newComp);

  const minScore = Math.min(m, g, v);
  const bottleneck = minScore === m ? 'moat' : minScore === g ? 'growth' : 'valuation';

  rows.push({
    ticker: d.ticker,
    m, g, v,
    oldComp: Math.round(oldComp * 10) / 10,
    newComp: Math.round(newComp * 10) / 10,
    delta: Math.round((newComp - oldComp) * 10) / 10,
    oldTier, newTier,
    bottleneck: minScore < PENALTY_FLOOR ? `${bottleneck} ${minScore}` : '',
  });
}

const moved = rows.filter(r => r.oldTier !== r.newTier);
const penalized = rows.filter(r => r.delta < 0);

rows.sort((a, b) => a.delta - b.delta);

const w = (s: string, n: number) => s.padEnd(n);

console.log(`\n${rows.length} stocks scored. Penalty applied to ${penalized.length} (any pillar < ${PENALTY_FLOOR}).\n`);

if (moved.length === 0) {
  console.log('No recommendation tier changes — try lower PENALTY_FLOOR or higher PENALTY_K.\n');
} else {
  console.log(`Tier changes (${moved.length} stocks):`);
  console.log(w('Ticker', 8) + w('Old', 18) + w('New', 18) + w('OldComp', 9) + w('NewComp', 9) + 'Bottleneck');
  console.log('─'.repeat(80));
  for (const r of moved.sort((a, b) => a.newComp - b.newComp)) {
    console.log(
      w(r.ticker, 8) + w(r.oldTier, 18) + w(r.newTier, 18) +
      w(String(r.oldComp), 9) + w(String(r.newComp), 9) + r.bottleneck
    );
  }
}

console.log(`\nAll penalized stocks (sorted by penalty severity):`);
console.log(w('Ticker', 8) + w('Moat', 6) + w('Growth', 8) + w('Val', 6) + w('OldComp', 9) + w('NewComp', 9) + w('Δ', 7) + 'Bottleneck');
console.log('─'.repeat(70));
for (const r of penalized) {
  const delta = r.delta < 0 ? String(r.delta) : `+${r.delta}`;
  console.log(
    w(r.ticker, 8) + w(String(r.m), 6) + w(String(r.g), 8) + w(String(r.v), 6) +
    w(String(r.oldComp), 9) + w(String(r.newComp), 9) + w(delta, 7) + r.bottleneck
  );
}

// Distribution check
const oldTierCounts: Record<string, number> = {};
const newTierCounts: Record<string, number> = {};
for (const r of rows) {
  oldTierCounts[r.oldTier] = (oldTierCounts[r.oldTier] ?? 0) + 1;
  newTierCounts[r.newTier] = (newTierCounts[r.newTier] ?? 0) + 1;
}
console.log('\nTier distribution shift:');
for (const t of ['Strong Buy', 'Accumulate', 'Hold', 'Speculative Buy']) {
  console.log(`  ${w(t, 18)} ${oldTierCounts[t] ?? 0} → ${newTierCounts[t] ?? 0}`);
}

// Portfolio impact (top 25 by composite ≥ 75)
const oldPortfolio = [...rows].sort((a, b) => b.oldComp - a.oldComp).filter(r => r.oldComp >= 75).slice(0, 25);
const newPortfolio = [...rows].sort((a, b) => b.newComp - a.newComp).filter(r => r.newComp >= 75).slice(0, 25);
const droppedFromPortfolio = oldPortfolio.filter(o => !newPortfolio.some(n => n.ticker === o.ticker));
const addedToPortfolio = newPortfolio.filter(n => !oldPortfolio.some(o => o.ticker === n.ticker));

console.log(`\nPortfolio (top 25 by composite ≥75):`);
console.log(`  size: ${oldPortfolio.length} → ${newPortfolio.length}`);
console.log(`  dropped: ${droppedFromPortfolio.map(r => r.ticker).join(', ') || '(none)'}`);
console.log(`  added:   ${addedToPortfolio.map(r => r.ticker).join(', ') || '(none)'}`);

if (skipped.length) console.log(`\nSkipped (growth derive failed): ${skipped.join(', ')}`);
