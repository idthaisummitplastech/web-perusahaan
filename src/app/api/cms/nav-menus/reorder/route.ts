import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    // Update sortOrder (and optional parentId) for each item in a transaction
    await prisma.$transaction(
      items.map((item: { id: number; sortOrder: number; parentId?: number | null }) => {
        const data: any = { sortOrder: item.sortOrder };
        if (item.parentId !== undefined) {
          data.parentId = item.parentId;
        }
        return prisma.navMenu.update({
          where: { id: parseInt(String(item.id)) },
          data,
        });
      })
    );

    return NextResponse.json({ success: true, message: 'Urutan menu berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Error POST /api/cms/nav-menus/reorder:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui urutan menu.' }, { status: 500 });
  }
}
