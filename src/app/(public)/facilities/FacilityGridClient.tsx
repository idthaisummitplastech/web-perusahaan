'use client';

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { parseFacilityImages } from '@/lib/facilities';
import { useLanguage } from '@/lib/LanguageContext';

export interface FacilityItem {
  id: number;
  title: string;
  category: string;
  image?: string | null;
  description?: string | null;
  specifications?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

interface Props {
  facilities: FacilityItem[];
}

export default function FacilityGridClient({ facilities }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);
  const [modalImgIdx, setModalImgIdx] = useState<number>(0);
  const [cardImgIndices, setCardImgIndices] = useState<Record<number, number>>({});
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const { language, t } = useLanguage();

  // Extract unique categories
  const categoryTabs = useMemo(() => {
    const map = new Map<string, number>();
    facilities.forEach((f) => {
      const cat = f.category || 'Lainnya';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const list: { id: string; label: string; count: number }[] = [
      { id: 'all', label: language === 'en' ? 'All Facilities' : 'Semua Fasilitas', count: facilities.length },
    ];
    map.forEach((count, key) => {
      list.push({ id: key, label: key, count });
    });
    return list;
  }, [facilities, language]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    if (activeCategory === 'all') return facilities;
    return facilities.filter((f) => f.category === activeCategory);
  }, [facilities, activeCategory]);

  // Modal images
  const modalImages = useMemo(() => {
    if (!selectedFacility) return [];
    return parseFacilityImages(selectedFacility.image);
  }, [selectedFacility]);

  const currentModalImg = modalImages[modalImgIdx] || modalImages[0] || '';
  const hasMultipleModal = modalImages.length > 1;

  const handleNextModal = useCallback(() => {
    if (modalImages.length <= 1) return;
    setModalImgIdx((prev) => (prev + 1) % modalImages.length);
  }, [modalImages.length]);

  const handlePrevModal = useCallback(() => {
    if (modalImages.length <= 1) return;
    setModalImgIdx((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  }, [modalImages.length]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!selectedFacility || !hasMultipleModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextModal();
      if (e.key === 'ArrowLeft') handlePrevModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFacility, hasMultipleModal, handleNextModal, handlePrevModal]);

  const handleOpenModal = (fac: FacilityItem, startIdx: number = 0) => {
    setSelectedFacility(fac);
    setModalImgIdx(startIdx);
  };

  const handleCardPrev = (e: React.MouseEvent, facId: number, count: number) => {
    e.stopPropagation();
    setCardImgIndices((prev) => {
      const cur = prev[facId] || 0;
      return { ...prev, [facId]: (cur - 1 + count) % count };
    });
  };

  const handleCardNext = (e: React.MouseEvent, facId: number, count: number) => {
    e.stopPropagation();
    setCardImgIndices((prev) => {
      const cur = prev[facId] || 0;
      return { ...prev, [facId]: (cur + 1) % count };
    });
  };

  return (
    <>
      {/* Category Filter Tabs */}
      {categoryTabs.length > 2 && (
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.2 }}>
          {categoryTabs.map((tab) => {
            const isSelected = activeCategory === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                variant={isSelected ? 'contained' : 'outlined'}
                size="small"
                startIcon={tab.id === 'all' ? <FilterAltIcon sx={{ fontSize: 16 }} /> : undefined}
                sx={{
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 0.7,
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

      {/* Facility Cards Grid */}
      <Grid container spacing={4}>
        {filteredFacilities.map((fac) => {
          const images = parseFacilityImages(fac.image);
          const hasImages = images.length > 0;
          const hasMultiple = images.length > 1;
          const currentIdx = cardImgIndices[fac.id] || 0;
          const activeCardImg = images[currentIdx] || images[0] || '';

          return (
            <Grid size={{ xs: 12, md: 6 }} key={fac.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid #cbead5',
                  borderTop: '4px solid #018730',
                  boxShadow: '0 6px 24px rgba(1, 135, 48, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#018730',
                    boxShadow: '0 16px 36px rgba(1, 135, 48, 0.12)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                {/* Image Container with Carousel Navigation */}
                {hasImages ? (
                  <Box
                    onClick={() => handleOpenModal(fac, currentIdx)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 260,
                      overflow: 'hidden',
                      bgcolor: '#0B1320',
                      cursor: 'zoom-in',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover .zoom-badge': { opacity: 1 },
                    }}
                  >
                    {imgErrorMap[activeCardImg] ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94A3B8' }}>
                        <PrecisionManufacturingIcon sx={{ fontSize: 52, color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          Foto mesin sedang diproses
                        </Typography>
                      </Box>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={activeCardImg}
                        alt={`${fac.title} - Foto ${currentIdx + 1}`}
                        onError={() => setImgErrorMap((prev) => ({ ...prev, [activeCardImg]: true }))}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'opacity 0.25s ease',
                        }}
                      />
                    )}

                    {/* Multi-Photo Count Badge */}
                    {hasMultiple && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'rgba(1, 135, 48, 0.92)',
                          color: '#FFFFFF',
                          borderRadius: '16px',
                          px: 1.2,
                          py: 0.35,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.6,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <CollectionsIcon sx={{ fontSize: 13 }} />
                        <span>{images.length} Foto Mesin</span>
                      </Box>
                    )}

                    {/* Zoom Icon Badge */}
                    <Box
                      className="zoom-badge"
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.75)',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        px: 1.2,
                        py: 0.35,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 15 }} />
                      <span>{language === 'en' ? 'Click to Enlarge' : 'Klik Perbesar'}</span>
                    </Box>

                    {/* Card Carousel Navigation Buttons */}
                    {hasMultiple && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => handleCardPrev(e, fac.id, images.length)}
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(15, 23, 42, 0.65)',
                            color: '#FFFFFF',
                            '&:hover': { bgcolor: '#018730' },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleCardNext(e, fac.id, images.length)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(15, 23, 42, 0.65)',
                            color: '#FFFFFF',
                            '&:hover': { bgcolor: '#018730' },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                        </IconButton>

                        {/* Dot Indicators */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 0.6,
                          }}
                        >
                          {images.map((_, dotIdx) => (
                            <Box
                              key={dotIdx}
                              sx={{
                                width: dotIdx === currentIdx ? 16 : 6,
                                height: 6,
                                borderRadius: '3px',
                                bgcolor: dotIdx === currentIdx ? '#018730' : 'rgba(255,255,255,0.6)',
                                transition: 'all 0.25s ease',
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 220,
                      background: 'linear-gradient(135deg, #018730 0%, #083818 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    <PrecisionManufacturingIcon sx={{ fontSize: 64, opacity: 0.8 }} />
                  </Box>
                )}

                {/* Content Details */}
                <Box sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip
                      label={fac.category}
                      size="small"
                      sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 800, fontSize: '0.75rem' }}
                    />
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: '#F0FDF4',
                        color: '#166534',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        px: 1.2,
                        py: 0.3,
                        borderRadius: '14px',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: 13, color: '#018730' }} />
                      <span>{language === 'en' ? 'Active Operation' : 'Aktif Beroperasi'}</span>
                    </Box>
                  </Box>

                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
                    {fac.title}
                  </Typography>

                  {fac.specifications && (
                    <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
                      <Typography variant="caption" fontWeight={800} color="#018730" display="block" sx={{ mb: 0.35, letterSpacing: '0.04em' }}>
                        {language === 'en' ? 'TECHNICAL SPECIFICATIONS:' : 'SPESIFIKASI TEKNIS:'}
                      </Typography>
                      <Typography variant="caption" color="#334155" sx={{ lineHeight: 1.6, display: 'block', fontSize: '0.82rem' }}>
                        {fac.specifications}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {fac.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Lightbox Modal Zoom for Multi-Photo Facility */}
      <Dialog
        open={Boolean(selectedFacility)}
        onClose={() => setSelectedFacility(null)}
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
            <PrecisionManufacturingIcon sx={{ color: '#018730', fontSize: 28 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedFacility?.title}
                </Typography>
                {hasMultipleModal && (
                  <Chip
                    size="small"
                    label={`Foto ${modalImgIdx + 1} dari ${modalImages.length}`}
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
                {selectedFacility?.category}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setSelectedFacility(null)}
            sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          {currentModalImg ? (
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  maxHeight: '68vh',
                  minHeight: 300,
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
                {imgErrorMap[currentModalImg] ? (
                  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <BrokenImageIcon sx={{ fontSize: 52, color: '#94A3B8' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Foto mesin belum dapat ditampilkan
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setImgErrorMap((prev) => ({ ...prev, [currentModalImg]: false }))}
                      startIcon={<RefreshIcon />}
                      sx={{ mt: 1, color: '#018730', borderColor: '#018730' }}
                    >
                      Muat Ulang
                    </Button>
                  </Box>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentModalImg}
                    alt={`${selectedFacility?.title} - Foto ${modalImgIdx + 1}`}
                    onError={() => setImgErrorMap((prev) => ({ ...prev, [currentModalImg]: true }))}
                    style={{ maxWidth: '100%', maxHeight: '64vh', objectFit: 'contain' }}
                  />
                )}
              </Box>

              {/* Prev / Next Arrows */}
              {hasMultipleModal && (
                <>
                  <IconButton
                    onClick={handlePrevModal}
                    aria-label="Foto Sebelumnya"
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
                    onClick={handleNextModal}
                    aria-label="Foto Berikutnya"
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
              Foto fasilitas belum tersedia.
            </Typography>
          )}

          {/* Thumbnail Strip */}
          {hasMultipleModal && (
            <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {modalImages.map((imgUrl, i) => (
                <Box
                  key={i}
                  onClick={() => setModalImgIdx(i)}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    p: 0.3,
                    border: i === modalImgIdx ? '2.5px solid #018730' : '1.5px solid #CBD5E1',
                    bgcolor: '#FFFFFF',
                    boxShadow: i === modalImgIdx ? '0 0 0 2px rgba(1, 135, 48, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': { borderColor: '#018730' },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${i + 1}`}
                    onError={() => setImgErrorMap((prev) => ({ ...prev, [imgUrl]: true }))}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      bgcolor: i === modalImgIdx ? '#018730' : 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      px: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {i + 1}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {currentModalImg && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={currentModalImg}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: '#018730',
                  borderColor: '#A3DFB7',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#018730', bgcolor: '#E8F6ED' },
                }}
              >
                {language === 'en' ? 'Open Original Photo' : 'Buka Foto Asli (Resolusi Penuh)'}
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
