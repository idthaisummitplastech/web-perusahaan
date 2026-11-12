import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import type { UserSessionPayload } from '@/lib/auth';

/**
 * GET /api/admin/session — kembalikan klaim sesi dari cookie tanpa menyentuh backend.
 * Dipakai oleh klien untuk mengecek status sesi (mustChangePassword, mfaVerified, dll).
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const session = await verifyToken<UserSessionPayload>(token);
  if (!session) {
    return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
  }

  return NextResponse.json({
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    mfaVerified: session.mfaVerified,
    mustChangePassword: session.mustChangePassword ?? false,
    mfaRequired: session.mfaRequired ?? false,
    sessionVersion: session.sessionVersion ?? 1,
  });
}

