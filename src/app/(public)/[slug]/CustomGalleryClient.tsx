'use client';

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Divider,
} from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export interface GalleryPhoto {
  url: string;
  title?: string;
  category?: string;
  description?: string;
}

export interface SubMenuItem {
  id: number;
  title: string;
  url: string;
}

interface Props {
  photos: GalleryPhoto[];
  pageTitle: string;
  initialCategory?: string;
  subMenus?: SubMenuItem[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCategoryFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('category');
  } catch {
    const match = url.match(/[?&]category=([^&#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export function isPhotoMatchingFilter(
  photoCategory: string | undefined | null,
  filterCategory: string | undefined | null,
  filterUrl?: string | null
): boolean {
  if (!filterCategory || filterCategory === 'all' || filterCategory === 'semua') return true;
  if (!photoCategory) return false;

  const pRaw = photoCategory.trim().toLowerCase();
  const fRaw = filterCategory.trim().toLowerCase();
  if (pRaw === fRaw) return true;

  const pNorm = normalizeText(photoCategory);
  const fNorm = normalizeText(filterCategory);

  if (pNorm === fNorm) return true;

  // Also match query param inside filterUrl if provided (e.g. /galery?category=Plan%20KIIC)
  if (filterUrl) {
    const urlParam = extractCategoryFromUrl(filterUrl);
    if (urlParam) {
      const uNorm = normalizeText(urlParam);
      if (pNorm === uNorm) return true;
      if (uNorm.includes('kiic') && pNorm.includes('kiic')) return true;
      if (uNorm.includes('giic') && pNorm.includes('giic')) return true;
    }
  }

  // Enterprise plant location matching (handles 'Plan KIIC', 'Plant 1 KIIC', 'plan-kiic', 'KIIC')
  if (fNorm.includes('kiic') && pNorm.includes('kiic')) return true;
  if (fNorm.includes('giic') && pNorm.includes('giic')) return true;

  // General word match
  const fWords = fNorm.split(' ').filter((w) => w.length > 2 && w !== 'plan' && w !== 'plant');
  if (fWords.length > 0 && fWords.some((w) => pNorm.includes(w))) {
    return true;
  }

  return false;
}

export default function CustomGalleryClient({
  photos,
  pageTitle,
  initialCategory = 'all',
  subMenus = [],
}: Props) {
  // Derive filter tabs directly from CMS Sub-menus
  const filterTabs = useMemo(() => {
    if (!subMenus || subMenus.length === 0) return [];
    return [
      {
        id: 'all',
        label: 'Semua Foto',
        count: photos.length,
        url: '',
      },
      ...subMenus.map((sm) => {
        const count = photos.filter((p) => isPhotoMatchingFilter(p.category, sm.title, sm.url)).length;
        return {
          id: sm.title,
          label: sm.title,
          count,
          url: sm.url,
        };
      }),
    ];
  }, [subMenus, photos]);

  // Determine active category matching initialCategory
  const resolvedInitial = useMemo(() => {
    if (!initialCategory || initialCategory === 'all') return 'all';
    if (filterTabs.length > 0) {
      const matched = filterTabs.find(
        (t) =>
          t.id !== 'all' &&
          (isPhotoMatchingFilter(t.id, initialCategory, t.url) ||
            isPhotoMatchingFilter(initialCategory, t.id, t.url))
      );
      if (matched) return matched.id;
    }
    return initialCategory;
  }, [initialCategory, filterTabs]);

  const [activeCategory, setActiveCategory] = useState<string>(resolvedInitial);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);

  useEffect(() => {
    setActiveCategory(resolvedInitial);
  }, [resolvedInitial]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (typeof window !== 'undefined') {
      const newUrl =
        catId === 'all'
          ? window.location.pathname
          : `${window.location.pathname}?category=${encodeURIComponent(catId)}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all' || filterTabs.length === 0) return photos;
    return photos.filter((p) => isPhotoMatchingFilter(p.category, activeCategory));
  }, [photos, activeCategory, filterTabs]);

  const currentPhoto = selectedPhotoIdx !== null ? filteredPhotos[selectedPhotoIdx] : null;

  const handleNext = useCallback(() => {
    if (selectedPhotoIdx === null || filteredPhotos.length <= 1) return;
    setSelectedPhotoIdx((prev) => ((prev ?? 0) + 1) % filteredPhotos.length);
  }, [selectedPhotoIdx, filteredPhotos.length]);

  const handlePrev = useCallback(() => {
    if (selectedPhotoIdx === null || filteredPhotos.length <= 1) return;
    setSelectedPhotoIdx((prev) => ((prev ?? 0) - 1 + filteredPhotos.length) % filteredPhotos.length);
  }, [selectedPhotoIdx, filteredPhotos.length]);

  useEffect(() => {
    if (selectedPhotoIdx === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedPhotoIdx(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIdx, handleNext, handlePrev]);

  return (
    <Box>
      {/* Category Filter Tabs: Only displayed when sub-menus have been created */}
      {filterTabs.length > 0 && (
        <Box
          sx={{
            mb: { xs: 4, md: 5 },
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1.2,
          }}
        >
          {filterTabs.map((tab) => {
            const isSelected =
              activeCategory === tab.id ||
              (tab.id !== 'all' && isPhotoMatchingFilter(tab.id, activeCategory, tab.url));
            return (
              <Button
                key={tab.id}
                size="medium"
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => handleSelectCategory(tab.id)}
                startIcon={tab.id === 'all' ? <FilterAltIcon sx={{ fontSize: 16 }} /> : undefined}
                sx={{
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.9rem',
                  px: 2.5,
                  py: 0.8,
                  bgcolor: isSelected ? '#018730' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  borderColor: isSelected ? '#018730' : '#CBD5E1',
                  boxShadow: isSelected ? '0 4px 14px rgba(1, 135, 48, 0.25)' : 'none',
                  '&:hover': {
                    bgcolor: isSelected ? '#016c27' : '#F1F5F9',
                    borderColor: '#018730',
                  },
                }}
              >
                {tab.label} ({tab.count})
              </Button>
            );
          })}
        </Box>
      )}

      {/* Active Filter Info Chip */}
      {activeCategory !== 'all' && filterTabs.length > 0 && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Chip
            label={`Filter Sub-Menu: ${activeCategory}`}
            onDelete={() => handleSelectCategory('all')}
            deleteIcon={<CloseIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              bgcolor: 'rgba(1, 135, 48, 0.1)',
              color: '#018730',
              fontWeight: 700,
              fontSize: '0.875rem',
              py: 0.5,
              px: 0.5,
              borderRadius: '20px',
              border: '1px solid rgba(1, 135, 48, 0.25)',
            }}
          />
        </Box>
      )}

      {/* Photos Grid or Empty State */}
      {filteredPhotos.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            px: 3,
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FFFFFF',
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#F1F5F9', mb: 2 }}>
            <CollectionsIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#334155" sx={{ mb: 1 }}>
            Belum Ada Foto dalam Kategori &quot;{activeCategory}&quot;
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 3 }}>
            Dokumentasi foto untuk sub-menu ini belum diunggah atau belum dikelompokkan ke dalam kategori ini.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleSelectCategory('all')}
            sx={{
              color: '#018730',
              borderColor: '#018730',
              borderRadius: '24px',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#E8F6ED', borderColor: '#018730' },
            }}
          >
            Tampilkan Semua Foto
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPhotos.map((photo, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Card
                onClick={() => setSelectedPhotoIdx(idx)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 14px 32px rgba(1, 135, 48, 0.12)',
                    borderColor: '#018730',
                    '& .zoom-overlay': { opacity: 1 },
                  },
                }}
              >
                <Box sx={{ position: 'relative', width: '100%', height: 230, bgcolor: '#0B1320', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.title || `Foto Dokumentasi ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />

                  {/* Category Pill on image */}
                  {photo.category && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.75)',
                        color: '#FFFFFF',
                        px: 1.2,
                        py: 0.4,
                        borderRadius: '16px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {photo.category}
                    </Box>
                  )}

                  {/* Hover Zoom Overlay */}
                  <Box
                    className="zoom-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(1, 135, 48, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: '#FFFFFF',
                        color: '#018730',
                        borderRadius: '50%',
                        p: 1.2,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 26 }} />
                    </Box>
                  </Box>
                </Box>

                {/* Card Info */}
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 0.5, lineHeight: 1.35 }}>
                    {photo.title || `Dokumentasi #${idx + 1}`}
                  </Typography>
                  {photo.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {photo.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Lightbox Modal */}
      <Dialog
        open={selectedPhotoIdx !== null}
        onClose={() => setSelectedPhotoIdx(null)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, overflow: 'hidden', bgcolor: '#0B1320' } } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CollectionsIcon sx={{ color: '#018730' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF">
                {currentPhoto?.title || pageTitle}
              </Typography>
              {currentPhoto?.category && (
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Kategori: {currentPhoto.category}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedPhotoIdx(null)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1, sm: 3 }, bgcolor: '#0B1320', textAlign: 'center' }}>
          {currentPhoto && (
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  maxHeight: '70vh',
                  minHeight: 280,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.title || 'Foto Dokumen'}
                  style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              </Box>

              {/* Navigation Arrows */}
              {filteredPhotos.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(15, 23, 42, 0.75)',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#018730' },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    }}
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(15, 23, 42, 0.75)',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#018730' },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    }}
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </>
              )}

              {/* Photo Caption & Action */}
              <Box sx={{ mt: 2.5, width: '100%', maxWidth: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {currentPhoto.description && (
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1.5, lineHeight: 1.6 }}>
                    {currentPhoto.description}
                  </Typography>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  component="a"
                  href={currentPhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: '#A3DFB7',
                    borderColor: 'rgba(163, 223, 183, 0.5)',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { borderColor: '#A3DFB7', bgcolor: 'rgba(1, 135, 48, 0.2)' },
                  }}
                >
                  Buka Gambar Asli (Resolusi Penuh)
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
