import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
    const allowedDocExts = ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.pptx', '.txt'];
    const allowedExts = [...allowedImageExts, ...allowedDocExts];
    const extCheck = path.extname(file.name).toLowerCase();
    if (!allowedExts.includes(extCheck)) {
      return NextResponse.json({ error: 'Tipe berkas tidak didukung. Gunakan JPG, PNG, WEBP, GIF, SVG, PDF, atau Excel.' }, { status: 400 });
    }
    const isImage = allowedImageExts.includes(extCheck);
    const maxSize = isImage ? 5 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: isImage ? 'Ukuran gambar melebihi 5 MB.' : 'Ukuran berkas melebihi 25 MB.' }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean and sanitize filename
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      fileName,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Gagal mengunggah berkas.' }, { status: 500 });
  }
}
