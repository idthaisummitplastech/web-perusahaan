import { NextResponse } from 'next/server';
import {
  getTempUser,
  signSessionToken,
  COOKIE_NAME,
  TEMP_COOKIE_NAME,
  getCmsCookieOptions,
} from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';

export async function POST(req: Request) {
  try {
    const tempUser = await getTempUser();

    if (!tempUser || tempUser.purpose !== 'mfa_verify') {
      return NextResponse.json(
        { error: 'Sesi verifikasi MFA telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Kode verifikasi wajib diisi.' },
        { status: 400 }
      );
    }

    const verifyResult = await fetchFromBackend('/auth/cms-mfa/verify', {
      method: 'POST',
      body: JSON.stringify({
        user_id: tempUser.id,
        code,
      }),
    });

    const user = verifyResult.user;
    const isFirstLogin = !!(user.is_first_login ?? user.isFirstLogin);
    const sessionVersion = user.session_version ?? user.sessionVersion ?? 1;

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
      usedBackup: verifyResult.used_backup ?? false,
      redirect: isFirstLogin ? '/admin/change-password' : '/admin',
    });

    const cookieOpts = getCmsCookieOptions();
    response.cookies.set({
      ...cookieOpts,
      value: sessionToken,
    });

    response.cookies.delete(TEMP_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('MFA verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses verifikasi.' },
      { status: 400 }
    );
  }
}
