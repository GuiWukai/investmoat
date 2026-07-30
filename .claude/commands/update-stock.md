# Update Stock

Refresh an existing stock's analysis data with current financials and revised price targets.

**Usage:** `/update-stock TICKER`

---

## What This Skill Does

Reads the existing `src/data/stocks/{slug}.json` for `$ARGUMENTS`, identifies stale data, and updates it to reflect the latest quarterly results, price movements, and any moat status changes.

---

## Update Checklist

Work through each section in order. Only modify fields where the data is outdated or incorrect.

### 1. Header Stats

Update `headerStats` if:
- The price is more than 2 weeks old (use the current price)
- The market cap has changed by more than 5%
- A new significant metric should replace an existing one

**Do not** change the order or number of header stats unless there's a compelling reason.

### 2. Key Metrics (3 metrics cards)

Update `metrics` if:
- The metric values reference a quarter more than 2 quarters old
- A previously highlighted metric is no longer the most relevant (e.g., a company launches a new segment that becomes the primary growth driver)

Keep the same 3-metric format. Each metric needs `title`, `value`, `label`, `icon`, and `color`.

Common Lucide icon names: `TrendingUp`, `TrendingDown`, `DollarSign`, `BarChart`, `Cpu`, `Cloud`, `Database`, `Zap`, `Shield`, `Globe`, `Laptop`, `Share2`, `Lock`, `Users`, `Package`, `Award`

### 3. Moat Score and Analysis

Review the moat score if:
- A new competitor has emerged with a credible path to displacement
- A regulatory change has strengthened or weakened regulatory lock-in
- A product discontinuation has removed a bundle component
- AI capabilities have materially changed the competitive landscape since the last update

**Moat score adjustment rules:**
- Only adjust by ±3 per quarter unless a structural change has occurred
- A structural change (e.g., lost a major government contract, entered a new market) can justify ±5–10
- Document the reason for any score change in `moat.description`

### 4. Growth Score

Review the growth score if:
- Revenue growth has re-accelerated or decelerated by more than 5 percentage points
- Management has provided new forward guidance materially different from prior guidance
- A new product/segment has launched that creates an incremental TAM
- A driver's trend has changed (e.g., `"accelerating"` → `"stable"`)

**Growth score adjustment rules:**
- Update `growth.description` to reference the most recent quarter's growth rate
- Reflect any management guidance changes for the next 2–4 quarters
- If `growthAnalysis` is missing, add it (see Step 5 in `analyse-stock.md` for the required format)
- If `growthAnalysis` is present, update:
  - `cagrEstimate` if the blended CAGR has shifted materially (>3pp). This single number drives ~78% of the growth score's variance, so treat it as the main event, not a header. Anchor it to a **measured series** and decay toward terminal, the way every equity in coverage does (MSFT 15–17% against a reported +40%; PLTR 25–35% decel-adjusted from ~71%) — then record that series in `cagrBasis`. An estimate no series supports is how BTC carried 30–60% while its own drivers were shrinking.
  - `cagrBasis` — the measured series and observed rate the estimate answers to. Required for `assetClass: crypto` and `commodity`, where there is no revenue line to fall back on; `validate:stocks` reports book-wide coverage. The series must **accrue to the asset** and be **unbounded**:
    - Not a bounded ratio. A market share or a percent-of-supply is capped at 100% and cannot compound at its cited rate — "65% of tokenized value", "33.6% of supply staked" describe position, not a rate.
    - Not third-party growth. Activity on the platform supports the estimate only through the channel that reaches the asset. If tokenized-RWA volume grows 315% but L1 fees fall from $23M/day to $227K/day, the accrual rate is the second number.
    - With no revenue line, use adoption — holders, addresses, physical demand — and mark up from it explicitly, as BTC does from +8.3% YoY holders to 12–20%.
  - If a measured series points *against* the estimate, charge it in `cagrEstimate`, not in `keyRisk` — the base is ~78% of the variance and `keyRisk` caps at −15, so risk-only treatment understates it
  - `drivers[].metric` with the latest YoY figures from the most recent quarter
  - `drivers[].trend` if the last 2 quarters show a directional change
  - `keyRisk` if a new specific, falsifiable risk has emerged or the prior risk has been resolved
  - `keyRiskSeverity` — carries only *unmaterialised* downside. When a risk becomes an observed fact it is charged in `cagrEstimate` or `drivers[].trend`; leaving severity where it was then charges it twice. Cut severity as the risk resolves in either direction
  - `marginTrend` if operating margin direction has reversed (scored for equities only — crypto and commodities have no margins)
  - `scoreDerivation` to match any score change, showing the updated base + adjustments

### 5. Valuation Score

The valuation score is **dynamic** (computed live from the current price vs scenarios in `src/lib/valuationScore.ts`). The static `valuation.score` in the JSON is used as a fallback.

Update `valuation.score` to match where the current price sits on the piecewise scale:
- ≤ 0.8× bear → 100
- At bear → 90
- At base → 65
- At bull → 45
- ≥ 1.2× bull → 20

Update `valuation.description` to reflect the current price position relative to bear/base targets.

