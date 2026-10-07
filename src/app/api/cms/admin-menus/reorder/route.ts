import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
function getInternalSecret(): string { const s = process.env.BACKEND_INTERNAL_SECRET; if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env'); return s; }
export async function POST(req: Request) {
  const user = await getCurrentUser(); if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Hanya admin' }, { status: 403 });
  try {
    const body = await req.json(); const items = body.items ?? body;
    const data = await fetchFromBackend('/cms/admin-menus/reorder', { method: 'POST', headers: { 'X-Internal-Secret': getInternalSecret() }, body: JSON.stringify(items) });
    return NextResponse.json({ success: true, data });
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Gagal reorder' }, { status: 500 }); }
}
