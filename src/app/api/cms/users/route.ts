import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { generateMfaSetup, generateBackupCodes } from '@/lib/mfa';

// GET /api/cms/users - Ambil daftar semua pengguna CMS
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  // Hanya admin yang dapat melihat daftar pengguna
  if (currentUser.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        backupCodes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    });

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
    const { name, email, password, role, mfaEnabled } = body;

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

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 400 }
      );
    }

    const validRole = ['admin', 'marketing', 'editor'].includes(role) ? role : 'marketing';
    const hashedPassword = await bcrypt.hash(password, 12);

    const isMfa = Boolean(mfaEnabled);
    let mfaSecret = null;
    let backupCodes = null;
    if (isMfa) {
      const setup = await generateMfaSetup(normalizedEmail);
      mfaSecret = setup.secret;
      backupCodes = JSON.stringify(generateBackupCodes(8));
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: validRole,
        mfaEnabled: isMfa,
        mfaSecret,
        backupCodes,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        backupCodes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Error POST /api/cms/users:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat pengguna baru.' }, { status: 500 });
  }
}

// PUT /api/cms/users - Perbarui role, nama, status MFA, atau reset kata sandi
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
    const { id, name, role, newPassword, mfaEnabled, regenerateBackupCodes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID pengguna wajib disertakan.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (role && ['admin', 'marketing', 'editor'].includes(role)) {
      // Cegah admin mengubah rolenya sendiri jika hanya tersisa 1 admin
      if (targetUser.id === currentUser.id && role !== 'admin') {
        return NextResponse.json(
          { error: 'Anda tidak dapat mencabut hak Administrator dari akun Anda sendiri.' },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (typeof mfaEnabled === 'boolean') {
      updateData.mfaEnabled = mfaEnabled;
      if (mfaEnabled && (!targetUser.mfaSecret || !targetUser.backupCodes)) {
        const setup = await generateMfaSetup(targetUser.email);
        updateData.mfaSecret = setup.secret;
        updateData.backupCodes = JSON.stringify(generateBackupCodes(8));
      }
    }

    if (regenerateBackupCodes) {
      updateData.backupCodes = JSON.stringify(generateBackupCodes(8));
      updateData.mfaEnabled = true;
    }

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal 6 karakter.' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        backupCodes: true,
        updatedAt: true,
      },
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

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error DELETE /api/cms/users:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
