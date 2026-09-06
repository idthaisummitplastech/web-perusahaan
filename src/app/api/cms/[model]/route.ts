import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function getDelegate(model: string) {
  switch (model) {
    case 'settings':
      return prisma.siteSetting;
    case 'nav-menus':
      return prisma.navMenu;
    case 'hero-sections':
      return prisma.heroSection;
    case 'announcements':
      return prisma.announcement;
    case 'partners':
      return prisma.partner;
    case 'features':
      return prisma.feature;
    case 'services':
      return prisma.service;
    case 'products':
      return prisma.product;
    case 'blog-posts':
      return prisma.blogPost;
    case 'testimonials':
      return prisma.testimonial;
    case 'faqs':
      return prisma.faq;
    case 'statistics':
      return prisma.statistic;
    case 'contacts':
      return prisma.contactSubmission;
    case 'certifications':
      return prisma.certification;
    case 'facilities':
      return prisma.facility;
    default:
      return null;
  }
}

function parseSafeDate(val: any): Date | null {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  if (year < 1900 || year > 2100) return null;
  return d;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
  }

  const { model } = await params;
  const delegate = getDelegate(model);

  if (!delegate) {
    return NextResponse.json({ error: `Model ${model} tidak ditemukan.` }, { status: 404 });
  }

  try {
    if (model === 'settings') {
      const items = await prisma.siteSetting.findMany();
      return NextResponse.json(items);
    }

    let items;
    if (model === 'blog-posts') {
      items = await prisma.blogPost.findMany({ orderBy: { id: 'desc' } });
    } else if (model === 'contacts') {
      items = await prisma.contactSubmission.findMany({ orderBy: { id: 'desc' } });
    } else {
      // If sortOrder exists in model
      try {
        items = await (delegate as any).findMany({ orderBy: { sortOrder: 'asc' } });
      } catch {
        items = await (delegate as any).findMany({ orderBy: { id: 'asc' } });
      }
    }

    return NextResponse.json(items);
  } catch (error: any) {
    console.error(`Error GET /api/cms/${model}:`, error);
    return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 });
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
  const delegate = getDelegate(model);

  if (!delegate) {
    return NextResponse.json({ error: `Model ${model} tidak ditemukan.` }, { status: 404 });
  }

  try {
    const data = await req.json();

    if (model === 'settings') {
      // data can be { settings: { [key]: value } } or single { key, value }
      if (data.settings && typeof data.settings === 'object') {
        const results = [];
        for (const [key, value] of Object.entries(data.settings)) {
          const item = await prisma.siteSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          });
          results.push(item);
        }
        return NextResponse.json({ success: true, results });
      } else if (data.key) {
        const item = await prisma.siteSetting.upsert({
          where: { key: data.key },
          update: { value: String(data.value) },
          create: { key: data.key, value: String(data.value) },
        });
        return NextResponse.json(item);
      }
    }

    // Clean numeric / decimal / date fields
    const cleaned = { ...data };
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.parent;
    delete cleaned.children;

    if (cleaned.parentId !== undefined) {
      cleaned.parentId = cleaned.parentId ? parseInt(cleaned.parentId) : null;
    }
    if (cleaned.price !== undefined) {
      cleaned.price = cleaned.price ? parseFloat(cleaned.price) : null;
    }
    if (cleaned.sortOrder !== undefined) {
      cleaned.sortOrder = parseInt(cleaned.sortOrder) || 0;
    }
    if (cleaned.rating !== undefined) {
      cleaned.rating = parseInt(cleaned.rating) || 5;
    }
    if (cleaned.publishedAt !== undefined) {
      cleaned.publishedAt = parseSafeDate(cleaned.publishedAt);
    }
    if (cleaned.issuedDate !== undefined) {
      cleaned.issuedDate = parseSafeDate(cleaned.issuedDate);
    }
    if (cleaned.expiryDate !== undefined) {
      cleaned.expiryDate = parseSafeDate(cleaned.expiryDate);
    }

    const created = await (delegate as any).create({ data: cleaned });
    return NextResponse.json(created);
  } catch (error: any) {
    console.error(`Error POST /api/cms/${model}:`, error);
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
  const delegate = getDelegate(model);

  if (!delegate) {
    return NextResponse.json({ error: `Model ${model} tidak ditemukan.` }, { status: 404 });
  }

  try {
    const data = await req.json();
    const id = data.id ? parseInt(data.id) : null;

    if (!id && model !== 'settings') {
      return NextResponse.json({ error: 'ID data wajib disertakan.' }, { status: 400 });
    }

    const cleaned = { ...data };
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.parent;
    delete cleaned.children;

    if (cleaned.parentId !== undefined) {
      cleaned.parentId = cleaned.parentId ? parseInt(cleaned.parentId) : null;
    }
    if (cleaned.price !== undefined) {
      cleaned.price = cleaned.price ? parseFloat(cleaned.price) : null;
    }
    if (cleaned.sortOrder !== undefined) {
      cleaned.sortOrder = parseInt(cleaned.sortOrder) || 0;
    }
    if (cleaned.rating !== undefined) {
      cleaned.rating = parseInt(cleaned.rating) || 5;
    }
    if (cleaned.publishedAt !== undefined) {
      cleaned.publishedAt = parseSafeDate(cleaned.publishedAt);
    }
    if (cleaned.issuedDate !== undefined) {
      cleaned.issuedDate = parseSafeDate(cleaned.issuedDate);
    }
    if (cleaned.expiryDate !== undefined) {
      cleaned.expiryDate = parseSafeDate(cleaned.expiryDate);
    }

    const updated = await (delegate as any).update({
      where: { id },
      data: cleaned,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error PUT /api/cms/${model}:`, error);
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
  const delegate = getDelegate(model);

  if (!delegate) {
    return NextResponse.json({ error: `Model ${model} tidak ditemukan.` }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ error: 'ID data tidak valid.' }, { status: 400 });
    }

    await (delegate as any).delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error DELETE /api/cms/${model}:`, error);
    return NextResponse.json({ error: 'Gagal menghapus data.' }, { status: 500 });
  }
}
