# InvestMoat

**Website: [www.investmoat.com](https://www.investmoat.com)**

An open-source equity-research framework that scores stocks, crypto, and commodities on **economic moat durability**, **growth trajectory**, and **live valuation** — then assembles a concentrated, high-conviction portfolio designed to compound through the AI era.

A portfolio that works for everyone, built to beat the S&P 500 on average through disciplined, systematic value investing.

## Philosophy

- **Moat-first** — Focus on businesses with durable competitive advantages that defend against disruption, especially from AI.
- **AI-aware** — Weight the moats AI *cannot* easily replicate (proprietary data, regulatory lock-in, network effects) more heavily than the moats it can.
- **Value investing** — Buy great businesses at fair prices, scored against explicit bear/base/bull scenarios using live market prices.
- **Concentration** — 25 positions, each earning its place by clearing a hard score threshold. No diluting into mediocrity.
- **Transparent & reproducible** — Every score is computed from a stock's JSON file by a single, documented formula. Edit the data, not the numbers.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Live prices come from Yahoo Finance (`query1.finance.yahoo.com`); no API key is required. If the upstream is unavailable, pages degrade gracefully (price shows `—`, scores fall back to their static valuation).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build (runs `validate:stocks` first via `prebuild`) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run validate:stocks` | Validate every stock JSON against the Zod schema |

## Documentation

Detailed docs live in [`docs/`](./docs):

| Doc | Contents |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | Tech stack, directory layout, routes, rendering model, live-price data flow |
| [Scoring methodology](./docs/SCORING.md) | How moat / growth / valuation / composite scores and portfolio selection work |
| [Data model](./docs/DATA-MODEL.md) | Stock JSON schema, the two-registry system, validation, adding & updating stocks |
| [Design system](./docs/DESIGN-SYSTEM.md) | "Institutional Gold" identity — colours, fonts, tokens, utilities, OG images |

Authoring helpers also exist as Claude Code slash commands in [`.claude/commands/`](./.claude/commands): `/add-stock`, `/analyse-stock`, `/update-stock`.

## Tech stack

[Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript · Tailwind CSS 3 · [HeroUI](https://www.heroui.com/) · Framer Motion · Zod. No database, no auth — all analysis lives in static JSON under `src/data/stocks/`.

## Contributing

Contributions are welcome — whether you're a developer, an investor, or just someone who wants a better financial future. See [`docs/DATA-MODEL.md`](./docs/DATA-MODEL.md) for how to add or update a stock, and [`AGENTS.md`](./AGENTS.md) for environment notes.

## Disclaimer

InvestMoat is an open-source research and education framework. Nothing here is financial advice. It represents the maintainers' analysis only. Consult a licensed financial adviser before making investment decisions. Past performance does not guarantee future results.

## Deploy

The app is deployed on [Vercel](https://vercel.com). Pushes open preview deployments; merges to `main` deploy to production.
