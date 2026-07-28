---
name: write-research
description: Write, restructure, or register an InvestMoat research article — the cross-cutting analysis published at /research and stored as JSON in src/data/research/. Use when drafting a new article, planning or editing its blocks, choosing which tickers a piece covers, or wiring a finished article into the registry. Triggers on requests like "write a research piece on X", "an article about this cohort", "add a research article", a category-wide or cross-ticker thesis, or any edit to src/data/research/*.json. For the editorial rules that govern prose and figures, use the research-style skill alongside this one.
---

# Writing a research article

A stock page underwrites one name. A research article reads **across** the
coverage universe — a cohort, a category-wide narrative, or a place where the
market's story and the framework's scores disagree. If the argument fits inside
one ticker, it belongs in that stock's JSON, not here.

Article JSON lives in `src/data/research/{slug}.json`. Format reference:
[`docs/RESEARCH.md`](../../../docs/RESEARCH.md). Schema of record:
[`src/lib/researchSchema.ts`](../../../src/lib/researchSchema.ts) (mirrored in
`src/types/research.ts` — when one changes, change both).

**Before writing a single block, read the editorial rules in the
`research-style` skill.** The governing constraint — an article carries
tickers, never numbers — shapes the block plan, not just the wording, and the
build rejects violations.

## Step 1 — Test the idea

An idea qualifies as an article only if it clears all three:

1. **Cross-cutting.** It reads on 4+ covered names, and the comparison is the
   point. Two names is a paragraph on a stock page.
2. **Contested.** There is a prevailing market narrative the framework
   disagrees with, or a sorting the market applies that the moat data does not
   support. An article that agrees with consensus tells the reader nothing.
3. **Falsifiable.** You can state, in one sentence, the specific observation
   that would prove the thesis wrong. This becomes `falsifiableBy`. If you
   can't write that sentence, the thesis is a vibe.

State the thesis in one sentence before drafting. If it takes two, it is
probably two articles — or one that hasn't found its argument yet.

## Step 2 — Fix the cohort

List the tickers the piece covers, then verify each one resolves in **both**
registries. A ticker in only one renders a blank row or a dead link:

```bash
# Coverage registry (supplies the scores) — src/app/stockData.ts
grep -n 'ticker: "NOW"' src/app/stockData.ts
# Page registry (supplies moat statuses and the link target) — src/data/stocks/index.ts
grep -n "^import now " src/data/stocks/index.ts
```

`npm run validate:research` enforces this, but checking first stops you from
building an argument on a name the site doesn't cover. If a name is central to
the thesis and isn't covered, add it with `/add-stock` before writing — do not
work around the gap with prose.

A good cohort has an internal contrast: a natural control group (as in
seat-billed vs. consumption-billed), or a spread from the thesis's clearest
case to its honest counter-example. A cohort where every name agrees with you
is a cohort you picked badly.

## Step 3 — Plan the blocks before writing prose

Decide the sequence of blocks first, then write into it. The block plan *is*
the argument's structure.

See [`references/block-playbook.md`](references/block-playbook.md) for what
each block is for, when each one is the wrong choice, and the article arc the
existing piece follows.

The short version: `scorecard` and `moat-matrix` carry evidence about covered
names and resolve live. `table` carries company-reported figures and demands an
`asOf`. `callout` marks the turn in the argument. `prose` connects them. If a
block isn't doing work the surrounding prose can't, cut it.

## Step 4 — Write the JSON

Field rules are tabulated in `docs/RESEARCH.md`. The ones that get fumbled:

- `slug` — lowercase kebab-case, and it must match in **three** places: the
  filename, the `slug` field, and the key in `index.ts`.
- `dek` — one sentence, ≤320 chars, does real work: it is reused for the page
  metadata and the index card. Write it last, once you know the argument.
- `published` / `lastReviewed` — day-precision, exactly `"July 28, 2026"`.
  Identical on a new article.
- `summary` — 2–5 sentences, used in the Markdown mirror and JSON-LD
  `abstract`. Must stand alone: a reader who sees only this should get the
  thesis and the mechanism, not a teaser.
- `falsifiableBy` — technically optional, treat it as required. It renders as
  its own section and is the review trigger.
- `tags` — 1–6 labels; reuse existing ones where they fit.

Inline markup in prose is `**bold**` and `[text](href)` only. Anything richer
belongs in a block type — that keeps articles diffable and renderable to clean
Markdown at `/research/{slug}/llms.txt`.

## Step 5 — Register and validate

One registry, unlike stocks. In `src/data/research/index.ts`:

```typescript
import mySlug from './my-slug.json';
// and in researchArticles:
'my-slug': mySlug as ResearchArticleData,
```

Then:

```bash
npm run validate:research   # schema, slug match, ticker coverage, group partitioning, prose lint
npm run lint
```

Everything downstream is automatic once it validates: the `/research` index,
the sitemap entry, `/llms.txt`, the Markdown mirror, the OG image, and the
"Research Covering This Name" backlink on every stock page whose ticker the
article cites.

## Checklist before calling it done

- [ ] Thesis is one sentence, and `falsifiableBy` names what would break it.
- [ ] The cohort includes an honest counter-example, addressed head-on rather
      than buried.
- [ ] Every score, moat status and recommendation on the page comes from a
      live block — nothing transcribed. `validate:research` reports no errors.
- [ ] Every `table` has an `asOf`, and every static figure in it is attributable
      to a company report.
- [ ] `slug` matches in filename, `slug` field, and `index.ts` key.
- [ ] Grouped blocks partition their tickers exactly — every ticker in exactly
      one group.
- [ ] The piece would still read correctly if every live number moved 10 points
      tomorrow. If a sentence would break, it is transcribing.
