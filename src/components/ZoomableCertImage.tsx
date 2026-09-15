'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CollectionsIcon from '@mui/icons-material/Collections';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import RefreshIcon from '@mui/icons-material/Refresh';
import { parseCertificateImages } from '@/lib/certifications';

interface ZoomableCertImageProps {
  image?: string | null;
  images?: string[];
  title: string;
  issuer?: string | null;
  certificateNumber?: string | null;
  description?: string | null;
  borderColor?: string;
}

/**
 * Thumbnail sertifikat 48x48 yang bisa diklik untuk memperbesar,
 * mendukung multi-dokumen (misal 1 standar seperti ISO 9001 memiliki 2 atau lebih sertifikat/halaman).
 */
export default function ZoomableCertImage({
  image,
  images,
  title,
  issuer,
  certificateNumber,
  description,
  borderColor = '#E2E8F0',
}: ZoomableCertImageProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  // Parse all certificate image URLs
  const certImages = React.useMemo(() => {
    if (images && images.length > 0) return images;
    return parseCertificateImages(image);
  }, [image, images]);

  const hasMultiple = certImages.length > 1;
  const primaryImage = certImages[0] || '';
  const currentImage = certImages[activeIdx] || primaryImage;

  const handleNext = useCallback(() => {
    if (certImages.length <= 1) return;
    setActiveIdx((prev) => (prev + 1) % certImages.length);
  }, [certImages.length]);

  const handlePrev = useCallback(() => {
    if (certImages.length <= 1) return;
    setActiveIdx((prev) => (prev - 1 + certImages.length) % certImages.length);
  }, [certImages.length]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!open || !hasMultiple) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasMultiple, handleNext, handlePrev]);

  return (
    <>
      <Box
        onClick={() => {
          setActiveIdx(0);
          setOpen(true);
        }}
        title={`Perbesar ${title} ${hasMultiple ? `(${certImages.length} berkas)` : ''}`}
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          overflow: 'hidden',
          flexShrink: 0,
          border: `1px solid ${borderColor}`,
          position: 'relative',
          cursor: 'zoom-in',
          bgcolor: '#F8FAFC',
          '& img': { transition: 'transform 0.25s ease' },
          '&:hover img': { transform: 'scale(1.12)' },
          '& .zoom-overlay': { opacity: 0, transition: 'opacity 0.2s ease' },
          '&:hover .zoom-overlay': { opacity: 1 },
        }}
      >
        {primaryImage && !imgErrorMap[primaryImage] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={primaryImage}
            alt={title}
            onError={() => setImgErrorMap((prev) => ({ ...prev, [primaryImage]: true }))}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#018730' }}>
            <WorkspacePremiumIcon fontSize="small" />
          </Box>
        )}

        {hasMultiple && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              bgcolor: 'rgba(1, 135, 48, 0.95)',
              color: '#FFFFFF',
              borderRadius: '6px',
              px: 0.5,
              py: 0.1,
              fontSize: '0.65rem',
              fontWeight: 800,
              lineHeight: 1.2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
            }}
          >
            <CollectionsIcon sx={{ fontSize: 10 }} />
            <span>{certImages.length}</span>
          </Box>
        )}

        <Box
          className="zoom-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <ZoomInIcon sx={{ fontSize: 20 }} />
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, overflow: 'hidden' } } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WorkspacePremiumIcon sx={{ color: '#018730', fontSize: 28 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  {title}
                </Typography>
                {hasMultiple && (
                  <Chip
                    size="small"
                    label={`Dokumen ${activeIdx + 1} dari ${certImages.length}`}
                    sx={{
                      bgcolor: '#018730',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      height: 22,
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {issuer || '-'} | No: {certificateNumber || '-'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          {currentImage ? (
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  maxHeight: '68vh',
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                }}
              >
                {imgErrorMap[currentImage] ? (
                  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <BrokenImageIcon sx={{ fontSize: 52, color: '#94A3B8' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Berkas gambar belum dapat ditampilkan
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', maxWidth: 360 }}>
                      Gambar sedang diproses atau URL berkas tidak dapat diakses saat ini.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setImgErrorMap((prev) => ({ ...prev, [currentImage]: false }))}
                      startIcon={<RefreshIcon />}
                      sx={{
                        mt: 1,
                        color: '#018730',
                        borderColor: '#A3DFB7',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#018730', bgcolor: '#E8F6ED' },
                      }}
                    >
                      Coba Muat Ulang
                    </Button>
                  </Box>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentImage}
                    alt={`${title} - Berkas ${activeIdx + 1}`}
                    onError={() => setImgErrorMap((prev) => ({ ...prev, [currentImage]: true }))}
                    style={{ maxWidth: '100%', maxHeight: '64vh', objectFit: 'contain' }}
                  />
                )}
              </Box>

              {/* Navigation Arrows for Multiple Documents */}
              {hasMultiple && (
                <>
                  <IconButton
                    onClick={handlePrev}
                    aria-label="Dokumen Sebelumnya"
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(15, 23, 42, 0.75)',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#018730' },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  <IconButton
                    onClick={handleNext}
                    aria-label="Dokumen Berikutnya"
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(15, 23, 42, 0.75)',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#018730' },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Dokumen scan sertifikat belum diunggah.
            </Typography>
          )}

          {/* Thumbnail Gallery Row for Multiple Documents */}
          {hasMultiple && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {certImages.map((imgUrl, i) => (
                <Box
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    p: 0.3,
                    border: i === activeIdx ? '2.5px solid #018730' : '1.5px solid #CBD5E1',
                    bgcolor: '#FFFFFF',
                    boxShadow: i === activeIdx ? '0 0 0 2px rgba(1, 135, 48, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': { borderColor: '#018730' },
                  }}
                >
                  {imgErrorMap[imgUrl] ? (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F1F5F9', color: '#94A3B8' }}>
                      <BrokenImageIcon sx={{ fontSize: 20 }} />
                    </Box>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      onError={() => setImgErrorMap((prev) => ({ ...prev, [imgUrl]: true }))}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      bgcolor: i === activeIdx ? '#018730' : 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      px: 0.4,
                      borderRadius: 1,
                    }}
                  >
                    {i + 1}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {currentImage && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={currentImage}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: '#018730',
                  borderColor: '#A3DFB7',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#018730', bgcolor: '#E8F6ED' },
                }}
              >
                Buka Berkas Asli (Resolusi Penuh)
              </Button>
            </Box>
          )}

          {description && (
            <Typography variant="body2" sx={{ mt: 2, maxWidth: 640, mx: 'auto', textAlign: 'center' }} color="text.secondary">
              {description}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
