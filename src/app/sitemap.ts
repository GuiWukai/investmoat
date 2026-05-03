import type { MetadataRoute } from 'next';
import { getAllSlugs, getStockData } from '@/data/stocks';

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function parseLastAnalyzed(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  // Matches "April 2026" or "April 29, 2026"
  const match = value.trim().match(/^([A-Za-z]+)\s+(?:(\d{1,2}),\s+)?(\d{4})$/);
  if (!match) return fallback;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return fallback;
  const day = match[2] ? parseInt(match[2], 10) : 1;
  const year = parseInt(match[3], 10);
  return new Date(Date.UTC(year, month, day));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const slugs = getAllSlugs();

  const stockPages: MetadataRoute.Sitemap = slugs.map((slug) => {
    const data = getStockData(slug);
    return {
      url: `https://investmoat.com/stocks/${slug}`,
      lastModified: parseLastAnalyzed(data?.lastAnalyzed, now),
      changeFrequency: 'monthly',
      priority: 0.8,
    };
  });

  const latestStockUpdate = stockPages.reduce<Date>((acc, p) => {
    const d = p.lastModified instanceof Date ? p.lastModified : new Date(p.lastModified ?? now);
    return d > acc ? d : acc;
  }, new Date(0));

  return [
    {
      url: 'https://investmoat.com',
      lastModified: latestStockUpdate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://investmoat.com/stocks',
      lastModified: latestStockUpdate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://investmoat.com/portfolio',
      lastModified: latestStockUpdate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...stockPages,
  ];
}
