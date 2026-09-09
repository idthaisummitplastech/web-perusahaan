import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';

const SECRET_KEY = process.env.BACKEND_INTERNAL_SECRET || 'pt-itsp-recruitment-ats-enterprise-jwt-secret-key-2026';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  const { model } = await params;
  try {
    const items = await fetchFromBackend(`/cms/${model}`, {
      headers: { 'X-Internal-Secret': SECRET_KEY },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil data.' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  const { model } = await params;
  try {
    const data = await req.json();
    const created = await fetchFromBackend(`/cms/${model}`, {
      method: 'POST',
      headers: { 'X-Internal-Secret': SECRET_KEY },
      body: JSON.stringify(data),
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan data.' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  const { model } = await params;
  try {
    const data = await req.json();
    const id = data.id || (model === 'settings' ? 0 : null);
    const updated = await fetchFromBackend(`/cms/${model}/${id ?? ''}`, {
      method: 'PUT',
      headers: { 'X-Internal-Secret': SECRET_KEY },
      body: JSON.stringify(data),
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memperbarui data.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  const { model } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await fetchFromBackend(`/cms/${model}/${id}`, {
      method: 'DELETE',
      headers: { 'X-Internal-Secret': SECRET_KEY },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus data.' }, { status: 500 });
  }
}
