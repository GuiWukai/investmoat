---
name: research-style
description: Editorial rules and house voice for InvestMoat research articles in src/data/research/ — the "carry tickers, never numbers" invariant, what may and may not be written into prose, and how to fix the prose lint that enforces it. Use when writing or editing article prose, when reviewing an article for publication, when deciding whether a figure belongs in prose or a live block, or when `npm run validate:research` reports a prose error, drift warning, or re-verify note. Pairs with the write-research skill, which covers structure and registration.
---

# Research article style

## The rule everything else follows

**An article never hard-codes a score, a moat status, or a price.**

The site's credibility rests on *edit the data, not the numbers*: every figure
on `/stocks` and `/portfolio` is computed from a stock JSON by a documented
formula. The sentence "NOW scores 83" freezes a number the rest of the site
keeps current — and the next earnings review turns it into a lie nobody notices.

So articles carry **tickers**, and the live blocks resolve them at render time
against the same data path `/stocks` uses. Update a stock after earnings and
every article citing it corrects itself.

### The test

Ask of every figure: *would this change when a stock is re-reviewed?*

| Figure | Where it goes |
|---|---|
| Composite, moat, growth, valuation score | `scorecard` or `stat-strip` with `live` |
| Recommendation label | `scorecard` (it's computed from the composite) |
| Live price | `stat-strip` with `live: { field: "price" }` |
| Moat pillar status | `moat-matrix` |
| Bear / base / bull target | `scorecard` — or name the ticker and let the reader click |
| Company-reported metric (revenue, ACV, NRR, guidance) | `table` with `asOf`, or prose naming the reporting period |

Company figures are *not* framework outputs and are never the problem. Quote
them freely — the `asOf` stamp and a citation are what keep them honest. Every
`table` and `chart` names the document its figures came from; see the
`source-research` skill.

A useful gut check on a finished draft: **if every live number moved ten points
tomorrow, would any sentence become false?** If yes, that sentence is
transcribing rather than arguing.

## The lint

`npm run validate:research` runs the prose rules in
`scripts/researchProseLint.ts`, in three grades:

**`error` — fails the build.** A framework output transcribed into text, or a
static number sitting where a live lookup belongs.

- *"NOW scores 83"*, *"a moat score of 90"*, *"83/100"* → carry the ticker; put
  it in a `scorecard` and let the prose describe the *shape* of the result
  ("the framework rates it above the cohort") rather than its value.
- *"Strong Buy"*, *"rated Accumulate"* → the recommendation is derived. A
  `scorecard` renders it.
- `{ label: "Composite", value: "83" }` → use `live: { ticker, field }`.
- A `table` row labelled "Composite" carrying a bare number → move it to a
  `scorecard`.

**`warning` — a scenario target written into prose.** Bear/base/bull targets
move on every review. Usually fixable by naming the ticker and letting the
scorecard carry the number. Occasionally the target *is* the subject of the
sentence and the warning is an accepted cost — in that case it becomes a thing
to check at `lastReviewed`.

**`note` — a moat status named in prose.** Not a defect. A cross-read argument
has to be able to say "all four AI-resilient pillars strong"; the matrix shows
it, the prose has to interpret it. These are the **re-verify list**: when you
bump `lastReviewed`, walk the notes and confirm each named status still matches
the stock JSON. A pillar quietly downgraded from `strong` to `weakened` is
exactly the rot that turns a good article into a wrong one.

Errors are never "fixed" by rephrasing to dodge the regex. If the number is a
framework output, it belongs in a live block, whatever the wording.

The lint also reads the article as a whole and reports what an editor would
notice on a read-through:

- **unsourced `table` or `chart`** (`warning`) — company figures a reader can't
  check. Fix with the `source-research` skill.
- **a source nothing cites** (`warning`) — cite it or drop it.
- **a trailing `method` callout** (`warning`) — the method footer is rendered
  by the article template now. Delete the authored copy.
- **no counter-case section, or one under 10% of the article** (`note`) — see
  below.
- **no `falsifiableBy`** (`note`) — nothing for `/review-research` to test.

## House voice

**Argue, don't summarise.** Every article contests something — a market
narrative, a category-wide re-pricing, a sorting the data doesn't support. If
the piece agrees with consensus throughout, it has no reason to exist.

**Evidence before interpretation.** Show the data, then say what it means.
The `table` and the `scorecard` come before the paragraph that reads them.

**Steelman the other side, in its own section, at length.** The strongest
article names the cohort member where the bear case is *correct* and explains
why, before positioning. Adobe plays that role in the ServiceNow piece. An
article that never reaches its counter-case is advocacy; one that reaches it in
two sentences is advocacy with a disclaimer.

The lint measures this — a counter-case under 10% of the article's words is a
`note`. Treat 10% as the floor, not the target. The test that matters is
whether a reader who *holds* the opposite view would recognise their own
argument in the section, stated at its strongest rather than at its most
convenient.

**State the mechanism.** Not "these companies are better positioned" but the
specific structural reason — what an agent must route through, what an
enterprise cannot decommission. Claims without mechanism are horoscopes.

**Be concrete about what would break it.** `falsifiableBy` is one sentence
naming an observable outcome, with a threshold and a timeframe where possible.
"Execution risk" is not falsifiable. "AI ACV stalling short of the $1.5B FY2026
target while subscription growth slips below 18%" is.

**Register.** Measured, specific, unhedged where the evidence supports it.
Bold marks the load-bearing claim of a paragraph, at most one per paragraph.
Avoid: hype adjectives, exclamation, "we believe" throat-clearing, and the
false balance of ending every paragraph with a caveat. One honest "one quarter
does not settle it" beats five hedges.

**Say when.** Company figures carry their reporting period ("Q2 2026"), and
anything static that isn't in a `table` still names its date in the sentence.

## Reviewing an existing article

Use the `review-research` skill — it carries the full loop, including the
`falsifiableBy` status, the revision log and what to do with an article whose
thesis has been tripped. In short:

1. Run `npm run validate:research` and work the notes — every moat status named
   in prose, checked against the stock JSON.
2. Test `falsifiableBy` and set its status. If it has tripped, the article needs
   a correction, not a date bump.
3. Check every `table` and `chart` — `asOf` current, citations still resolving.
4. Append a revision entry and bump `lastReviewed` even if the prose didn't
   change. It drives the sitemap's `lastModified` and is the site's only visible
   answer to "has anyone checked this lately".
