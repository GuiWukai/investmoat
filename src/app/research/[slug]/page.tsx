import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getResearchArticle,
  getAllResearchArticles,
  getAllResearchSlugs,
} from '@/data/research';
import ResearchArticleView, { type RelatedArticle } from '@/components/ResearchArticle';
import { researchArticleJsonLd, researchArticleMetadata } from '@/lib/researchSeo';

export async function generateStaticParams() {
  return getAllResearchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) return {};
  return researchArticleMetadata(article);
}

/**
 * Up to two sibling pieces for the end-of-article rail, ranked by shared
 * tickers then shared tags — a reader who finished this argument is most
 * likely to want the next one about the same names.
 */
function relatedArticles(slug: string): RelatedArticle[] {
  const current = getResearchArticle(slug);
  if (!current) return [];

  return getAllResearchArticles()
    .filter((a) => a.slug !== slug)
    .map((a) => ({
      article: a,
      overlap:
        a.tickers.filter((t) => current.tickers.includes(t)).length * 2 +
        a.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 2)
    .map(({ article }) => ({
      slug: article.slug,
      title: article.title,
      dek: article.dek,
      tags: article.tags,
      published: article.published,
    }));
}

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) notFound();

  const related = relatedArticles(slug);
  const jsonLd = researchArticleJsonLd(
    article,
    related.map((r) => ({ slug: r.slug, title: r.title })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResearchArticleView article={article} related={related} />
    </>
  );
}
