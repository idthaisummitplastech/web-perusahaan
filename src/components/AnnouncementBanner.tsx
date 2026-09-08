'use client';

import * as React from 'react';
import { useState } from 'react';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface AnnouncementProps {
  announcement?: {
    id: number;
    message: string;
    btnText?: string | null;
    btnUrl?: string | null;
  } | null;
}

export default function AnnouncementBanner({ announcement }: AnnouncementProps) {
  const [visible, setVisible] = useState(true);
  const { language } = useLanguage();

  if (!announcement || !visible) return null;

  const displayMessage =
    language === 'en'
      ? 'PT Indonesia Thai Summit Plastech — High-Quality Automotive Plastic Component Manufacturing. "Before We Build Parts, We Build People."'
      : announcement.message;

  const displayBtnText =
    language === 'en'
      ? 'Explore Products'
      : (announcement.btnText || 'Lihat Produk');

  return (
    <Box
      sx={{
        background: 'linear-gradient(90deg, #062111 0%, #0c381d 50%, #062111 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#FFFFFF',
        py: 0.7,
        px: 2,
        position: 'relative',
        zIndex: 1100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          position: 'relative',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '0.78rem', md: '0.825rem' },
            fontWeight: 500,
            textAlign: 'center',
            color: '#F1F5F9',
            letterSpacing: '0.01em',
          }}
        >
          {displayMessage}
        </Typography>

        {displayBtnText && announcement.btnUrl && (
          <Button
            component={Link}
            href={announcement.btnUrl}
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: '12px !important' }} />}
            sx={{
              bgcolor: '#fc4509',
              color: '#FFFFFF',
              fontSize: '0.725rem',
              fontWeight: 700,
              py: '2px',
              px: '10px',
              minWidth: 'auto',
              borderRadius: 20,
              textTransform: 'none',
              boxShadow: '0 2px 6px rgba(252, 69, 9, 0.3)',
              '&:hover': {
                bgcolor: '#e03800',
              },
            }}
          >
            {displayBtnText}
          </Button>
        )}

        <IconButton
          size="small"
          onClick={() => setVisible(false)}
          sx={{
            position: { xs: 'static', sm: 'absolute' },
            right: 8,
            color: 'rgba(255, 255, 255, 0.5)',
            p: 0.5,
            '&:hover': { color: '#FFFFFF' },
          }}
          aria-label="Close announcement"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Container>
    </Box>
  );
}
