import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/api-client';
import { signTempToken, TEMP_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    let authResult: any;
    try {
      authResult = await fetchFromBackend('/auth/cms-login', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const { user, requires_mfa } = authResult;
    const isMfaEnabled = requires_mfa ?? user.mfa_enabled ?? user.mfaEnabled;

    if (!isMfaEnabled) {
      // Direct login if MFA is not enabled
      const { signSessionToken, COOKIE_NAME } = await import('@/lib/auth');
      const sessionToken = await signSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaVerified: true,
      });

      const response = NextResponse.json({
        success: true,
        redirect: '/admin',
      });

      response.cookies.set({
        name: COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // MFA is enabled -> Verify step
    const tempToken = await signTempToken({
      id: user.id,
      email: user.email,
      purpose: 'mfa_verify',
    });

    const response = NextResponse.json({
      success: true,
      requiresMfa: true,
      redirect: '/login/verify-mfa',
    });

    response.cookies.set({
      name: TEMP_COOKIE_NAME,
      value: tempToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
