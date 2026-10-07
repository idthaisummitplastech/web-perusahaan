import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';

// GET /api/cms/users - Ambil daftar semua pengguna CMS
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  if (currentUser.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' },
      { status: 403 }
    );
  }

  try {
    const users = await fetchFromBackend('/cms/users');
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error GET /api/cms/users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

// POST /api/cms/users - Tambah pengguna baru
export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  if (currentUser.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak. Hanya Administrator yang dapat menambah pengguna.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, role, mfaEnabled, isActive, portalAccess, username, department } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const pa = (portalAccess || 'both').toLowerCase();
    const validPA = ['perusahaan','karir','both'].includes(pa) ? pa : 'both';
    const newUser = await fetchFromBackend('/cms/users', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'marketing',
        mfa_enabled: Boolean(mfaEnabled),
        is_active: typeof isActive === 'boolean' ? isActive : true,
        portal_access: validPA,
        username: username?.trim() || undefined,
        department: department?.trim() || undefined,
      }),
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Error POST /api/cms/users:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat pengguna baru.' }, { status: 500 });
  }
}

// PUT /api/cms/users - Perbarui role, nama, email, status MFA, atau reset kata sandi
export async function PUT(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  if (currentUser.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak. Hanya Administrator yang dapat mengubah data pengguna.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, name, email, role, newPassword, mfaEnabled, isActive, portalAccess, username, department } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID pengguna wajib disertakan.' }, { status: 400 });
    }

    const payload: any = {};
    if (name) payload.name = name.trim();
    if (email) payload.email = email.toLowerCase().trim();
    if (role) payload.role = role;
    if (username !== undefined) payload.username = username.trim();
    if (department !== undefined) payload.department = department.trim();
    if (typeof mfaEnabled === 'boolean') payload.mfa_enabled = mfaEnabled;
    if (typeof isActive === 'boolean') payload.is_active = isActive;
    if (portalAccess) {
      const pa = String(portalAccess).toLowerCase().trim();
      if (['perusahaan','karir','both'].includes(pa)) payload.portal_access = pa;
    }
    if (newPassword && newPassword.trim().length >= 6) {
      payload.password = newPassword.trim();
    }

    const updated = await fetchFromBackend(`/cms/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error PUT /api/cms/users:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

// DELETE /api/cms/users?id=123 - Hapus pengguna
export async function DELETE(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  if (currentUser.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak. Hanya Administrator yang dapat menghapus pengguna.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ error: 'ID pengguna tidak valid.' }, { status: 400 });
    }

    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' },
        { status: 400 }
      );
    }

    await fetchFromBackend(`/cms/users/${id}`, {
      method: 'DELETE',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error DELETE /api/cms/users:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
