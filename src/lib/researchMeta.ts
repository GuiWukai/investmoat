import type { ResearchArticleData, ResearchBlock } from '@/types/research';

/**
 * Derived, presentation-only metadata for research articles — section anchors
 * and reading time. Nothing here is authored in the JSON: an article carries
 * blocks, and the reader-facing scaffolding (contents rail, "N min read") is
 * computed from them so it can never drift from the prose.
 */

/** Slug for a heading, safe as a DOM id and a URL fragment. */
export function headingSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

export interface ArticleSection {
  id: string;
  label: string;
  eyebrow?: string;
}

/**
 * The table-of-contents entries for an article: the thesis panel, every
 * `heading` block, then the standing foot sections the renderer emits.
 * Ids are de-duplicated so two identically-titled headings still get
 * distinct anchors.
 */
export function getArticleSections(article: ResearchArticleData): ArticleSection[] {
  const seen = new Map<string, number>();
  const sections: ArticleSection[] = [{ id: THESIS_ID, label: 'Thesis in brief' }];

  for (const block of article.blocks) {
    if (block.type !== 'heading') continue;
    const base = headingSlug(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    sections.push({
      id: count === 0 ? base : `${base}-${count + 1}`,
      label: block.text,
      eyebrow: block.eyebrow,
    });
  }

  if (article.falsifiableBy) {
    sections.push({ id: FALSIFIABLE_ID, label: 'What would prove this wrong' });
  }
  if (article.sources && article.sources.length > 0) {
    sections.push({ id: SOURCES_ID, label: 'Sources' });
  }
  if (article.revisions && article.revisions.length > 0) {
    sections.push({ id: REVISIONS_ID, label: 'Revisions' });
  }

  return sections;
}

/** Standing section ids — shared by the TOC and the view. */
export const THESIS_ID = 'thesis';
export const FALSIFIABLE_ID = 'what-would-prove-this-wrong';
export const SOURCES_ID = 'sources';
export const REVISIONS_ID = 'revisions';

/**
 * Resolve heading blocks to their anchor ids in render order, so the renderer
 * can stamp the same ids the TOC links to.
 */
export function buildHeadingIds(article: ResearchArticleData): Map<number, string> {
  const seen = new Map<string, number>();
  const ids = new Map<number, string>();

  article.blocks.forEach((block, i) => {
    if (block.type !== 'heading') return;
    const base = headingSlug(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    ids.set(i, count === 0 ? base : `${base}-${count + 1}`);
  });

  return ids;
}

const WORDS_PER_MINUTE = 220;
/** A data block costs a reader roughly this long to scan. */
const SECONDS_PER_DATA_BLOCK = 25;

function words(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function blockWords(block: ResearchBlock): number {
  switch (block.type) {
    case 'prose':
      return words(block.body);
    case 'heading':
      return words(block.text);
    case 'callout':
      return words(block.body) + words(block.title ?? '');
    case 'list':
      return block.items.reduce((sum, item) => sum + words(item), 0);
    case 'table':
      return block.rows.reduce(
        (sum, row) => sum + row.reduce((s, cell) => s + words(cell), 0),
        words(block.caption ?? ''),
      );
    case 'chart':
      return words(block.caption ?? '') + words(block.note ?? '');
    case 'scorecard':
      return Object.values(block.notes ?? {}).reduce((sum, n) => sum + words(n), 0);
    case 'moat-matrix':
      return words(block.caption ?? '');
    case 'stat-strip':
      return block.stats.reduce((sum, s) => sum + words(s.note ?? ''), 0);
  }
}

const DATA_BLOCKS = new Set(['table', 'chart', 'scorecard', 'moat-matrix', 'stat-strip']);

/** Word count of the page-visible copy (dek, summary, and blocks). */
export function articleWordCount(article: ResearchArticleData): number {
  return article.blocks.reduce(
    (sum, b) => sum + blockWords(b),
    words(article.dek) + words(article.summary),
  );
}

/** Estimated reading time in whole minutes (never less than 1). */
export function readingMinutes(article: ResearchArticleData): number {
  const total = article.blocks.reduce((sum, b) => sum + blockWords(b), words(article.dek));
  const scanning = article.blocks.filter((b) => DATA_BLOCKS.has(b.type)).length;
  const minutes = total / WORDS_PER_MINUTE + (scanning * SECONDS_PER_DATA_BLOCK) / 60;
  return Math.max(1, Math.round(minutes));
}
