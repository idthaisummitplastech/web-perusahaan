'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Stack,
  Divider,
} from '@mui/material';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HomeIcon from '@mui/icons-material/Home';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';

interface MaintenanceNoticeProps {
  title?: string;
  subtitle?: string;
  isNotFound?: boolean;
}

export default function MaintenanceNotice({
  title = 'Halaman Sedang Dalam Tahap Pemeliharaan & Integrasi',
  subtitle = 'Menu atau konten yang Anda tuju saat ini sedang dalam proses penyusunan dan optimalisasi sistem oleh tim IT & Manajemen PT Indonesia Thai Summit Plastech untuk menghadirkan pengalaman dan data terbaik bagi Anda.',
  isNotFound = false,
}: MaintenanceNoticeProps) {
  return (
    <Box
      sx={{
        bgcolor: '#F8FAFC',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient gradients */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(1,135,48,0.12) 0%, rgba(252,69,9,0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
            bgcolor: '#FFFFFF',
            overflow: 'hidden',
            textAlign: 'center',
            p: { xs: 3, sm: 6 },
          }}
        >
          {/* Top Decorative Color Bar */}
          <Box
            sx={{
              height: 5,
              width: '100%',
              background: 'linear-gradient(90deg, #018730 0%, #fc4509 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />

          {/* Animated Icon Circle */}
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              bgcolor: 'rgba(1, 135, 48, 0.08)',
              color: '#018730',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
              boxShadow: '0 0 0 10px rgba(1, 135, 48, 0.04)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(15deg) scale(1.05)',
              },
            }}
          >
            <EngineeringIcon sx={{ fontSize: 52 }} />
          </Box>

          {/* Status Chip */}
          <Chip
            label={isNotFound ? '🛠️ HALAMAN DALAM PENGEMBANGAN' : '⚡ SEDANG DALAM PEMELIHARAAN SISTEM'}
            sx={{
              bgcolor: 'rgba(1, 135, 48, 0.1)',
              color: '#018730',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 0.8,
              py: 0.5,
              px: 1,
              mb: 2.5,
              borderRadius: '20px',
            }}
          />

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 26, sm: 34, md: 38 },
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              mb: 2,
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#64748B',
              fontSize: { xs: 15, sm: 17 },
              lineHeight: 1.7,
              maxWidth: 640,
              mx: 'auto',
              mb: 4,
            }}
          >
            {subtitle}
          </Typography>

          {/* Status Highlights */}
          <Grid container spacing={2} sx={{ mb: 4, textAlign: 'left' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  height: '100%',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <SpeedIcon sx={{ color: '#018730', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Status Pembaruan
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  Integrasi modul dan update konten berkala.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  height: '100%',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <VerifiedUserIcon sx={{ color: '#018730', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Standar Mutu
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  Sesuai kepatuhan ISO 9001, 14001 & IATF 16949.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  height: '100%',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <ContactSupportIcon sx={{ color: '#018730', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Dukungan Langsung
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  Bantuan informasi via tim IT & Help Desk resmi.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', mb: 4 }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                bgcolor: '#018730',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 3.5,
                py: 1.3,
                borderRadius: 2.5,
                boxShadow: '0 10px 20px -5px rgba(1, 135, 48, 0.4)',
                '&:hover': {
                  bgcolor: '#016d26',
                },
              }}
            >
              Kembali ke Beranda
            </Button>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              size="large"
              startIcon={<ContactSupportIcon />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 600,
                px: 3,
                py: 1.3,
                borderRadius: 2.5,
                '&:hover': {
                  borderColor: '#018730',
                  color: '#018730',
                  bgcolor: 'rgba(1, 135, 48, 0.04)',
                },
              }}
            >
              Hubungi Kami
            </Button>
            <Button
              component={Link}
              href="/products"
              variant="text"
              size="large"
              startIcon={<PrecisionManufacturingIcon />}
              sx={{
                color: '#64748B',
                fontWeight: 600,
                px: 2,
                py: 1.3,
                borderRadius: 2.5,
                '&:hover': {
                  color: '#018730',
                  bgcolor: 'rgba(1, 135, 48, 0.04)',
                },
              }}
            >
              Katalog Produk
            </Button>
          </Stack>

          <Divider sx={{ my: 3, borderColor: '#F1F5F9' }} />

          {/* Contact Fast Info */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 4 }}
            sx={{ justifyContent: 'center', alignItems: 'center', color: '#64748B', fontSize: 13 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneInTalkIcon sx={{ fontSize: 16, color: '#018730' }} />
              <span>+62 267 864 1234 (Ext. Info)</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 16, color: '#fc4509' }} />
              <span>info@itsp.co.id</span>
            </Box>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
