/**
 * Validates every JSON file in src/data/stocks against the Zod schema, and
 * checks that the two registries agree.
 *
 * Run via `npm run validate:stocks` (also wired into `prebuild`).
 *
 * Catches: typos in field names, out-of-range scores, invalid enum values,
 * missing required fields, slug ↔ filename drift, and — per DATA-MODEL.md,
 * "the most common mistake" — a stock registered in one registry but not the
 * other. That failure is silent at build time: the stock appears on /stocks
 * with a link to a page that 404s.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { stockAnalysisSchema } from '../src/lib/stockSchema';
import { parseScenarioPrice } from '../src/lib/valuationScore';
import { getAllSlugs } from '../src/data/stocks';
import { allCoverageData } from '../src/app/stockData';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STOCKS_DIR = join(__dirname, '..', 'src', 'data', 'stocks');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

type Failure = { file: string; message: string };
type Warning = { file: string; message: string };

/**
 * Widest base/bear corridor that reads as a fair-value base case.
 *
 * The base target is meant to be 12–24 month expected value; the bull target
 * carries the cycle peak. Nothing enforces that, and crypto drifted: BTC's base
 * was literally described as a "post-halving cycle peak" at a new all-time
 * high, and ETH's ladder was set to the same multiples of spot as the BTC and
 * SOL ladders rather than to anything about Ethereum. Because
 * computeValuationScore reads position within the corridor, a base set at the
 * cycle peak parks spot near the bear end and pays out a high score for it —
 * crypto averaged 85.3 on valuation with a standard deviation of 0.9, against
 * an equity mean of 70.3 with a spread of 9.5. A pillar that returns the same
 * answer for every asset in a class is not measuring that class.
 *
 * A ratio can't see whether the base is fair value, but it is a good proxy: at
 * 3.0 every equity in coverage passes except MSTR, whose corridor is wide
 * because it is a leveraged BTC proxy. So this warns rather than fails —
 * a wide corridor is a smell, not proof of an error.
 */
const MAX_BASE_BEAR_RATIO = 3.0;

function validateFile(file: string): Failure[] {
  const fullPath = join(STOCKS_DIR, file);
  const slug = basename(file, '.json');

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
  } catch (err) {
    return [{ file, message: `JSON parse error: ${(err as Error).message}` }];
  }

  const result = stockAnalysisSchema.safeParse(raw);
  if (!result.success) {
    return result.error.issues.map((issue) => ({
      file,
      message: `${issue.path.join('.') || '<root>'}: ${issue.message}`,
    }));
  }

  if (result.data.slug !== slug) {
    return [
      {
        file,
        message: `slug "${result.data.slug}" does not match filename "${slug}"`,
      },
    ];
  }

  return [];
}

/**
 * Flag scenario ladders whose base sits implausibly far above the bear case —
 * the signature of a cycle-peak number occupying the base slot. See
 * MAX_BASE_BEAR_RATIO.
 */
function checkScenarioCorridors(files: string[]): Warning[] {
  const warnings: Warning[] = [];
  for (const file of files) {
    let data: { scenarios?: { bear?: { priceTarget?: string }; base?: { priceTarget?: string } } };
    try {
      data = JSON.parse(readFileSync(join(STOCKS_DIR, file), 'utf-8'));
    } catch {
      continue; // parse errors are already a hard failure
    }
    const bear = parseScenarioPrice(data.scenarios?.bear?.priceTarget ?? '');
    const base = parseScenarioPrice(data.scenarios?.base?.priceTarget ?? '');
    if (!bear || !base) continue;
    const ratio = base / bear;
    if (ratio > MAX_BASE_BEAR_RATIO) {
      warnings.push({
        file,
        message:
          `base is ${ratio.toFixed(1)}× the bear target (limit ${MAX_BASE_BEAR_RATIO}×) — check that the base case is ` +
          '12–24 month expected value and not a cycle peak; the cycle peak belongs in the bull slot',
      });
    }
  }
  return warnings;
}

/**
 * Cross-check the two registries against each other and against the JSON files
 * on disk. A stock in src/app/stockData.ts but not src/data/stocks/index.ts is
 * listed on /stocks with a link to a 404 — the failure this catches.
 */
function checkRegistries(files: string[]): Failure[] {
  const failures: Failure[] = [];
  const onDisk = files.map((f) => basename(f, '.json'));
  const pageSlugs = new Set(getAllSlugs());
  const coverageSlugs = new Set(allCoverageData.map((s) => s.slug));

  for (const slug of coverageSlugs) {
    if (!pageSlugs.has(slug)) {
      failures.push({
        file: `${slug}.json`,
        message:
          'registered in src/app/stockData.ts but missing from src/data/stocks/index.ts — /stocks lists it, /stocks/' +
          `${slug} would 404`,
      });
    }
  }

  for (const slug of pageSlugs) {
    if (!coverageSlugs.has(slug)) {
      failures.push({
        file: `${slug}.json`,
        message:
          'registered in src/data/stocks/index.ts but missing from src/app/stockData.ts — the page exists but is unreachable from /stocks and /portfolio',
      });
    }
  }

  for (const slug of onDisk) {
    if (!pageSlugs.has(slug) && !coverageSlugs.has(slug)) {
      failures.push({
        file: `${slug}.json`,
        message: 'JSON file is not registered in either registry — it is dead data',
      });
    }
  }

  return failures;
}

function main(): void {
  const files = readdirSync(STOCKS_DIR).filter((f) => extname(f) === '.json');
  if (files.length === 0) {
    console.error(`${RED}No JSON files found in ${STOCKS_DIR}${RESET}`);
    process.exit(1);
  }

  const failures: Failure[] = [];
  for (const file of files) {
    const fileFailures = validateFile(file);
    failures.push(...fileFailures);
  }

  failures.push(...checkRegistries(files));

  if (failures.length > 0) {
    const failedFiles = new Set(failures.map((f) => f.file));
    console.error(
      `${RED}✗ Stock data validation failed: ${failures.length} issue(s) in ${failedFiles.size} file(s)${RESET}\n`,
    );
    let currentFile = '';
    for (const { file, message } of failures) {
      if (file !== currentFile) {
        console.error(`${YELLOW}${file}${RESET}`);
        currentFile = file;
      }
      console.error(`  ${DIM}•${RESET} ${message}`);
    }
    console.error(
      `\n${DIM}Schema: src/lib/stockSchema.ts — update both schema and src/types/stockAnalysis.ts when fields change.${RESET}`,
    );
    process.exit(1);
  }

  const warnings = checkScenarioCorridors(files);
  if (warnings.length > 0) {
    console.log(`${YELLOW}Scenario corridor notes (${warnings.length}) — advisory, not failures:${RESET}`);
    for (const { file, message } of warnings) {
      console.log(`  ${DIM}•${RESET} ${YELLOW}${file}${RESET} ${message}`);
    }
    console.log('');
  }

  console.log(`${GREEN}✓ Validated ${files.length} stock file(s)${RESET}`);
}

main();
