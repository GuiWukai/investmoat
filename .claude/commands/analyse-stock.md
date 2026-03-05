# Analyse Stock

Run a deep-dive analysis on an existing or prospective stock using the InvestMoat Ten Moats framework.

**Usage:** `/analyse-stock TICKER`

---

## What This Skill Does

Produces a structured investment analysis report for `$ARGUMENTS` covering moat durability, AI-era resilience, growth trajectory, valuation relative to scenarios, and an overall recommendation. If the stock already exists in `src/data/stocks/`, the analysis also flags any data that may be stale or needs updating.

---

## Analysis Framework

### Phase 1 — Business Model Clarity

Answer these questions before scoring anything:

1. **What does the company actually sell?** (product/service, not the marketing description)
2. **Who pays and why?** (identify the economic buyer vs end user if different)
3. **What would happen if this company disappeared tomorrow?** (the higher the disruption, the stronger the moat)
4. **How does the company make money harder to lose over time?** (look for compounding mechanisms)

---

### Phase 2 — Ten Moats Assessment

Rate each of the ten moats as `strong / intact / weakened / destroyed`. For each, answer: *Is AI making this moat stronger or weaker?*

#### AI-Vulnerable Moats

**1. Learned Interfaces** (`learnedInterfaces`)
- Does the product have a complex UI/workflow that users invest time mastering?
- Would AI agents be able to operate competing products just as easily?
- *Weakened* if AI can abstract away the interface; *strong* if human expertise compounds (e.g., surgical robotics)

**2. Business Logic Lock-in** (`businessLogic`)
- Is the company's software deeply embedded in a customer's proprietary processes?
- Could an AI re-implement the business logic from scratch in weeks?
- *Strong* if the logic is customised per enterprise and has years of configuration; *destroyed* if it's a generic SaaS

**3. Public Data Access** (`publicDataAccess`)
- Does the company control access to a valuable dataset others can't replicate?
- Is that data becoming more accessible via AI scraping and synthesis?
- *Intact* if data is contractual/proprietary; *weakened* if AI makes equivalent data freely available

**4. Talent Scarcity** (`talentScarcity`)
- Is the moat built on hard-to-hire specialists?
- Can AI automate or augment those roles significantly?
- *Strong* if human judgment remains irreplaceable (e.g., chip architects, surgeons); *weakened* if AI coding/analysis replaces the scarcity

**5. Bundling** (`bundling`)
- Does the company benefit from customers purchasing a multi-product suite?
- Is AI enabling point-solution competitors to replicate bundle value cheaply?
- *Strong* if bundle integration creates emergent value AI can't replicate; *weakened* if AI enables unbundling

#### AI-Resilient Moats

**6. Proprietary Data** (`proprietaryData`)
- Does the company own unique, non-public data that gets more valuable over time?
- Is this data used to improve products in a way competitors can't replicate?
- *Strong* if data is contractually exclusive, continuously updated, and central to the product (e.g., Bloomberg terminal data, credit card transaction flows)

**7. Regulatory Lock-in** (`regulatoryLockIn`)
- Does the product require government certification, compliance, or contract approval?
- Are there multi-year procurement cycles or accreditation requirements?
- *Strong* if switching involves regulatory re-certification (e.g., FedRAMP, FDA approval, HIPAA); *weakened* if regulations are being relaxed

**8. Network Effects** (`networkEffects`)
- Does each additional user make the product more valuable for all users?
- Is this direct (social) or indirect (marketplace, data flywheel)?
- *Strong* if the network is self-reinforcing and entrenched; *intact* if growing but not yet dominant; *weakened* if network fragmentation is accelerating

**9. Transaction Embedding** (`transactionEmbedding`)
- Is the company embedded in the payment or workflow layer of daily operations?
- Would removing it require re-engineering core business processes?
- *Strong* if it processes transactions and sits between buyer and seller at scale (e.g., Mastercard, Stripe); *intact* if embedded in workflows but with alternatives

**10. System of Record** (`systemOfRecord`)
- Is this the authoritative source of truth for a critical business function?
- Would migrating away require data cleansing, reconciliation, and business risk?
- *Strong* if it stores identity, financial, legal, or healthcare records that can't be easily moved (e.g., Active Directory, core banking systems)

---

### Phase 3 — Moat Score Derivation

Calculate the moat score (0–100) as a weighted average:

| Weight | Category |
|---|---|
| 60% | AI-resilient moats (proprietaryData, regulatoryLockIn, networkEffects, transactionEmbedding, systemOfRecord) |
| 40% | AI-vulnerable moats (learnedInterfaces, businessLogic, publicDataAccess, talentScarcity, bundling) |

Point values: `strong` = 100, `intact` = 75, `weakened` = 40, `destroyed` = 0 (N/A moats are excluded from the average).

