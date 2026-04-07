import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinynest.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/profile/',
          '/messages/',
          '/my-listings/',
          '/list-home/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
