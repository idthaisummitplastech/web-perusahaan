import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';
import {
  canWriteCmsModel,
  errorResponse,
  isAllowedCmsModel,
  parseRecordId,
} from '@/lib/cms-guard';

function getInternalSecret(): string {
  const s = process.env.BACKEND_INTERNAL_SECRET;
  if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env. Isi file .env - lihat .env.example.');
  return s;
}

const UNAUTHORIZED = () => NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
const FORBIDDEN = () => NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
const MODEL_NOT_FOUND = () => NextResponse.json({ error: 'Model CMS tidak ditemukan.' }, { status: 404 });

export async function GET(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return UNAUTHORIZED();

  const { model } = await params;
  if (!isAllowedCmsModel(model)) return MODEL_NOT_FOUND();

  try {
    const items = await fetchFromBackend(`/cms/${model}`, {
      headers: {
        'X-Internal-Secret': getInternalSecret(),
        'X-Admin-Role': user.role,
      },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error(`Error GET /api/cms/${model}:`, error);
    return errorResponse(error, 'Gagal mengambil data.');
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return UNAUTHORIZED();

  const { model } = await params;
  if (!isAllowedCmsModel(model)) return MODEL_NOT_FOUND();
  if (!canWriteCmsModel(user, model)) return FORBIDDEN();

  try {
    const data = await req.json();
    const created = await fetchFromBackend(`/cms/${model}`, {
      method: 'POST',
      headers: {
        'X-Internal-Secret': getInternalSecret(),
        'X-Admin-Role': user.role,
      },
      body: JSON.stringify(data),
    });
    return NextResponse.json(created);
  } catch (error: any) {
    console.error(`Error POST /api/cms/${model}:`, error);
    return errorResponse(error, 'Gagal menyimpan data.');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return UNAUTHORIZED();

  const { model } = await params;
  if (!isAllowedCmsModel(model)) return MODEL_NOT_FOUND();
  if (!canWriteCmsModel(user, model)) return FORBIDDEN();

  try {
    const data = await req.json();
    const rawId = data.id || (model === 'settings' ? 0 : null);
    const id = parseRecordId(rawId);
    if (id === null) {
      return NextResponse.json({ error: 'ID data tidak valid.' }, { status: 400 });
    }
    const updated = await fetchFromBackend(`/cms/${model}/${id}`, {
      method: 'PUT',
      headers: {
        'X-Internal-Secret': getInternalSecret(),
        'X-Admin-Role': user.role,
      },
      body: JSON.stringify(data),
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error PUT /api/cms/${model}:`, error);
    return errorResponse(error, 'Gagal memperbarui data.');
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return UNAUTHORIZED();

  const { model } = await params;
  if (!isAllowedCmsModel(model)) return MODEL_NOT_FOUND();
  if (!canWriteCmsModel(user, model)) return FORBIDDEN();

  try {
    const { searchParams } = new URL(req.url);
    const id = parseRecordId(searchParams.get('id'));
    if (id === null) {
      return NextResponse.json({ error: 'ID data tidak valid.' }, { status: 400 });
    }
    await fetchFromBackend(`/cms/${model}/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Internal-Secret': getInternalSecret(),
        'X-Admin-Role': user.role,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error DELETE /api/cms/${model}:`, error);
    return errorResponse(error, 'Gagal menghapus data.');
  }
}
