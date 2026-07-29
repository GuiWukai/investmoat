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
Requires `asOf` and, in practice, `sources`. Rows must match the column count.
`highlightColumn` optional.

The sanctioned home for company-reported figures at a point in time. The
strongest use adds a column explaining *what each row tests* — turning a data
dump into evidence about the thesis, as the ServiceNow Q2 table does with its
"What it tests" column.

Wrong choice when: any cell is a framework score. That fails the build.

### `chart` — static
A series, not a snapshot. `variant` is `line` | `bar`; `categories` are the
x-axis labels (usually reporting periods), `series` up to four named lines or
bar groups with one value per category — `null` where a company didn't report.
Optional `unit` ("%") and `prefix` ("$"). Same rules as `table`: `asOf` required,
`sources` expected, framework outputs forbidden (a series named "Composite"
fails the build).

Reach for it when the **shape over time** is the argument and a table would
make the reader do the differencing themselves:

- Two rates diverging or converging — the S&P Global piece's core claim.
- A quantity outrunning another — backlog against capex.
- An inflection: the quarter something turned.

Wrong choice when: one period (that's a `table`), two data points (that's a
sentence), or a series where each point comes from a different definition —
label drift inside a chart is invisible in a way it isn't in a table.

Renders as inline SVG with a screen-reader table carrying the same numbers, and
degrades to a Markdown table in the `/llms.txt` mirror. Nulls break the line
rather than interpolating across them.

## Choosing an arc

Four shapes. Pick the one the argument actually has — a piece forced into the
wrong arc reads as a template being filled, and a site where every article has
the same spine teaches the reader to skim it.

**1. The cross-read** (below). A category-wide narrative meets the cohort data
and doesn't survive it. The default, and the one all three published articles
use — which is the reason to consider the others first.

**2. The screen.** Starts from the data, not a narrative: a `scorecard` or
`moat-matrix` opens the piece, and the argument is what the sorting reveals.
Arc: matrix → what it shows → the names that break the pattern → mechanism →
what it means for positioning. Best when the finding came out of
`npm run screen:research` rather than a print.

**3. The post-mortem.** Re-reads a thesis the site already published — its own
or the market's — against what actually happened. Arc: the claim as it stood →
what was predicted → `chart` or `table` of what occurred → what the framework
got right and wrong → the corrected view. Requires a `falsifiableBy` that has
been tested. The most credible thing the site can publish, and currently the
one shape it has never used.

**4. The framework note.** The subject is the framework itself: why a pillar is
weighted as it is, where the composite misleads, what a moat status does and
doesn't claim. Arc: the objection → how the framework actually computes it →
worked example across 3–4 names → the honest limitation. No positioning
section; it isn't about a trade.

Whichever arc you pick, three things are load-bearing: evidence before
interpretation, the cohort read before the conclusion, and the counter-case
*before* positioning rather than after it.

## The cross-read arc in full

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

The article ends there. The method note ("how to read the numbers on this
page") is rendered by the template for every article with a live block — do not
author one.

Not a template to fill mechanically. An article that never reaches step 8 is
advocacy; one that reaches it for two sentences is advocacy with a disclaimer,
and the lint says so below 10% of the body.
