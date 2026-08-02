/**
 * Validates the agent skills in .agents/skills against the Agent Skills spec
 * (https://agentskills.io/specification), and checks that each one is reachable
 * from the Claude Code compatibility directory.
 *
 * Run via `npm run validate:skills` (also wired into `prebuild`).
 *
 * .agents/skills is the vendor-neutral location, read directly by Cursor,
 * Copilot and other compliant clients. Claude Code scans only .claude/skills,
 * so every skill needs a symlink there. A skill added without one is invisible
 * to Claude Code with no error anywhere — the silent half-migration this check
 * exists to catch.
 */
import { readdirSync, readFileSync, statSync, lstatSync, readlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILLS_DIR = join(ROOT, '.agents', 'skills');
const CLAUDE_DIR = join(ROOT, '.claude', 'skills');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

type Failure = { skill: string; message: string };

/**
 * Reads the `name` and `description` out of a SKILL.md's YAML frontmatter.
 *
 * Deliberately not a full YAML parse: the spec's required fields are flat
 * scalars, and a real parser would be a dependency for two `key: value` lines.
 * Values may legally contain colons, so only the first one is a delimiter.
 */
function readFrontmatter(path: string): Record<string, string> | null {
  const lines = readFileSync(path, 'utf-8').split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;

  const end = lines.indexOf('---', 1);
  if (end === -1) return null;

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1, end)) {
    const separator = line.indexOf(':');
    if (separator === -1 || /^\s/.test(line)) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) fields[key] = value.replace(/^["']|["']$/g, '');
  }
  return fields;
}

function validateSkill(name: string): Failure[] {
  const failures: Failure[] = [];
  const skillFile = join(SKILLS_DIR, name, 'SKILL.md');

  let fields: Record<string, string> | null;
  try {
    fields = readFrontmatter(skillFile);
  } catch {
    return [{ skill: name, message: 'has no SKILL.md' }];
  }

  if (!fields) {
    return [{ skill: name, message: 'SKILL.md has no YAML frontmatter delimited by ---' }];
  }

  // The name is the skill's identity: clients key on it, and a mismatch with
  // the directory means two clients can disagree about what the skill is called.
  if (!fields.name) {
    failures.push({ skill: name, message: 'SKILL.md frontmatter has no `name`' });
  } else if (fields.name !== name) {
    failures.push({
      skill: name,
      message: `frontmatter name "${fields.name}" does not match its directory`,
    });
  }

  // The description is the only thing an agent sees before deciding to load the
  // skill. Without it the skill is installed but never activates.
  if (!fields.description) {
    failures.push({ skill: name, message: 'SKILL.md frontmatter has no `description`' });
  }

  const link = join(CLAUDE_DIR, name);
  let target: string | null = null;
  try {
    target = lstatSync(link).isSymbolicLink() ? resolve(CLAUDE_DIR, readlinkSync(link)) : link;
  } catch {
    failures.push({
      skill: name,
      message:
        'not linked into .claude/skills — Claude Code will not see it. ' +
        `Fix: ln -s ../../.agents/skills/${name} .claude/skills/${name}`,
    });
  }

  if (target && target !== join(SKILLS_DIR, name)) {
    failures.push({
      skill: name,
      message: `.claude/skills/${name} resolves to ${target}, not the skill in .agents/skills`,
    });
  }

  return failures;
}

function main(): void {
  let names: string[];
  try {
    names = readdirSync(SKILLS_DIR).filter((entry) =>
      statSync(join(SKILLS_DIR, entry)).isDirectory(),
    );
  } catch {
    console.log(`${DIM}No .agents/skills directory yet — skipping.${RESET}`);
    return;
  }

  if (names.length === 0) {
    console.log(`${DIM}No skills to validate.${RESET}`);
    return;
  }

  const failures = names.flatMap(validateSkill);

  // A directory under .claude/skills that no longer has a counterpart is a
  // leftover from a renamed or deleted skill, and shadows nothing but confuses
  // everyone reading it.
  try {
    for (const entry of readdirSync(CLAUDE_DIR)) {
      if (names.includes(entry)) continue;
      failures.push({
        skill: entry,
        message: 'exists in .claude/skills with no matching skill in .agents/skills',
      });
    }
  } catch {
    // No compatibility directory at all is reported per-skill above.
  }

  if (failures.length > 0) {
    console.error(`${RED}✗ Skill validation failed: ${failures.length} issue(s)${RESET}\n`);
    let current = '';
    for (const { skill, message } of failures) {
      if (skill !== current) {
        console.error(`${YELLOW}${skill}${RESET}`);
        current = skill;
      }
      console.error(`  ${DIM}•${RESET} ${message}`);
    }
    console.error(
      `\n${DIM}Skills live in .agents/skills (vendor-neutral, per agentskills.io).` +
        `\n.claude/skills holds one symlink per skill, because Claude Code scans only its own directory.${RESET}`,
    );
    process.exit(1);
  }

  console.log(`${GREEN}✓ Validated ${names.length} agent skill(s)${RESET}`);
}

main();
