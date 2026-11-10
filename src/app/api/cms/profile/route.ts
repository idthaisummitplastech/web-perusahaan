import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
import { errorResponse } from '@/lib/cms-guard';

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const data = await fetchFromBackend(`/cms/profile?user_id=${sessionUser.id}`, {
      headers: { 'X-Admin-Role': sessionUser.role },
    });
    return NextResponse.json({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      mfaEnabled: data.mfaEnabled ?? data.mfa_enabled ?? false,
      backupCodesCount: data.backupCodesCount ?? data.backup_codes_count ?? 0,
      createdAt: data.createdAt ?? data.created_at,
    });
  } catch (error: any) {
    console.error('Error GET /api/cms/profile:', error);
    return errorResponse(error, 'Gagal mengambil data profil.');
  }
}

export async function POST(req: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Identitas HANYA dari session. Buang semua variasi user id dari body klien
    // (backend membaca user_id maupun userId), lalu set dari session setelahnya.
    const { user_id: _ignoredUserId, userId: _ignoredUserIdCamel, ...safeBody } = body ?? {};
    const result = await fetchFromBackend('/cms/profile', {
      method: 'POST',
      headers: { 'X-Admin-Role': sessionUser.role },
      body: JSON.stringify({
        ...safeBody,
        user_id: sessionUser.id,
      }),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Profile update error:', error);
    return errorResponse(error, 'Terjadi kesalahan saat memperbarui profil.', 400);
  }
}
