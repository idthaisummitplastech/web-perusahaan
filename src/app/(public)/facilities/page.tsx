import * as React from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Grid, Typography, Card, Chip, Button } from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

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

        <Grid container spacing={4}>
          {facilities.map((fac) => (
            <Grid size={{ xs: 12, md: 6 }} key={fac.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid #cbead5',
                  borderTop: '4px solid #018730',
                  boxShadow: '0 6px 24px rgba(1, 135, 48, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#018730',
                    boxShadow: '0 16px 36px rgba(1, 135, 48, 0.12)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                {fac.image ? (
                  <Box sx={{ width: '100%', height: 260, overflow: 'hidden', bgcolor: '#0B1320', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fac.image} alt={fac.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      background: 'linear-gradient(135deg, #018730 0%, #083818 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    <PrecisionManufacturingIcon sx={{ fontSize: 64, opacity: 0.8 }} />
                  </Box>
                )}

                <Box sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip
                      label={fac.category}
                      size="small"
                      sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 800, fontSize: '0.75rem' }}
                    />
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: '#F0FDF4',
                        color: '#166534',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        px: 1.2,
                        py: 0.3,
                        borderRadius: '14px',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: 13, color: '#018730' }} />
                      <span>Aktif Beroperasi</span>
                    </Box>
                  </Box>

                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
                    {fac.title}
                  </Typography>

                  {fac.specifications && (
                    <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
                      <Typography variant="caption" fontWeight={800} color="#018730" display="block" sx={{ mb: 0.35, letterSpacing: '0.04em' }}>
                        SPESIFIKASI TEKNIS:
                      </Typography>
                      <Typography variant="caption" color="#334155" sx={{ lineHeight: 1.6, display: 'block', fontSize: '0.82rem' }}>
                        {fac.specifications}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {fac.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

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
