/**
 * Prototype: multiplicative composite (CES-style).
 *
 *   composite = (m/100)^0.40 × (g/100)^0.35 × (v/100)^0.25 × 100
 *
 * Built-in bottleneck: any pillar near 0 disproportionately drags the score.
 * Identical to weighted-additive when all pillars are equal; strictly lower
 * when they differ. Replaces the additive + bottleneck-penalty pair.
 *
 * No files modified. Run via `npx tsx scripts/preview-multiplicative.ts`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeMoatScore,
  computeGrowthScore,
  type GrowthAnalysisInput,
} from '../src/lib/valuationScore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STOCKS = join(__dirname, '..', 'src', 'data', 'stocks');

function additivePenalized(m: number, g: number, v: number): number {
  // Current production formula (PR #119): weighted sum minus bottleneck penalty.
  return m * 0.40 + g * 0.35 + v * 0.25
       - Math.max(0, 55 - Math.min(m, g, v)) * 0.8;
}

function multiplicative(m: number, g: number, v: number): number {
  // CES-style: weighted geometric mean. Equivalent to additive for equal inputs;
  // strictly lower (more penalising) when inputs differ.
  return Math.pow(m / 100, 0.40)
       * Math.pow(g / 100, 0.35)
       * Math.pow(v / 100, 0.25)
       * 100;
}

function tier(c: number): string {
  if (c >= 85) return 'Strong Buy';
  if (c >= 75) return 'Accumulate';
  if (c >= 65) return 'Hold';
  return 'Speculative Buy';
}

interface Row {
  ticker: string;
  m: number; g: number; v: number;
  oldComp: number; newComp: number; delta: number;
  oldTier: string; newTier: string;
}

const rows: Row[] = [];
for (const file of readdirSync(STOCKS).sort()) {
  if (!file.endsWith('.json')) continue;
  const d = JSON.parse(readFileSync(join(STOCKS, file), 'utf-8'));
  const m = computeMoatScore(d.tenMoats);
  const g = computeGrowthScore(d.growth.growthAnalysis as GrowthAnalysisInput) ?? 0;
  const v = d.valuation.score;

  const oldComp = additivePenalized(m, g, v);
  const newComp = multiplicative(m, g, v);
  rows.push({
    ticker: d.ticker, m, g, v,
    oldComp: Math.round(oldComp * 10) / 10,
    newComp: Math.round(newComp * 10) / 10,
    delta: Math.round((newComp - oldComp) * 10) / 10,
    oldTier: tier(oldComp), newTier: tier(newComp),
  });
}

// Distribution histogram
const oldTierCounts: Record<string, number> = {};
const newTierCounts: Record<string, number> = {};
for (const r of rows) {
  oldTierCounts[r.oldTier] = (oldTierCounts[r.oldTier] ?? 0) + 1;
  newTierCounts[r.newTier] = (newTierCounts[r.newTier] ?? 0) + 1;
}

console.log(`\n${rows.length} stocks scored. Comparing additive+penalty (PR #119) vs multiplicative.\n`);

console.log('Tier distribution:');
for (const t of ['Strong Buy', 'Accumulate', 'Hold', 'Speculative Buy']) {
  console.log(`  ${t.padEnd(18)} ${oldTierCounts[t] ?? 0} → ${newTierCounts[t] ?? 0}`);
}

const moved = rows.filter(r => r.oldTier !== r.newTier);
const w = (s: string, n: number) => s.padEnd(n);

console.log(`\nTier changes (${moved.length} stocks):`);
console.log(w('Ticker', 8) + w('M/G/V', 14) + w('Old', 18) + w('New', 18) + w('OldComp', 9) + 'NewComp');
console.log('─'.repeat(80));
for (const r of moved.sort((a, b) => a.newComp - b.newComp)) {
  console.log(
    w(r.ticker, 8) +
    w(`${r.m}/${r.g}/${r.v}`, 14) +
    w(r.oldTier, 18) + w(r.newTier, 18) +
    w(String(r.oldComp), 9) + String(r.newComp)
  );
}

// Distribution stats
const meanDelta = rows.reduce((s, r) => s + r.delta, 0) / rows.length;
const meanAbs = rows.reduce((s, r) => s + Math.abs(r.delta), 0) / rows.length;
console.log('\nDelta stats (multiplicative − additive+penalty):');
console.log(`  mean Δ:   ${meanDelta.toFixed(2)}`);
console.log(`  mean |Δ|: ${meanAbs.toFixed(2)}`);

// Portfolio impact
const oldPortfolio = [...rows].sort((a, b) => b.oldComp - a.oldComp).filter(r => r.oldComp >= 75).slice(0, 25);
const newPortfolio = [...rows].sort((a, b) => b.newComp - a.newComp).filter(r => r.newComp >= 75).slice(0, 25);
const dropped = oldPortfolio.filter(o => !newPortfolio.some(n => n.ticker === o.ticker));
const added = newPortfolio.filter(n => !oldPortfolio.some(o => o.ticker === n.ticker));

console.log(`\nPortfolio (top 25 by composite ≥75):`);
console.log(`  size: ${oldPortfolio.length} → ${newPortfolio.length}`);
console.log(`  dropped: ${dropped.map(r => `${r.ticker} (${r.newComp})`).join(', ') || '(none)'}`);
console.log(`  added:   ${added.map(r => `${r.ticker} (${r.newComp})`).join(', ') || '(none)'}`);

// Largest movers (any direction)
console.log('\nLargest |Δ| (top 15):');
const byAbs = [...rows].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 15);
console.log(w('Ticker', 8) + w('M/G/V', 14) + w('Old', 9) + w('New', 9) + 'Δ');
for (const r of byAbs) {
  const d = r.delta > 0 ? `+${r.delta}` : String(r.delta);
  console.log(w(r.ticker, 8) + w(`${r.m}/${r.g}/${r.v}`, 14) + w(String(r.oldComp), 9) + w(String(r.newComp), 9) + d);
}
