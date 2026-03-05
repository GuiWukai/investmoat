# Add Stock

Add a new stock to InvestMoat's analysis coverage.

**Usage:** `/add-stock TICKER`

---

## What This Skill Does

Creates a complete stock analysis JSON file in `src/data/stocks/` and registers the stock in `src/app/stockData.ts`. The stock is automatically placed into the portfolio or excluded list based on its composite score.

---

## Step 1 — Research the Company

Before writing any code, gather the following data for `$ARGUMENTS`:

**Fundamentals**
- Current stock price, market cap, sector/industry
- Last 3 years of revenue growth (% YoY)
- Gross margin and operating margin trends
- Free cash flow yield and ROIC
- Debt/equity ratio and balance sheet quality
- Dividend history (if any)

**Competitive Position**
- Primary business model and revenue streams
- Top 3 competitive advantages (moat sources)
- Main competitors and market share dynamics
- Pricing power evidence (can they raise prices?)
- Customer switching costs and retention rates

**AI-Era Disruption Risk**
- Which parts of the business could AI automate or displace?
- Which parts are defensible against AI disruption?
- Is the company a net beneficiary or net loser from AI adoption?

---

## Step 2 — Score the Three Dimensions (0–100 each)

### Moat Score
Assess durable competitive advantage using the Ten Moats framework (see Step 4). Weight:
- **90–100**: Exceptional, near-impossible to replicate moat (e.g., ASML monopoly on EUV)
- **80–89**: Strong moat with multiple reinforcing advantages
- **70–79**: Solid moat but with identifiable vulnerabilities
- **60–69**: Narrow moat, category leadership but replicable
- **50–59**: Questionable moat, execution-dependent
- **Below 50**: Commodity business, no structural advantage

### Growth Score
Assess the 3–5 year revenue and earnings growth trajectory:
- **90–100**: Hypergrowth (30%+ CAGR) with multiple expanding TAMs
- **80–89**: Strong growth (15–30% CAGR) with clear catalysts
- **70–79**: Steady growth (8–15% CAGR), durable compounder
- **60–69**: Moderate growth (4–8% CAGR), mature business
- **Below 60**: Low/no growth, declining, or cyclical headwinds

### Valuation Score (Static Estimate)
Estimate the static valuation score based on where the current price sits relative to your bear/base/bull scenarios. Use the piecewise scale in `src/lib/valuationScore.ts`:
- Price ≤ 0.8× bear → 100
- Price = bear → 90
- Price = base → 65
- Price = bull → 45
- Price ≥ 1.2× bull → 20

**Portfolio inclusion requires an average score ≥ 75 across all three dimensions.**

---

## Step 3 — Set Bear / Base / Bull Price Targets

Define three 12–24 month price scenarios. Each must include:
- A `priceTarget` string (e.g., `"$450"`, `"$1,500"`, `"$45,000"`)
- A one-sentence `description` summarising the macro/fundamental thesis for that scenario
- Three specific, falsifiable `points` (catalysts or risks) that would make the scenario play out

**Bear case**: Realistic downside — not catastrophic collapse, but a genuine deterioration in fundamentals or multiple compression. Assume 1–2 headwinds materialise.

**Base case**: Most likely 12–24 month outcome given current trajectory. Assumes no major positive or negative surprises.

**Bull case**: Upside scenario if 1–2 key catalysts exceed expectations. Should be plausible, not fantasy.

---

## Step 4 — Assess the Ten Moats

Rate each moat as `"strong"`, `"intact"`, `"weakened"`, or `"destroyed"` and write a one-sentence `note` explaining why.

### AI-Vulnerable Moats (frequently weakened by AI)
| Moat Key | Description |
|---|---|
| `learnedInterfaces` | Users trained on a specific UI/workflow; switching requires relearning |
| `businessLogic` | Complex, proprietary business logic encoded in software that competitors can't easily replicate |
| `publicDataAccess` | Control over access to a valuable public data source or aggregation |
| `talentScarcity` | Moat built on hiring and retaining scarce specialist talent |
| `bundling` | Customers buy a suite of products together; individual products are stickier as a bundle |

### AI-Resilient Moats (often strengthened by AI)
| Moat Key | Description |
|---|---|
| `proprietaryData` | Unique, non-public data assets that compound over time and cannot be replicated |
| `regulatoryLockIn` | Government certifications, compliance requirements, or contracts creating switching barriers |
| `networkEffects` | Product becomes more valuable as more users join; Metcalfe's Law dynamics |
| `transactionEmbedding` | Embedded in the payment/workflow layer of a customer's daily operations |
| `systemOfRecord` | The authoritative source of truth for a critical business function (identity, financial records, etc.) |

**If a moat is not applicable to this business model, set it to `"destroyed"` and explain it's N/A in the note.**

### AI Resilience Score
Calculate `aiResilienceScore` (0–100): weighted average favouring the AI-resilient moats. A company with all 5 resilient moats as `"strong"` scores ~90+. Weight the score toward resilient moats (60% weighting) vs vulnerable moats (40% weighting):
- `strong` = 100 pts, `intact` = 75 pts, `weakened` = 40 pts, `destroyed` = 0 pts (or N/A = exclude from average)

Write a 2-sentence `verdict` summarising the AI moat picture.

---

## Step 5 — Write the JSON File

Create `src/data/stocks/{slug}.json` using the schema below. Replace all placeholder values:

