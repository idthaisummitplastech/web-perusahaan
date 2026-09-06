import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Box, Container, Typography, Button, Paper, Stack, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const dynamic = 'force-dynamic';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service || !service.isActive) {
    notFound();
  }

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="md">
        <Button
          component="a"
          href="/services"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 4, color: '#64748B', fontWeight: 600, '&:hover': { color: '#018730' } }}
        >
          Kembali ke Semua Layanan
        </Button>

        <Paper elevation={2} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Chip
            label="Layanan Unggulan"
            sx={{
              bgcolor: '#e8f6ed',
              color: '#018730',
              fontWeight: 800,
              border: '1px solid #a3dfb7',
              mb: 2,
            }}
          />
          <Typography variant="h3" component="h1" fontWeight={900} color="#0F172A" sx={{ mb: 1 }}>
            {service.title}
          </Typography>

          {service.subtitle && (
            <Typography variant="h6" fontWeight={700} sx={{ color: '#018730', mb: 3 }}>
              {service.subtitle}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.9, fontSize: '1.1rem', mb: 4 }}>
            {service.description}
          </Typography>

          <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0', mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A" sx={{ mb: 2 }}>
              Jaminan Standar Mutu & Keunggulan Layanan:
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: '#018730', fontSize: 20 }} />
                <Typography variant="body2" color="#334155">Perancangan presisi tinggi berbasis spesifikasi teknis OEM</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: '#018730', fontSize: 20 }} />
                <Typography variant="body2" color="#334155">Fasilitas robotika & lini produksi mutakhir dengan sertifikasi ISO</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: '#018730', fontSize: 20 }} />
                <Typography variant="body2" color="#334155">Quality control ketat, uji ketahanan beban, dan pengiriman tepat waktu</Typography>
              </Box>
            </Stack>
          </Box>

          <Button
            component="a"
            href={`/contact?service=${encodeURIComponent(service.title)}`}
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#018730',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: 25,
              py: 1.5,
              px: 4,
              boxShadow: '0 8px 20px rgba(1, 135, 48, 0.3)',
              '&:hover': { bgcolor: '#016f27' },
            }}
          >
            Konsultasikan Kebutuhan Anda
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
