import type { MetadataRoute } from 'next';

/**
 * Robots pengganti WordPress — izinkan Google pindah ke Next.js.
 */
function baseUrl(): string {
  const raw =
    (process.env.NEXT_PUBLIC_COMPANY_URL ||
      process.env.COMPANY_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      'https://thaisummitplastech.co.id')
      .trim()
      .replace(/\/+$/, '');
  return raw || 'https://thaisummitplastech.co.id';
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/login/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
