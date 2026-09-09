import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';

const SECRET_KEY = process.env.BACKEND_INTERNAL_SECRET || 'pt-itsp-recruitment-ats-enterprise-jwt-secret-key-2026';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Data urutan menu harus berupa array.' }, { status: 400 });
    }

    const res = await fetchFromBackend('/cms/nav-menus/reorder', {
      method: 'POST',
      headers: { 'X-Internal-Secret': SECRET_KEY },
      body: JSON.stringify(items),
    });

    return NextResponse.json({ success: true, message: 'Urutan menu berhasil diperbarui.', data: res });
  } catch (error: any) {
    console.error('Error POST /api/cms/nav-menus/reorder:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui urutan menu.' }, { status: 500 });
  }
}
