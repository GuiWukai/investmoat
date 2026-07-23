import { getAllSlugs, getStockData } from '@/data/stocks';
import { computeStockScores } from '@/lib/stockMarkdown';

const SITE_URL = 'https://investmoat.com';

/**
 * /llms.txt — a curated, LLM-facing index of the site, following the
 * llms.txt convention (https://llmstxt.org). It gives an agent the site's
 * purpose, the scoring methodology, and a linked list of every analysis
 * (with its Markdown mirror) in a single, cheap-to-parse document.
 *
 * Statically generated at build time from the same data that drives the site.
 */
export const dynamic = 'force-static';

function buildLlmsTxt(): string {
  const slugs = getAllSlugs();

  const rows = slugs
    .map((slug) => {
      const data = getStockData(slug);
      if (!data) return null;
      const s = computeStockScores(data);
      const assetClass = data.assetClass ?? 'equity';
      const summary =
        `${data.name} (${data.ticker}) · ${assetClass} · Composite ${s.composite}/100 · ` +
        `${s.recommendation} · Moat ${s.moat} / Growth ${s.growth} / Valuation ${s.valuation}`;
      return `- [${data.name} (${data.ticker})](${SITE_URL}/stocks/${slug}/llms.txt): ${summary}`;
    })
    .filter((row): row is string => row !== null)
    .sort();

  return `# InvestMoat

> Open-source equity-research framework that scores stocks, crypto, and
> commodities on economic moat durability, growth trajectory, and live
> valuation, then assembles a concentrated, high-conviction portfolio built to
> compound through the AI era.

Every score on this site is computed deterministically from a structured data
file by a single documented formula — there are no hand-typed ratings. Each
analysis below links to a clean Markdown mirror (append \`/llms.txt\` to any
\`/stocks/<ticker>\` URL) so agents can read the full thesis without parsing HTML.

## Methodology

- Composite = geometric blend of Moat^0.40 × Growth^0.30 × Valuation^0.30, scaled to 0–100.
- Recommendation bands: Strong Buy ≥ 82, Accumulate ≥ 75, Hold ≥ 68, Speculative Buy ≥ 60, otherwise Avoid.
- Moat scoring is asset-class aware: equities use a 10-moat business framework, crypto a 5-pillar monetary framework, commodities a 3-pillar framework. Scores are NOT comparable across asset classes.
- Live prices are fetched from Yahoo Finance; if unavailable, valuation falls back to the static estimate.

## Key pages

- [Portfolio overview](${SITE_URL}/portfolio): the concentrated, score-selected portfolio.
- [All analyses](${SITE_URL}/stocks): the full ranked universe.
- [Sitemap](${SITE_URL}/sitemap.xml)

## Analyses

${rows.join('\n')}

## Notes

InvestMoat is an open-source research and education framework. Nothing here is
financial advice. Past performance does not guarantee future results.
`;
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
