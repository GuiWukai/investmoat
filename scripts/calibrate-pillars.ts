/**
 * Re-derives the pillar normalisation constants used by computeCompositeRaw.
 *
 * The composite standardises each pillar before weighting so that the declared
 * weights (moat .40 / growth .30 / valuation .30) actually govern how much each
 * pillar moves the ranking. Standardising needs the coverage universe's centre
 * and spread per pillar — those are baked into PILLAR_CALIBRATION in
 * src/lib/valuationScore.ts rather than recomputed at render time, so a stock's
 * published score doesn't shift when unrelated coverage is added.
 *
 * Baked constants drift as coverage grows. Run this script periodically:
 *
 *   npx tsx scripts/calibrate-pillars.ts
 *
 * It prints the observed statistics, the drift vs. the baked constants, and a
 * ready-to-paste replacement block. Re-baking changes every published score, so
 * treat it as a deliberate recalibration, not routine maintenance.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeAssetMoatScore,
  computeGrowthScore,
  PILLAR_CALIBRATION,
  COMPOSITE_CALIBRATION,
  type GrowthAnalysisInput,
} from '../src/lib/valuationScore';
import type { StockAnalysisData } from '../src/types/stockAnalysis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STOCKS_DIR = join(__dirname, '..', 'src', 'data', 'stocks');

const DIM = '\x1b[2m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/** Weights must match COMPOSITE_WEIGHTS in valuationScore.ts. */
const WEIGHTS = { moat: 0.4, growth: 0.3, valuation: 0.3 };

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function sd(xs: number[]): number {
  const mu = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - mu) ** 2)));
}

/** Pearson correlation, used to report how independent the pillars really are. */
function corr(a: number[], b: number[]): number {
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

/** Composite works in log space, so the calibration statistics do too. */
const toLog = (score: number) => Math.log(Math.max(score, 1) / 100);

function main(): void {
  const files = readdirSync(STOCKS_DIR).filter((f) => f.endsWith('.json'));
  const moat: number[] = [];
  const growth: number[] = [];
  const valuation: number[] = [];

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(STOCKS_DIR, file), 'utf-8')) as StockAnalysisData;
    const g = computeGrowthScore(data.growth.growthAnalysis as GrowthAnalysisInput, data.assetClass ?? 'equity');
    if (g == null) throw new Error(`${file}: computeGrowthScore returned null`);
    moat.push(computeAssetMoatScore(data));
    growth.push(g);
    valuation.push(data.valuation.score);
  }

  const logs = { moat: moat.map(toLog), growth: growth.map(toLog), valuation: valuation.map(toLog) };
  const observed = {
    moat: { logMean: mean(logs.moat), logSd: sd(logs.moat) },
    growth: { logMean: mean(logs.growth), logSd: sd(logs.growth) },
    valuation: { logMean: mean(logs.valuation), logSd: sd(logs.valuation) },
  };

  // The blended z-score's spread is not 1: the pillars are weighted and mildly
  // correlated. COMPOSITE_CALIBRATION.logSd is divided by this so the composite
  // keeps the dispersion the un-normalised formula produced — which is what
  // lets the recommendation bands stay where they are.
  const zs = (['moat', 'growth', 'valuation'] as const).map((k) =>
    logs[k].map((x) => (x - observed[k].logMean) / observed[k].logSd),
  );
  const blended = zs[0].map((_, i) => WEIGHTS.moat * zs[0][i] + WEIGHTS.growth * zs[1][i] + WEIGHTS.valuation * zs[2][i]);
  const blendedSd = sd(blended);

  console.log(`${DIM}Universe: ${files.length} assets in ${STOCKS_DIR}${RESET}\n`);
  console.log('Per-pillar statistics of ln(score/100):\n');
  console.log('  pillar      raw mean   raw sd    logMean    logSd    baked logMean  baked logSd');
  for (const k of ['moat', 'growth', 'valuation'] as const) {
    const raw = { moat, growth, valuation }[k];
    const baked = PILLAR_CALIBRATION[k];
    const drift = Math.abs(observed[k].logSd - baked.logSd) / baked.logSd;
    const flag = drift > 0.1 ? `${YELLOW}  ← logSd drift ${(drift * 100).toFixed(0)}%${RESET}` : '';
    console.log(
      `  ${k.padEnd(11)} ${mean(raw).toFixed(1).padStart(7)} ${sd(raw).toFixed(1).padStart(8)} ` +
        `${observed[k].logMean.toFixed(4).padStart(10)} ${observed[k].logSd.toFixed(4).padStart(8)} ` +
        `${baked.logMean.toFixed(4).padStart(14)} ${baked.logSd.toFixed(4).padStart(12)}${flag}`,
    );
  }

  console.log('\nPillar correlations (low values mean the pillars carry independent information):');
  console.log(`  moat~growth ${corr(logs.moat, logs.growth).toFixed(2)}   ` +
    `moat~valuation ${corr(logs.moat, logs.valuation).toFixed(2)}   ` +
    `growth~valuation ${corr(logs.growth, logs.valuation).toFixed(2)}`);

  console.log(`\nBlended z-score spread: ${blendedSd.toFixed(4)} ${DIM}(baked: ${COMPOSITE_CALIBRATION.blendedZSd.toFixed(4)})${RESET}`);

  console.log('\n─── Paste into src/lib/valuationScore.ts ───\n');
  console.log('export const PILLAR_CALIBRATION: Record<PillarKey, PillarCalibration> = {');
  for (const k of ['moat', 'growth', 'valuation'] as const) {
    console.log(`  ${(k + ':').padEnd(11)} { logMean: ${observed[k].logMean.toFixed(4)}, logSd: ${observed[k].logSd.toFixed(4)} },`);
  }
  console.log('};');
  console.log(`\n// blendedZSd: ${blendedSd.toFixed(4)}`);
}

main();
