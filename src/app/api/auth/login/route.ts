import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    if (!user.mfaEnabled) {
      // Login langsung jika pengguna belum mengaktifkan MFA
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
