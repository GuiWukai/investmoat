# Hyperscalers — Comparative Analysis

**As of:** June 2026
**Framework:** InvestMoat Ten Moats (moat 40% · growth 30% · valuation 30%, geometric composite)
**Scope:** The seven public names in the InvestMoat universe that build and rent hyperscale AI/cloud infrastructure.

> All scores below are the live, app-derived numbers produced by `src/lib/valuationScore.ts`
> from each stock's JSON — not re-authored estimates. This is a cross-cutting comparison
> of names already covered individually; it does not re-run a full per-stock analysis. For
> the deep dives see `/stocks/{ticker}`.

---

## The cohort

Hyperscalers come in three structurally different flavours, and conflating them is the
single most common analytical error in this sector. They do not share a moat profile,
a margin profile, or a risk profile.

| Tier | Names | What they are | Moat character |
|---|---|---|---|
| **Tier 1 — Integrated hyperscalers** | MSFT (Azure), AMZN (AWS), GOOGL (Google Cloud) | Public clouds wrapped around a cash-gushing core (Office/Windows, retail+ads, Search+ads) | Wide, multi-source, AI-resilient |
| **Tier 2 — Challenger / captive** | ORCL (OCI), META (captive infra) | Oracle is a database incumbent turning into a cloud; Meta builds hyperscale infra for itself, not for rent | Wide but narrower base (ORCL) / captive (META) |
| **Tier 3 — Neoclouds** | CRWV (CoreWeave), NBIS (Nebius) | Pure-play GPU landlords renting Nvidia capacity at hypergrowth | Narrow, time-bounded, concentrated |

---

## Scorecard

Sorted by composite. Recommendation bands: ≥82 Strong Buy · 75–81 Accumulate · 68–74 Hold · 60–67 Speculative Buy · <60 Avoid.

| Rank | Ticker | Moat | Growth | Val | **Composite** | Rec | Price | Mkt cap | Blended CAGR |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **MSFT** | 89 | 86 | 74 | **83** | Strong Buy | ~$411 | ~$3.05T | 15–17% |
| 2 | **ORCL** | 84 | 79 | 82 | **82** | Strong Buy | $140 | $397B | 22–26% |
| 3 | **META** | 82 | 86 | 79 | **82** | Strong Buy | ~$631 | ~$1.61T | 20–25% |
| 4 | **AMZN** | 82 | 89 | 73 | **81** | Accumulate | $274 | $2.89T | 15–20% |
| 5 | **GOOGL** | 86 | 80 | 72 | **80** | Accumulate | ~$365 | ~$4.4T | 17–22% |
| 6 | **CRWV** | 22 | 89 | 55 | **44** | Avoid | ~$125 | ~$69B | 70–120% |
| 7 | **NBIS** | 22 | 89 | 50 | **43** | Avoid | ~$175 | ~$44.4B | 100–250% |

**The headline:** the top five cluster within 3 composite points (83→80) — this is one of
the highest-quality cohorts in the entire universe. The two neoclouds sit ~36 points
below them. The neoclouds have the *highest* growth scores and the *lowest* composites,
which is the whole point of the moat-weighted framework: durability, not velocity, carries
the composite. Tier-1/2 names win on the 40%-weighted moat pillar; neoclouds get crushed there.

---

## The capex super-cycle is the story

Everything in this sector in 2026 rhymes off one number: the four mega-cap hyperscalers
(AMZN, MSFT, GOOGL, META) are guiding to **~$650–725B of combined capex in 2026** — roughly
double 2025 and the largest concentrated infrastructure cycle in tech history. Add Oracle
and the "big five" clear $600B+, of which ~75% (~$450B) is AI-specific (GPUs, custom silicon,
datacenters).

| Company | 2026 capex guide | Funding source | FCF impact |
|---|---|---|---|
| Amazon | ~$200B | AWS + retail + ads operating cash | FCF compressed to near-zero 2026–27 in bear case |
| Microsoft | ~$80–190B¹ | M365/Azure operating cash | Heaviest absolute drag of the software-pure names |
| Alphabet | ~$175–185B | Search + ads cash | Q1 net income flattered by investment gains; FCF pressured |
| Meta | $125–145B (raised from $115–135B) | Ads cash | Capex compression is META's single biggest 2026 risk |

¹ Reported figures for Microsoft 2026 capex vary by source ($80B headline vs ~$190B all-in
including leases/component inflation); the wide range itself is a signal of how aggressively
the cycle is being financed.

**Why this matters per tier:**

- **Tier 1/2 self-fund.** AWS, Azure, Search, ads and Office throw off enough cash to pay for
  the build out of operating profit. The risk is *FCF compression and multiple de-rating*, not
  solvency. If AI demand stalls, they slow capex and the cash comes back.
