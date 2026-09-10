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
  description: 'PT Indonesia Thai Summit Plastech (ITSP) — Manufaktur komponen plastik otomotif berkualitas tinggi. Plastic Injection Molding, Spray Painting & Interior Assembly untuk Mitsubishi, Hyundai, Toyota, Suzuki, Wuling.',
  keywords: ['PT ITSP', 'Indonesia Thai Summit Plastech', 'plastic injection molding', 'automotive parts', 'instrument panel', 'dashboard mobil', 'door trim', 'bumper', 'Karawang', 'Cikarang', 'Thai Summit Group'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'PT Indonesia Thai Summit Plastech',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <head>
        {/* Enterprise React DOM Safety Patch & Auto-Translation Init */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Prevent React removeChild / insertBefore crashes from translation DOM mutations
              if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
                var origRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                  if (child.parentNode !== this) {
                    if (console && console.warn) console.warn('Protected removeChild mismatch', this, child);
                    return child;
                  }
                  return origRemoveChild.apply(this, arguments);
                };

                var origInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(newNode, refNode) {
                  if (refNode && refNode.parentNode !== this) {
                    if (console && console.warn) console.warn('Protected insertBefore mismatch', this, refNode);
                    return newNode;
                  }
                  return origInsertBefore.apply(this, arguments);
                };
              }

              // 2. Default to English auto-translation on load
              try {
                var saved = localStorage.getItem('itsp_language');
                var target = saved === 'id' ? '/id/id' : '/id/en';
                document.cookie = 'googtrans=' + target + '; path=/;';
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  document.cookie = 'googtrans=' + target + '; path=/; domain=' + window.location.hostname + ';';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={jakarta.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
