import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Typography, Button, Paper, Stack, Grid, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawProducts = await cmsApi.getItems<any>('products').catch(() => []);
  const product = rawProducts.find((p: any) => p.slug === slug);

  if (!product || (product.isActive ?? product.is_active) === false) {
    notFound();
  }


  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        {/* Back navigation & Breadcrumb */}
        <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Link
            href={product.category === 'motor' ? '/products?category=motor' : '/products?category=mobil'}
            style={{ textDecoration: 'none' }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              sx={{
                color: '#64748B',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                borderRadius: '20px',
                px: 2,
                py: 0.6,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                '&:hover': {
                  color: product.category === 'motor' ? '#D97706' : '#018730',
                  borderColor: product.category === 'motor' ? '#F59E0B' : '#018730',
                  bgcolor: product.category === 'motor' ? '#FEF3C7' : 'rgba(1, 135, 48, 0.05)',
                },
              }}
            >
              Kembali ke Katalog {product.category === 'motor' ? 'Sepeda Motor (2W)' : 'Mobil (4W)'}
            </Button>
          </Link>
        </Box>

        {/* Product Detail Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'flex-start' }}>
            {/* Left Column: Product Image Showcase */}
            <Grid size={{ xs: 12, md: 6 }}>
              {product.image ? (
                <Box
                  sx={{
                    borderRadius: 3.5,
                    overflow: 'hidden',
                    bgcolor: '#0B1320',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: 520,
                      objectFit: 'contain',
                      borderRadius: 10,
                      display: 'block',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      bgcolor: 'rgba(1, 135, 48, 0.92)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      px: 1.5,
                      py: 0.45,
                      borderRadius: '20px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 13 }} />
                    <span>Komponen Presisi OEM</span>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    borderRadius: 3.5,
                    height: 380,
                    bgcolor: '#0F172A',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    gap: 2,
                  }}
                >
                  <PrecisionManufacturingIcon sx={{ fontSize: 72, opacity: 0.5 }} />
                  <Typography variant="body2" color="#94A3B8">
                    Gambar teknis belum tersedia
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Right Column: Product Specs & Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {product.category === 'motor' ? (
                  <Chip
                    label="🏍️ Sepeda Motor (2-Wheeler)"
                    size="small"
                    sx={{
                      bgcolor: '#FEF3C7',
                      color: '#B45309',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      border: '1px solid #FCD34D',
                    }}
                  />
                ) : (
                  <Chip
                    label="🚗 Mobil (4-Wheeler)"
                    size="small"
                    sx={{
                      bgcolor: '#EFF6FF',
                      color: '#1D4ED8',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      border: '1px solid #BFDBFE',
                    }}
                  />
                )}
                <Chip
                  label="Manufaktur Otomotif Tier-1"
                  size="small"
                  sx={{
                    bgcolor: '#e8f6ed',
                    color: '#018730',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: '1px solid #a3dfb7',
                  }}
                />
                <Chip
                  label="Standar IATF 16949"
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid #E2E8F0',
                  }}
                />
              </Box>

              <Typography variant="h4" component="h1" fontWeight={900} color="#0F172A" sx={{ mb: 2, lineHeight: 1.25 }}>
                {product.title}
              </Typography>

              {product.price && (
                <Typography variant="h5" fontWeight={900} sx={{ color: '#fc4509', mb: 2.5 }}>
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </Typography>
              )}

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.8, fontSize: '1rem', mb: 3 }}>
                {product.description}
              </Typography>

              {/* Technical Specifications */}
              <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0', mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5, letterSpacing: '0.02em' }}>
                  KAPABILITAS & STANDAR MUTU:
                </Typography>
                <Stack spacing={1.2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <CheckCircleIcon sx={{ color: '#018730', fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="body2" color="#334155" fontWeight={500}>
                      Teknologi Plastic Injection Molding presisi dengan toleransi mikron
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <CheckCircleIcon sx={{ color: '#018730', fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="body2" color="#334155" fontWeight={500}>
                      Finishing Matted / Gloss Painting, Silver Metallic & Ultrasonic Welding
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <CheckCircleIcon sx={{ color: '#018730', fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="body2" color="#334155" fontWeight={500}>
                      Inspeksi dimensi 3D CMM berakurasi tinggi untuk Zero Defect
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <CheckCircleIcon sx={{ color: '#018730', fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="body2" color="#334155" fontWeight={500}>
                      Kepatuhan standar industri OEM roda empat dan roda dua
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Link
                  href={`/contact?product=${encodeURIComponent(product.title)}`}
                  style={{ textDecoration: 'none', flexGrow: 1 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<SupportAgentIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #018730 0%, #009e3a 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      borderRadius: '25px',
                      py: 1.4,
                      px: 3.5,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 6px 18px rgba(1, 135, 48, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #016f27 0%, #018730 100%)',
                      },
                    }}
                  >
                    Minta Penawaran B2B
                  </Button>
                </Link>

                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: '#475569',
                      borderColor: '#CBD5E1',
                      fontWeight: 600,
                      borderRadius: '25px',
                      py: 1.4,
                      px: 3,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#018730',
                        color: '#018730',
                        bgcolor: 'rgba(1, 135, 48, 0.05)',
                      },
                    }}
                  >
                    Semua Produk
                  </Button>
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