- **Tier 3 cannot self-fund.** CoreWeave and Nebius are financing multi-billion GPU buildouts
  with debt and equity against contracted backlog. CRWV carries a ~$95B backlog; NBIS is scaling
  from ~$530M to $3B+ revenue on a $16–20B capex plan. Their risk is *existential* — a demand
  air-pocket or a rate shock hits them before it hits the integrated players, and they have no
  cash-cow to retreat to. That asymmetry is exactly why their valuation scores (55/50) and
  moat scores (22/22) sit so far below Tier 1.

This is also the core **systemic risk** for the whole cohort: a meaningful slice of the demand
underwriting these commitments is circular (model labs funded by hyperscalers who then commit
to buy that hyperscaler's compute — e.g., Amazon's $33B into Anthropic against Anthropic's
$100B+ AWS commitment). If AI monetisation disappoints into 2027, the entire cohort de-rates
together regardless of individual moat quality.

---

## Cloud growth scoreboard (Q1 2026)

The competitive dynamic *within* the cloud is the most important read of the quarter:

| Cloud | Q1 2026 YoY | Trend | Read |
|---|---|---|---|
| **Google Cloud** | **+63%** | accelerating | Fastest of the three; ~$20B/qtr, ~$460B backlog. The clear share-gainer. |
| **Azure** | **+40%** | accelerating | Re-accelerating on AI; OpenAI relationship + enterprise bundle. |
| **AWS** | **+28%** | accelerating | Fastest in 15 quarters — but *slowest of the three in absolute growth rate*. |
| OCI (Oracle) | ~50%+ (RPO-led) | accelerating | $130B+ RPO; the genuine fourth hyperscaler, off a smaller base. |

**The most important tension in the group:** AWS is still the largest cloud by revenue, but it
is growing slower than both Azure (+40%) and GCP (+63%). Amazon bulls call the Q1 28% print a
durable re-acceleration; bears call it a one-quarter spike while the share-gain story belongs to
Google and Microsoft. This single question — *does AWS hold share in enterprise AI inference?* —
is the swing factor for the two largest names in the cohort by infrastructure spend.

---

## Moat comparison — where the composite is decided

The 40%-weighted moat pillar is what separates this cohort, and it maps cleanly onto the tiers.

**Tier 1/2 (82–89 moat):** wide, multi-source, and *AI-resilient*. Across MSFT/AMZN/GOOGL/ORCL the
strong moats are the ones AI strengthens rather than erodes:
- **System of record** — Azure AD/Entra, AWS as the substrate of the internet, the Oracle database
  embedded in mission-critical ERP. You don't migrate these without business risk.
- **Regulatory lock-in** — FedRAMP, GovCloud, HIPAA, sovereign-cloud certification. Switching means
  re-certification, which is a multi-year moat.
- **Proprietary data + custom silicon** — Trainium/Graviton (AWS), TPU (Google), the MSFT/OpenAI
  data loop. Custom silicon is becoming a *second* cloud moat: it lowers the cost floor in a way
  pure GPU-renters cannot match.
- **Bundling/network effects** — M365's 450M+ seats, the AWS marketplace flywheel, Google Search→Cloud.

META is the odd one out: a genuine 82 moat, but it is a *captive* hyperscaler. It builds frontier
infrastructure (Muse Spark, MSL) to defend a social/advertising moat, not to rent compute. Its moat
is advertising network effects + first-party data, with AI deepening ad targeting — not cloud lock-in.

**Tier 3 (22 moat):** narrow and time-bounded. CoreWeave's and Nebius's only durable edges are
Nvidia preferred-partner allocation and operational velocity during a GPU shortage. Almost every
one of the ten moats is N/A or weakened for a pure GPU landlord — there is no system of record, no
regulatory lock-in, no proprietary data flywheel. The 22 moat score is not a bug; it is the framework
correctly pricing the fact that *renting someone else's chips is not a moat*. When GPU supply
normalises, their pricing power compresses.

---

## Valuation & recommendation

| Ticker | Val score | Bear / Base / Bull | Read |
|---|---|---|---|
| ORCL | 82 | $110 / $200 / $320 | Cheapest of Tier 1/2 vs its own scenarios — at $140 it sits well below the $200 base. |
| META | 79 | $475 / $820 / $1,000 | At ~$631, meaningful margin of safety to the $820 base; widest absolute upside band. |
| MSFT | 74 | $300 / $475 / $590 | Fairly valued; "perfection priced in" — beats sell off. |
| AMZN | 73 | $195 / $310 / $395 | ~12% below base after a strong run; thinner margin of safety. |
| GOOGL | 72 | $235 / $420 / $560 | Best operational momentum (Cloud +63%) but richest relative to scenarios; ~$4.4T cap. |
| CRWV | 55 | $50 / $135 / $240 | Hypergrowth priced; bull/bear range is ~5×, reflecting binary outcome. |
| NBIS | 50 | $80 / $170 / $280 | Even more binary; thin coverage, high volatility. |

