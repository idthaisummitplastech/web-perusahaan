import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/lib/ThemeRegistry';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_COMPANY_URL ||
      process.env.COMPANY_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      'https://thaisummitplastech.co.id',
  ),
  title: {
    default: 'PT Indonesia Thai Summit Plastech — Automotive Plastic Injection & Interior Assembly',
    template: '%s | PT ITSP',
  },
  description: 'PT Indonesia Thai Summit Plastech (ITSP) — High-quality automotive plastic component manufacturing. Plastic Injection Molding, Spray Painting & Interior Assembly for Mitsubishi, Hyundai, Toyota, Suzuki, Wuling.',
  keywords: ['PT ITSP', 'Indonesia Thai Summit Plastech', 'plastic injection molding', 'automotive parts', 'instrument panel', 'car dashboard', 'door trim', 'bumper', 'Karawang', 'Cikarang', 'Thai Summit Group'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PT Indonesia Thai Summit Plastech',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={jakarta.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
