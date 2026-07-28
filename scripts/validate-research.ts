/**
 * Validates every JSON file in src/data/research against the Zod schema, and
 * checks that every ticker an article references actually exists in the
 * coverage registry.
 *
 * Run via `npm run validate:research` (also wired into `prebuild`).
 *
 * The ticker check is the important one: a research article that cites a
 * ticker the site doesn't cover would render a blank row and a broken link,
 * which is exactly the kind of silent rot the live-scores design exists to
 * prevent.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { researchArticleSchema } from '../src/lib/researchSchema';
import { allCoverageData } from '../src/app/stockData';
import { getStockData } from '../src/data/stocks';
import { lintArticleProse, type ProseIssue } from './researchProseLint';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = join(__dirname, '..', 'src', 'data', 'research');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const slugForTicker = new Map(allCoverageData.map((s) => [s.ticker, s.slug]));

type Failure = { file: string; message: string };
type ProseFinding = ProseIssue & { file: string };

/**
 * Structural failures fail the build; prose findings are graded by the lint
 * itself (only its `error` severity is fatal). A file that fails to parse or
 * fails the schema is never linted — there is nothing coherent to read.
 */
type FileReport = { failures: Failure[]; prose: ProseFinding[] };

function validateFile(file: string): FileReport {
  const fullPath = join(RESEARCH_DIR, file);
  const slug = basename(file, '.json');

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
  } catch (err) {
    return {
      failures: [{ file, message: `JSON parse error: ${(err as Error).message}` }],
      prose: [],
    };
  }

  const result = researchArticleSchema.safeParse(raw);
  if (!result.success) {
    return {
      failures: result.error.issues.map((issue) => ({
        file,
        message: `${issue.path.join('.') || '<root>'}: ${issue.message}`,
      })),
      prose: [],
    };
  }

  const article = result.data;
  const failures: Failure[] = [];

  if (article.slug !== slug) {
    failures.push({
      file,
      message: `slug "${article.slug}" does not match filename "${slug}"`,
    });
  }

  // Every ticker referenced anywhere in the article must be covered.
  const referenced = new Set<string>(article.tickers);
  for (const block of article.blocks) {
    if (block.type === 'scorecard' || block.type === 'moat-matrix') {
      block.tickers.forEach((t) => referenced.add(t));
      block.groups?.forEach((g) => g.tickers.forEach((t) => referenced.add(t)));
      if (block.type === 'scorecard' && block.notes) {
        Object.keys(block.notes).forEach((t) => referenced.add(t));
      }
    } else if (block.type === 'stat-strip') {
      block.stats.forEach((s) => s.live && referenced.add(s.live.ticker));
    }
  }

  // A ticker must resolve through BOTH registries: the coverage registry
  // supplies the scores, and the page registry supplies the moat statuses and
  // the link target. Missing either one renders a blank row or a dead link.
  for (const ticker of referenced) {
    const stockSlug = slugForTicker.get(ticker);
    if (!stockSlug) {
      failures.push({
        file,
        message: `ticker "${ticker}" is not in the coverage registry (src/app/stockData.ts)`,
      });
      continue;
    }
    if (!getStockData(stockSlug)) {
      failures.push({
        file,
        message: `ticker "${ticker}" is not in the page registry (src/data/stocks/index.ts) — its row would render blank and link to a 404`,
      });
    }
  }

  // A grouped block must place every one of its tickers in exactly one group,
  // or rows silently vanish from the rendered table.
  for (const [i, block] of article.blocks.entries()) {
    if ((block.type === 'scorecard' || block.type === 'moat-matrix') && block.groups) {
      const grouped = new Set(block.groups.flatMap((g) => g.tickers));
      const ungrouped = block.tickers.filter((t) => !grouped.has(t));
      if (ungrouped.length > 0) {
        failures.push({
          file,
          message: `blocks[${i}] (${block.type}): ${ungrouped.join(', ')} listed in tickers but missing from every group — would not render`,
        });
      }
      const extra = [...grouped].filter((t) => !block.tickers.includes(t));
      if (extra.length > 0) {
        failures.push({
          file,
          message: `blocks[${i}] (${block.type}): ${extra.join(', ')} grouped but missing from tickers`,
        });
      }
    }
  }

  return {
    failures,
    prose: lintArticleProse(article).map((issue) => ({ file, ...issue })),
  };
}

/**
 * Print the non-fatal half of the prose lint.
 *
 * Warnings are avoidable drift. Notes are the re-verify list: a cross-read
 * argument legitimately has to say "all four pillars strong", and that claim
 * needs a human eye whenever the article's `lastReviewed` is bumped.
 */
function reportProse(issues: ProseFinding[]): void {
  if (issues.length === 0) return;

  const warnings = issues.filter((i) => i.severity === 'warning');
  const notes = issues.filter((i) => i.severity === 'note');

  for (const [label, group, colour] of [
    ['drift warning', warnings, YELLOW],
    ['re-verify at lastReviewed', notes, DIM],
  ] as const) {
    if (group.length === 0) continue;
    console.log(`\n${colour}${group.length} ${label}(s)${RESET}`);
    let currentFile = '';
    for (const { file, where, message, excerpt } of group) {
      if (file !== currentFile) {
        console.log(`${DIM}${file}${RESET}`);
        currentFile = file;
      }
      console.log(`  ${DIM}•${RESET} ${where}: ${message}`);
      console.log(`    ${DIM}"${excerpt}"${RESET}`);
    }
  }
  console.log('');
}

function main(): void {
  let files: string[];
  try {
    files = readdirSync(RESEARCH_DIR).filter((f) => extname(f) === '.json');
  } catch {
    console.log(`${DIM}No research directory yet — skipping.${RESET}`);
    return;
  }

  if (files.length === 0) {
    console.log(`${DIM}No research articles to validate.${RESET}`);
    return;
  }

  const reports = files.map(validateFile);
  const failures = reports.flatMap((r) => r.failures);
  const prose = reports.flatMap((r) => r.prose);

  // Prose errors are structural failures in every sense that matters: a score
  // transcribed into text is drift the build should refuse to ship.
  failures.push(
    ...prose
      .filter((p) => p.severity === 'error')
      .map(({ file, where, message, excerpt }) => ({
        file,
        message: `${where}: ${message}\n    ${DIM}"${excerpt}"${RESET}`,
      })),
  );

  reportProse(prose.filter((p) => p.severity !== 'error'));

  if (failures.length > 0) {
    const failedFiles = new Set(failures.map((f) => f.file));
    console.error(
      `${RED}✗ Research validation failed: ${failures.length} issue(s) in ${failedFiles.size} file(s)${RESET}\n`,
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
      `\n${DIM}Schema: src/lib/researchSchema.ts — update both schema and src/types/research.ts when fields change.` +
        `\nProse rules: scripts/researchProseLint.ts — an article carries tickers, never numbers.${RESET}`,
    );
    process.exit(1);
  }

  console.log(`${GREEN}✓ Validated ${files.length} research article(s)${RESET}`);
}

main();
