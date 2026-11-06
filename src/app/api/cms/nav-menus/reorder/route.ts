import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
import { canWriteCmsContent, errorResponse } from '@/lib/cms-guard';

function getInternalSecret(): string {
  const s = process.env.BACKEND_INTERNAL_SECRET;
  if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env. Isi file .env - lihat .env.example.');
  return s;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }
  if (!canWriteCmsContent(user)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Data urutan menu harus berupa array.' }, { status: 400 });
    }

    const res = await fetchFromBackend('/cms/nav-menus/reorder', {
      method: 'POST',
      headers: { 'X-Internal-Secret': getInternalSecret() },
      body: JSON.stringify(items),
    });

    return NextResponse.json({ success: true, message: 'Urutan menu berhasil diperbarui.', data: res });
  } catch (error: any) {
    console.error('Error POST /api/cms/nav-menus/reorder:', error);
    return errorResponse(error, 'Gagal memperbarui urutan menu.');
  }
}
