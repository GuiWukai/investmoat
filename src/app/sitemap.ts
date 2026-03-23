import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/data/stocks';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  const stockPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `https://investmoat.com/stocks/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://investmoat.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://investmoat.com/stocks',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://investmoat.com/portfolio',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...stockPages,
  ];
}