```json
{
  "slug": "{ticker_lowercase}",
  "ticker": "{TICKER}",
  "name": "{Company Full Name}",
  "headerStats": [
    { "label": "Ticker", "value": "{TICKER}" },
    { "label": "Market Cap", "value": "{e.g. $500B}" },
    { "label": "Price", "value": "{e.g. $250.00}" }
  ],
  "chips": [
    { "label": "{Sector | Sub-sector}", "color": "primary" },
    { "label": "{One-word moat descriptor}", "color": "success" }
  ],
  "recommendation": "{Strong Buy | Accumulate | Hold | Speculative Buy}",
  "metrics": [
    {
      "title": "{Key Metric Name}",
      "value": "{Metric Value}",
      "label": "{Context or time period}",
      "icon": "{Lucide icon name, e.g. TrendingUp}",
      "color": "{hex color}"
    },
    {
      "title": "{Key Metric Name}",
      "value": "{Metric Value}",
      "label": "{Context or time period}",
      "icon": "{Lucide icon name}",
      "color": "{hex color}"
    },
    {
      "title": "{Key Metric Name}",
      "value": "{Metric Value}",
      "label": "{Context or time period}",
      "icon": "{Lucide icon name}",
      "color": "{hex color}"
    }
  ],
  "moat": {
    "score": 0,
    "description": "{One sentence summarising the primary moat source}",
    "analysisTitle": "{Punchy title for the moat section, e.g. 'The Network Moat'}",
    "analysisSummary": "{Opening sentence with **bold** key phrase}",
    "analysisPoints": [
      { "title": "{Moat pillar 1}", "text": "{2-3 sentence explanation}" },
      { "title": "{Moat pillar 2}", "text": "{2-3 sentence explanation}" },
      { "title": "{Moat pillar 3}", "text": "{2-3 sentence explanation}" }
    ]
  },
  "growth": {
    "score": 0,
    "description": "{One sentence summarising the growth thesis and key drivers}"
  },
  "valuation": {
    "score": 0,
    "description": "{One sentence placing the price vs bear/base targets and why this represents value or risk}"
  },
  "scenarios": {
    "bear": {
      "priceTarget": "$0",
      "description": "{Bear case thesis}",
      "points": [
        "{Specific risk or catalyst 1}",
        "{Specific risk or catalyst 2}",
        "{Specific risk or catalyst 3}"
      ]
    },
    "base": {
      "priceTarget": "$0",
      "description": "{Base case thesis}",
      "points": [
        "{Specific catalyst 1}",
        "{Specific catalyst 2}",
        "{Specific catalyst 3}"
      ]
    },
    "bull": {
      "priceTarget": "$0",
      "description": "{Bull case thesis}",
      "points": [
        "{Specific upside catalyst 1}",
        "{Specific upside catalyst 2}",
        "{Specific upside catalyst 3}"
      ]
    }
  },
  "tenMoats": {
    "learnedInterfaces": { "status": "intact", "note": "{Explanation}" },
    "businessLogic": { "status": "intact", "note": "{Explanation}" },
    "publicDataAccess": { "status": "intact", "note": "{Explanation}" },
    "talentScarcity": { "status": "intact", "note": "{Explanation}" },
    "bundling": { "status": "intact", "note": "{Explanation}" },
    "proprietaryData": { "status": "intact", "note": "{Explanation}" },
    "regulatoryLockIn": { "status": "intact", "note": "{Explanation}" },
    "networkEffects": { "status": "intact", "note": "{Explanation}" },
    "transactionEmbedding": { "status": "intact", "note": "{Explanation}" },
    "systemOfRecord": { "status": "intact", "note": "{Explanation}" },
    "aiResilienceScore": 0,
    "verdict": "{2-sentence AI moat verdict}"
  }
}
```

**Chip color guide:**
- `"primary"` (blue) — sector/industry label
- `"success"` (green) — positive descriptor (e.g., "Monopoly", "Gold Standard")
- `"warning"` (amber) — neutral/speculative (e.g., "Cyclical", "Early Stage")
- `"danger"` (red) — risk flag (e.g., "AI Risk", "Commodity")

**Recommendation guide:**
- `"Strong Buy"` — exceptional quality at or below base case; avg score ≥ 82
- `"Accumulate"` — high quality, reasonable price; avg score 75–81
- `"Hold"` — quality position, fully/slightly over base; avg score 68–74
- `"Speculative Buy"` — high potential but elevated risk or uncertainty

---

## Step 6 — Register in stockData.ts

Add the stock to the `allCoverageData` array in `src/app/stockData.ts`:

```typescript
{
  name: "{Display Name}",
  ticker: "{TICKER}",
  slug: "{slug}",
  scores: [{moatScore}, {growthScore}, {valuationScore}],
  href: "/stocks/{slug}",
  category: "{Big Tech | Financials | Healthcare | Hard Assets | Other}",
  bearTarget: "{e.g. $300}",
  baseTarget: "{e.g. $450}",
  bullTarget: "{e.g. $580}"
},
```

Place it in the array sorted approximately by composite score (highest first). The portfolio/excluded split is automatic — stocks with average score ≥ 75 and within the top 20 enter the portfolio.

---

## Step 7 — Verify

1. Check the JSON is valid (no trailing commas, all required fields present)
2. Confirm the slug matches the filename and the `href` in `stockData.ts`
3. Run `npm run lint` to catch any TypeScript errors
4. If the stock qualifies for the portfolio, verify it appears on the main page by checking that its average score ≥ 75

---

## Quality Standards

- **Be specific**: Use real financial metrics, not vague adjectives
- **Be current**: Reference the most recent quarterly results available
- **Be honest**: If the moat is weak, score it weak — don't inflate to force portfolio inclusion
- **Be consistent**: Match the tone and depth of existing stock analyses (read `msft.json` or `nvda.json` as reference)
- **Scenario targets must be internally consistent**: Bull target should be ≥ 1.5× bear target
