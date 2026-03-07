# Analyse Stock

Run a deep-dive analysis on an existing or prospective stock using the InvestMoat Ten Moats framework.

**Usage:** `/analyse-stock TICKER`

---

## What This Skill Does

Produces a structured investment analysis report for `$ARGUMENTS` covering moat durability, AI-era resilience, growth trajectory, valuation relative to scenarios, and an overall recommendation. If the stock already exists in `src/data/stocks/`, redirect to `/update-stock $ARGUMENTS` instead — do not duplicate work.

---

## Step 0 — Check if Stock Already Exists

Before doing any analysis, check whether `src/data/stocks/{slug}.json` exists for `$ARGUMENTS`.

- **If it exists:** Run `/update-stock $ARGUMENTS` instead of this skill.
- **If it doesn't exist:** Proceed with the steps below.

---

## Step 1 — Research the Company

Search for current data before scoring anything. Do not rely on training data for financials — prices, earnings, and moat dynamics change.

**Search for:**
- Current stock price, market cap, 52-week range
- Most recent 2 quarters of revenue, gross margin, and operating income
- Free cash flow and ROIC for the trailing twelve months
- Forward guidance from the most recent earnings call
- Key recent news: product launches, regulatory changes, competitor moves

**Business Model Clarity — answer before scoring:**
1. **What does the company actually sell?** (product/service, not the marketing description)
2. **Who pays and why?** (identify the economic buyer vs end user if different)
3. **What would happen if this company disappeared tomorrow?** (the higher the disruption, the stronger the moat)
4. **How does the company make money harder to lose over time?** (look for compounding mechanisms)
5. **Is this a software/data business, a physical/hardware business, or a regulated asset?** (this determines which moats are applicable — see N/A guidance in Step 2)

---

## Step 2 — Ten Moats Assessment

Rate each moat as `strong / intact / weakened / destroyed`. For each, answer: *Is AI making this moat stronger or weaker?*

**Before scoring, determine the business type:**
- **Software/platform businesses** (e.g., MSFT, CRM, META): all 10 moats are potentially applicable
- **Hardware/physical monopolies** (e.g., ASML, TSM): transaction embedding, system of record, learned interfaces are often N/A → set to `"destroyed"` with note explaining N/A
- **Regulated assets / utilities** (e.g., CEG): interface, data, bundling moats are often N/A → set to `"destroyed"` with N/A note
- **Luxury/physical goods** (e.g., RACE): business logic, data access, system of record are often N/A → set to `"destroyed"` with N/A note
- **Commodities/crypto** (e.g., BTC, XAU): most software moats are N/A; focus on network effects and regulatory recognition

**N/A rule:** If a moat category genuinely doesn't apply to the business model, mark it `"destroyed"` and write `"N/A — [reason]"` in the note. Do not force-fit inapplicable moats.

### AI-Vulnerable Moats

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

### AI-Resilient Moats

**6. Proprietary Data** (`proprietaryData`)
- Does the company own unique, non-public data that gets more valuable over time?
- Is this data used to improve products in a way competitors can't replicate?
- *Strong* if data is contractually exclusive, continuously updated, and central to the product (e.g., Bloomberg terminal data, credit card transaction flows)

**7. Regulatory Lock-in** (`regulatoryLockIn`)
- Does the product require government certification, compliance, or contract approval?
- Are there multi-year procurement cycles or accreditation requirements?
- *Strong* if switching involves regulatory re-certification (e.g., FedRAMP, FDA approval, HIPAA, NRSRO); *weakened* if regulations are being relaxed

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

## Step 3 — Moat Score Derivation

### Formula

Calculate `moat.score` (0–100) using the following:

**Point values per moat status:**
| Status | Points |
|---|---|
| `strong` | 100 |
| `intact` | 75 |
| `weakened` | 40 |
| `destroyed` (N/A) | excluded from average |
| `destroyed` (genuine weakness) | 0 |

