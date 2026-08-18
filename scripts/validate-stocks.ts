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
import {
  parseScenarioPrice,
  parseCagrEstimate,
  computeGrowthScore,
  type GrowthAnalysisInput,
} from '../src/lib/valuationScore';
import type { AssetClass } from '../src/types/stockAnalysis';
import { getAllSlugs } from '../src/data/stocks';
import { allCoverageData } from '../src/app/stockData';
import { allSectorKeys } from '../src/lib/sectorCatalog';

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

/**
 * How far the arithmetic written into `scoreDerivation` may fall from the score
 * `computeGrowthScore` actually returns before it is worth flagging. Small gaps
 * are usually rounding in the prose; large ones mean the derivation describes a
 * superseded calculation.
 *
 * This does NOT affect any published score — computeGrowthScore reads the
 * structured fields (cagrEstimate, drivers, marginTrend, primaryType,
 * keyRiskSeverity), never the prose. But the prose is what a reader is shown as
 * the explanation for the number next to it, so drift makes the site explain
 * its scores incorrectly. Gold is the worst case: its derivation still narrates
 * an old hand-rolled "Base 50 ... = 50" method against a computed 71.
 */
const MAX_DERIVATION_DRIFT = 2;

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
 * Highest cagrEstimate midpoint that reads as a forecast rather than an
 * extrapolation. Above 30% the base curve saturates, so an implausible number
 * is absorbed silently instead of being challenged — NBIS at 175% and AVGO at
 * 40% score 95 and 92.5. Saturation is deliberate (see baseFromCagr), but it
 * means the rubric cannot object to a number no business sustains, so the
 * validator does the objecting.
 */
const MAX_PLAUSIBLE_CAGR = 60;

/**
 * Phrases that mark a cited figure as a bounded ratio rather than a rate. A
 * market share or a percent-of-supply is capped at 100%, so it cannot compound
 * at its cited value over a forecast window — it describes position, not growth.
 * Flagged because such a figure reads as a citation and satisfies a naive
 * "is there a basis?" check while being structurally unable to carry the
 * estimate attached to it (ETH: "~65% of tokenized value", "33.6% of supply").
 */
const BOUNDED_RATIO_PATTERNS: RegExp[] = [
  /\d+(?:\.\d+)?%\s*of\s+(?:supply|all|total|the\s+market|tokenized|circulating)/i,
  /(?:share|dominance)\s+(?:of|at)\s+~?\d+(?:\.\d+)?%/i,
  /~?\d+(?:\.\d+)?%\s*(?:market\s+)?share/i,
  /at\s+~?\d+(?:\.\d+)?%\s+of\b/i,
];

/** An unbounded rate: "+8.3% YoY", "~9%/yr", "+315% YoY", "up 44% YTD". */
const RATE_PATTERN =
  /[+\-]?\d+(?:\.\d+)?%\s*(?:\/\s*(?:yr|year)|\s*(?:YoY|YTD|CAGR|per\s+year|a\s+year|annual))/i;

/**
 * Growth-input hygiene. Four checks, all advisory:
 *   • cagrEstimate too high to read as a forecast (MAX_PLAUSIBLE_CAGR)
 *   • cagrBasis missing on crypto/commodity, where there is no revenue line to
 *     fall back on and the estimate is otherwise unfalsifiable
 *   • cagrBasis citing only bounded ratios — capped figures cannot anchor a rate
 *   • cagrBasis citing no unbounded rate at all
 * Plus book-wide cagrBasis coverage, reported by the caller.
 */
function checkGrowthInputs(files: string[]): { warnings: Warning[]; missingBasis: number } {
  const warnings: Warning[] = [];
  let missingBasis = 0;
  for (const file of files) {
    let data: {
      assetClass?: string;
      growth?: { growthAnalysis?: { cagrEstimate?: string; cagrBasis?: string } };
    };
    try {
      data = JSON.parse(readFileSync(join(STOCKS_DIR, file), 'utf-8'));
    } catch {
      continue;
    }
    const ga = data.growth?.growthAnalysis;
    if (!ga) continue;
    if (!ga.cagrBasis) missingBasis++;
    const mid = parseCagrEstimate(ga.cagrEstimate ?? '');
    if (mid != null && mid > MAX_PLAUSIBLE_CAGR) {
      warnings.push({
        file,
        message:
          `cagrEstimate midpoint is ${mid}% (limit ${MAX_PLAUSIBLE_CAGR}%) — above 30% the base curve saturates, so ` +
          'this scores the same as a 50% estimate. State the rate the business can sustain, not its current one',
      });
    }

    const needsBasis = data.assetClass === 'crypto' || data.assetClass === 'commodity';
    if (needsBasis && !ga.cagrBasis) {
      warnings.push({
        file,
        message:
          `assetClass=${data.assetClass} has no cagrBasis — with no revenue line, the CAGR base (~78% of the growth ` +
          'score) rests on an unfalsifiable number. Anchor it on an adoption series and record the rate',
      });
    }

    if (ga.cagrBasis) {
      const bounded = BOUNDED_RATIO_PATTERNS.filter(p => p.test(ga.cagrBasis!));
      const hasRate = RATE_PATTERN.test(ga.cagrBasis);
      if (bounded.length > 0 && !hasRate) {
        warnings.push({
          file,
          message:
            'cagrBasis cites only bounded ratios (market share / percent-of-supply) and no unbounded rate. A figure ' +
            'capped at 100% cannot compound at its cited value — it describes position, not growth. Cite the rate of ' +
            'the channel that accrues to the asset',
        });
      } else if (!hasRate) {
        warnings.push({
          file,
          message:
            'cagrBasis cites no unbounded rate (expected something like "+8.3% YoY" or "~9%/yr"). The estimate needs ' +
            'a measured rate it is answerable to, not only levels',
        });
      } else if (bounded.length > 0 && mid != null) {
        warnings.push({
          file,
          message:
            `cagrBasis mixes bounded ratios with rates behind a ${mid}% midpoint — check that the estimate rests on ` +
            'the unbounded accrual series and not on the capped ones, which cannot support a multi-year rate',
        });
      }
    }
  }
  return { warnings, missingBasis };
}

