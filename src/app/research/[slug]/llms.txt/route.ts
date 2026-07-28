import { getResearchArticle, getAllResearchSlugs } from '@/data/research';
import { researchToMarkdown } from '@/lib/researchMarkdown';

/**
 * Plain-Markdown mirror of a research article, served at
 * /research/[slug]/llms.txt for LLMs and agents that prefer clean text over
 * the interactive HTML page. Statically generated at build time.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return getAllResearchSlugs().map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(researchToMarkdown(article), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