### 6. Price Scenarios

**Review scenarios if:**
- More than 6 months have passed since the last scenario revision
- The stock has traded above the bull target (scenarios need to be reset)
- The stock has traded below the bear target (scenarios need to be reassessed)
- A major earnings report has materially changed the earnings trajectory

**Scenario revision guidelines:**
- Bear target: should represent a realistic downside — typically 25–40% below current price for growth stocks, 15–25% for mature compounders
- Base target: should represent 12–24 month fair value at consensus earnings estimates
- Bull target: should be plausible with 1–2 upside catalysts — typically 40–80% above base for growth stocks

**The base target is not the cycle peak.** `computeValuationScore` reads where the price sits *within* the bear-to-base-to-bull corridor, so it cannot tell a fair-value base from an aspirational one — putting a cycle peak or a new all-time high in the base slot parks spot near the bear end and collects a high score for it. That belongs in the bull slot. This drifted for the crypto assets until July 2026 and was worth roughly +7 composite points; see `docs/SCORING.md`.

For assets with no earnings to anchor on (crypto, commodities), anchor the ladder to something **specific to that asset and falsifiable** — staking yield on staked supply, share of a settlement market, cost of production, official-sector holdings. Do not set the targets at the same multiples of spot as a sibling asset: that guarantees a similar valuation score regardless of what is true about the asset, which is how the crypto ladders ended up interchangeable.

`npm run validate:stocks` prints an advisory note when `base / bear` exceeds 3.0×, the shape a cycle-peak base produces. It is a smell, not proof of an error — investigate it rather than tuning the number until the note disappears.

**Update `scenarios` in both:**
1. `src/data/stocks/{slug}.json` — full scenario objects with priceTarget, description, and points
2. `src/app/stockData.ts` — the `bearTarget`, `baseTarget`, `bullTarget` shorthand strings

### 7. Ten Moats

Review each moat status if any of the following have occurred since the last update:
- A major product launch or discontinuation
- A new competitor entering the market with a credible AI-native alternative
- A regulatory ruling, government contract award/loss, or certification change
- A merger, acquisition, or strategic partnership that changes the competitive position

**Status change rules:**
- `intact` → `strong`: requires concrete evidence of moat deepening (not just market dominance)
- `intact` → `weakened`: requires a specific, named threat that has already materialised
- `weakened` → `destroyed`: requires evidence that the moat source no longer creates switching costs
- Do not move a status more than one level per update unless a catastrophic event occurred

Update the `verdict` if 2+ moat statuses have changed.

**`primaryType` is descriptive, not scored.** It still renders as a chip and belongs in the JSON, but it no longer adds points — it paid +3/+4 to 111 of 128 assets and discriminated between almost none of them.

**`scoreDerivation` is commentary.** The page renders the authoritative arithmetic from `growthScoreBreakdown()`, so this string is where you explain *why* the inputs are what they are. Keep any total you write in it consistent with the computed score — `validate:stocks` reports drift.

### 8. Recommendation (derived — do not set in JSON)

The `recommendation` field is no longer stored in the JSON. It is computed at render time from the composite score by `computeRecommendation()` in `src/lib/valuationScore.ts` using:

```
composite = moatScore * 0.4 + growthScore * 0.3 + valuationScore * 0.3
```

| Composite | Recommendation |
|---|---|
| ≥ 82 | Strong Buy |
| 75–81 | Accumulate |
| 68–74 | Hold |
| 60–67 | Speculative Buy |
| Below 60 | Avoid |

Sanity-check that the resulting recommendation is what you'd expect given the updated scores — if not, the underlying scores are likely miscalibrated.

### 9. Analysis Date

**Always** update `lastAnalyzed` to the current date with **day precision** (e.g., `"June 16, 2026"`) at the end of every update run, regardless of whether any other fields changed. Use the full `"Month D, YYYY"` form, not just the month and year. This field records the exact date a human-reviewed analysis was last performed.

### 10. stockData.ts Entry

Update the entry in `src/app/stockData.ts` if:
- Any of the three scores have changed
- Any of the price targets have changed
- The stock's category has changed

---

## Verification Steps

After making all changes:

1. **Validate JSON syntax** — no trailing commas, all strings quoted, arrays closed
2. **Check score consistency** — the `scores` array in `stockData.ts` must match the scores in the JSON file
3. **Check scenario consistency** — the shorthand targets in `stockData.ts` must match `priceTarget` values in the JSON
4. **Check portfolio impact** — if the composite score crosses the 75 threshold (either direction), the stock will move between portfolio and excluded. Confirm this is the intended outcome.
5. **Confirm `lastAnalyzed` is set** — must be updated to the current date with day precision (e.g., `"June 16, 2026"`) before committing.
6. **Run lint** — `npm run lint` to catch TypeScript issues

---

## What NOT to Change

- Do not change `slug`, `ticker`, or `name` (these are identifiers)
- Do not rewrite the entire analysis — only update what's stale
- Do not change moat statuses without documented evidence
- Do not adjust scores by more than 10 points without a structural justification
- Do not change the `href` field in `stockData.ts`
