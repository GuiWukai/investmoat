# Data model & adding stocks

Every asset is a single JSON file in [`src/data/stocks/`](../src/data/stocks). That file is the source of truth — scores are computed from it, never hand-synced.

## The two registries

A stock must be registered in **two** places. Missing either one is the most common mistake.

| File | Purpose | Symptom if missing |
|---|---|---|
| `src/data/stocks/index.ts` | Maps `slug → data` for the `/stocks/[ticker]` route via `getStockData()` | The stock page 404s |
| `src/app/stockData.ts` | The `allCoverageData` array used by the list/portfolio pages and the score/portfolio logic | The stock is missing from `/stocks` and `/portfolio` |

The `slug` must match in four places: the filename (`{slug}.json`), the `slug` field inside the JSON, the key in `index.ts`, and the `href` (`/stocks/{slug}`).

## Schema

The JSON is validated by the Zod schema in [`src/lib/stockSchema.ts`](../src/lib/stockSchema.ts); the matching TypeScript type is `StockAnalysisData` in [`src/types/stockAnalysis.ts`](../src/types/stockAnalysis.ts). **Keep the schema and the type in sync when fields change.**

Key fields:

| Field | Notes |
|---|---|
| `slug`, `ticker`, `name` | Identity. `slug` must match the filename. |
| `assetClass` | `equity` (default) · `crypto` · `commodity`. Selects the moat framework. |
| `lastAnalyzed` | Day-precision date, e.g. `"June 16, 2026"`. |
| `headerStats`, `chips`, `metrics` | Header/display content. |
| `moat` | `description`, `analysisTitle`, `analysisSummary`, `analysisPoints[]`. The numeric `score` is **computed**, not read. |
| `growth.growthAnalysis` | Drives the growth score — see below. Required. |
| `valuation.score` | Static fallback used until a live price loads. |
| `scenarios.{bear,base,bull}` | Each has `priceTarget`, `description`, `points[]`. Targets feed the live valuation score. |
| `tenMoats` / `cryptoMoats` / `commodityMoats` | The moat assessment for the asset's class. |
| `extraSections` | Optional `grid-cards` / `production-timeline` blocks. |

### Moat assessment

Each moat is `{ status, note, aiExposure? }` where `status` is `strong | intact | weakened | destroyed`. Use `destroyed` + a note starting with `N/A` for moats that don't apply (they're excluded from scoring). Set `aiExposure: 'resilient'` to mark a normally-vulnerable moat as AI-strengthened for this company. The pillar sets per asset class and their weights are documented in [SCORING.md](./SCORING.md).

### Growth analysis (required)

```jsonc
"growthAnalysis": {
  "cagrEstimate": "15–20%",          // blended 3–5yr revenue CAGR; anchors the score
  "scoreDerivation": "base 85 + ...", // human-readable derivation
  "drivers": [{ "name": "...", "metric": "...", "trend": "accelerating" }],
  "primaryType": "both",              // "TAM expansion" | "market share" | "both"
  "keyRisk": "Specific, falsifiable risk with a horizon",
  "keyRiskSeverity": "moderate",      // low | moderate | high | severe
  "marginTrend": "expanding"          // expanding | stable | compressing
}
```

These fields feed `computeGrowthScore` directly — see [SCORING.md](./SCORING.md#2-growth-score).

## Validation

```bash
npm run validate:stocks
```

Runs [`scripts/validate-stocks.ts`](../scripts/validate-stocks.ts), which checks every JSON against the schema and verifies `slug` matches the filename. It's wired into `prebuild`, so `npm run build` fails on malformed data. Errors print the offending file, field path, and message.

## Adding a stock

1. Research the company and decide the moat statuses, growth fields, and bear/base/bull targets.
2. Create `src/data/stocks/{slug}.json` following the schema.
3. Register it in **both** `src/data/stocks/index.ts` and `src/app/stockData.ts`.
4. Add the Yahoo Finance symbol mapping in `src/app/api/stock-price/[ticker]/route.ts` so live prices resolve.
5. Run `npm run validate:stocks` and `npm run lint`, then `npm run build`.

The Claude Code slash command [`/add-stock`](../.claude/commands/add-stock.md) walks through this end to end; [`/analyse-stock`](../.claude/commands/analyse-stock.md) and [`/update-stock`](../.claude/commands/update-stock.md) help research and refresh existing entries.

## Updating a stock

Edit the JSON (moat statuses, growth fields, scenario targets, `lastAnalyzed`). Scores recompute automatically — don't hand-edit numbers in `stockData.ts`. Re-run validation and build.
