# Scoring methodology

Every asset is scored 0–100 on three pillars — **Moat**, **Growth**, **Valuation** — which combine into a single **composite** that drives ranking, portfolio inclusion, and the recommendation band.

> **Single source of truth:** all formulas live in [`src/lib/valuationScore.ts`](../src/lib/valuationScore.ts). This document describes that code; if they ever disagree, the code wins. The home page (`src/app/page.tsx`) restates the same figures for a general audience and must be updated alongside any recalibration.

---

## 1. Moat score (asset-class aware)

`computeAssetMoatScore(data)` dispatches on `assetClass` (`equity` by default):

- `equity` → 10-moat business framework (`computeMoatScore`)
- `crypto` → 5-pillar monetary-protocol framework (`computeCryptoMoatScore`)
- `commodity` → 3-pillar commodity framework (`computeCommodityMoatScore`)

Scores are **not comparable across asset classes** — a BTC moat of 100 measures protocol durability, not the same thing as an equity moat of 100.

Each moat/pillar is rated and converted to points:

| Status | Points |
|---|---|
| `strong` | 100 |
| `intact` | 65 |
| `weakened` | 35 |
| `destroyed` | 0 |

`destroyed` scores 0 rather than a token floor, so both ends of the moat scale are literal: **0 means all ten applicable moats are destroyed, 100 means all ten are strong.** This also sharpens the distinction from N/A — an N/A moat is dropped entirely and its weight redistributes (the moat never applied), whereas a destroyed moat keeps its weight and scores nothing (it applied and is gone).

A moat marked `destroyed` whose note starts with `N/A` / `Not applicable` is **excluded** from the score and its weight redistributes.

### Equity: the 10-moat framework

Moats split into two groups. **AI-resilient** moats (base pool = 60) are advantages AI cannot easily replicate; **AI-vulnerable** moats (base pool = 40) are ones intelligent agents increasingly substitute for.

| Group | Moat | Weight |
|---|---|---|
| Resilient | `networkEffects` | 15 |
| Resilient | `proprietaryData` | 12 |
| Resilient | `systemOfRecord` | 12 |
| Resilient | `regulatoryLockIn` | 11 |
| Resilient | `transactionEmbedding` | 10 |
| Vulnerable | `businessLogic` | 14 |
| Vulnerable | `bundling` | 10 |
| Vulnerable | `learnedInterfaces` | 8 |
| Vulnerable | `talentScarcity` | 5 |
| Vulnerable | `publicDataAccess` | 3 |

The score is a weighted average within each group, the two groups blended by their applicable capacity, then two adjustments:

- **Quality-gated breadth bonus:** `+1` per moat rated *intact-or-better* beyond 5, capped at `+4`. Broad mediocrity earns nothing — the moats must be demonstrably present.
- **AI-vulnerability discount:** `−5` when the vulnerable group contributes *more* total score than the resilient group (catches businesses whose only strength is AI-disruptable, e.g. Adobe).

**`aiExposure` override:** any moat assessment may set `aiExposure: 'resilient' | 'vulnerable'` to route it to the other bucket. This lets moats that are AI-*strengthened* for a specific company (NVIDIA's CUDA `learnedInterfaces`, Palantir's ontology `businessLogic`) sit in the resilient pool where their economics belong — and it flows through to the discount calculation.

### Crypto: 5-pillar monetary framework

Pillars: `networkEffects`, `schellingPoint`, `credibleNeutrality`, `regulatoryIncumbency`, `securityBudget`. The declared `primaryMoat` gets **30%**; the other four split the remaining 70% (**17.5%** each). So BTC scores on credible neutrality, ETH on network effects — without averaging through pillars that don't define them.

The primary weight was cut from 50% in July 2026. Unlike the equity weights, which the framework fixes, `primaryMoat` is declared per asset — and every crypto and commodity asset in coverage declares one at or tied to its maximum-scoring option. At 50% that was a free option rather than an analytical claim: ETH, which has one strong pillar and four merely intact, gained 14 points of moat from the declaration alone. The primary remains the heaviest single pillar; it no longer outweighs the other four combined.

### Commodity: 3-pillar framework

Pillars: `absoluteScarcity`, `monetaryHistory`, `industrialUtility`. The `primaryMoat` gets **40%**; the other two get **30%** each. Gold scores on monetary history; copper on industrial utility. Cut from 50/25/25 in July 2026 for the reason given above.

---

## 2. Growth score

