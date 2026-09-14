'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';

interface BrandLogoProps {
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  lightText?: boolean;
}

export default function BrandLogo({
  title = 'Indonesia Thai Summit Plastech',
  subtitle = 'Automotive Plastic & Interior Systems',
  size = 'medium',
  lightText = false,
}: BrandLogoProps) {
  const dimensions = {
    small: { imgHeight: 34, titleSize: '0.82rem', subSize: '0.58rem' },
    medium: { imgHeight: 42, titleSize: '0.98rem', subSize: '0.66rem' },
    large: { imgHeight: 52, titleSize: '1.2rem', subSize: '0.74rem' },
  }[size];

  return (
    <Box
      className="notranslate"
      translate="no"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        userSelect: 'none',
        maxWidth: '100%',
      }}
    >
      {/* Official TS Plastech Logo Mark */}
      <Box
        sx={{
          height: { xs: 34, sm: 38, md: dimensions.imgHeight },
          width: { xs: 34, sm: 38, md: dimensions.imgHeight },
          minWidth: { xs: 34, sm: 38, md: dimensions.imgHeight },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
          p: 0.4,
          borderRadius: '8px',
          boxShadow: lightText ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.06)',
          border: lightText ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(1, 135, 48, 0.2)',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="/logo-plastech.jpg"
          alt="Indonesia Thai Summit Plastech Logo"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>

      {/* Corporate Typography */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, overflow: 'hidden' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: lightText ? '#FFFFFF' : '#0F172A',
            fontSize: { xs: '0.78rem', sm: '0.86rem', md: dimensions.titleSize },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: lightText ? '#4ade80' : '#018730',
            fontSize: dimensions.subSize,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            mt: 0.3,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Box component="span" sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#fc4509', flexShrink: 0 }} />
          <span>{subtitle}</span>
        </Typography>
      </Box>
    </Box>
  );
}
