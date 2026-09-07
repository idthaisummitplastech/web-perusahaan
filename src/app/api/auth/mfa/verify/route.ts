import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getTempUser,
  signSessionToken,
  COOKIE_NAME,
  TEMP_COOKIE_NAME,
} from '@/lib/auth';
import { verifyMfaToken } from '@/lib/mfa';

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

    const user = await prisma.user.findUnique({
      where: { id: tempUser.id },
    });

    if (!user || !user.mfaSecret) {
      return NextResponse.json(
        { error: 'Konfigurasi MFA pengguna tidak valid.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().replace(/\s+/g, '');
    let isCodeValid = verifyMfaToken(cleanCode, user.mfaSecret);
    let usedBackup = false;

    // If TOTP verification failed, check backup codes
    if (!isCodeValid && user.backupCodes) {
      try {
        const backupCodes: string[] = JSON.parse(user.backupCodes);
        const formattedCode = cleanCode.toUpperCase();
        const codeIndex = backupCodes.indexOf(formattedCode);

        if (codeIndex !== -1) {
          isCodeValid = true;
          usedBackup = true;
          // Consume backup code
          backupCodes.splice(codeIndex, 1);
          await prisma.user.update({
            where: { id: user.id },
            data: { backupCodes: JSON.stringify(backupCodes) },
          });
        }
      } catch (err) {
        console.error('Error parsing backup codes:', err);
      }
    }

    if (!isCodeValid) {
      return NextResponse.json(
        { error: 'Kode autentikasi salah atau sudah kedaluwarsa. Pastikan jam HP dan jam laptop/server sudah sinkron (WIB UTC+7), lalu masukkan kode 6-digit yang sedang aktif.' },
        { status: 400 }
      );
    }

    const sessionToken = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mfaVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      usedBackup,
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
      { error: 'Terjadi kesalahan saat memproses verifikasi.' },
      { status: 500 }
    );
  }
}
