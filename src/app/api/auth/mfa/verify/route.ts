import { NextResponse } from 'next/server';
import {
  getTempUser,
  signSessionToken,
  COOKIE_NAME,
  TEMP_COOKIE_NAME,
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

    const sessionToken = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mfaVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      usedBackup: verifyResult.used_backup ?? false,
      redirect: '/admin',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
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
