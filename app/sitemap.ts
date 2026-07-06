import { MetadataRoute } from 'next';
import { getDb } from '../lib/db';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinyliving.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic listing pages
  const indexableListings = (db.listings || []).filter((l: any) => 
    l.status === 'approved' && (!l.robotsMeta || !l.robotsMeta.includes('noindex'))
  );
  
  const listingUrls: MetadataRoute.Sitemap = indexableListings.map((listing: any) => {
    const url = listing.canonicalUrl || (listing.slug ? `${siteUrl}/listings/${listing.slug}` : `${siteUrl}/listings/${listing.id}`);
    return {
      url,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(listing.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    };
  });

  // Dynamic blog pages
  const indexableBlogs = (db.blogs || []).filter((b: any) => 
    !b.robotsMeta || !b.robotsMeta.includes('noindex')
  );

  const blogUrls: MetadataRoute.Sitemap = indexableBlogs.map((blog: any) => {
    const url = blog.canonicalUrl || (blog.slug ? `${siteUrl}/blogs/${blog.slug}` : `${siteUrl}/blogs/${blog.id}`);
    return {
      url,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...listingUrls, ...blogUrls];
}
