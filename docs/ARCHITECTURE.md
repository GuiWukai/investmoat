# Architecture

InvestMoat is a single [Next.js 16](https://nextjs.org) (App Router) application. There is **no database, no authentication, and no backend service** — every piece of analysis is a static JSON file, and the only runtime data fetch is live prices from Yahoo Finance.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI runtime | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + a small set of custom utilities in `globals.css` |
| Components | [HeroUI](https://www.heroui.com/) (provider + a few primitives like `Spinner`) |
| Animation | Framer Motion (mobile score tabs) + CSS keyframes |
| Icons | `lucide-react` |
| Validation | Zod (stock JSON schema) |
| Hosting | Vercel |

## Directory layout

```
src/
├── app/
│   ├── layout.tsx              # Root layout, <html>, metadata, JSON-LD, NavBar + <main>
│   ├── page.tsx                # Home — thesis, scoring framework, 10-moat model, FAQ
│   ├── globals.css             # Design tokens, fonts, utility classes
│   ├── providers.tsx           # HeroUIProvider
│   ├── stockData.ts            # ★ Coverage registry + portfolio selection (list pages)
│   ├── tenMoatsData.ts         # Ten-moats types/labels for UI
│   ├── opengraph-image.tsx     # Site-wide OG share image (next/og)
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── _fonts/                 # Bundled TTF for OG images (private folder, not a route)
│   ├── portfolio/page.tsx      # Portfolio allocation, weights, scenario returns
│   ├── stocks/
│   │   ├── page.tsx            # Coverage universe — searchable, filterable, sortable
│   │   └── [ticker]/
│   │       ├── page.tsx        # Per-stock analysis page (server)
│   │       └── opengraph-image.tsx
│   └── api/stock-price/[ticker]/route.ts   # Live price proxy → Yahoo Finance
├── components/                 # NavBar, MoatMark, analysis/gauge/chart components
│   └── research/
│       ├── page.tsx            # Research index
│       └── [slug]/             # Article page, OG image, llms.txt mirror
├── data/stocks/
│   ├── *.json                  # ★ One file per asset — the source of truth
│   └── index.ts                # ★ Registry for the /stocks/[ticker] route
├── data/research/
│   ├── *.json                  # One file per article — tickers, never numbers
│   └── index.ts                # Registry for the /research routes
├── lib/
│   ├── valuationScore.ts       # ★ All scoring formulas (single source of truth)
│   ├── stockSchema.ts          # Zod schema for stock JSON
│   ├── researchSchema.ts       # Zod schema for research JSON
│   └── researchMarkdown.ts     # Article → Markdown for the llms.txt mirror
└── types/stockAnalysis.ts      # TypeScript types for stock data
scripts/validate-stocks.ts      # Validates JSON + registry agreement (prebuild)
scripts/validate-research.ts    # Validates articles + ticker references (prebuild)
```

The four ★ files are where most changes happen. See [DATA-MODEL.md](./DATA-MODEL.md).

## Routes

| Route | Rendering | Description |
|---|---|---|
| `/` | Static | Home: thesis, scoring framework, 10-moat model, FAQ |
| `/portfolio` | Static (client-hydrated) | Allocation, position weights, weighted scenario returns |
| `/stocks` | Static (client-hydrated) | Coverage universe — search, category filter, column sort |
| `/stocks/[ticker]` | SSG (`generateStaticParams`) | Full per-asset analysis |
| `/research` | Static | Index of cross-cutting research articles |
| `/research/[slug]` | SSG (`generateStaticParams`) | A research article — see [RESEARCH.md](./RESEARCH.md) |
| `/llms.txt`, `/stocks/[ticker]/llms.txt`, `/research/[slug]/llms.txt` | Static | Markdown mirrors for LLM/agent consumption |
| `/api/stock-price/[ticker]` | Dynamic (route handler) | Live price proxy to Yahoo Finance |
| `/opengraph-image`, `/stocks/[ticker]/opengraph-image` | Edge (`next/og`) | Social share images |
| `/sitemap.xml` | Static | Generated from the coverage registry |

## Data flow

### Scores (build time)
Each stock JSON is the source of truth. At module load, `stockData.ts` computes the three pillar scores for every asset:

```
moat   = computeAssetMoatScore(json)   // dispatches on assetClass
growth = computeGrowthScore(json.growth.growthAnalysis)
value  = json.valuation.score          // static fallback
```

The portfolio is then derived: sort by composite, keep names clearing the minimum score, cap at 25. See [SCORING.md](./SCORING.md).

### Live prices (runtime, client)
Pages that show live data fetch `/api/stock-price/[ticker]`, which proxies Yahoo Finance and is cached (`revalidate: 3600` + `s-maxage`). The client then recomputes the **valuation** pillar from the live price against the bear/base/bull targets (`computeValuationScore`) and blends it back into the composite, so scores reflect the current price.

- `/portfolio` and `/stocks` fetch prices for the whole coverage list in parallel and recompute composites for ranking, weighting, and sorting.
- `/stocks/[ticker]` fetches a single price for the live widget, valuation gauge, and scenario bar.

If a fetch fails, the UI falls back to the static valuation score and shows `—` for price.

## Rendering notes

- The app is dark-mode only (`<html className="dark">`); `globals.css` defines the palette.
- `next/og` (Satori) does **not** read CSS or web fonts, so OG images bundle their own TTF from `src/app/_fonts/` — see [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md).
- SEO: per-page `metadata`, `WebSite`/`Organization`/`FAQPage` JSON-LD, sitemap, and robots.

## Conventions

- Develop on a feature branch; open a PR into `main`. Vercel builds a preview per PR.
- `npm run build` runs `validate:stocks` first — a malformed JSON fails the build.
- There are some pre-existing lint warnings (see `AGENTS.md`); avoid adding new ones.
