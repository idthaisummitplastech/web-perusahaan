import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mfaEnabled: true,
      backupCodes: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
  }

  let backupCodesCount = 0;
  if (user.backupCodes) {
    try {
      backupCodesCount = JSON.parse(user.backupCodes).length;
    } catch {}
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mfaEnabled: user.mfaEnabled,
    backupCodesCount,
    createdAt: user.createdAt,
  });
}

export async function POST(req: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, name, currentPassword, newPassword, enabled } = body;

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (action === 'update_profile') {
      if (!name) {
        return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });

      return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui.' });
    }

    if (action === 'change_password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Kata sandi saat ini dan kata sandi baru wajib diisi.' },
          { status: 400 }
        );
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return NextResponse.json(
          { error: 'Kata sandi saat ini tidak sesuai.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal 6 karakter.' },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: 'Kata sandi berhasil diubah.' });
    }

    if (action === 'toggle_mfa') {
      const { generateMfaSetup, generateBackupCodes } = await import('@/lib/mfa');
      const newStatus = typeof enabled === 'boolean' ? enabled : !user.mfaEnabled;
      const updateData: any = { mfaEnabled: newStatus };

      if (newStatus && (!user.mfaSecret || !user.backupCodes)) {
        const setup = await generateMfaSetup(user.email);
        updateData.mfaSecret = setup.secret;
        updateData.backupCodes = JSON.stringify(generateBackupCodes(8));
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        mfaEnabled: newStatus,
        message: newStatus ? 'Autentikasi Multi-Faktor (MFA) berhasil diaktifkan.' : 'Autentikasi Multi-Faktor (MFA) berhasil dinonaktifkan.',
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