/**
 * Flag growth derivations whose written arithmetic no longer lands on the score
 * the formula produces. See MAX_DERIVATION_DRIFT.
 */
function checkGrowthDerivations(files: string[]): Warning[] {
  const warnings: Warning[] = [];
  for (const file of files) {
    let data: {
      assetClass?: AssetClass;
      growth?: { growthAnalysis?: GrowthAnalysisInput & { scoreDerivation?: string } };
    };
    try {
      data = JSON.parse(readFileSync(join(STOCKS_DIR, file), 'utf-8'));
    } catch {
      continue;
    }
    const ga = data.growth?.growthAnalysis;
    if (!ga?.scoreDerivation) continue;
    // Must pass assetClass: growth dispatches on it (marginTrend is equity-only),
    // so omitting it compares the prose against a score the site never renders.
    // Every crypto/commodity asset currently carries marginTrend "stable", which
    // contributes 0 either way, so this changes no warning today — it stops the
    // check going wrong the first time one of them is set to expanding.
    const computed = computeGrowthScore(ga, data.assetClass ?? 'equity');
    if (computed == null) continue;
    // The derivation reads "base + adj − adj = NN"; take the last such total.
    // Authors write the total after either "=" or "≈", so accept both — matching
    // only "=" silently skipped 5 files, 4 of which had drifted 3-4 points. The
    // last-occurrence guard covers both symbols, so a file that already parsed on
    // "=" cannot be re-read as a stray "≈ 30%" later in the prose.
    const match = ga.scoreDerivation.match(/[=≈]\s*(\d{1,3})(?![\s\S]*[=≈]\s*\d)/);
    if (!match) continue; // not every derivation is written as an equation
    const stated = Number(match[1]);
    if (Math.abs(stated - computed) > MAX_DERIVATION_DRIFT) {
      warnings.push({
        file,
        message:
          `growth derivation states ${stated} but computeGrowthScore returns ${computed} — the prose describes a ` +
          'superseded calculation. The score is unaffected (it is derived from the structured fields), but the ' +
          'explanation shown next to it is wrong',
      });
    }
  }
  return warnings;
}

const MOAT_PILLAR_KEYS = [
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
] as const;

/**
 * `strong` is 100 points on a pillar — the same 100 Visa's network and S&P's
 * benchmark receive. Seven or more strongs is the signature of using the top
 * label as a default rather than as category-defining intensity. Advisory
 * because a handful of names (index franchise, card network, process monopoly)
 * can legitimately be that strong; the warning is so the next author does not
 * treat Datadog-style switching costs as the same 100.
 */
const MAX_STRONG_WITHOUT_NOTE = 6;

/** Customer-encoded config is switching cost, not vendor-owned business logic. */
const CUSTOMER_CONFIG_LOGIC =
  /customers encode|encode thousands of|monitors, SLO|SLO definitions|detection rules|threat hunting queries|SQL transformations|dbt models|dashboards, runbooks/i;

/** Scale of ingested customer telemetry is not unique proprietary data. */
const CUSTOMER_TELEMETRY_DATA =
  /customers retain ownership|customers can export|customer-owned data|ingest(s)? trillions|telemetry events daily|customer telemetry/i;

/** A public archive or ops history is not a business system of record. */
const SOFT_SYSTEM_OF_RECORD =
  /peer knowledge|incident history|operational state|operational history/i;

/** Weakened used as a polite N/A — still scores 35 at full pillar weight. */
const WEAKENED_AS_NA =
  /does not meaningfully apply|category does not apply|this moat category is not|moat category does not apply/i;

