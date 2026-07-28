# Block playbook

What each block is for, when it's the wrong choice, and how they sequence into
an argument. Schema of record: `src/lib/researchSchema.ts`.

## The choice that matters most

Every figure an article shows is either **computed by the framework** (score,
moat status, recommendation, live price) or **reported by a company** (revenue,
ACV, renewal rate, guidance).

- Framework figures → a **live block** (`scorecard`, `moat-matrix`,
  `stat-strip` with `live`). Never prose, never a table.
- Company figures → a **`table`** with an `asOf`, or prose with the reporting
  period named.

Getting this wrong is the one mistake that fails the build. See the
`research-style` skill.

## Block reference

### `prose`
The connective tissue and the argument itself. `**bold**` and
`[text](href)` only.

Bold carries the load-bearing claim of a paragraph — one per paragraph at most.
The existing article uses it to mark exactly the sentences a skimming reader
must not miss ("ServiceNow is the purest test of that thesis").

A paragraph that only restates the block above it is padding. Cut it.

### `heading`
An `<h2>` and anchor target, with an optional gold `eyebrow`.

The eyebrow names the *move* the section makes, not its topic: "The evidence",
"The cross-read", "The mechanism", "The counter-case", "Positioning". The
heading text then states the claim: "Billing model is the wrong variable". A
heading that could sit above any section ("Analysis", "Discussion") is wasted.

### `list`
2+ items, `ordered` optional, same inline markup as prose.

Use when items are genuinely parallel — the four moat pillars, three risks in
priority order. A list of non-parallel points is prose that lost its verbs.
Lead each item with a bolded label when the items name things.

### `callout`
`tone` is `insight` | `risk` | `method`.

- `insight` — the generalisable test or lesson the reader should take away and
  apply elsewhere. The turn in the argument.
- `risk` — what breaks the thesis, stated concretely and in priority order.
  Pairs with `falsifiableBy`; the callout is the expanded version.
- `method` — how to read the page: which numbers are live, which are static,
  what date the static ones carry. Most articles want one, near the end.

Three or four callouts is a lot. Each one should mark a genuine turn.

### `scorecard` — **live**
Moat / growth / valuation / composite / recommendation per ticker, resolved
from the coverage registry at render time with valuation recomputed against the
live price.

- Minimum 2 tickers.
- `groups` divide the table — use them when the split *is* the argument
  (seat-billed vs. consumption-billed). Groups must partition `tickers`
  exactly: every listed ticker in exactly one group, no extras. Validation
  fails otherwise.
- `notes` — one short line per ticker. This is where a company-reported metric
  earns its place next to a live score ("NDR 139%, but AI-native competition is
  months old"). Keep them to a clause or two.
- `sort` — `composite` when ranking is the point, `given` when your ordering
  carries meaning.

Wrong choice when: you want to show two or three figures for one company —
that's a `stat-strip`. Or when the figures are company-reported — that's a
`table`.

### `moat-matrix` — **live**
Tickers × up to 5 moat pillars, statuses read from each stock's `tenMoats`.

This is the block that does what no other site surface does: it makes a
cross-cohort moat pattern visible in one grid. Pick the pillars that carry the
thesis (the four AI-resilient ones, or the pillars the market is mispricing) —
not all ten, and the schema caps it at five.

Same grouping rule as `scorecard`. Best used immediately after a `scorecard`
that failed to sort the cohort cleanly: the scorecard shows the market's
sorting doesn't work, the matrix shows what sorting does.

### `stat-strip` — **partly live**
2–5 headline figures. Each stat has **exactly one** of `value` (static) or
`live: { ticker, field }`, where field is `composite` | `moat` | `growth` |
`valuation` | `price`. Optional `note` beneath.

Almost always the opening block: the framework's read on the central name
before the prose starts arguing. If a stat is labelled "Composite" and carries
a static `value`, that's an error — it must be `live`.

### `table` — static
Requires `asOf`. Rows must match the column count. `highlightColumn` optional.

The only sanctioned home for company-reported figures. The strongest use adds a
column explaining *what each row tests* — turning a data dump into evidence
about the thesis, as the ServiceNow Q2 table does with its "What it tests"
column.

Wrong choice when: any cell is a framework score. That fails the build.

## The arc

The existing article
(`src/data/research/servicenow-and-the-seat-pricing-question.json`) follows a
sequence worth reusing:

1. `stat-strip` — the framework's live read on the central name.
2. `prose` ×2 — the fear/narrative, then why this name is the cleanest test.
3. `heading` "The evidence" → `table` → `prose` — company-reported data, and
   what pattern in it would settle the question.
4. `callout` insight — the generalisable test extracted from that data.
5. `heading` "The cross-read" → `prose` → `scorecard` — apply the market's
   sorting to the whole cohort; show it doesn't sort.
6. `prose` → `moat-matrix` → `prose` — the sorting that does work.
7. `heading` "The mechanism" → `prose` → `list` — why it works, pillar by pillar.
8. `heading` "The counter-case" → `prose` — the name that proves the fear is
   sometimes right, and the name sitting between the poles.
9. `heading` "Positioning" → `prose` → `callout` risk — what the framework
   concludes, then what would break it.
10. `prose` — the lesson that generalises past this cohort.
11. `callout` method — how to read the numbers on the page.

Not a template to fill mechanically. The load-bearing parts are: evidence
before interpretation, the cohort read before the conclusion, and the
counter-case *before* positioning rather than after it. An article that never
reaches step 8 is advocacy.
