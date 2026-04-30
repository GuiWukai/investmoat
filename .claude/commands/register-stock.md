# Register Stock Page

Ensure a stock's JSON analysis is wired into both data registries so the page renders without a 404.

**Usage:** `/register-stock TICKER`

---

## What This Skill Does

After a stock JSON is created in `src/data/stocks/`, it must be registered in **two separate files** before the page works. This skill checks both and adds any missing entries.

---

## Step 1 — Resolve the Slug

Derive the slug from `$ARGUMENTS` (the ticker):
- Lowercase the ticker (e.g., `BKNG` → `bkng`)
- Exception: if the JSON filename differs from the ticker (e.g., `amazon.json` for `AMZN`, `mastercard.json` for `MA`), read the `slug` field from the JSON file

Confirm `src/data/stocks/{slug}.json` exists. If it does not, stop and tell the user to run `/analyse-stock {TICKER}` first.

---

## Step 2 — Check and Update `src/data/stocks/index.ts`

This file is used by `getStockData()` inside `src/app/stocks/[ticker]/page.tsx`. If the slug is absent here, every visit to `/stocks/{slug}` returns a 404.

**Check:** grep for the slug in the file.

**If missing**, make two edits:

1. Add an import near the other imports (maintain alphabetical or append at the end of the import block):
```typescript
import {slug} from './{slug}.json';
```

2. Add an entry to `stocksMap` (append before the closing `}`):
```typescript
  {slug}: {slug} as StockAnalysisData,
```

---

## Step 3 — Check and Update `src/app/stockData.ts`

This file powers the portfolio and coverage list pages. Missing here means the stock won't appear in any list, but it won't cause a 404.

**Check:** grep for the slug in the file.

**If missing**, make two edits:

1. Add an import near the other imports:
```typescript
import {slug}Data from '@/data/stocks/{slug}.json';
```

2. Add an entry to `allCoverageData` (append before the closing `]`). Read the stock's `growth.score` and `valuation.score` from the JSON, and use the moat score computed from `tenMoats` via `m()`. Choose the closest matching category:
   - `"Big Tech"` — software platforms, semiconductors, cloud, AI
   - `"Financials"` — banks, payment networks, data/index providers, insurance
   - `"Healthcare"` — pharma, medical devices, health services
   - `"Industrials"` — aerospace, defence, manufacturing, energy equipment
   - `"Hard Assets"` — commodities, mining, crypto, physical assets
   - `"Other"` — consumer discretionary, travel, media, retail, utilities

```typescript
{ name: "{Display Name}", ticker: "{TICKER}", slug: "{slug}", scores: [m({slug}Data), g({slug}Data), v({slug}Data)], href: "/stocks/{slug}", category: "{category}", ...t({slug}Data) },
```

---

## Step 4 — Verify

Confirm both files now reference the slug:
```bash
grep -n "{slug}" src/data/stocks/index.ts src/app/stockData.ts
```

Both files must show at least two matches (import + map entry). Report the result.

---

## Step 5 — Commit

Stage and commit only the changed registry files (not the JSON, which should already be committed):

```
Register {TICKER} in index.ts and stockData.ts

Ensures /stocks/{slug} resolves and the stock appears in coverage lists.
```