**Calibration anchors:**
- ASML: 94 (near-monopoly on EUV lithography, regulatory + proprietary data)
- Mastercard/Visa: 88–90 (network effects + transaction embedding + regulatory)
- Microsoft: 84 (bundling + system of record + proprietary data)
- Meta: 73 (network effects strong but vulnerable moats weakened by AI)
- Netflix: 63 (content moat is non-durable, no structural lock-in)

---

### Phase 4 — Growth Score

Assess the 3–5 year growth outlook:

**Revenue Growth Rate (primary driver)**
- 30%+ CAGR → starts at 90+
- 15–30% CAGR → 75–89
- 8–15% CAGR → 60–74
- 4–8% CAGR → 45–59
- Below 4% → below 45

**Adjust for quality:**
- +5 to +10 if growth is recurring/subscription-based with high net revenue retention
- +5 if there is a new TAM expansion catalyst (e.g., AI monetisation layer on top of existing base)
- -5 to -10 if growth is lumpy, cyclical, or dependent on a single customer
- -5 if margin compression accompanies growth

**Key questions to answer:**
1. What drives the next 3 years of growth? Name the specific product or market.
2. Is this a TAM expansion story or a market share story?
3. What is the biggest risk to the growth thesis? (Be specific: regulation, competition, technology shift)

---

### Phase 5 — Valuation Assessment

Compare current price to bear/base/bull scenarios using the piecewise scoring system from `src/lib/valuationScore.ts`:

| Price vs Scenarios | Score |
|---|---|
| ≤ 0.8× bear | 100 (deeply discounted) |
| At bear | 90 |
| Between bear and base | 90 → 65 (linear) |
| At base | 65 |
| Between base and bull | 65 → 45 (linear) |
| At bull | 45 |
| ≥ 1.2× bull | 20 (premium valuation) |

**Set or validate scenarios:**

*Bear*: What earnings/revenue trajectory is the market currently pricing in worst case? What macro or competitive shock causes a permanent re-rating down?

*Base*: What does consensus expect? Is there a margin of safety if consensus is achieved?

*Bull*: What specific catalyst (new product, market, partnership) drives upside to 1.5–2.5× current price over 3–5 years?

---

### Phase 6 — Composite Score and Recommendation

**Composite score = (moatScore + growthScore + valuationScore) / 3**

| Composite | Recommendation |
|---|---|
| ≥ 82 | Strong Buy |
| 75–81 | Accumulate |
| 68–74 | Hold |
| 60–67 | Speculative Buy |
| Below 60 | Avoid / Exclude |

**Portfolio inclusion rules (from `src/app/stockData.ts`):**
- Minimum average score: 75
- Maximum portfolio size: 20 stocks
- Stocks below 75 average or outside the top 20 by score are excluded

---

### Phase 7 — Output Report

Produce a structured report with these sections:

```
## [TICKER] — [Company Name]
**Composite Score:** [X] ([moat]/[growth]/[valuation])
**Recommendation:** [Strong Buy | Accumulate | Hold | Speculative Buy | Avoid]
**Current Price:** $X  |  **Bear:** $X  |  **Base:** $X  |  **Bull:** $X

### Moat Analysis (Score: X/100)
[Primary moat thesis in 2-3 sentences]

**Ten Moats Breakdown:**
| Moat | Status | AI Impact |
|------|--------|-----------|
| Learned Interfaces | strong/intact/weakened/destroyed | strengthened/weakened/neutral |
...

**AI Resilience Score:** X/100
**Verdict:** [2 sentences]

### Growth Analysis (Score: X/100)
[Growth thesis, key drivers, and 3-5 year CAGR estimate]

### Valuation Analysis (Score: X/100)
[Where price sits vs scenarios, margin of safety commentary]

### Scenarios
**Bear ($X):** [1 sentence]
**Base ($X):** [1 sentence]
**Bull ($X):** [1 sentence]

### Key Risks
1. [Specific, falsifiable risk with time horizon]
2. [Specific, falsifiable risk with time horizon]
3. [Specific, falsifiable risk with time horizon]

### Conclusion
[2-3 sentence summary of the investment case and what would change the thesis]
```

---

## If Updating an Existing Stock

If `src/data/stocks/{ticker}.json` exists, compare the analysis to the current data and flag:

1. **Stale metrics** — headerStats or metrics referencing outdated quarters
2. **Outdated price targets** — scenarios that were set over 12 months ago without revision
3. **Moat status changes** — any moat whose status should be upgraded or downgraded given recent news
4. **Score drift** — if the composite score has changed materially (±5 or more), update all three scores
5. **Recommendation consistency** — ensure recommendation aligns with the updated composite score

Propose specific JSON edits for any fields that need updating.