**Weighting:**
- AI-resilient moats (proprietaryData, regulatoryLockIn, networkEffects, transactionEmbedding, systemOfRecord): **60% weight**
- AI-vulnerable moats (learnedInterfaces, businessLogic, publicDataAccess, talentScarcity, bundling): **40% weight**

**Exclude N/A moats from their group average.** If a group has all moats marked N/A, use only the other group's score.

### Moat Score ↔ AI Resilience Score Consistency Rule

`moat.score` and `tenMoats.aiResilienceScore` must be within **5 points of each other** unless there is a specific, documented structural reason for a larger gap (e.g., a physical asset business where the moat is real but AI-irrelevant). If the gap exceeds 5 points, revisit both scores — one of them is wrong.

**Exception:** Non-software businesses (luxury goods, regulated utilities, physical hardware) may have a large gap by design. Document the reason explicitly in the `tenMoats.verdict`.

### Calibration Anchors

Cross-check your score against these anchors before finalising:

| Company | Score | Why |
|---|---|---|
| ASML | 94 | Physical monopoly on EUV; regulatory + proprietary process data; most moats are N/A (hardware) |
| Visa / Mastercard | 88–90 | Network effects + transaction embedding + regulatory lock-in across 4B+ cards |
| MSCI | 91 | Index standard = 50-year regulatory moat; system of record for global benchmarks |
| Microsoft | 84 | Bundling + system of record + proprietary data; antitrust risk caps upside |
| Meta | 79 | Network effects strong; AI-resilient moats solid; regulatory drag from GDPR/DMA |
| Shopify | 78 | Proprietary merchant data + network effects; AI-vulnerable moats weakened |
| Netflix | 63 | Content moat is non-durable; no structural lock-in; high substitutability |
| AMD | 52 | No software moat (no CUDA equivalent); execution-dependent; hardware without monopoly |

### Peer-Group Consistency Check

Before finalising the score, compare it to similar businesses already in the portfolio:

| Peer Group | Expected Range |
|---|---|
| Financial data / index providers (MCO, MSCI, SPGI) | 87–92 |
| Payment networks (V, MA) | 88–91 |
| Enterprise software with deep embedding (MSFT, ORCL) | 82–86 |
| AI-native platforms (NVDA, CRWD, PLTR) | 78–86 |
| Consumer platforms (META, GOOGL, NFLX) | 63–88 |
| Physical monopolies (ASML, TSM) | 88–94 |
| Semiconductors — commodity (AMD, MU) | 50–65 |
| Healthcare (ISRG, LLY, UNH) | 80–90 |
| Commodities / crypto | 50–76 |

If your score is more than 8 points outside the peer range, document why this company is exceptional — or recalibrate.

---

## Step 4 — AI Resilience Score

Calculate `aiResilienceScore` separately from `moat.score` using the same formula but with explicit focus on AI impact:

- For each moat, ask: *Has AI made this moat stronger, weaker, or irrelevant since 2022?*
- Apply the same 60/40 weighting and N/A exclusion rules
- `aiResilienceScore` should be within 5 points of `moat.score` (see consistency rule above)

Write a `verdict` of 2–4 sentences that:
1. States whether the company is a net beneficiary or net loser from AI
2. Names the specific moats that are AI-resilient and why
3. Names the specific moats most at risk from AI
4. Concludes with a one-sentence summary of AI era durability

---

## Step 5 — Growth Score

Assess the 3–5 year growth outlook:

**Revenue Growth Rate (primary driver)**
- 30%+ CAGR → starts at 90+
- 15–30% CAGR → 75–89
- 8–15% CAGR → 60–74
- 4–8% CAGR → 45–59
- Below 4% → below 45

**Adjust for quality:**
- +5 to +10 if growth is recurring/subscription-based with high net revenue retention (>110% NRR)
- +5 if there is a new TAM expansion catalyst (e.g., AI monetisation layer on top of existing base)
- -5 to -10 if growth is lumpy, cyclical, or dependent on a single customer (>20% revenue concentration)
- -5 if margin compression accompanies growth (operating margin declining while revenue grows)

