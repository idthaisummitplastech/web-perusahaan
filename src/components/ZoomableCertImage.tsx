'use client';

import * as React from 'react';
import { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, Typography, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

interface ZoomableCertImageProps {
  image: string;
  title: string;
  issuer?: string | null;
  certificateNumber?: string | null;
  description?: string | null;
  borderColor?: string;
}

/**
 * Thumbnail sertifikat 48x48 yang bisa diklik untuk memperbesar,
 * meniru lightbox di /certifications (CertificateGridClient).
 * Dipakai di Home (/) dan About (/about) yang sebelumnya statis.
 */
export default function ZoomableCertImage({
  image,
  title,
  issuer,
  certificateNumber,
  description,
  borderColor = '#E2E8F0',
}: ZoomableCertImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        title={`Perbesar ${title}`}
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          overflow: 'hidden',
          flexShrink: 0,
          border: `1px solid ${borderColor}`,
          position: 'relative',
          cursor: 'zoom-in',
          '& img': { transition: 'transform 0.25s ease' },
          '&:hover img': { transform: 'scale(1.12)' },
          '& .zoom-overlay': { opacity: 0, transition: 'opacity 0.2s ease' },
          '&:hover .zoom-overlay': { opacity: 1 },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                {title}
              </Typography>
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
              src={image}
              alt={title}
              style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
            />
          </Box>
          {description && (
            <Typography variant="body2" sx={{ mt: 2.5, maxWidth: 600, mx: 'auto', textAlign: 'center' }} color="text.secondary">
              {description}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
