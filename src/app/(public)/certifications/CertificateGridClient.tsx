'use client';

import * as React from 'react';
import { useState } from 'react';
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
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useLanguage } from '@/lib/LanguageContext';

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
  const { language, t } = useLanguage();

  return (
    <>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
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

      {/* Grid of Certificates */}
      <Grid container spacing={3.5}>
        {certifications.map((cert) => (
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
              {cert.image ? (
                <Box
                  onClick={() => setSelectedCert(cert)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 190,
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
                      transform: 'scale(1.04)',
                    },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cert.image}
                    alt={cert.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                  <Box
                    className="zoom-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(1, 135, 48, 0.75)',
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
                    <span>{t('cert_zoom', 'Zoom Certificate')}</span>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 90,
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

                {/* Footer status */}
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
                    <span>{t('cert_active', 'Active')}</span>
                  </Box>
                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                    {cert.expiryDate ? `${t('cert_valid_until', 'Valid until')} ${new Date(cert.expiryDate).getFullYear()}` : (language === 'en' ? 'Lifetime Valid' : 'Berlaku')}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
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

      {/* Lightbox Modal for High-Resolution Certificate Inspection */}
      <Dialog
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            overflow: 'hidden',
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
              <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF">
                {selectedCert?.title}
              </Typography>
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
          {selectedCert?.image && (
            <Box
              sx={{
                maxHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedCert.image}
                alt={selectedCert.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
          {selectedCert?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
              {selectedCert.description}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
