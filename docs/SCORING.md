# Scoring methodology

Every asset is scored 0–100 on three pillars — **Moat**, **Growth**, **Valuation** — which combine into a single **composite** that drives ranking, portfolio inclusion, and the recommendation band.

> **Single source of truth:** all formulas live in [`src/lib/valuationScore.ts`](../src/lib/valuationScore.ts). This document describes that code; if they ever disagree, the code wins. (Some marketing copy on the home page describes an earlier calibration — the figures below reflect the current implementation.)

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
| `destroyed` | 10 |

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

Pillars: `networkEffects`, `schellingPoint`, `credibleNeutrality`, `regulatoryIncumbency`, `securityBudget`. The declared `primaryMoat` gets **50%**; the other four split the remaining 50% (**12.5%** each). So BTC scores on credible neutrality, ETH on network effects — without averaging through pillars that don't define them.

### Commodity: 3-pillar framework

Pillars: `absoluteScarcity`, `monetaryHistory`, `industrialUtility`. The `primaryMoat` gets **50%**; the other two get **25%** each. Gold scores on monetary history; copper on industrial utility.

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
| < 0% | 30 |

---

## 3. Valuation score (live)

`computeValuationScore(price, bear, base, bull)` places the live price on a piecewise-linear curve through the scenario targets:

| Price level | Score |
|---|---|
| ≤ 0.8 × bear | 100 |
| = bear | 90 |
| = base | 65 |
| = bull | 45 |
| ≥ 1.2 × bull | 20 |

Cheaper than bear → richly scored; above bull → penalised. Before a live price loads (or if the fetch fails), the static `valuation.score` authored in the JSON is used instead.

---

## 4. Composite & recommendation

The composite is a **weighted geometric mean** — `moat 0.40 · growth 0.30 · valuation 0.30`:

```
composite = (moat/100)^0.40 · (growth/100)^0.30 · (valuation/100)^0.30 · 100
```

Geometric (rather than arithmetic) means a weak pillar genuinely drags the score: a wide moat can't fully offset a rich price. Equal pillars reproduce the arithmetic mean. `computeCompositeRaw` returns a float for precise sorting; `computeComposite` rounds for display.

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
