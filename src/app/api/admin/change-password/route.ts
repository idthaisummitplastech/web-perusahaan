import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, signSessionToken, getCmsCookieOptions, COOKIE_NAME } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
import type { UserSessionPayload } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const session = await verifyToken<UserSessionPayload>(token);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Password lama dan baru wajib diisi.' }, { status: 400 });
    }

    // Panggil backend CMS profile change-password
    const result = await fetchFromBackend('/cms/profile', {
      method: 'POST',
      body: JSON.stringify({
        user_id: session.id,
        current_password: currentPassword,
        new_password: newPassword,
      }),
      session: { ...session },
      bypassEnforcement: true, // route penyelesaian sesi
    });

    // Re-issue cookie: mustChangePassword = false, sessionVersion naik
    const newSessionVersion = (result.session_version ?? result.sessionVersion ?? (session.sessionVersion || 1)) + 0;
    // Ambil session_version terbaru dari backend response jika ada
    const updatedVersion = result.session_version ?? result.sessionVersion ?? ((session.sessionVersion || 1) + 1);

    const newToken = await signSessionToken({
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      mfaVerified: session.mfaVerified,
      mustChangePassword: false,
      mfaRequired: session.mfaRequired,
      sessionVersion: updatedVersion,
    });

    const response = NextResponse.json({
      success: true,
      redirect: session.mfaRequired && !session.mfaVerified ? '/admin/mfa-setup?setup=first-time' : '/admin',
    });

    const cookieOpts = getCmsCookieOptions();
    response.cookies.set({ ...cookieOpts, value: newToken });

    return response;
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengganti password.' },
      { status: error.status || 500 }
    );
  }
}

