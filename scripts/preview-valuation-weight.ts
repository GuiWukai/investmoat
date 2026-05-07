/**
 * Prototype: re-weight valuation in the multiplicative composite.
 *
 *   composite = (m/100)^wM × (g/100)^wG × (v/100)^wV × 100
 *
 * Production weights are 0.40 / 0.35 / 0.25. This script compares a few
 * candidates that bump valuation higher to see which names move tiers and
 * which enter/leave the top-25 portfolio. No files modified.
 *
 * Run via `npx tsx scripts/preview-valuation-weight.ts`.
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

interface Weights { m: number; g: number; v: number; label: string }

const SCENARIOS: Weights[] = [
  { label: 'baseline 40/35/25', m: 0.40, g: 0.35, v: 0.25 },
  { label: 'A: 40/30/30',       m: 0.40, g: 0.30, v: 0.30 },
  { label: 'B: 35/30/35',       m: 0.35, g: 0.30, v: 0.35 },
  { label: 'C: 33/33/33',       m: 1/3,  g: 1/3,  v: 1/3  },
];

function geometric(m: number, g: number, v: number, w: Weights): number {
  return Math.pow(m / 100, w.m)
       * Math.pow(g / 100, w.g)
       * Math.pow(v / 100, w.v)
       * 100;
}

function tier(c: number): string {
  if (c >= 85) return 'Strong Buy';
  if (c >= 75) return 'Accumulate';
  if (c >= 65) return 'Hold';
  return 'Speculative Buy';
}

interface Row { ticker: string; m: number; g: number; v: number }

const rows: Row[] = [];
for (const file of readdirSync(STOCKS).sort()) {
  if (!file.endsWith('.json')) continue;
  const d = JSON.parse(readFileSync(join(STOCKS, file), 'utf-8'));
  const m = computeMoatScore(d.tenMoats);
  const g = computeGrowthScore(d.growth.growthAnalysis as GrowthAnalysisInput) ?? 0;
  const v = d.valuation.score;
  rows.push({ ticker: d.ticker, m, g, v });
}

const w = (s: string, n: number) => s.padEnd(n);

const baseline = SCENARIOS[0];
const baseScores = new Map(rows.map(r => [r.ticker, geometric(r.m, r.g, r.v, baseline)]));
const baseTiers  = new Map(rows.map(r => [r.ticker, tier(baseScores.get(r.ticker)!)]));
const basePortfolio = [...rows]
  .map(r => ({ ticker: r.ticker, c: baseScores.get(r.ticker)! }))
  .sort((a, b) => b.c - a.c)
  .filter(r => r.c >= 75)
  .slice(0, 25)
  .map(r => r.ticker);

console.log(`\n${rows.length} stocks. Comparing valuation-weight scenarios against baseline (40/35/25).\n`);

for (const sc of SCENARIOS.slice(1)) {
  const compScores = new Map(rows.map(r => [r.ticker, geometric(r.m, r.g, r.v, sc)]));
  const compTiers  = new Map(rows.map(r => [r.ticker, tier(compScores.get(r.ticker)!)]));

  const moved = rows
    .filter(r => baseTiers.get(r.ticker) !== compTiers.get(r.ticker))
    .map(r => ({
      ticker: r.ticker, m: r.m, g: r.g, v: r.v,
      oldT: baseTiers.get(r.ticker)!,
      newT: compTiers.get(r.ticker)!,
      oldC: baseScores.get(r.ticker)!,
      newC: compScores.get(r.ticker)!,
    }))
    .sort((a, b) => a.newC - b.newC);

  const compPortfolio = [...rows]
    .map(r => ({ ticker: r.ticker, c: compScores.get(r.ticker)! }))
    .sort((a, b) => b.c - a.c)
    .filter(r => r.c >= 75)
    .slice(0, 25)
    .map(r => r.ticker);

  const dropped = basePortfolio.filter(t => !compPortfolio.includes(t));
  const added   = compPortfolio.filter(t => !basePortfolio.includes(t));

  const deltas = rows.map(r => geometric(r.m, r.g, r.v, sc) - baseScores.get(r.ticker)!);
  const meanDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  const meanAbs   = deltas.reduce((s, d) => s + Math.abs(d), 0) / deltas.length;

  const byAbs = rows
    .map(r => ({
      ticker: r.ticker, m: r.m, g: r.g, v: r.v,
      oldC: baseScores.get(r.ticker)!,
      newC: geometric(r.m, r.g, r.v, sc),
    }))
    .sort((a, b) => Math.abs(b.newC - b.oldC) - Math.abs(a.newC - a.oldC))
    .slice(0, 10);

  console.log('═'.repeat(80));
  console.log(`Scenario ${sc.label}`);
  console.log('═'.repeat(80));
  console.log(`mean Δ: ${meanDelta.toFixed(2)}   mean |Δ|: ${meanAbs.toFixed(2)}`);

  console.log(`\nTier changes (${moved.length}):`);
  if (moved.length === 0) {
    console.log('  (none)');
  } else {
    console.log('  ' + w('Ticker', 8) + w('M/G/V', 14) + w('Old', 18) + w('New', 18) + w('OldC', 9) + 'NewC');
    for (const r of moved) {
      console.log('  ' +
        w(r.ticker, 8) +
        w(`${r.m}/${r.g}/${r.v}`, 14) +
        w(r.oldT, 18) + w(r.newT, 18) +
        w(r.oldC.toFixed(1), 9) + r.newC.toFixed(1));
    }
  }

  console.log(`\nTop-25 portfolio (composite ≥ 75):`);
  console.log(`  size: ${basePortfolio.length} → ${compPortfolio.length}`);
  console.log(`  dropped: ${dropped.join(', ') || '(none)'}`);
  console.log(`  added:   ${added.join(', ') || '(none)'}`);

  console.log('\nLargest |Δ| (top 10):');
  console.log('  ' + w('Ticker', 8) + w('M/G/V', 14) + w('Old', 9) + w('New', 9) + 'Δ');
  for (const r of byAbs) {
    const d = r.newC - r.oldC;
    const ds = d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);
    console.log('  ' + w(r.ticker, 8) + w(`${r.m}/${r.g}/${r.v}`, 14) +
      w(r.oldC.toFixed(1), 9) + w(r.newC.toFixed(1), 9) + ds);
  }
  console.log();
}
