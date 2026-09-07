'use client';

import * as React from 'react';
import { useState } from 'react';
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

  return (
    <>
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
                    <span>Perbesar Sertifikat</span>
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
                    Akreditasi Global
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
                    No: {cert.certificateNumber}
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
                  {cert.description || 'Sertifikasi standar mutu dan operasional global PT ITSP.'}
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
                    <span>Aktif</span>
                  </Box>
                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                    {cert.expiryDate ? `s/d ${new Date(cert.expiryDate).getFullYear()}` : 'Berlaku'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                Penerbit: {selectedCert?.issuer} | No: {selectedCert?.certificateNumber || '-'}
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
