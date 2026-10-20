import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const MIME_TYPES: Record<string, string> = {
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
 * Dynamic File Serving Route Handler
 * 
 * In Next.js production (`next start`), files written to `public/` dynamically
 * after server startup are NOT automatically indexed in `publicFolderItems`.
 * This route handler intercepts any `/uploads/...` request and serves it
 * directly from `public/uploads` in real-time, ensuring newly uploaded files
 * never return 404 without needing a PM2 restart.
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

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const requestedPath = path.resolve(uploadsDir, ...segments);

    // Security check: Prevent path traversal outside public/uploads
    if (!requestedPath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!existsSync(requestedPath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = await fs.readFile(requestedPath);
    const ext = path.extname(requestedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const searchParams = req.nextUrl.searchParams;
    const isDownload = searchParams.get('download') === '1' || searchParams.has('download');
    const customFilename = searchParams.get('filename');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.byteLength.toString(),
      'Cache-Control': isDownload ? 'no-cache, must-revalidate' : 'public, max-age=31536000, immutable',
    };

    if (isDownload) {
      const fallbackName = path.basename(requestedPath);
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
