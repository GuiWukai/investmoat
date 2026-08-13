/**
 * Research article registry — maps slug → article data for the
 * /research and /research/[slug] routes.
 *
 * To add an article: drop the JSON in this directory and add one entry below.
 * `npm run validate:research` (wired into prebuild) checks it against the Zod
 * schema in src/lib/researchSchema.ts and fails the build on drift.
 *
 * Unlike stocks, there is only ONE registry — articles are not scored or
 * ranked, so nothing equivalent to src/app/stockData.ts is needed.
 */

import type { ResearchArticleData } from '@/types/research';

import alphabetAiBuild from './the-odds-on-alphabets-ai-build.json';
import camecoUraniumBeta from './cameco-and-the-uranium-beta-trade.json';
import datadogMeter from './datadog-and-the-meter-on-the-cluster.json';
import halfWithTheMoat from './sp-global-and-the-half-with-the-moat.json';
import oneReceipt from './metas-capex-has-one-receipt.json';
import seatPricing from './servicenow-and-the-seat-pricing-question.json';

const researchArticles: Record<string, ResearchArticleData> = {
  'cameco-and-the-uranium-beta-trade': camecoUraniumBeta as ResearchArticleData,
  'datadog-and-the-meter-on-the-cluster': datadogMeter as ResearchArticleData,
  'metas-capex-has-one-receipt': oneReceipt as ResearchArticleData,
  'servicenow-and-the-seat-pricing-question': seatPricing as ResearchArticleData,
  'sp-global-and-the-half-with-the-moat': halfWithTheMoat as ResearchArticleData,
  'the-odds-on-alphabets-ai-build': alphabetAiBuild as ResearchArticleData,
};

/** All slugs, newest first by published date. */
export function getAllResearchSlugs(): string[] {
  return Object.values(researchArticles)
    .slice()
    .sort((a, b) => publishedTime(b) - publishedTime(a))
    .map((a) => a.slug);
}

/** All articles, newest first by published date. */
export function getAllResearchArticles(): ResearchArticleData[] {
  return getAllResearchSlugs().map((slug) => researchArticles[slug]);
}

export function getResearchArticle(slug: string): ResearchArticleData | undefined {
  return researchArticles[slug];
}

/** Articles that cover a given ticker, newest first. */
export function getResearchForTicker(ticker: string): ResearchArticleData[] {
  const upper = ticker.toUpperCase();
  return getAllResearchArticles().filter((a) =>
    a.tickers.some((t) => t.toUpperCase() === upper),
  );
}

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Parse a day-precision date ("July 28, 2026") to a UTC Date. The schema
 * enforces the format, so a miss here means the registry and schema drifted.
 */
export function parseArticleDate(value: string): Date | undefined {
  const match = value.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return undefined;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return undefined;
  return new Date(Date.UTC(parseInt(match[3], 10), month, parseInt(match[2], 10)));
}

function publishedTime(a: ResearchArticleData): number {
  return parseArticleDate(a.published)?.getTime() ?? 0;
}
