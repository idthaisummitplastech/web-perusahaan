'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Button, Stack, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface HeroProps {
  badge?: string;
  title: string;
  subtitle?: string | null;
  primaryBtnText?: string | null;
  primaryBtnUrl?: string | null;
  secondaryBtnText?: string | null;
  secondaryBtnUrl?: string | null;
}

export default function HeroSection({
  badge = 'Solusi Manufaktur & Rekayasa Plastik Otomotif',
  title,
  subtitle,
  primaryBtnText,
  primaryBtnUrl,
  secondaryBtnText,
  secondaryBtnUrl,
}: HeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #E6F5EC 0%, #F4FAF6 45%, #FFFFFF 100%)',
        pt: { xs: 8, md: 12 },
        pb: { xs: 10, md: 14 },
        borderBottom: '1px solid #D1EBD9',
      }}
    >
      {/* Background Subtle Tech Dot Pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(1, 135, 48, 0.1) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />

      {/* Decorative Ambient Brand Glows (#018730 Green & #fc4509 Orange) */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse at center, rgba(1, 135, 48, 0.18) 0%, rgba(240, 253, 244, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '12%',
          width: 550,
          height: 380,
          background: 'radial-gradient(ellipse at center, rgba(252, 69, 9, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {badge && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#e8f6ed',
              color: '#018730',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: '1.5px solid #a3dfb7',
              boxShadow: '0 2px 8px rgba(1, 135, 48, 0.12)',
              mb: 3,
              px: 2,
              py: 0.8,
              borderRadius: '20px',
            }}
          >
            <SparklesIcon sx={{ fontSize: 16, color: '#fc4509' }} />
            <span>{badge}</span>
          </Box>
        )}

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.4rem', sm: '3.4rem', md: '4.2rem' },
            fontWeight: 900,
            lineHeight: 1.16,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            mb: 3,
            '& span': {
              color: '#018730',
              display: 'inline-block',
              fontWeight: 900,
            },
          }}
          dangerouslySetInnerHTML={{ __html: title }}
        />

        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: '#475569',
              fontSize: { xs: '1.05rem', md: '1.25rem' },
              lineHeight: 1.7,
              maxWidth: 720,
              mx: 'auto',
              mb: 4.5,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </Typography>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'center', alignItems: 'center', mb: 5 }}
        >
          {primaryBtnText && primaryBtnUrl && (
            <Button
              component={Link}
              href={primaryBtnUrl}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#018730',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.05rem',
                borderRadius: 25,
                py: 1.75,
                px: 4.5,
                boxShadow: '0 8px 24px rgba(1, 135, 48, 0.35)',
                '&:hover': {
                  bgcolor: '#016f27',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(1, 135, 48, 0.45)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {primaryBtnText}
            </Button>
          )}

          {secondaryBtnText && secondaryBtnUrl && (
            <Button
              component={Link}
              href={secondaryBtnUrl}
              variant="outlined"
              size="large"
              sx={{
                borderColor: '#fc4509',
                borderWidth: 1.5,
                color: '#fc4509',
                fontWeight: 700,
                fontSize: '1.05rem',
                borderRadius: 25,
                py: 1.75,
                px: 3.5,
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(252, 69, 9, 0.08)',
                '&:hover': {
                  borderColor: '#e03800',
                  backgroundColor: '#fff1ed',
                  color: '#e03800',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {secondaryBtnText}
            </Button>
          )}
        </Stack>

        {/* Marketing Trust Badges */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}
        >
          {[
            'Standar Mutu Manufaktur Otomotif',
            'Presisi & Skalabilitas Tinggi',
            'Dukungan Teknis B2B Berpengalaman',
          ].map((text, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#e8f6ed',
                border: '1.5px solid #a3dfb7',
                borderRadius: 20,
                px: 2.2,
                py: 0.85,
                boxShadow: '0 2px 8px rgba(1, 135, 48, 0.08)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 18, color: '#018730' }} />
              <Typography variant="body2" sx={{ color: '#015e21', fontWeight: 700, fontSize: '0.875rem' }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
