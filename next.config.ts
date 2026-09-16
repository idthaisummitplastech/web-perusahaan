import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cutover WordPress -> Next.js: pertahankan ranking lama thaisummitplastech.co.id
  // Sumber: wp-sitemap-posts-page-1.xml + wp-sitemap-posts-post-1.xml
  async redirects() {
    return [
      // Halaman lama /commitment/ tidak ada di Next.js -> gabung ke /about
      { source: "/commitment", destination: "/about", permanent: true },
      { source: "/commitment/", destination: "/about", permanent: true },
      // Teknologi lama di bawah /products/technology -> pindah ke /services
      { source: "/products/technology", destination: "/services", permanent: true },
      { source: "/products/technology/", destination: "/services", permanent: true },
      // Postingan sampah Elementor /2026/07/... -> arsip /news (hanya match angka tanggal)
      { source: "/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})/:slug*", destination: "/news", permanent: true },
      // Normalisasi trailing-slash produk lama sudah di-handle Next, tegaskan slug customer
      { source: "/products/hmmi/", destination: "/products/hmmi", permanent: true },
      { source: "/products/mmki/", destination: "/products/mmki", permanent: true },
      { source: "/products/sgmw/", destination: "/products/sgmw", permanent: true },
      { source: "/products/sim/", destination: "/products/sim", permanent: true },
      { source: "/products/tmmin/", destination: "/products/tmmin", permanent: true },
    ];
  },
};

export default nextConfig;

