import type { MetadataRoute } from 'next';

/**
 * Sitemap pengganti WordPress (wp-sitemap-posts-page-1.xml).
 * Canonical penuh ke https://thaisummitplastech.co.id agar Google pindah ranking.
 * Ganti domain cukup via env COMPANY_SITE_URL / NEXT_PUBLIC_COMPANY_URL.
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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const now = new Date();
  const staticRoutes = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/about', priority: 0.9, freq: 'weekly' as const },
    { path: '/products', priority: 0.9, freq: 'weekly' as const },
    { path: '/services', priority: 0.8, freq: 'weekly' as const },
    { path: '/facilities', priority: 0.8, freq: 'monthly' as const },
    { path: '/certifications', priority: 0.7, freq: 'monthly' as const },
    { path: '/news', priority: 0.9, freq: 'daily' as const },
    { path: '/blog', priority: 0.8, freq: 'daily' as const },
    { path: '/careers', priority: 0.8, freq: 'weekly' as const },
    { path: '/contact', priority: 0.9, freq: 'monthly' as const },
    // Slug lama WordPress /products/{mmki,hmmi,sgmw,tmmin,sim} — tetap hidup di /products/[slug]
    { path: '/products/hmmi', priority: 0.7, freq: 'monthly' as const },
    { path: '/products/mmki', priority: 0.7, freq: 'monthly' as const },
    { path: '/products/sgmw', priority: 0.7, freq: 'monthly' as const },
    { path: '/products/sim', priority: 0.7, freq: 'monthly' as const },
    { path: '/products/tmmin', priority: 0.7, freq: 'monthly' as const },
  ];
  return staticRoutes.map((r) => ({
    url: `${base}${r.path || '/'}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
