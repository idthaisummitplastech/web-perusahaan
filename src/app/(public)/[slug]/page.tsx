import * as React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Typography, Button, Breadcrumbs, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CustomGalleryClient, { GalleryPhoto } from './CustomGalleryClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPageBySlug(slug: string) {
  try {
    const rawPages = await cmsApi.getItems<any>('pages');
    if (!Array.isArray(rawPages)) return null;
    const cleanSlug = slug.toLowerCase().trim();
    const page = rawPages.find(
      (p: any) =>
        (p.slug || '').toLowerCase().trim() === cleanSlug &&
        (p.isActive ?? p.is_active) !== false
    );
    return page || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Halaman Tidak Ditemukan — PT Indonesia Thai Summit Plastech',
    };
  }

  return {
    title: page.meta_title || page.metaTitle || `${page.title} — PT Indonesia Thai Summit Plastech`,
    description: page.meta_description || page.metaDescription || page.content?.slice(0, 160) || undefined,
  };
}

export default async function DynamicCustomPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const templateType = page.template_type || page.templateType || 'gallery';

  // Parse gallery images
  let galleryPhotos: GalleryPhoto[] = [];
  const rawGallery = page.gallery_images ?? page.galleryImages;
  if (Array.isArray(rawGallery)) {
    galleryPhotos = rawGallery;
  } else if (typeof rawGallery === 'string') {
    try {
      galleryPhotos = JSON.parse(rawGallery);
    } catch {
      galleryPhotos = [];
    }
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '80vh', py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />}
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>
            <HomeIcon sx={{ fontSize: 18 }} />
            <span>Beranda</span>
          </Link>
          <Typography color="#018730" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
            {page.title}
          </Typography>
        </Breadcrumbs>

        {/* Page Hero Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 }, maxWidth: 860, mx: 'auto' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#e8f6ed',
              color: '#018730',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: '1px solid #a3dfb7',
              borderRadius: '20px',
              mb: 2,
              px: 2,
              py: 0.6,
            }}
          >
            <WebAssetIcon sx={{ fontSize: 18, color: '#018730' }} />
            <span>
              {templateType === 'gallery'
                ? 'Galeri Dokumentasi Resmi'
                : 'Informasi & Dokumentasi Perusahaan'}
            </span>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            fontWeight={900}
            color="#0F172A"
            sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.25, mb: 2 }}
          >
            {page.title}
          </Typography>

          {page.content && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 740, mx: 'auto' }}
            >
              {page.content}
            </Typography>
          )}
        </Box>

        {/* Content by Template Type */}
        {templateType === 'gallery' ? (
          <CustomGalleryClient photos={galleryPhotos} pageTitle={page.title} />
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 4,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
            }}
          >
            <Box
              sx={{
                '& h2': { fontWeight: 800, color: '#0F172A', mt: 3, mb: 1.5 },
                '& p': { color: '#334155', lineHeight: 1.8, fontSize: '1.025rem', mb: 2 },
                '& ul, & ol': { pl: 3, mb: 2, color: '#334155' },
                '& li': { mb: 0.75, lineHeight: 1.7 },
              }}
              dangerouslySetInnerHTML={{ __html: page.content || '<p>Konten halaman sedang disiapkan.</p>' }}
            />
          </Paper>
        )}

        {/* Footer Contact Banner */}
        <Box sx={{ mt: 10, p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: '#018730', color: '#FFFFFF', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5 }}>
            Ingin Informasi Lebih Lengkap Mengenai Fasilitas & Layanan Kami?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3.5, maxWidth: 640, mx: 'auto' }}>
            Hubungi perwakilan manajemen atau tim pemasaran PT Indonesia Thai Summit Plastech untuk konsultasi proyek dan kunjungan pabrik.
          </Typography>
          <Link href="/contact" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SupportAgentIcon />}
              sx={{
                bgcolor: '#fc4509',
                color: '#FFFFFF',
                fontWeight: 800,
                px: 4,
                py: 1.4,
                borderRadius: '30px',
                boxShadow: '0 4px 14px rgba(252, 69, 9, 0.35)',
                '&:hover': { bgcolor: '#e03d08' },
              }}
            >
              Hubungi Kami
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
