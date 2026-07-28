# Research articles

Cross-cutting analysis lives in [`src/data/research/`](../src/data/research) and renders at `/research` and `/research/[slug]`. Where a stock page underwrites one name, a research article reads across the universe — cohorts, category-wide narratives, and places where the market's story and the framework's scores disagree.

## The rule that shapes everything

**An article never hard-codes a score, a moat status, or a price.**

The site's credibility rests on *"edit the data, not the numbers"* — every figure on `/stocks` and `/portfolio` is computed from a JSON file by a documented formula. Prose breaks that discipline the moment it says "MSFT scores 83", because the sentence freezes a number the rest of the site keeps current.

So articles carry **tickers, not numbers**. The `scorecard`, `moat-matrix` and live `stat-strip` blocks resolve against `allCoverageData` and the stock JSONs at render time, with the valuation pillar recomputed from the live Yahoo price — the same path `/stocks` uses. Update a stock after earnings and every article citing it corrects itself.

Anything genuinely static (a capex guide, a quarterly metric) goes in a `table`, which **requires** an `asOf` stamp so a stale figure is visibly stale.

## Adding an article

1. Write `src/data/research/{slug}.json` (see the block reference below).
2. Register it in [`src/data/research/index.ts`](../src/data/research/index.ts) — one import, one map entry.
3. Run `npm run validate:research`.

Unlike stocks there is **one** registry, not two — articles aren't scored or ranked, so nothing equivalent to `src/app/stockData.ts` is needed. The slug must match in three places: the filename, the `slug` field, and the key in `index.ts`.

Everything downstream is automatic: the `/research` index, the sitemap entry, the site-level `llms.txt` listing, the Markdown mirror at `/research/{slug}/llms.txt`, the OG share image, and the "Research Covering This Name" section on every stock page whose ticker the article references.

## Article fields

| Field | Notes |
|---|---|
| `slug` | Lowercase kebab-case; must match the filename. |
| `title`, `dek` | Headline and one-sentence standfirst. The dek is reused for metadata and the index card. |
| `published`, `lastReviewed` | Day-precision dates, e.g. `"July 28, 2026"`. Both are shown on the page. |
| `tickers` | Names the article covers. Drives the ticker rail, the stock-page backlink, and index filtering. |
| `tags` | 1–6 short topic labels. |
| `summary` | 2–5 sentences. Used in the Markdown mirror and JSON-LD `abstract`. |
| `falsifiableBy` | What would prove the thesis wrong. Optional but strongly encouraged — it's rendered as its own section. |
| `blocks` | The body. See below. |

### `lastReviewed` is doing real work

Stock pages have an earnings-driven refresh trigger (`/update-stock`); articles have none, so they rot silently. `lastReviewed` is the visible answer to "has anyone checked this lately", and it drives the sitemap's `lastModified`. Update it whenever you re-read an article against the current data, even if the prose doesn't change.

## Block reference

| Block | Live? | Purpose |
|---|---|---|
| `prose` | — | A paragraph. Supports `**bold**` and `[text](href)` only. |
| `heading` | — | Section heading with an optional gold `eyebrow`. |
| `list` | — | Bulleted (or `ordered`) list; items support the same inline markup. |
| `callout` | — | Pull-out note. `tone` is `insight` \| `risk` \| `method`. |
| `scorecard` | **Yes** | Moat / growth / valuation / composite / recommendation per ticker, optionally `groups`-divided and `sort`ed. |
| `moat-matrix` | **Yes** | Tickers × up to 5 moat pillars, statuses read from each stock's `tenMoats`. |
| `stat-strip` | Partly | 2–5 headline figures. A stat has either a static `value` or a `live: { ticker, field }`. |
| `table` | — | Static table. `asOf` required; rows must match the column count. |

Inline markup is deliberately minimal. Anything richer belongs in a block type — that keeps articles diffable, machine-readable, and renderable to clean Markdown for agents.

## Validation

```bash
npm run validate:research
```

Wired into `prebuild`, so a malformed article fails the build. Beyond the Zod schema it checks that:

- the `slug` matches the filename;
- **every ticker referenced anywhere** — top-level, in a scorecard, a matrix, a grouped list, or a live stat — exists in the coverage registry;
- grouped blocks partition their tickers exactly, so no row silently vanishes from a rendered table.

That ticker check is the important one. An article citing a ticker the site doesn't cover would render a blank row and a dead link — precisely the silent rot the live-scores design exists to prevent.

### The prose lint

Structure is only half the problem. The rule at the top of this page — *never hard-code a score, a moat status, or a price* — is an editorial rule the schema cannot see, so [`scripts/researchProseLint.ts`](../scripts/researchProseLint.ts) reads the article's text and grades what it finds:

| Grade | Meaning | Build |
|---|---|---|
| `error` | A framework output transcribed into text, or a static number where a live lookup belongs — `"NOW scores 83"`, a `"Strong Buy"` label, a `stat-strip` stat labelled *Composite* carrying a static `value`. | Fails |
| `warning` | A scenario price target written into prose. It moves on the next review of that stock; the sentence won't. | Passes |
| `note` | A moat status named in prose. Not a defect — a cross-read argument has to interpret the matrix — but it is the list to re-verify when `lastReviewed` is bumped. | Passes |

Company-reported figures (revenue, ACV, NRR, guidance) are never flagged. They aren't framework outputs, and the `table` block's mandatory `asOf` is what keeps them honest.

## Authoring skills

Two Claude Code skills in [`.claude/skills/`](../.claude/skills) carry this document's rules into the editor, and load automatically when an article is being written or reviewed:

| Skill | Covers |
|---|---|
| `write-research` | Thesis tests, cohort selection, the block plan and article arc, the JSON shape, registration, validation. Its `references/block-playbook.md` is the per-block guide. |
| `research-style` | The "tickers, never numbers" invariant, what belongs in prose vs. a live block, how to fix each lint grade, and the house voice. |

Stock authoring has the equivalent slash commands in [`.claude/commands/`](../.claude/commands): `/add-stock`, `/analyse-stock`, `/update-stock`.

## Agent surfaces

Research is wired into the same agent-readability layer as the stock pages:

- `/research/{slug}/llms.txt` — clean Markdown mirror, with live blocks resolved from the stock data so the mirror can't contradict the page.
- `/llms.txt` — site index gains a **Research** section listing every article with its coverage and review date.
- `AnalysisNewsArticle` JSON-LD per article, including `about` entries for each ticker and an `encoding` pointer to the Markdown mirror.
- `sitemap.xml` — the index plus one entry per article, `lastModified` from `lastReviewed`.
