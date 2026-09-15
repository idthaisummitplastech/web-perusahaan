import * as React from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Typography, Button } from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FacilityGridClient from './FacilityGridClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Fasilitas Pabrik & Mesin Injeksi Plastik | PT Indonesia Thai Summit Plastech',
  description: 'Fasilitas manufaktur mutakhir PT ITSP dengan 18 mesin injeksi plastik hingga 3000 Ton, robotik spray painting, dan jalur perakitan interior otomotif.',
};

export default async function FacilitiesPage() {
  const rawFacilities = await cmsApi.getItems<any>('facilities').catch(() => []);
  const facilities = rawFacilities.filter((f: any) => (f.isActive ?? f.is_active) !== false);


  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
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
            <PrecisionManufacturingIcon sx={{ fontSize: 18, color: '#018730' }} />
            <span>Fasilitas Manufaktur & Pabrik</span>
          </Box>
          <Typography variant="h2" component="h1" fontWeight={900} color="#0F172A" sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}>
            Lini Mesin Injeksi & Perakitan Presisi
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720, mx: 'auto', fontSize: '1.05rem' }}>
            Didukung 18 mesin injeksi plastik berkapasitas 450 Ton hingga 3000 Ton, automated spray painting line, dan stasiun ultrasonik welding di Plant 1 Karawang & Plant 2 Cikarang.
          </Typography>
        </Box>

        <FacilityGridClient facilities={facilities} />

        {/* CTA Contact */}
        <Box sx={{ mt: 10, p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: '#018730', color: '#FFFFFF', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5 }}>
            Ingin Menjadwalkan Factory Visit atau Kunjungan Audit?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3.5, maxWidth: 640, mx: 'auto' }}>
            Hubungi tim teknis dan manajemen kami untuk mengatur jadwal verifikasi fasilitas manufaktur dan kapabilitas mesin.
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
              Hubungi Tim Marketing
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
