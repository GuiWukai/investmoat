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
| `na` | excluded |

`destroyed` scores 0 rather than a token floor, so both ends of the moat scale are literal: **0 means all ten applicable moats are destroyed, 100 means all ten are strong.** `na` is a separate status for moats that never applied — dropped entirely, weight redistributes. Do not encode N/A as `destroyed` plus a note prefix; that used to silently score zero at full weight.

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

`computeGrowthScore(growthAnalysis, assetClass)` derives a 0–100 score from structured fields (returns `null` if `cagrEstimate` can't be parsed):

```
growth = baseCAGR(cagrEstimate)   // piecewise, see below
       + trajectory(drivers)       // ±4, net of accelerating vs decelerating
       + margin(marginTrend)       // expanding +4 · stable 0 · compressing −4 · equities only
       + risk(keyRiskSeverity)     // low 0 · moderate −5 · high −10 · severe −15
```

**Base from CAGR** (midpoint of strings like `"22-28%"`, `"30%+"`, `"<5%"`):

| Blended CAGR | Base score | slope |
|---|---|---|
| ≥ 30% | 90 → 95 | 0.25 /pp |
| 15–30% | 80 → 90 | 0.67 /pp |
| 8–15% | 70 → 80 | 1.43 /pp |
| 4–8% | 60 → 70 | 2.5 /pp |
| 0–4% | 50 → 60 | 2.5 /pp |
| −20–0% | 0 → 50 | 2.5 /pp |
| ≤ −20% | 0 | |

Below zero the curve keeps descending to 0 at −20% CAGR — revenue roughly halving across the forecast window — rather than resting on a flat floor, so the bottom of the growth scale is a reachable statement about the business.

The slope is monotone non-increasing, which it was not before July 2026. The old curve anchored 0% at 40, making 0–4% the steepest segment on the whole curve at 5 points per percentage point — steeper than the distressed region beneath it. It claimed more precision about a 1% versus a 3% grower than about a −10% versus a −5% one, which is backwards.

### Known limits of this pillar

Worth stating, because the pillar reads as more decomposed than it is.

**The CAGR base drives ~78% of the score's variance** across the 128-asset book (sd 8.81 against a total of 11.0). The adjustments share the rest: risk 3.06, margin 3.04, trajectory 1.44. So `growth ≈ f(one authored number)`, where moat is genuinely built from ten weighted sub-assessments. `cagrBasis` exists to make that number checkable — it records the measured series the estimate is answerable to, and `validate:stocks` reports how much of the book still lacks one.

**A basis series must accrue to the asset, and must be unbounded.** Recording *a* series is not enough — it has to be a series that can carry the estimate. Two failure modes, both of which pass a naive "is there a citation?" reading:

- **Bounded ratios cannot anchor a CAGR.** A market share, a fraction of supply, or any percent-of-total is capped at 100% and therefore cannot compound at the cited rate for the length of a forecast. ETH's basis cites "~65% of tokenized value" and "staked ETH 33.6% of supply" — real, checkable, and structurally incapable of supporting a 40% multi-year estimate. Such figures can describe position; they cannot anchor a rate.
- **Third-party growth is not accrual.** A series measuring activity *on* the asset's platform only supports the estimate if value from that activity reaches the asset. Tokenized-RWA market growth of +315% YoY accrues to ETH through L1 fees — which fell from a ~$23M/day peak to ~$227K/day. Cite the accrual channel's rate, not the activity's.

Where an asset has no revenue line (crypto, commodities), the accrual series is adoption — holders, addresses, physical demand — as BTC's basis does with holder count +8.3% YoY and addresses ~9%/yr. Marking up from that for channel mix is legitimate and should be stated; substituting a faster unrelated series for it is not.

**A contradicting series is charged in the base, not in `keyRisk`.** When a measured series points against the estimate, it belongs in `cagrEstimate` — the base is ~78% of the pillar's variance while `keyRisk` caps at −15, so routing a structural fact to the risk term systematically understates it. The corollary is that `keyRisk` carries only *unmaterialised* downside: once a risk becomes an observed fact it is charged in the base or in `drivers[].trend`, and holding severity constant after it materialises charges it twice. BTC held `high` through July 2026 while the policy half of its risk confirmed (and was rated `decelerating` on the sovereign driver) and the flow half stepped back; that was a double-charge, corrected to `moderate`.

**`primaryType` no longer scores.** It paid +3 for TAM expansion, +4 for both, 0 for market share — and 111 of 128 assets collected +3 or +4, so it shifted the whole distribution up while discriminating between almost nobody. Deleting it outright moved mean rank by 1.2 places. The ordering it asserted was also never argued: taking share in a large market can be more durable than riding an expanding TAM. The field remains in the schema and still renders as a chip, as description rather than score.

**`marginTrend` is equity-only.** Bitcoin has no margins. All seven crypto and commodity assets carried `"stable"` — a field filled to satisfy the schema. Moat already dispatches on `assetClass`; growth now does too.

**Saturation above 30% is deliberate.** Twenty-one assets compress into base 90–95, so NBIS at 175% and AVGO at 40% differ by 2.5 points. Spreading them on rate alone would assert that the faster grower is better, when the real difference is how long either rate survives — and the pillar has no persistence input. `validate:stocks` flags estimates above a 60% midpoint rather than absorbing them silently.

**The score's arithmetic is rendered from the formula, not from prose.** `scoreDerivation` is authored text and was never mechanically faithful — ORCL narrates "+5 TAM expansion" where the term was worth 3 — which is why 43 of 128 files disagreed with their own computed score before any of this changed. The stock page now shows a breakdown computed by `growthScoreBreakdown()`, so the displayed sum is correct by construction, and `scoreDerivation` is the author's commentary on why the inputs are what they are. `validate:stocks` reports how far each file's narration has drifted.

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

### What each scenario rung means

The curve reads *position within the corridor*, so the score is only comparable across assets if the rungs mean the same thing everywhere:

| Rung | Meaning |
|---|---|
| **bear** | Realistic downside if the key risk materialises |
| **base** | **12–24 month expected value** — the central case |
| **bull** | Cycle peak, re-rating, or the upside case paying off |

**The base is not the cycle peak.** This drifted once and it is worth stating plainly, because the failure is invisible: crypto base targets were written as cycle peaks at new all-time highs while equity bases were 12–24 month fair value. `computeValuationScore` cannot tell the two apart, so parking the base at the cycle peak leaves spot near the bear end of the corridor and collects a high score for it. Before this was corrected in July 2026, crypto averaged **85.3 on valuation with a standard deviation of 0.9** against an equity mean of **70.3 with a spread of 9.5** — the pillar returned essentially the same answer for every crypto asset, which is a pillar that has stopped measuring. Worth roughly +7 composite points, purely from a convention.

A scenario ladder should also be anchored to the *asset*. ETH's was set to the same multiples of spot as the BTC and SOL ladders, which guarantees a similar valuation score no matter what is true about Ethereum. Anchor to something asset-specific and falsifiable — for ETH, staking yield on staked supply and share of tokenized settlement; for an equity, earnings and a multiple.

`npm run validate:stocks` prints an advisory note when `base / bear` exceeds **3.0×**, the shape a cycle-peak base produces. It warns rather than fails: a wide corridor is a smell, not proof of an error (MSTR's 7.5× is legitimate — it is a leveraged BTC proxy).

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
- `MIN_MOAT_SCORE = 70` — moat-first gate; growth/valuation alone cannot carry a weak-moat name in.
- `MAX_PORTFOLIO = 25` — hard cap on positions.

The coverage universe is sorted by composite (descending), filtered to those clearing both the composite and moat floors, and the top 25 form the portfolio. The `/portfolio` page recomputes this live (using current prices) and assigns position weights from each holding's score, capped at 10% per name. Because the floors and the 25-cap both bind, the portfolio shrinks rather than dilutes if coverage thins or valuations get rich.
