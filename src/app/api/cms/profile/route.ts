import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const data = await fetchFromBackend(`/cms/profile?user_id=${sessionUser.id}`);
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
    return NextResponse.json({ error: error.message || 'Gagal mengambil data profil.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await fetchFromBackend('/cms/profile', {
      method: 'POST',
      body: JSON.stringify({
        user_id: sessionUser.id,
        ...body,
      }),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memperbarui profil.' },
      { status: 400 }
    );
  }
}
