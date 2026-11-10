import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/**
 * Dynamic File Serving Route Handler (Hardened against Path Traversal & Symlink Escape - CAND-WP-07)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // 1. Validasi karakter terlarang pada segmen: tolak null bytes, backslash, dan '..'
    for (const segment of segments) {
      if (
        segment.includes('\0') ||
        segment.includes('\\') ||
        segment === '..' ||
        segment.includes('..')
      ) {
        return new NextResponse('Invalid Path Segment', { status: 400 });
      }
    }

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const requestedPath = path.resolve(uploadsDir, ...segments);

    // 2. Strict boundary check: path ter-resolve WAJIB berada di dalam root direktori uploads
    const uploadsDirWithSep = uploadsDir.endsWith(path.sep) ? uploadsDir : uploadsDir + path.sep;
    if (!requestedPath.startsWith(uploadsDirWithSep)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. Allowlist ekstensi: tolak berkas tanpa ekstensi atau ekstensi berbahaya
    const ext = path.extname(requestedPath).toLowerCase();
    if (!ext || !ALLOWED_MIME_TYPES[ext]) {
      return new NextResponse('File Type Not Allowed', { status: 403 });
    }

    if (!existsSync(requestedPath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // 4. Tangkal Symlink Escape via fs.realpath pada keduanya (root dan target)
    let realUploadsDir: string;
    let realTarget: string;
    try {
      realUploadsDir = await fs.realpath(uploadsDir);
      realTarget = await fs.realpath(requestedPath);
    } catch {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const realUploadsDirWithSep = realUploadsDir.endsWith(path.sep) ? realUploadsDir : realUploadsDir + path.sep;
    if (!realTarget.startsWith(realUploadsDirWithSep)) {
      return new NextResponse('Forbidden: Symlink Escape Detected', { status: 403 });
    }

    const stat = await fs.stat(realTarget);
    if (!stat.isFile()) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await fs.readFile(realTarget);
    const contentType = ALLOWED_MIME_TYPES[ext];

    const searchParams = req.nextUrl.searchParams;
    const isDownload = searchParams.get('download') === '1' || searchParams.has('download');
    const customFilename = searchParams.get('filename');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.byteLength.toString(),
      'Cache-Control': isDownload ? 'no-cache, must-revalidate' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    };

    if (ext === '.svg') {
      headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'";
    }

    if (isDownload) {
      const fallbackName = path.basename(realTarget);
      const safeFilename = (customFilename || fallbackName).replace(/["\r\n]/g, '_');
      headers['Content-Disposition'] = `attachment; filename="${safeFilename}"`;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
