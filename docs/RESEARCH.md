# Research articles

Cross-cutting analysis lives in [`src/data/research/`](../src/data/research) and renders at `/research` and `/research/[slug]`. Where a stock page underwrites one name, a research article reads across the universe — cohorts, category-wide narratives, and places where the market's story and the framework's scores disagree.

## The rule that shapes everything

**An article never hard-codes a score, a moat status, or a price.**

The site's credibility rests on *"edit the data, not the numbers"* — every figure on `/stocks` and `/portfolio` is computed from a JSON file by a documented formula. Prose breaks that discipline the moment it says "MSFT scores 83", because the sentence freezes a number the rest of the site keeps current.

So articles carry **tickers, not numbers**. The `scorecard`, `moat-matrix` and live `stat-strip` blocks resolve against `allCoverageData` and the stock JSONs at render time, with the valuation pillar recomputed from the live Yahoo price — the same path `/stocks` uses. Update a stock after earnings and every article citing it corrects itself.

Anything genuinely static (a capex guide, a quarterly metric) goes in a `table` or a `chart`, which **require** an `asOf` stamp so a stale figure is visibly stale — and a `sources` reference so a reader can check it against the document it came from. A live figure corrects itself; a company figure can only be checked against its source.

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
| `falsifiableBy` | `{ claim, status, note? }`. What would prove the thesis wrong, and where it stands: `holding` \| `watch` \| `tripped` \| `retired`. A status other than `holding` requires a `note`. Optional but strongly encouraged — it renders as its own section with a status badge. |
| `sources` | Primary documents behind the static figures: `{ id, label, publisher?, date, url, kind }`. Referenced by `id` from a `table` or `chart`. |
| `revisions` | `{ date, note }[]`, newest first. Written by a review, not a rewrite. Renders as a visible revision log. |
| `blocks` | The body. See below. |

### `falsifiableBy` is a claim with a status, not a sentence

A falsifiable claim nobody ever re-tests is decoration. Carrying the status as data means the re-read has somewhere to put its answer, a reader can see the thesis has been checked since publication, and an article whose thesis has failed says so on its own page instead of standing quietly. `/review-research` walks it; the schema refuses a non-`holding` status without a note explaining what the data shows.

### `lastReviewed` is doing real work

Stock pages have an earnings-driven refresh trigger (`/update-stock`); articles have none, so they rot silently. `lastReviewed` is the visible answer to "has anyone checked this lately", and it drives the sitemap's `lastModified`. Update it whenever you re-read an article against the current data, even if the prose doesn't change.

The re-read itself is the `review-research` skill: work the lint's re-verify notes against the stock JSONs, test `falsifiableBy` and set its status, age-check every `asOf` and citation, then append a `revisions` entry saying what moved and what didn't. A review that finds nothing still bumps the date — that is the case where the date is doing the most work.

## Block reference

| Block | Live? | Purpose |
|---|---|---|
| `prose` | — | A paragraph. Supports `**bold**`, `*emphasis*` and `[text](href)` only. |
| `heading` | — | Section heading with an optional gold `eyebrow`. |
| `list` | — | Bulleted (or `ordered`) list; items support the same inline markup. |
| `callout` | — | Pull-out note. `tone` is `insight` \| `risk` \| `method`. |
| `scorecard` | **Yes** | Moat / growth / valuation / composite / recommendation per ticker, optionally `groups`-divided and `sort`ed. `sort` sets the *initial* order; a reader can re-sort from any column header. |
| `moat-matrix` | **Yes** | Tickers × up to 5 moat pillars, statuses read from each stock's `tenMoats`. |
| `stat-strip` | Partly | 2–5 headline figures. A stat has either a static `value` or a `live: { ticker, field }`. |
| `table` | — | Static table for one period. `asOf` required, `sources` expected; rows must match the column count. |
| `chart` | — | Static series — `line` or `bar`, up to 4 series over shared `categories`, `null` for a period not reported. Same `asOf` / `sources` rules. Inline SVG plus a screen-reader table; degrades to a Markdown table in the mirror. Use when the shape over time *is* the argument. |

Inline markup is deliberately minimal. Anything richer belongs in a block type — that keeps articles diffable, machine-readable, and renderable to clean Markdown for agents.

## Reading experience

Nothing below is authored — the renderer derives it from the blocks, so it can never drift from the article:

- **Contents.** Every `heading` becomes an anchor (`#the-heading-text`) and an entry in the contents list, together with the thesis panel, the falsifiable-claim section, Sources and Revisions. On wide screens a sticky rail in the gutter tracks the active section. Below `xl` the contents panel pins under the progress rule as the reader scrolls — carrying the current heading and remaining time — because the mobile header itself is not sticky.
- **Reading time.** Computed in [`src/lib/researchMeta.ts`](../src/lib/researchMeta.ts) from word count plus a scanning allowance per data block. Shown on the article and on the index card; the sticky contents bar counts it down.
- **Thesis in brief.** `summary` is surfaced above the body, so a reader who bounces still leaves with the argument.
- **Method note.** Every article with a live block gets the "how to read the numbers on this page" footer, rendered from the template. It used to be copied into each article as a `method` callout, which meant three articles carrying three drifting accounts of one mechanism. Don't author one; the lint warns if you do.
- **Sources and revisions.** `sources` renders as a numbered list at the foot, with matching citation links under each table and chart. `revisions` renders as a dated log ending in "Published". Both are in the contents list.
- **Phone layout.** `scorecard` and `moat-matrix` rows render as cards below `sm` rather than a clipped table; scorecard cards can be re-sorted from a chip row. The remaining wide tables keep a horizontal scroller with a pinned first column and edge fades. Charts scale to the viewport (no forced min-width), expose their numbers in a table underneath, and highlight a period on tap or hover so a value is never locked in a picture. Share uses the platform sheet when the browser has one, and copies the URL including the current section hash otherwise. The `/research` index trims itself the same way: below `sm` a card shows one tag, a two- or three-line dek and four tickers with a `+N more` tail, the "Read" affordance drops (the card is the tap target), and the theme filter becomes a one-line horizontal scroller. Nothing is removed above `sm` — the trimming is CSS on identical markup, so server and client render the same tree.
- **Scorecard sorting.** `sort` sets the initial order; column headers (and the phone chip row) re-sort client-side, and "Reset order" restores the article's own.

