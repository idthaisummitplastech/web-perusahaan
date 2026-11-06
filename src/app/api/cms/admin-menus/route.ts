import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
import { errorResponse, parseRecordId } from '@/lib/cms-guard';

function getInternalSecret(): string {
  const s = process.env.BACKEND_INTERNAL_SECRET;
  if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env');
  return s;
}
export async function GET(req: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const portal = searchParams.get('portal') || undefined;
    const location = searchParams.get('location') || undefined;
    const role = searchParams.get('role') || undefined;
    const qs = new URLSearchParams();
    if (portal) qs.set('portal', portal);
    if (location) qs.set('location', location);
    if (role) qs.set('role', role);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const data = await fetchFromBackend(`/cms/admin-menus${suffix}`, { headers: { 'X-Internal-Secret': getInternalSecret() } });
    return NextResponse.json(data);
  } catch (e: any) { console.error('Error GET /api/cms/admin-menus:', e); return errorResponse(e, 'Gagal memuat admin menus'); }
}
export async function POST(req: Request) {
  const user = await getCurrentUser(); if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Hanya admin' }, { status: 403 });
  try { const body = await req.json(); const data = await fetchFromBackend('/cms/admin-menus', { method: 'POST', headers: { 'X-Internal-Secret': getInternalSecret() }, body: JSON.stringify(body) }); return NextResponse.json(data); } catch (e: any) { console.error('Error POST /api/cms/admin-menus:', e); return errorResponse(e, 'Gagal simpan'); }
}
export async function PUT(req: Request) {
  const user = await getCurrentUser(); if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Hanya admin' }, { status: 403 });
  try { const body = await req.json(); const id = parseRecordId(body.id); if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 }); const data = await fetchFromBackend(`/cms/admin-menus/${id}`, { method: 'PUT', headers: { 'X-Internal-Secret': getInternalSecret() }, body: JSON.stringify(body) }); return NextResponse.json(data); } catch (e: any) { console.error('Error PUT /api/cms/admin-menus:', e); return errorResponse(e, 'Gagal update'); }
}
export async function DELETE(req: Request) {
  const user = await getCurrentUser(); if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Hanya admin' }, { status: 403 });
  try { const { searchParams } = new URL(req.url); const id = parseRecordId(searchParams.get('id')); if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 }); await fetchFromBackend(`/cms/admin-menus/${id}`, { method: 'DELETE', headers: { 'X-Internal-Secret': getInternalSecret() } }); return NextResponse.json({ success: true }); } catch (e: any) { console.error('Error DELETE /api/cms/admin-menus:', e); return errorResponse(e, 'Gagal hapus'); }
}
