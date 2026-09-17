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

interface Props {
  photos: GalleryPhoto[];
  pageTitle: string;
  initialCategory?: string;
}

export default function CustomGalleryClient({ photos, pageTitle, initialCategory = 'all' }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const isCategoryMatch = useCallback((photoCategory: string | undefined, targetCategory: string) => {
    if (!photoCategory) return false;
    const p = photoCategory.trim().toLowerCase();
    const t = targetCategory.trim().toLowerCase();
    if (p === t) return true;
    const slugP = p.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slugT = t.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (slugP === slugT) return true;
    if ((t === 'kiic' || t === 'plan-kiic' || t === 'plant-kiic') && p.includes('kiic')) return true;
    if ((t === 'giic' || t === 'plan-giic' || t === 'plant-giic') && p.includes('giic')) return true;
    return false;
  }, []);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [photos]);

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (typeof window !== 'undefined') {
      const newUrl = cat === 'all' ? window.location.pathname : `${window.location.pathname}?category=${encodeURIComponent(cat)}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;
    return photos.filter((p) => isCategoryMatch(p.category, activeCategory));
  }, [photos, activeCategory, isCategoryMatch]);

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
    <Box sx={{ py: 2 }}>
      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.2 }}>
          <Button
            size="small"
            variant={activeCategory === 'all' ? 'contained' : 'outlined'}
            onClick={() => setActiveCategory('all')}
            startIcon={<FilterAltIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: activeCategory === 'all' ? 800 : 600,
              fontSize: '0.85rem',
              px: 2,
              py: 0.6,
              bgcolor: activeCategory === 'all' ? '#018730' : '#FFFFFF',
              color: activeCategory === 'all' ? '#FFFFFF' : '#475569',
              borderColor: activeCategory === 'all' ? '#018730' : '#CBD5E1',
              boxShadow: activeCategory === 'all' ? '0 4px 14px rgba(1, 135, 48, 0.25)' : 'none',
              '&:hover': { bgcolor: activeCategory === 'all' ? '#016c27' : '#F1F5F9' },
            }}
          >
            Semua Foto ({photos.length})
          </Button>

          {categories.map((cat) => {
            const count = photos.filter((p) => isCategoryMatch(p.category, cat)).length;
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase() || isCategoryMatch(cat, activeCategory);
            return (
              <Button
                key={cat}
                size="small"
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => handleSelectCategory(cat)}
                sx={{
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 0.6,
                  bgcolor: isSelected ? '#018730' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  borderColor: isSelected ? '#018730' : '#CBD5E1',
                  boxShadow: isSelected ? '0 4px 14px rgba(1, 135, 48, 0.25)' : 'none',
                  '&:hover': { bgcolor: isSelected ? '#016c27' : '#F1F5F9' },
                }}
              >
                {cat} ({count})
              </Button>
            );
          })}
        </Box>
      )}

      {/* Active Filter Info Banner */}
      {activeCategory !== 'all' && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Chip
            label={`Filter Album: ${activeCategory}`}
            onDelete={() => handleSelectCategory('all')}
            deleteIcon={<CloseIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              bgcolor: 'rgba(1, 135, 48, 0.1)',
              color: '#018730',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '20px',
              border: '1px solid rgba(1, 135, 48, 0.25)',
            }}
          />
        </Box>
      )}

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: '#94A3B8' }}>
          <CollectionsIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1">Belum ada foto dalam kategori ini.</Typography>
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