`computeGrowthScore(growthAnalysis)` derives a 0–100 score from structured fields (returns `null` if `cagrEstimate` can't be parsed):

```
growth = baseCAGR(cagrEstimate)   // piecewise, see below
       + trajectory(drivers)       // ±4, net of accelerating vs decelerating
       + margin(marginTrend)       // expanding +4 · stable 0 · compressing −4
       + type(primaryType)         // TAM expansion +3 · both +4 · market share 0
       + risk(keyRiskSeverity)     // low 0 · moderate −5 · high −10 · severe −15
```

**Base from CAGR** (midpoint of strings like `"22-28%"`, `"30%+"`, `"<5%"`):

| Blended CAGR | Base score |
|---|---|
| ≥ 30% | 90 → 95 |
| 15–30% | 80 → 90 |
| 8–15% | 70 → 80 |
| 4–8% | 60 → 70 |
| 0–4% | 40 → 60 |
| −20–0% | 0 → 40 |
| ≤ −20% | 0 |

Below zero the curve keeps descending to 0 at −20% CAGR — revenue roughly halving across the forecast window — rather than resting on a flat floor, so the bottom of the growth scale is a reachable statement about the business.

---

## 3. Valuation score (live)

`computeValuationScore(price, bear, base, bull)` places the live price on a piecewise-linear curve through the scenario targets:

| Price level | Score |
|---|---|
| ≤ 0.8 × bear | 100 |
| = bear | 90 |
| = base | 65 |
| = bull | 45 |
| = 1.2 × bull | 20 |
| ≥ 2.0 × bull | 0 |

Cheaper than bear → richly scored; above bull → penalised. Both ends are reachable and specific: **100 means the price is 20% below the bear case, 0 means it is double the bull case.** The curve still saturates beyond those points — further overvaluation past 2× bull carries no extra information — but the dead zone now starts where it genuinely stops discriminating rather than at an arbitrary floor of 20. Before a live price loads (or if the fetch fails), the static `valuation.score` authored in the JSON is used instead.

---

## 4. Composite & recommendation

The composite is a **standardised weighted geometric mean** — `moat 0.40 · growth 0.30 · valuation 0.30`.

Geometric (rather than arithmetic) means a weak pillar genuinely drags the score: a wide moat can't fully offset a rich price.

### Why the pillars are standardised first

A weight only governs influence if the thing it weights actually varies. The three rubrics were each calibrated on their own terms, so they don't vary comparably:

| Pillar | Observed range | sd of `ln(score/100)` |
|---|---|---|
| Moat | 22–98 | 0.266 |
| Growth | 41–97 | 0.155 |
| Valuation | 45–89 | 0.144 |

Fed straight into the weighted mean, that made `40/30/30` a fiction. A typical move in moat shifted the composite about **4× as much** as a typical move in valuation, and moat drove **~71%** of composite dispersion. The most subjective pillar — author-assigned moat status labels — was quietly outvoting the only pillar that responds to price.

So each pillar is converted to a **z-score against the coverage universe** before weighting:

```
zₚ         = (ln(score/100) − logMeanₚ) / logSdₚ
blended    = 0.40·z_moat + 0.30·z_growth + 0.30·z_valuation
composite  = exp(logMean + logSd · blended / blendedZSd) · 100
```

After standardisation a 1-sd move in any pillar shifts the composite in exact proportion to its weight — **40 : 30 : 30**, verified against the universe. (The *variance* share lands at 49/25/25 rather than 40/30/30; that gap is just the arithmetic of squaring weights and is unavoidable under any weighting scheme.)

The final `logMean` / `logSd` reproduce the location and spread the un-standardised formula produced over the same universe, so **the recommendation bands and the portfolio threshold keep the meaning they were tuned for**. Standardisation redistributes where dispersion comes from without inflating or shrinking it.

What this does *not* do: it corrects the weighting, but it cannot manufacture resolution a rubric doesn't have. Each pillar still saturates at its endpoints, so assets past `2.0 × bull` (or below `0.8 × bear`) remain indistinguishable from one another — they are now merely penalised as much as a 30%-weight pillar should penalise them.

Worked examples of where the ends of the scale land:

| Case | Composite |
|---|---|
| Perfect moat and growth, 20% above its own bull case | 51 (*Avoid*) |
| Perfect moat and growth, at double its bull case | 14 (*Avoid*) |
| Perfect moat and growth, priced at the bull case | 72 (*Hold*) |
| Mediocre business (70/70) at a deep discount | 81 (*Accumulate*) |
| All ten moats destroyed, strong growth and price | 21 (*Avoid*) |

Under the un-standardised formula the first of those scored 62 — a *Speculative Buy* for a business trading past its own bull case.

### Calibration constants

`PILLAR_CALIBRATION` and `COMPOSITE_CALIBRATION` in [`src/lib/valuationScore.ts`](../src/lib/valuationScore.ts) are **baked from the universe, not recomputed at render time** — a stock's published score must not move because unrelated coverage was added. They were derived from 128 assets in July 2026.

Re-derive them with:

```
npx tsx scripts/calibrate-pillars.ts
```

which prints the observed statistics, flags any pillar whose spread has drifted more than 10% from the baked value, and emits a ready-to-paste block. Re-baking moves every published score, so treat it as a deliberate recalibration rather than routine maintenance.

`computeCompositeRaw` returns a float for precise sorting; `computeComposite` rounds for display. `pillarZScore` is exported so the derivation is inspectable — a z of 0 means "typical for this pillar", +1 means one standard deviation better than the universe.

**Recommendation bands** (`computeRecommendation`):

| Composite | Rating |
|---|---|
| ≥ 82 | Strong Buy |
| ≥ 75 | Accumulate |
| ≥ 68 | Hold |
| ≥ 60 | Speculative Buy |
| < 60 | Avoid |

---

## 5. Portfolio selection

In [`src/app/stockData.ts`](../src/app/stockData.ts):

- `MIN_AVG_SCORE = 80` — minimum composite to be eligible.
- `MAX_PORTFOLIO = 25` — hard cap on positions.

The coverage universe is sorted by composite (descending), filtered to those clearing the threshold, and the top 25 form the portfolio. The `/portfolio` page recomputes this live (using current prices) and assigns position weights from each holding's score, capped at 10% per name. Because the threshold and the 25-cap both bind, the portfolio shrinks rather than dilutes if coverage thins or valuations get rich.
