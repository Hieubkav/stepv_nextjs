import type { MetadataRoute } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Doc } from '@dohy/backend/convex/_generated/dataModel';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dohymedia.com';

async function getCourses(): Promise<Array<{ slug: string; updatedAt: number }>> {
  try {
    const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return [];

    const client = new ConvexHttpClient(convexUrl);
    const courses = (await client.query(api.courses.listCourses, {
      includeInactive: false,
    })) as Doc<'courses'>[];

    return courses
      .filter((c) => c.active && c.slug)
      .map((c) => ({
        slug: c.slug || '',
        updatedAt: c.updatedAt || Date.now(),
      }));
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await getCourses();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/khoa-hoc`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/thu-vien`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/khoa-hoc/${course.slug}`,
    lastModified: new Date(course.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
