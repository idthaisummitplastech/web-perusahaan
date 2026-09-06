import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'super-secret-key-portal-cms-enterprise-2025'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('cms_session')?.value;
  const tempCookie = request.cookies.get('cms_temp_mfa')?.value;

  let isAuthenticated = false;
  let userRole = '';
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, SECRET_KEY);
      if (payload && payload.mfaVerified) {
        isAuthenticated = true;
        userRole = (payload as any)?.role || '';
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Admin routes protection
  if (path.startsWith('/admin')) {
    if (path === '/admin/mfa-setup') {
      // Must have either temp token or session
      if (!tempCookie && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.next();
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

  // Auth pages redirect if already authenticated
  if (path === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (path === '/login/verify-mfa') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!tempCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/login/verify-mfa'],
};
