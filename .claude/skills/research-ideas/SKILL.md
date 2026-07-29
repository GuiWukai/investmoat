---
name: research-ideas
description: Find the next InvestMoat research article in the coverage data rather than in an earnings headline — screen the universe for cross-category moat cohorts, rank disagreements, category spreads and uncovered names, then test each candidate against the article bar. Use when asked what to write about next, for article ideas or a research pipeline, when a piece is wanted but the subject isn't decided, or when deciding whether an idea is worth an article at all. Hand the winning idea to write-research.
---

# Finding the next article

The obvious pipeline is: a company reports, the stock moves, someone writes
about it. That pipeline has two failure modes, and both are already visible in
the published set — every article is keyed to one quarter's print, and the
cohorts skew toward whichever large-cap names happen to report in the same
week.

The site's actual edge is different: 100+ names scored by one framework, where
the interesting arguments live in comparisons nobody had a news hook to make.
This skill mines those.

```bash
npm run screen:research                          # category spread, rank divergence, coverage gaps
npm run screen:research -- pillars systemOfRecord
npm run screen:research -- divergence 20
npm run screen:research -- uncovered
npm run screen:research -- stale
```

## The five screens, and the article each one implies

### `pillars` — cross-category moat cohorts

Groups the universe by the status of one moat pillar. The output flags cohorts
that reach `strong` across three or more categories.

That flag is the signal. Four software names sharing a pillar is a sector note.
Software, an exchange and a payments network sharing it is an argument that the
pillar cuts across the labels the market sorts by — which is exactly the move
the ServiceNow piece makes with billing models and the S&P Global piece makes
with "data business" versus "benchmark owner".

**The article:** *this pillar, not the sector label, is the variable that
matters.* Cohort = the strong names plus the counter-examples that share the
sector but not the pillar.

### `divergence` — where durability and the composite disagree

Ranks every name by moat, ranks it again by composite, and sorts by the gap.

- **Durable, ranked down** (large positive gap): the framework likes the
  business and dislikes the price or the growth. Either the market is paying
  for durability it already has, or the moat rating is generous. Both are
  arguments.
- **Ranked up, thinner moat** (large negative gap): a name the screen likes for
  reasons that aren't durability. The most useful article the site can write
  about its own portfolio.

**The article:** *the framework's own two halves disagree about these names,
and here is which half is right.*

### `category` — labels doing less work than they look

Internal composite spread within each category. A wide spread means one label
covers businesses the framework rates very differently.

**The article:** *this category is two categories.* The cohort is already
picked for you: the top of the spread against the bottom.

### `uncovered` — the coverage gap

High-composite names no article has ever cited. Research currently touches a
fraction of the universe, and the untouched part is not random — it is whatever
didn't have an earnings hook.

**The article:** anything, as long as the name earns a cross-read. Use this
screen as a constraint on the others: prefer a cohort that brings in names
research has never argued about.

### `stale` — what you may not argue from

Names whose `lastAnalyzed` is oldest, and names carrying a month-precision date
that won't parse. An article argues from stock JSONs; building on one nobody
has re-read in two quarters ships a piece that is stale on publication.

Not an article idea — a precondition. If a candidate cohort leans on a stale
name, run `/update-stock` on it first.

## Testing a candidate

A screen produces candidates, not articles. Every idea still has to clear the
bar in the `write-research` skill:

1. **Cross-cutting** — reads on 4+ covered names, and the comparison is the point.
2. **Contested** — a prevailing narrative the framework disagrees with.
3. **Falsifiable** — one sentence naming the observation that would break it.

Add two more that come from what's already published:

4. **Not the same article again.** Check the published set before committing.
   If the new idea's move is "the market sorted on X, the moat data sorts on
   Y", that move already exists twice. The thesis can be new while the *shape*
   is worn out — vary the arc as well as the subject (see `write-research`).
5. **A half-life longer than one print.** If the whole piece rests on one
   quarter's reaction, it is dead in ninety days. Prefer a structural claim
   that a specific print happens to test.

```bash
# what's been argued already, and about whom
grep -h '"title"\|"tickers"\|"tags"\|"dek"' src/data/research/*.json
```

## Turning a screen into a cohort

The screens give you a list. A cohort is a list with an internal contrast:

- The clearest case for the thesis.
- A natural control group — names that look the same on the market's variable
  and different on yours.
- At least one **honest counter-example**, where the other side is right. If
  every name in the cohort agrees with you, go back to the screen: you picked
  the list, not the evidence.

Then verify each ticker resolves in both registries and hand the cohort to
`write-research`.

## What is not an article

- A single name doing something interesting. That belongs on its stock page.
- A cohort where the framework agrees with consensus throughout.
- A screen result restated. "These six names all have a strong system of
  record" is an observation; the article is what follows from it that the
  market is currently getting wrong.
