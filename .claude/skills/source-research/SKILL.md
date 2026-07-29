---
name: source-research
description: Source and cite the company-reported figures in an InvestMoat research article — the sources[] list, per-table and per-chart citations, which document counts as primary, and how to fix the "static figures with no sources" warning from validate:research. Use when adding a table or chart to an article, when quoting revenue, ACV, backlog, guidance or any company figure, when auditing an article's citations, or when the prose lint warns about an unsourced block.
---

# Sourcing an article

Every figure in an article is one of two kinds, and they fail in opposite ways.

**Framework figures** — scores, moat statuses, recommendations — are live. They
resolve from the stock JSONs at render time, so they cannot go stale. They must
never be typed into prose. (That's the `research-style` skill.)

**Company figures** — revenue, ACV, NRR, backlog, guidance, capex — are static.
They cannot correct themselves, so the only thing keeping them honest is the
document they came from. That document goes in the article.

Both halves matter. An article whose scores are live and whose company figures
are unattributable is only half-checkable, and the half that carries the actual
argument is the unchecked one.

## The rule

**Every `table` and every `chart` cites at least one source.**
`npm run validate:research` warns on any that doesn't.

```json
"sources": [
  {
    "id": "now-q2-2026",
    "label": "ServiceNow Reports Second Quarter 2026 Financial Results",
    "publisher": "ServiceNow",
    "date": "July 22, 2026",
    "url": "https://investor.servicenow.com/news/news-details/2026/ServiceNow-Reports-Second-Quarter-2026-Financial-Results/default.aspx",
    "kind": "press-release"
  }
],
"blocks": [
  {
    "type": "table",
    "asOf": "July 2026",
    "sources": ["now-q2-2026"],
    "columns": ["Metric", "Q2 2026", "What it tests"],
    "rows": [["Subscription revenue", "+24.5% YoY", "…"]]
  }
]
```

`sources` sits at the article level; blocks reference entries by `id`. The
renderer numbers them in order and prints them twice — as a citation line under
the figure, and as a numbered Sources section at the foot of the article. The
Markdown mirror at `/research/{slug}/llms.txt` carries both.

Validation is strict about the wiring: ids must be unique, every referenced id
must exist, and a source nothing cites gets a warning (either it belongs to a
block or it belongs in the bin).

## What counts as a source

Ranked by how much weight it can carry, best first:

| `kind` | Use for | Example |
|---|---|---|
| `filing` | Anything audited — segment revenue, margins, share count | 10-Q, 10-K, 8-K exhibit 99.1 (SEC EDGAR) |
| `press-release` | The quarter's headline figures and guidance | "Reports Second Quarter 2026 Financial Results" |
| `transcript` | Figures management said aloud but didn't print — attach rates, deal counts, colour on guidance | Earnings call transcript |
| `regulator` | Rules, accreditations, approvals | FedRAMP marketplace, FDA, EU register |
| `company-site` | Product and customer claims | Documentation, customer-count page |
| `third-party` | Only when no primary source exists | Industry estimate, market-share study |

Prefer a primary document over anyone's summary of it. If a figure exists only
in a news article about a print, cite the print. If it exists only in a
third-party estimate, mark it `third-party` and say so in the prose — a figure
nobody official ever asserted should read differently to one from a 10-Q.

**Never cite a URL you have not opened.** A plausible-looking IR link that
404s is worse than no citation, because it looks verified. If a fetch is
blocked by bot protection (IR sites and SEC often are), open it another way and
confirm the figures match before writing the entry.

## Cross-company tables

A comparison table pulling one figure each from six companies needs six
sources, and that is a real cost. It is also the point: a cohort table is the
most load-bearing evidence in an article and the easiest place for a
half-remembered number to slip in.

Two honest options, in order of preference:

1. **Cite all of them.** One `sources` entry per company, all listed on the
   block. Do this when the table is central to the argument.
2. **Narrow the table.** If sourcing six names is disproportionate, the table
   is probably carrying names the argument does not need.

What is *not* an option is citing the one company you happened to check and
letting the rest ride.

## Figures in prose

Prose is not exempt, but it is handled differently: a company figure in a
sentence names its reporting period rather than carrying a footnote.

> Agentforce with Data 360 has reached $3.4B ARR, up 200% *(Q2 2026)*.

If a figure is important enough to argue from, put it in a `table` or `chart`
where the `asOf` and the citation live. Prose figures should be the ones that
merely colour a sentence.

## Fixing the warning

```
blocks[4] (table): static figures with no `sources` — a reader cannot check a
company-reported number against anything.
```

1. Find where the numbers actually came from. If nobody can say, that is the
   finding — the figures come out, not the warning.
2. Locate the primary document and open it. Confirm each figure in the block.
3. Add the `sources` entry and reference its `id` from the block.
4. Re-run `npm run validate:research`.

Do not silence the warning by deleting the `asOf` or converting the table to
prose. The warning is about whether a reader can check the claim, and moving
the claim doesn't change the answer.