function checkMoatLabelInflation(files: string[]): Warning[] {
  const warnings: Warning[] = [];
  for (const file of files) {
    let data: { tenMoats?: Record<string, { status?: string; note?: string }> };
    try {
      data = JSON.parse(readFileSync(join(STOCKS_DIR, file), 'utf-8'));
    } catch {
      continue;
    }
    if (!data.tenMoats) continue;
    const strongs = MOAT_PILLAR_KEYS.filter((k) => data.tenMoats?.[k]?.status === 'strong');
    if (strongs.length > MAX_STRONG_WITHOUT_NOTE) {
      warnings.push({
        file,
        message:
          `${strongs.length} pillars marked strong (${strongs.join(', ')}). strong is category-defining ` +
          'intensity, not "switching costs exist" — the same 100 points Visa\'s network receives. ' +
          'Downgrade any pillar that is real-but-not-unique to intact',
      });
    }

    const bl = data.tenMoats.businessLogic;
    if (bl?.status === 'strong' && bl.note && CUSTOMER_CONFIG_LOGIC.test(bl.note)) {
      warnings.push({
        file,
        message:
          'businessLogic is strong but the note describes customer-encoded config (monitors, SLOs, SQL, detection rules). ' +
          'That is switching cost — learnedInterfaces or transactionEmbedding — not vendor-owned logic competitors cannot replicate. Rate intact (see Snowflake SQL) unless the logic is the company\'s',
      });
    }

    const pd = data.tenMoats.proprietaryData;
    if (pd?.status === 'strong' && pd.note && CUSTOMER_TELEMETRY_DATA.test(pd.note)) {
      warnings.push({
        file,
        message:
          'proprietaryData is strong but the note describes ingested customer telemetry or customer-owned data. ' +
          'Scale is not uniqueness — Snowflake rates the same fact weakened because customers can export it. Rate intact unless the dataset cannot be replicated without the franchise (Threat Graph, claims, genetics, benchmarks)',
      });
    }

    const sor = data.tenMoats.systemOfRecord;
    if (sor?.status === 'strong' && sor.note && SOFT_SYSTEM_OF_RECORD.test(sor.note)) {
      warnings.push({
        file,
        message:
          'systemOfRecord is strong but the note describes operational history, incident archives, or peer knowledge. ' +
          'strong is identity / payments / CMDB / design database — the record downstream systems must defer to. Rate intact (CrowdStrike endpoint telemetry) unless replacing it is a multi-year compliance programme',
      });
    }

    for (const k of MOAT_PILLAR_KEYS) {
      const a = data.tenMoats[k];
      if (a?.status === 'weakened' && a.note && WEAKENED_AS_NA.test(a.note)) {
        warnings.push({
          file,
          message:
            `${k} is weakened but the note says the pillar does not apply. weakened still scores 35 at full weight ` +
            'inside its group — use status na so the weight drops out',
        });
      }
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

function checkCategories(): Failure[] {
  const known = new Set<string>(allSectorKeys());
  const failures: Failure[] = [];
  for (const stock of allCoverageData) {
    if (!known.has(stock.category)) {
      failures.push({
        file: `${stock.slug}.json`,
        message:
          `category "${stock.category}" is not a SECTORS[].key in src/lib/sectorCatalog.ts — ` +
          `/stocks filters and /sectors would drop this name`,
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
  failures.push(...checkCategories());

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

  const corridorWarnings = checkScenarioCorridors(files);
  if (corridorWarnings.length > 0) {
    console.log(`${YELLOW}Scenario corridor notes (${corridorWarnings.length}) — advisory, not failures:${RESET}`);
    for (const { file, message } of corridorWarnings) {
      console.log(`  ${DIM}•${RESET} ${YELLOW}${file}${RESET} ${message}`);
    }
    console.log('');
  }

  const { warnings: inputWarnings, missingBasis } = checkGrowthInputs(files);
  if (inputWarnings.length > 0) {
    console.log(`${YELLOW}Growth input hygiene (${inputWarnings.length}) — advisory, not failures:${RESET}`);
    for (const { file, message } of inputWarnings) {
      console.log(`  ${DIM}•${RESET} ${YELLOW}${file}${RESET} ${message}`);
    }
    console.log('');
  }
  if (missingBasis > 0) {
    console.log(
      `${YELLOW}cagrBasis coverage:${RESET} ${files.length - missingBasis}/${files.length} files cite the measured ` +
        `series behind their cagrEstimate. ${DIM}The CAGR base drives ~78% of the growth score; a basis makes it ` +
        `checkable.${RESET}\n`,
    );
  }

  const derivationWarnings = checkGrowthDerivations(files);
  if (derivationWarnings.length > 0) {
    console.log(
      `${YELLOW}Growth derivation drift (${derivationWarnings.length} of ${files.length}) — advisory, not failures:${RESET}`,
    );
    for (const { file, message } of derivationWarnings) {
      console.log(`  ${DIM}•${RESET} ${YELLOW}${file}${RESET} ${message}`);
    }
    console.log('');
  }

  const moatWarnings = checkMoatLabelInflation(files);
  if (moatWarnings.length > 0) {
    console.log(
      `${YELLOW}Moat label inflation (${moatWarnings.length}) — advisory, not failures:${RESET}`,
    );
    for (const { file, message } of moatWarnings) {
      console.log(`  ${DIM}•${RESET} ${YELLOW}${file}${RESET} ${message}`);
    }
    console.log('');
  }

  console.log(`${GREEN}✓ Validated ${files.length} stock file(s)${RESET}`);
}

main();
