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
  title: {
    default: 'PT Indonesia Thai Summit Plastech — Automotive Plastic Injection & Interior Assembly',
    template: '%s | PT ITSP',
  },
  description: 'PT Indonesia Thai Summit Plastech (ITSP) — Manufaktur komponen plastik otomotif berkualitas tinggi. Plastic Injection Molding, Spray Painting & Interior Assembly untuk Mitsubishi, Hyundai, Toyota, Suzuki, Wuling.',
  keywords: ['PT ITSP', 'Indonesia Thai Summit Plastech', 'plastic injection molding', 'automotive parts', 'instrument panel', 'dashboard mobil', 'door trim', 'bumper', 'Karawang', 'Cikarang', 'Thai Summit Group'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className={jakarta.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