## Validation

```bash
npm run validate:research
```

Wired into `prebuild`, so a malformed article fails the build. Beyond the Zod schema it checks that:

- the `slug` matches the filename;
- **every ticker referenced anywhere** — top-level, in a scorecard, a matrix, a grouped list, or a live stat — exists in the coverage registry;
- grouped blocks partition their tickers exactly, so no row silently vanishes from a rendered table;
- source ids are unique and every `sources` reference on a block resolves;
- revision dates read newest first and sit between `published` and `lastReviewed`.

That ticker check is the important one. An article citing a ticker the site doesn't cover would render a blank row and a dead link — precisely the silent rot the live-scores design exists to prevent.

### The prose lint

Structure is only half the problem. The rule at the top of this page — *never hard-code a score, a moat status, or a price* — is an editorial rule the schema cannot see, so [`scripts/researchProseLint.ts`](../scripts/researchProseLint.ts) reads the article's text and grades what it finds:

| Grade | Meaning | Build |
|---|---|---|
| `error` | A framework output transcribed into text, or a static number where a live lookup belongs — `"NOW scores 83"`, a `"Strong Buy"` label, a `stat-strip` stat labelled *Composite* carrying a static `value`, a `chart` series named *Composite*. | Fails |
| `warning` | A scenario price target written into prose; a `table` or `chart` with no `sources`; a source nothing cites; a trailing `method` callout duplicating the rendered footer. | Passes |
| `note` | A moat status named in prose (the list to re-verify when `lastReviewed` is bumped); a missing or thin counter-case; a missing `falsifiableBy`. | Passes |

Company-reported figures (revenue, ACV, NRR, guidance) are never flagged as errors. They aren't framework outputs — the mandatory `asOf` and the `sources` citation are what keep them honest.

The counter-case check measures it: a counter-case section under 10% of the article's words earns a note. The house rule is "steelman the other side, in its own section", and a section that is two sentences long is a disclaimer wearing a heading.

## Authoring skills

Five skills in [`.agents/skills/`](../.agents/skills) carry this document's rules into the editor, and load automatically at the point in the lifecycle they belong to:

| Skill | Covers |
|---|---|
| `research-ideas` | Finding the next article in the coverage data rather than in an earnings headline. Wraps `npm run screen:research`. |
| `write-research` | Thesis tests, cohort selection, the block plan and the four article arcs, the JSON shape, registration, validation. Its `references/block-playbook.md` is the per-block guide. |
| `research-style` | The "tickers, never numbers" invariant, what belongs in prose vs. a live block, how to fix each lint grade, and the house voice. |
| `source-research` | Citing company figures: what counts as primary, the `sources` wiring, cross-company tables, fixing the unsourced-block warning. |
| `review-research` | The re-read loop — testing `falsifiableBy`, re-verifying moat statuses named in prose, age-checking tables, writing a revision entry, bumping `lastReviewed`. |

Each skill is a directory holding a `SKILL.md` with `name` and `description` frontmatter, per the [Agent Skills](https://agentskills.io) spec. `.agents/skills/` is the vendor-neutral location, read directly by Cursor, GitHub Copilot and other compliant clients. Claude Code scans only `.claude/skills/`, so that directory holds a symlink per skill pointing back at `.agents/skills/` — the files themselves live in one place, and adding a skill means creating it under `.agents/skills/` and adding the matching symlink.

Stock authoring has the equivalent slash commands in [`.claude/commands/`](../.claude/commands): `/add-stock`, `/analyse-stock`, `/update-stock`. Slash commands have no cross-agent standard, so these stay Claude Code specific.

## The idea pipeline

```bash
npm run screen:research                          # category spread, rank divergence, coverage gaps
npm run screen:research -- pillars systemOfRecord
npm run screen:research -- divergence 20
npm run screen:research -- uncovered
npm run screen:research -- stale
```

[`scripts/research-screen.ts`](../scripts/research-screen.ts) reads the coverage registry and the stock JSONs and reports the cohorts, rank disagreements, category spreads and coverage gaps an article could be built on. It decides nothing — a screen produces candidates, and the article test in `write-research` decides whether a candidate is a piece.

## Agent surfaces

Research is wired into the same agent-readability layer as the stock pages:

- `/research/{slug}/llms.txt` — clean Markdown mirror, with live blocks resolved from the stock data so the mirror can't contradict the page.
- `/llms.txt` — site index gains a **Research** section listing every article with its coverage and review date.
- `AnalysisNewsArticle` JSON-LD per article, including `about` entries for each ticker and an `encoding` pointer to the Markdown mirror.
- `sitemap.xml` — the index plus one entry per article, `lastModified` from `lastReviewed`.
