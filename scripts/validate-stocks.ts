/**
 * Validates every JSON file in src/data/stocks against the Zod schema.
 * Run via `npm run validate:stocks` (also wired into `prebuild`).
 *
 * Catches: typos in field names, out-of-range scores, invalid enum values,
 * missing required fields, and slug ↔ filename drift.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { stockAnalysisSchema } from '../src/lib/stockSchema';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STOCKS_DIR = join(__dirname, '..', 'src', 'data', 'stocks');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

type Failure = { file: string; message: string };

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

  console.log(`${GREEN}✓ Validated ${files.length} stock file(s)${RESET}`);
}

main();
