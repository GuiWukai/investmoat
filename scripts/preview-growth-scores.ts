/**
 * Migration verification: compare authored growth.score vs the score
 * derived from growthAnalysis + keyRiskSeverity for every stock that has
 * been backfilled. Use during rollout to spot calibration issues.
 *
 *   npx tsx scripts/preview-growth-scores.ts
 *
 * No files are modified.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeGrowthScore, type GrowthAnalysisInput } from '../src/lib/valuationScore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STOCKS = join(__dirname, '..', 'src', 'data', 'stocks');

interface Row { ticker: string; cagr: string; severity: string; author: number; derived: number; delta: number }
const rows: Row[] = [];
let unbackfilled = 0;
let noAnalysis = 0;

for (const file of readdirSync(STOCKS).sort()) {
  if (!file.endsWith('.json')) continue;
  const d = JSON.parse(readFileSync(join(STOCKS, file), 'utf-8'));
  const ga: (GrowthAnalysisInput & { keyRiskSeverity?: string }) | undefined = d.growth?.growthAnalysis;
  if (!ga) { noAnalysis++; continue; }
  if (!ga.keyRiskSeverity) { unbackfilled++; continue; }
  const derived = computeGrowthScore(ga);
  if (derived == null) continue;
  rows.push({
    ticker: d.ticker,
    cagr: ga.cagrEstimate,
    severity: ga.keyRiskSeverity,
    author: d.growth.score,
    derived,
    delta: derived - d.growth.score,
  });
}

rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

console.log(`\nDerived vs author growth scores after backfill`);
console.log(`  ${rows.length} backfilled, ${unbackfilled} pending backfill, ${noAnalysis} without growthAnalysis\n`);

const w = (s: string, n: number) => s.padEnd(n);
console.log(w('Ticker', 8) + w('CAGR', 12) + w('Sev', 10) + w('Auth', 6) + w('Deriv', 7) + 'Δ');
console.log('─'.repeat(50));
for (const r of rows) {
  const d = r.delta > 0 ? `+${r.delta}` : String(r.delta);
  console.log(w(r.ticker, 8) + w(r.cagr, 12) + w(r.severity, 10) + w(String(r.author), 6) + w(String(r.derived), 7) + d);
}

const meanD = rows.reduce((s, r) => s + r.delta, 0) / rows.length;
const meanAbs = rows.reduce((s, r) => s + Math.abs(r.delta), 0) / rows.length;
const w3 = rows.filter(r => Math.abs(r.delta) <= 3).length;
const w7 = rows.filter(r => Math.abs(r.delta) <= 7).length;
const w10 = rows.filter(r => Math.abs(r.delta) <= 10).length;

console.log('\nSummary:');
console.log(`  mean Δ:     ${meanD.toFixed(1)}`);
console.log(`  mean |Δ|:   ${meanAbs.toFixed(1)}`);
console.log(`  within ±3:  ${w3}/${rows.length} (${(w3/rows.length*100).toFixed(0)}%)`);
console.log(`  within ±7:  ${w7}/${rows.length} (${(w7/rows.length*100).toFixed(0)}%)`);
console.log(`  within ±10: ${w10}/${rows.length} (${(w10/rows.length*100).toFixed(0)}%)`);
