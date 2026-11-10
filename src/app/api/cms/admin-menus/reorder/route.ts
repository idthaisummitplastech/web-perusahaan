import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
import { errorResponse } from '@/lib/cms-guard';
function getInternalSecret(): string { const s = process.env.BACKEND_INTERNAL_SECRET; if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env'); return s; }
export async function POST(req: Request) {
  const user = await getCurrentUser(); if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Hanya admin' }, { status: 403 });
  try {
    const body = await req.json(); const items = body.items ?? body;
    const data = await fetchFromBackend('/cms/admin-menus/reorder', {
      method: 'POST',
      headers: {
        'X-Internal-Secret': getInternalSecret(),
        'X-Admin-Role': user.role,
      },
      body: JSON.stringify(items),
    });
    return NextResponse.json({ success: true, data });
  } catch (e: any) { console.error('Error POST /api/cms/admin-menus/reorder:', e); return errorResponse(e, 'Gagal reorder'); }
}
