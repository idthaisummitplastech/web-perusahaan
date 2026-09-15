import { NextResponse } from 'next/server';
import {
  getTempUser,
  getCurrentUser,
  signSessionToken,
  COOKIE_NAME,
  TEMP_COOKIE_NAME,
} from '@/lib/auth';
import { generateMfaSetup, verifyMfaToken, generateBackupCodes, getCurrentTotp } from '@/lib/mfa';
import { fetchFromBackend } from '@/lib/api-client';

export async function GET() {
  try {
    const tempUser = await getTempUser();
    const currentUser = await getCurrentUser();

    const targetUser = tempUser || (currentUser ? { id: currentUser.id, email: currentUser.email } : null);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Sesi setup MFA tidak valid atau telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const user = await fetchFromBackend(`/auth/cms-mfa/${targetUser.id}`);

    // Generate secret for QR code setup without saving to DB until user verifies OTP code
    let secret = user?.mfaSecret || user?.mfa_secret;
    if (!secret) {
      const setup = await generateMfaSetup(targetUser.email);
      secret = setup.secret;
    }

    const mfaData = await generateMfaSetup(targetUser.email, secret);
    const currentOtp = getCurrentTotp(secret);

    return NextResponse.json({
      ...mfaData,
      currentOtp,
    });
  } catch (error: any) {
    console.error('MFA setup get error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat QR Code MFA.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tempUser = await getTempUser();
    const currentUser = await getCurrentUser();
    const targetUserId = tempUser?.id || currentUser?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Sesi setup MFA tidak valid. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const { code, secret } = await req.json();

    if (!code || !secret) {
      return NextResponse.json(
        { error: 'Kode autentikasi dan secret wajib diisi.' },
        { status: 400 }
      );
    }

    const isValid = verifyMfaToken(code, secret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Kode 6-digit salah atau sudah kedaluwarsa. Pastikan jam HP dan jam laptop tersinkronisasi, lalu masukkan kode yang sedang aktif di aplikasi Authenticator.' },
        { status: 400 }
      );
    }

    const backupCodes = generateBackupCodes(8);

    const activateRes = await fetchFromBackend('/auth/cms-mfa/activate', {
      method: 'POST',
      body: JSON.stringify({
        user_id: targetUserId,
        secret,
        backup_codes: backupCodes,
      }),
    });

    const user = activateRes.user;

    const sessionToken = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mfaVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      backupCodes,
      redirect: '/admin',
    });

    // Set authenticated session cookie (7 days)
    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    // Remove temp token
    response.cookies.delete(TEMP_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('MFA setup post error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memverifikasi setup MFA.' },
      { status: 500 }
    );
  }
}
