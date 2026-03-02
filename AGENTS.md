# AGENTS.md

## Cursor Cloud specific instructions

**InvestMoat** is a single Next.js (v16, App Router) application — a stock/investment portfolio analysis dashboard. There is no database, no authentication, and no Docker. All stock analysis data lives in static JSON files under `src/data/stocks/`.

### Running the app

- `npm run dev` starts the dev server on port 3000.
- Live stock prices are fetched from Yahoo Finance (`query1.finance.yahoo.com`); no API key is needed. If the external API is unavailable, pages degrade gracefully (price shows "—").

### Lint / Build / Test

- `npm run lint` — runs ESLint. Note: there are pre-existing lint warnings/errors in the repo (unused vars, `require()` in `tailwind.config.js`).
- `npm run build` — production build via Turbopack.
- No automated test suite exists (`npm test` is not configured).

### Key routes

| Route | Description |
|---|---|
| `/` or `/portfolio` | Portfolio overview with allocation breakdown |
| `/stocks/[ticker]` | Individual stock analysis (moat, growth, valuation, price scenarios) |
| `/api/stock-price/[ticker]` | API route fetching live price from Yahoo Finance |
