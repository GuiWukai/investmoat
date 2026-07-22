import { getStockData, getAllSlugs } from '@/data/stocks';
import { stockToMarkdown } from '@/lib/stockMarkdown';

/**
 * Plain-Markdown mirror of a stock analysis, served at
 * /stocks/[ticker]/llms.txt for LLMs and agents that prefer clean text over
 * the interactive HTML page. Statically generated at build time.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return getAllSlugs().map((ticker) => ({ ticker }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const data = getStockData(ticker);
  if (!data) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(stockToMarkdown(data), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
