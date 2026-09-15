'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useLanguage } from '@/lib/LanguageContext';
import { parseCertificateImages } from '@/lib/certifications';

export interface CertificationItem {
  id: number;
  title: string;
  issuer: string;
  certificateNumber: string | null;
  issuedDate: string | Date | null;
  expiryDate: string | Date | null;
  image: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  certifications: CertificationItem[];
}

export default function CertificateGridClient({ certifications }: Props) {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { language, t } = useLanguage();

  // Extract unique categories for filter tabs (e.g., ISO 9001, IATF 16949, ISO 14001, ISO 45001)
  const categoryTabs = useMemo(() => {
    const standardsMap = new Map<string, number>();

    certifications.forEach((c) => {
      const lower = c.title.toLowerCase();
      let key = 'Lainnya';
      if (lower.includes('9001')) key = 'ISO 9001';
      else if (lower.includes('16949') || lower.includes('iatf')) key = 'IATF 16949';
      else if (lower.includes('14001')) key = 'ISO 14001';
      else if (lower.includes('45001')) key = 'ISO 45001';
      else key = c.title.split(' ')[0] || 'Lainnya';

      standardsMap.set(key, (standardsMap.get(key) || 0) + 1);
    });

    const list: { id: string; label: string; count: number }[] = [
      { id: 'all', label: language === 'en' ? 'All Standards' : 'Semua Sertifikasi', count: certifications.length },
    ];

    standardsMap.forEach((count, key) => {
      list.push({ id: key, label: key, count });
    });

    return list;
  }, [certifications, language]);

  // Filter certifications based on selected category
  const filteredCertifications = useMemo(() => {
    if (activeCategory === 'all') return certifications;
    return certifications.filter((c) => {
      const lower = c.title.toLowerCase();
      if (activeCategory === 'ISO 9001') return lower.includes('9001');
      if (activeCategory === 'IATF 16949') return lower.includes('16949') || lower.includes('iatf');
      if (activeCategory === 'ISO 14001') return lower.includes('14001');
      if (activeCategory === 'ISO 45001') return lower.includes('45001');
      return c.title.startsWith(activeCategory);
    });
  }, [certifications, activeCategory]);

  // Active selected certificate images
  const selectedImages = useMemo(() => {
    if (!selectedCert) return [];
    return parseCertificateImages(selectedCert.image);
  }, [selectedCert]);

  const hasMultipleSelected = selectedImages.length > 1;
  const currentModalImage = selectedImages[activeImgIdx] || selectedImages[0] || '';

  const handleNextImg = useCallback(() => {
    if (selectedImages.length <= 1) return;
    setActiveImgIdx((prev) => (prev + 1) % selectedImages.length);
  }, [selectedImages.length]);

  const handlePrevImg = useCallback(() => {
    if (selectedImages.length <= 1) return;
    setActiveImgIdx((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  }, [selectedImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedCert || !hasMultipleSelected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextImg();
      if (e.key === 'ArrowLeft') handlePrevImg();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCert, hasMultipleSelected, handleNextImg, handlePrevImg]);

  const handleOpenCert = (cert: CertificationItem) => {
    setSelectedCert(cert);
    setActiveImgIdx(0);
  };

  return (
    <>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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
          <WorkspacePremiumIcon sx={{ fontSize: 18, color: '#018730' }} />
          <span>{t('cert_badge', 'Global Compliance & Quality Standards')}</span>
        </Box>
        <Typography variant="h2" component="h1" fontWeight={900} color="#0F172A" sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}>
          {t('cert_title', 'International Automotive Certifications')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 700, mx: 'auto', fontSize: '1.05rem' }}>
          {t('cert_subtitle', 'All quality management, plastic injection molding, occupational health & safety, and environmental stewardship systems at PT ITSP are certified by international audit bodies.')}
        </Typography>
      </Box>

      {/* Filter Tabs (handles multiple certificates per standard cleanly) */}
      {categoryTabs.length > 2 && (
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.2 }}>
          {categoryTabs.map((tab) => {
            const isSelected = activeCategory === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                size="medium"
                variant={isSelected ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '24px',
                  px: 2.2,
                  py: 0.75,
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  bgcolor: isSelected ? '#018730' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  borderColor: isSelected ? '#018730' : '#CBD5E1',
                  boxShadow: isSelected ? '0 4px 12px rgba(1, 135, 48, 0.25)' : 'none',
                  '&:hover': {
                    bgcolor: isSelected ? '#016f27' : '#F4FAF6',
                    borderColor: '#018730',
                    color: isSelected ? '#FFFFFF' : '#018730',
                  },
                }}
              >
                <span>{tab.label}</span>
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.8,
                    py: 0.1,
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    bgcolor: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0',
                    color: isSelected ? '#FFFFFF' : '#475569',
                  }}
                >
                  {tab.count}
                </Box>
              </Button>
            );
          })}
        </Box>
      )}

      {/* Grid of Certificates */}
      <Grid container spacing={3.5}>
        {filteredCertifications.map((cert) => {
          const certImages = parseCertificateImages(cert.image);
          const hasMultiple = certImages.length > 1;
          const primaryImage = certImages[0] || '';

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cert.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  border: '1.5px solid #cbead5',
                  borderTop: '4px solid #018730',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 6px 20px rgba(1, 135, 48, 0.06)',
                  overflow: 'hidden',
                  transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#018730',
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 36px rgba(1, 135, 48, 0.14)',
                  },
                }}
              >
                {/* Image Preview Container */}
                {primaryImage ? (
                  <Box
                    onClick={() => handleOpenCert(cert)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 195,
                      bgcolor: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1.5,
                      '&:hover .zoom-overlay': {
                        opacity: 1,
                      },
                      '&:hover img': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImage}
                      alt={cert.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease',
                      }}
                    />

                    {/* Multi-Certificate Badge if this standard has 2 or more documents */}
                    {hasMultiple && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: 'rgba(1, 135, 48, 0.95)',
                          color: '#FFFFFF',
                          borderRadius: '20px',
                          px: 1.2,
                          py: 0.35,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.6,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <CollectionsIcon sx={{ fontSize: 13 }} />
                        <span>{certImages.length} Dokumen</span>
                      </Box>
                    )}

                    <Box
                      className="zoom-overlay"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(1, 135, 48, 0.78)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        color: '#FFFFFF',
                        opacity: 0,
                        transition: 'opacity 0.25s ease',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 24 }} />
                      <span>{hasMultiple ? `Perbesar (${certImages.length} Berkas)` : t('cert_zoom', 'Zoom Certificate')}</span>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 100,
                      bgcolor: '#F4FAF6',
                      borderBottom: '1px solid #E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#018730',
                      gap: 1.5,
                    }}
                  >
                    <ShieldIcon sx={{ fontSize: 36, color: '#018730' }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#018730', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {language === 'en' ? 'Global Accreditation' : 'Akreditasi Global'}
                    </Typography>
                  </Box>
                )}

                {/* Certificate Content Body */}
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.3, fontSize: '1.05rem' }}>
                      {cert.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 700, color: '#018730' }}>
                      {cert.issuer}
                    </Typography>
                  </Box>

                  {cert.certificateNumber && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        py: 0.6,
                        px: 1,
                        borderRadius: 1.5,
                        color: '#015e21',
                        fontWeight: 700,
                        mb: 1.5,
                        display: 'block',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {language === 'en' ? 'Cert No:' : 'No:'} {cert.certificateNumber}
                    </Typography>
                  )}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      fontSize: '0.825rem',
                      lineHeight: 1.6,
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {cert.description || (language === 'en' ? 'Global quality management and manufacturing certification of PT ITSP.' : 'Sertifikasi standar mutu dan operasional global PT ITSP.')}
                  </Typography>

                  {/* Footer status & multi-doc indicator */}
                  <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: '#018730',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        px: 1.2,
                        py: 0.35,
                        borderRadius: '14px',
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: 12, color: '#FFFFFF' }} />
                      <span>{hasMultiple ? `${certImages.length} Berkas` : t('cert_active', 'Active')}</span>
                    </Box>
                    <Typography variant="caption" color="#64748B" fontWeight={600}>
                      {cert.expiryDate ? `${t('cert_valid_until', 'Valid until')} ${new Date(cert.expiryDate).getFullYear()}` : (language === 'en' ? 'Lifetime Valid' : 'Berlaku')}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* CTA Section */}
      <Box sx={{ mt: 10, p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: '#018730', color: '#FFFFFF', textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5 }}>
          {t('cert_cta_title', 'Need Official Certificate Documents for OEM Due Diligence?')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3.5, maxWidth: 640, mx: 'auto' }}>
          {t('cert_cta_desc', 'Contact our Quality Assurance (QA) and marketing department for certified official copies.')}
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
            {t('cert_cta_btn', 'Contact QA / Marketing Team')}
          </Button>
        </Link>
      </Box>

      {/* Lightbox Modal with Multi-Document Carousel & Thumbnails */}
      <Dialog
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              overflow: 'hidden',
            },
          },
        }}
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
                <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF">
                  {selectedCert?.title}
                </Typography>
                {hasMultipleSelected && (
                  <Chip
                    size="small"
                    label={`Berkas ${activeImgIdx + 1} dari ${selectedImages.length}`}
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
              <Typography variant="caption" color="#94A3B8">
                {language === 'en' ? 'Issuing Body:' : 'Penerbit:'} {selectedCert?.issuer} | {language === 'en' ? 'Cert No:' : 'No:'} {selectedCert?.certificateNumber || '-'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setSelectedCert(null)}
            sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          {currentModalImage ? (
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentModalImage}
                  alt={`${selectedCert?.title} - Dokumen ${activeImgIdx + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '64vh',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {/* Prev / Next Arrows for Multi-Certificate */}
              {hasMultipleSelected && (
                <>
                  <IconButton
                    onClick={handlePrevImg}
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
                    onClick={handleNextImg}
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
              Dokumen scan belum tersedia.
            </Typography>
          )}

          {/* Thumbnail Gallery Row if multiple documents exist */}
          {hasMultipleSelected && (
            <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {selectedImages.map((imgUrl, i) => (
                <Box
                  key={i}
                  onClick={() => setActiveImgIdx(i)}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    p: 0.3,
                    border: i === activeImgIdx ? '2.5px solid #018730' : '1.5px solid #CBD5E1',
                    bgcolor: '#FFFFFF',
                    boxShadow: i === activeImgIdx ? '0 0 0 2px rgba(1, 135, 48, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': { borderColor: '#018730' },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      bgcolor: i === activeImgIdx ? '#018730' : 'rgba(0,0,0,0.6)',
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

          {currentModalImage && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={currentModalImage}
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
                {language === 'en' ? 'Open Original Resolution' : 'Buka Berkas Asli (Resolusi Penuh)'}
              </Button>
            </Box>
          )}

          {selectedCert?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, maxWidth: 640, mx: 'auto', textAlign: 'center' }}>
              {selectedCert.description}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