**Key questions to answer:**
1. What drives the next 3 years of growth? Name the specific product or market.
2. Is this a TAM expansion story or a market share story?
3. What is the biggest risk to the growth thesis? (Be specific: regulation, competition, technology shift)

---

## Step 6 — Valuation Assessment

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

**Set scenarios (12–24 month horizon):**

*Bear*: Realistic downside — 1–2 headwinds materialise. What macro or competitive shock causes a permanent re-rating down? Not catastrophic collapse.

*Base*: Most likely outcome given current trajectory. Consensus estimates achieved, no major surprises. Should represent fair value with a margin of safety.

*Bull*: Upside if 1–2 key catalysts exceed expectations. Plausible, not fantasy. Typically 40–80% above base for growth stocks.

**Scenario internal consistency check:** Bull target must be ≥ 1.5× bear target. If not, widen the range.

---

## Step 7 — Composite Score and Recommendation

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

## Step 8 — Output Report

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
| Learned Interfaces       | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Business Logic Lock-in   | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Public Data Access       | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Talent Scarcity          | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Bundling                 | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Proprietary Data         | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Regulatory Lock-in       | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Network Effects          | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| Transaction Embedding    | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |
| System of Record         | strong/intact/weakened/destroyed | strengthened/weakened/neutral/N/A |

**AI Resilience Score:** X/100
**Verdict:** [2–4 sentences covering AI beneficiary/loser, strongest moats, biggest AI risks]

### Growth Analysis (Score: X/100)
[Growth thesis, key drivers, named products/markets, 3–5 year CAGR estimate]

### Valuation Analysis (Score: X/100)
[Where price sits vs scenarios, margin of safety commentary, DCF assumptions if relevant]

### Scenarios
**Bear ($X):** [1 sentence thesis]
- [Specific falsifiable risk 1]
- [Specific falsifiable risk 2]
- [Specific falsifiable risk 3]

**Base ($X):** [1 sentence thesis]
- [Specific catalyst 1]
- [Specific catalyst 2]
- [Specific catalyst 3]

**Bull ($X):** [1 sentence thesis]
- [Specific upside catalyst 1]
- [Specific upside catalyst 2]
- [Specific upside catalyst 3]

### Key Risks
1. [Specific, falsifiable risk with time horizon — e.g., "If AMD ROCm reaches 10% developer share by 2026, CUDA moat weakens"]
2. [Specific, falsifiable risk with time horizon]
3. [Specific, falsifiable risk with time horizon]

### Peer Comparison
[1–2 sentences comparing this stock's moat score to its closest peer-group members and why it sits where it does]

### Conclusion
[2–3 sentence summary of the investment case and what specific events would change the thesis up or down]
```

---

## If Updating an Existing Stock

If `src/data/stocks/{ticker}.json` exists, **run `/update-stock $ARGUMENTS` instead**. Do not re-analyse from scratch.

If you must review inline, compare the analysis to the current data and flag:

1. **Stale metrics** — headerStats or metrics referencing outdated quarters
2. **Outdated price targets** — scenarios set over 6 months ago without revision
3. **Moat status changes** — any moat whose status should be upgraded or downgraded given recent news
4. **Score drift** — if the composite score has changed materially (±5 or more), update all three scores
5. **moat.score ↔ aiResilienceScore misalignment** — if the gap has grown beyond 5 points without a documented reason, reconcile them
6. **Recommendation consistency** — ensure recommendation aligns with the updated composite score

Propose specific JSON edits for any fields that need updating.

---

## Quality Standards

- **Be specific**: Use real financial metrics, not vague adjectives
- **Be current**: Reference the most recent quarterly results — search for them, don't assume
- **Be honest**: If the moat is weak, score it weak — don't inflate to force portfolio inclusion
- **Be consistent**: Match the tone and depth of existing stock analyses (read `msft.json` or `nvda.json` as reference)
- **Scenario targets must be internally consistent**: Bull target ≥ 1.5× bear target
- **Score alignment**: moat.score and aiResilienceScore must be within 5 points unless you document the structural reason
- **Peer calibration**: Always state which peer-group stocks you compared against before finalising the moat score
