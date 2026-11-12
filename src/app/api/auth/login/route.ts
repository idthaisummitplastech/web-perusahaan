import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/api-client';
import { signTempToken, signSessionToken, COOKIE_NAME, TEMP_COOKIE_NAME, getCmsCookieOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Employee ID primary (ITSP.004.02.16) — dual-mode fallback email/username 6 months
    const raw: string = String(body.employee_id || body.employee_id_or_email || body.login || body.username || body.email || "").trim();
    const password: string = String(body.password || "");

    if (!raw || !password) {
      return NextResponse.json(
        { error: 'Employee ID / Email and password are required.' },
        { status: 400 }
      );
    }

    let authResult: any;
    try {
      authResult = await fetchFromBackend('/auth/cms-login', {
        method: 'POST',
        body: JSON.stringify({ employee_id: raw, employee_id_or_email: raw, login: raw, username: raw, email: raw, password }),
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const { user, requires_mfa, has_mfa_secret } = authResult;
    const isMfaEnabled = requires_mfa ?? user.mfa_enabled ?? user.mfaEnabled;
    const isFirstLogin = !!(user.is_first_login ?? user.isFirstLogin);
    const sessionVersion = user.session_version ?? user.sessionVersion ?? 1;

    if (!isMfaEnabled) {
      // Direct login if MFA is not enabled
      const sessionToken = await signSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaVerified: true,
        mustChangePassword: isFirstLogin,
        mfaRequired: false,
        sessionVersion,
      });

      const response = NextResponse.json({
        success: true,
        redirect: isFirstLogin ? '/admin/change-password' : '/admin',
      });

      const cookieOpts = getCmsCookieOptions();
      response.cookies.set({
        ...cookieOpts,
        value: sessionToken,
      });

      return response;
    }

    const hasSecret = Boolean(has_mfa_secret ?? user.has_mfa_secret ?? user.mfa_secret);

    if (!hasSecret) {
      // User has MFA enabled but hasn't scanned QR barcode / configured MFA yet -> Setup step
      const tempToken = await signTempToken({
        id: user.id,
        email: user.email,
        purpose: 'mfa_setup',
      });

      // Juga set cms_session dengan sesi belum lengkap agar proxy bisa membaca klaim
      const sessionToken = await signSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaVerified: false,
        mustChangePassword: isFirstLogin,
        mfaRequired: true,
        sessionVersion,
      });

      const response = NextResponse.json({
        success: true,
        requiresMfa: true,
        requireMfaSetup: true,
        redirect: '/admin/mfa-setup',
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

      const cookieOpts = getCmsCookieOptions();
      response.cookies.set({
        ...cookieOpts,
        value: sessionToken,
      });

      return response;
    }

    // MFA is enabled and user already has MFA configured -> Verify OTP step
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
