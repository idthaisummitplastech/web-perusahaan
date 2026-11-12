/**
 * Next.js 16 Proxy — penegakan sesi first-login & MFA untuk CMS web-perusahaan.
 *
 * Konvensi Next.js 16: middleware.ts → proxy.ts, export function proxy().
 * Baca cms_session cookie, verifikasi JWT, lalu paksa penyelesaian sesi
 * (ganti password, setup MFA, verifikasi MFA) sebelum akses admin.
 *
 * FIRST_LOGIN_ENFORCE (server-side, bukan NEXT_PUBLIC): saat false, tidak
 * ada redirect paksa — pengguna bisa langsung ke /admin.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET belum diisi via env (min 32 karakter).');
  }
  return new TextEncoder().encode(secret);
}

/** Route penyelesaian sesi — di-whitelist, tidak diredirect oleh enforcement. */
const SESSION_COMPLETION_ROUTES = new Set([
  '/admin/change-password',
  '/admin/mfa-setup',
  '/login/verify-mfa',
]);

/** Route API penyelesaian sesi — bypass enforcement. */
const SESSION_COMPLETION_API = [
  '/api/admin/change-password',
  '/api/auth/mfa/',
  '/api/auth/logout',
  '/api/admin/session',
];

function isSessionCompletionRoute(path: string): boolean {
  if (SESSION_COMPLETION_ROUTES.has(path)) return true;
  return SESSION_COMPLETION_API.some((prefix) => path.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('cms_session')?.value;
  const tempCookie = request.cookies.get('cms_temp_mfa')?.value;

  let isAuthenticated = false;
  let userRole = '';
  let mustChangePassword = false;
  let mfaRequired = false;
  let mfaVerified = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, getSecretKey());
      if (payload) {
        isAuthenticated = true;
        userRole = (payload as any)?.role || '';
        mustChangePassword = !!(payload as any)?.mustChangePassword;
        mfaRequired = !!(payload as any)?.mfaRequired;
        mfaVerified = !!(payload as any)?.mfaVerified;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  let tempPurpose = '';
  if (tempCookie) {
    try {
      const { payload } = await jwtVerify(tempCookie, getSecretKey());
      tempPurpose = (payload as any)?.purpose || '';
    } catch {
      tempPurpose = '';
    }
  }

  // ---- First-login & MFA enforcement (hanya jika FIRST_LOGIN_ENFORCE=true) ----
  const enforceEnabled = process.env.FIRST_LOGIN_ENFORCE === 'true';

  // Admin routes protection
  if (path.startsWith('/admin')) {
    if (path === '/admin/mfa-setup') {
      // Must have either temp token or session
      if (!tempCookie && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (tempPurpose === 'mfa_verify' && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login/verify-mfa', request.url));
      }
      return NextResponse.next();
    }

    // Enforcement redirect (hanya jika diaktifkan dan bukan route penyelesaian sesi)
    if (enforceEnabled && isAuthenticated && !isSessionCompletionRoute(path)) {
      if (mustChangePassword) {
        return NextResponse.redirect(new URL('/admin/change-password', request.url));
      }
      if (mfaRequired && !mfaVerified) {
        return NextResponse.redirect(new URL('/admin/mfa-setup?setup=first-time', request.url));
      }
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection for admin-only pages
    if ((path.startsWith('/admin/users') || path.startsWith('/admin/settings')) && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // API routes enforcement (hanya jika diaktifkan)
  if (enforceEnabled && isAuthenticated && path.startsWith('/api/') && !isSessionCompletionRoute(path)) {
    if (mustChangePassword || (mfaRequired && !mfaVerified)) {
      return NextResponse.json(
        { error: 'SESSION_INCOMPLETE', code: mustChangePassword ? 'FIRST_LOGIN_REQUIRED' : 'MFA_VERIFICATION_REQUIRED' },
        { status: 403 }
      );
    }
  }

  // Auth pages redirect if already authenticated (sesi lengkap)
  if (path === '/login') {
    if (isAuthenticated && !mustChangePassword && !(mfaRequired && !mfaVerified)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (path === '/login/verify-mfa') {
    if (isAuthenticated && !mustChangePassword && !(mfaRequired && !mfaVerified)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!tempCookie && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (tempPurpose === 'mfa_setup') {
      return NextResponse.redirect(new URL('/admin/mfa-setup', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/login/verify-mfa', '/api/admin/:path*', '/api/cms/:path*'],
};

