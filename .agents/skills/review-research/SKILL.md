---
name: review-research
description: Re-read a published InvestMoat research article against current data and record the result — check whether its falsifiable claim has tripped, re-verify every moat status named in prose, age-check the static tables, append a revision entry and bump lastReviewed. Use when asked to review, re-check, refresh, audit or update an existing article in src/data/research/, after a covered name reports earnings or is re-analysed, or when validate:research reports re-verify notes. Pairs with research-style for the editorial rules and write-research for structure.
---

# Reviewing a published article

A stock page has an earnings trigger: a name reports, `/update-stock` runs, the
JSON changes. An article has no such trigger. It sits at a permanent URL,
carries a thesis, and quietly stops being true.

This skill is that missing trigger. The output of a review is never "looks
fine" — it is a change to the article file: a status, a revision entry, a
corrected sentence, or a new `lastReviewed` date that a reader can see.

## When a review is due

- A name the article covers has been re-analysed since `lastReviewed`
  (`lastAnalyzed` in its stock JSON is the newer date).
- A name it covers has reported earnings.
- The article's `falsifiableBy` names a threshold whose deadline has passed.
- Nothing has happened for a quarter. Silence is not evidence.

Find the candidates:

```bash
npm run screen:research -- stale        # oldest analyses in the universe
grep -l '"lastReviewed"' src/data/research/*.json | xargs -I{} \
  node -e 'const a=require("./{}");console.log(a.lastReviewed, a.slug, a.tickers.join(" "))'
```

## Step 1 — Run the lint and work the notes

```bash
npm run validate:research
```

Each `note` is a moat status the article asserts in prose. That assertion was
true when it was written; the whole point of the note is that it may not be
now. For every one, open the stock JSON and check:

```bash
# the article says ServiceNow's system-of-record pillar is strong — is it?
node -e 'console.log(require("./src/data/stocks/now.json").tenMoats.systemOfRecord.status)'
```

A pillar quietly downgraded from `strong` to `weakened` is the exact rot this
review exists to catch. When one has moved, the sentence changes — and the
change goes in the revision log, because a reader who read the old sentence
deserves to know it moved.

`warning`s are the sourcing and drift backlog: an unsourced table, a scenario
target hard-coded in prose. Fix what you can; a warning you choose to carry is
a decision, so say so in the revision note.

## Step 2 — Test the falsifiable claim

This is the part no other process does. Read `falsifiableBy.claim` and ask what
the current data says about it, then set `status` to exactly one of:

| Status | Means |
|---|---|
| `holding` | The claim has been re-tested and the thesis survives. |
| `watch` | Something in the claim is moving the wrong way but hasn't crossed the line. |
| `tripped` | The observable named in the claim has happened. |
| `retired` | The question the claim tested is settled or no longer live — a spin-off closed, the cohort dissolved. |

Anything other than `holding` **requires** a `note` saying what the latest data
shows. The schema enforces this.

A `tripped` article is not deleted and not quietly patched. It gets:

1. `falsifiableBy.status: "tripped"` with a note naming the observation and its
   date,
2. a revision entry saying the thesis failed and what that implies,
3. prose corrected where it now asserts something false — not softened, corrected.

The site's credibility comes from the framework being checkable. An article that
was wrong and says so is worth more than three that were never tested.

## Step 3 — Age-check the static figures

Every `table` and `chart` carries `asOf` and should carry `sources`. For each:

- Is there a newer print? Then the figure is stale even if it isn't wrong —
  refresh it and update `asOf`, or cut the row.
- Does the citation still resolve? Open the URL. IR sites reorganise; a dead
  citation is worse than none because it looks checked.
- Is the figure more than two reporting periods old with no argument for
  keeping it? Cut it.

If a block has no `sources`, this is the review that adds them — see the
`source-research` skill.

## Step 4 — Record the review

Two fields, both required, in `src/data/research/{slug}.json`:

```json
"lastReviewed": "October 27, 2026",
"revisions": [
  {
    "date": "October 27, 2026",
    "note": "Q3 re-check. ServiceNow AI ACV reached $1.35B against the $1.5B FY2026 target with subscription growth at 23.1%, so the substitution pattern the thesis warns about has still not appeared. Adobe's system-of-record pillar unchanged at weakened."
  }
]
```

Rules the validator enforces: revisions read **newest first**, every revision
date sits between `published` and `lastReviewed`, and `lastReviewed` is never
earlier than `published`.

Write the note for a reader, not a changelog robot. "Updated figures" tells
nobody anything. Name what was checked, what moved, and what did not — the
non-events are the evidence that the thesis is holding.

**Bump `lastReviewed` even when nothing changed.** That is the case where the
date is doing the most work: it is the difference between an article that
survived a check and one nobody has opened since publication.

## Step 5 — Validate

```bash
npm run validate:research
npm run lint
```

## Checklist

- [ ] Every `note` from the lint checked against the stock JSON it names.
- [ ] `falsifiableBy.status` set deliberately, with a `note` if it isn't `holding`.
- [ ] Every `table`/`chart` `asOf` is current, or the block is gone.
- [ ] Every source URL opened and still resolving.
- [ ] A revision entry written in reader-facing language, newest first.
- [ ] `lastReviewed` bumped — including when the answer was "nothing moved".
- [ ] Prose corrected wherever the data no longer supports it. No softening a
      false sentence into a vague one.