**Composite-driven calls:**
- **Strong Buy:** MSFT (83), ORCL (82), META (82) — the moat-quality + valuation-headroom sweet spot.
- **Accumulate:** AMZN (81), GOOGL (80) — elite businesses, but valuation headroom is thinner after
  strong runs, so the composite lands just under the Strong-Buy band.
- **Avoid (as core holdings):** CRWV (44), NBIS (44) — these are *trades on the GPU cycle*, not
  moat-compounders. They fail the portfolio's 80-average inclusion bar by a wide margin. A barbell
  investor might hold a small speculative position, but the framework will not put them in the
  25-name portfolio.

---

## Cross-cutting risks

1. **AI capex digestion (the whole cohort).** ~$700B is being spent against demand that is partly
   circular. If enterprise AI ROI disappoints into 2027, every name de-rates together — moat quality
   won't protect the multiple in a sector-wide air-pocket.
2. **AWS share loss (AMZN, and relative GOOGL/MSFT upside).** AWS at +28% vs Azure +40% / GCP +63%.
   If the gap widens through 2026, the AMZN re-acceleration thesis breaks and the share-gain accrues
   to Google and Microsoft.
3. **FCF compression → multiple de-rating (Tier 1/2).** Near-zero FCF years are tolerable only if the
   build pays off on schedule. Watch FCF inflection in 2027.
4. **Neocloud refinancing & concentration (CRWV, NBIS).** Debt-funded GPU buildouts with customer
   concentration and no cash-cow. A rate shock or a single large-customer loss is existential, not
   incremental.
5. **GPU supply normalisation (CRWV, NBIS).** Their pricing power is a function of scarcity. As Nvidia
   supply and competing silicon (Trainium, TPU, MI-series) ramp, the neocloud spread compresses.
6. **Regulatory/antitrust (GOOGL, AMZN, META).** Search remedies, marketplace+logistics bundling
   (ASCS), and ad-market scrutiny are live overhangs for the consumer-facing Tier 1 names.

---

## Verdict & ranking

**Quality ladder (moat-first):** MSFT ≈ GOOGL > AMZN ≈ ORCL ≈ META  ≫  CRWV ≈ NBIS.

**Risk-adjusted preference for new capital (composite + valuation headroom):**
1. **ORCL** — the best *value* expression of the cloud build (composite 82 on a valuation score of 82);
   the genuine fourth hyperscaler at the cheapest scenario positioning, with the trade-off being a
   negative-FCF capex cycle and the narrowest base of the Tier-1/2 group.
2. **META** — best margin-of-safety among the mega-caps (val 79, ~$190 to base) with an 86 growth score;
   captive-infra rather than rent-able cloud is the conceptual caveat.
3. **MSFT** — highest composite (83) and the most AI-resilient moat (89); you pay full price for it.
4. **AMZN / GOOGL** — elite, but Accumulate not Strong Buy purely on thinner valuation headroom; GOOGL
   has the best operating momentum (Cloud +63%), AMZN the AWS-share question to resolve.
5. **CRWV / NBIS** — express the GPU cycle, not the moat. Trade, don't hold; excluded from the portfolio.

**One-line summary:** the integrated hyperscalers are among the most durable AI-era compounders in the
universe and cluster at the top of the board; the neoclouds offer the fastest growth and the least
durability, and the framework rightly keeps them out of the core portfolio. The swing variable for
2026 is whether the ~$700B capex cycle converts to FCF on schedule — and whether AWS defends share
against a surging Google Cloud.

---

## Sources

- [Google Cloud vs AWS vs Azure Q1 2026 — MindStudio](https://www.mindstudio.ai/blog/google-cloud-vs-aws-vs-azure-q1-2026-ai-infrastructure-race)
- [Azure vs Google Cloud vs AWS AI 2026 — Oplexa](https://oplexa.com/azure-vs-google-cloud-vs-aws-ai-2026/)
- [The $112 Billion Quarter — Tomasz Tunguz](https://tomtunguz.com/2026-04-29-the-112-billion-quarter-hyperscalers-bet-the-farm-on-ai/)
- [Big Tech set to spend $650 billion in 2026 — Yahoo Finance](https://finance.yahoo.com/news/big-tech-set-to-spend-650-billion-in-2026-as-ai-investments-soar-163907630.html)
- [Hyperscalers Hit $700 Billion in 2026 AI Spending — Yahoo Finance](https://finance.yahoo.com/sectors/technology/articles/hyperscalers-hit-700-billion-2026-111243744.html)
- [Big Tech AI spending to hit $725 billion in 2026 — Tom's Hardware](https://www.tomshardware.com/tech-industry/big-tech/big-techs-ai-spending-plans-reach-725-billion)
- [Moody's: Hyperscaler capex to close in on $1trn by 2027 — DCD](https://www.datacenterdynamics.com/en/news/moodys-hyperscaler-capex-forecasts-marked-up-by-85bn-to-close-in-on-1trn-by-2027/)
- Per-stock InvestMoat analyses: `src/data/stocks/{amazon,msft,google,orcl,meta,crwv,nbis}.json`
