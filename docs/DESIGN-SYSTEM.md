# Design system — "Institutional Gold"

The UI is styled to read like a professional investment fund / research desk: a deep-slate dark canvas, a champagne-gold signature accent, editorial serif headlines, and tabular/monospace data. Design tokens and utilities live in [`src/app/globals.css`](../src/app/globals.css). The app is **dark-mode only**.

## Colour tokens

Defined as CSS variables in `:root`:

| Token | Value | Use |
|---|---|---|
| `--background` | `#080a0e` | Near-black slate canvas |
| `--foreground` | `#f4f1ea` | Warm off-white text |
| `--gold` | `#c9a96a` | Brand accent (champagne gold) |
| `--gold-bright` | `#e4c98a` | Highlight / hover gold |
| `--gold-deep` | `#9c7f44` | Gradient shadow gold |
| `--positive` / `--accent` | `#34d399` | Gains (green) |
| `--negative` | `#fb7185` | Losses (red) |

`--primary`/`--secondary` are aliased to gold so existing utilities pick up the brand colour.

### Semantic data colours (do not rebrand)

These carry meaning and must stay legible for traders:

- **Green / red** — gains / losses, up / down.
- **Score pills** — green ≥ 90, blue ≥ 80, amber ≥ 70, red below.
- **Moat groups** — blue = AI-resilient, amber = AI-vulnerable.
- **Scenarios** — rose = bear, blue = base, emerald = bull.

Gold is for **brand chrome** (nav, eyebrows, CTAs, focus states), not data.

## Typography

Four families, each with a job:

| Role | Family | Token / how it's applied |
|---|---|---|
| Brand wordmark | **Libre Caslon Display** | `--font-brand`, applied to "InvestMoat" in the nav and OG images (matches Wealthsimple's Caslon look) |
| Headlines (`h1`–`h4`) | **Newsreader** | `--font-serif`, applied globally to headings for editorial gravitas |
| Labels & numerics | **IBM Plex Mono** | `--font-mono` and `.section-label`; `tabular-nums` for aligned figures |
| Body | **Inter** | Default `body` font |

All four are loaded via a single Google Fonts `@import` at the top of `globals.css`.

## Utility classes

| Class | Effect |
|---|---|
| `.section-label` | Uppercase, wide-tracked, gold, mono eyebrow label |
| `.gradient-text` | Off-white → gold text gradient |
| `.gradient-text-animated` | Champagne sheen sweep (used on big display headings) |
| `.primary-gradient` | Gold gradient background (logo tile, primary buttons) |
| `.text-gold` / `.text-gold-bright` / `.border-gold` / `.bg-gold-soft` | Gold accent helpers |
| `.fund-rule` | Hairline divider with a gold tick |
| `.dot-pattern` | Fine engraved grid background ("research desk" texture) |
| `.glass-card` | Translucent bordered card with blur |

Ambient gold glows, the gold scrollbar, and gold text selection are also defined globally.

## Brand mark & favicon

- [`src/components/MoatMark.tsx`](../src/components/MoatMark.tsx) — the logo glyph: a fortified shield ringed by a moat around a protected core. Stroke-based, inherits `currentColor`, used inside the gold nav tile.
- [`src/app/icon.svg`](../src/app/icon.svg) — favicon: the same glyph in gold on a dark rounded tile.

## OpenGraph / social images

`next/og` (Satori) does **not** read CSS or web fonts, so OG images can't use the tokens above directly:

- Colours are written inline as literal hex values matching the palette.
- The brand wordmark font is bundled as a TTF in [`src/app/_fonts/`](../src/app/_fonts) (a `_`-prefixed private folder, so it isn't a route) and loaded via `fetch(new URL(..., import.meta.url))`, then passed to `ImageResponse` through the `fonts` option. Both `src/app/opengraph-image.tsx` and `src/app/stocks/[ticker]/opengraph-image.tsx` fall back to the default sans if the font can't be read, so image generation never breaks.

## Changing the brand font

1. Add the family to the Google Fonts `@import` in `globals.css`.
2. Update `--font-brand`.
3. If it should also appear on the OG share cards, add the TTF to `src/app/_fonts/` and reference it from both OG routes.
