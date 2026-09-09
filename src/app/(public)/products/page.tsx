import * as React from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Grid, Typography, Card, Button, Stack, Paper } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedIcon from '@mui/icons-material/Verified';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LayersIcon from '@mui/icons-material/Layers';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams?: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentCategory = resolvedParams.category?.toLowerCase() || 'all';

  const rawProducts = await cmsApi.getItems<any>('products').catch(() => []);
  const activeProducts = rawProducts.filter((p: any) => (p.isActive ?? p.is_active) !== false);

  const totalCount = activeProducts.length;
  const mobilCount = activeProducts.filter((p: any) => (p.category || '').toLowerCase() === 'mobil').length;
  const motorCount = activeProducts.filter((p: any) => (p.category || '').toLowerCase() === 'motor').length;

  let products = activeProducts;
  if (currentCategory === 'mobil') {
    products = activeProducts.filter((p: any) => (p.category || '').toLowerCase() === 'mobil');
  } else if (currentCategory === 'motor') {
    products = activeProducts.filter((p: any) => (p.category || '').toLowerCase() === 'motor');
  }


  const tabs = [
    {
      id: 'all',
      label: 'Semua Komponen',
      href: '/products',
      count: totalCount,
      icon: <LayersIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: 'mobil',
      label: 'Komponen Mobil (4-Wheeler)',
      href: '/products?category=mobil',
      count: mobilCount,
      icon: <DirectionsCarIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: 'motor',
      label: 'Komponen Sepeda Motor (2-Wheeler)',
      href: '/products?category=motor',
      count: motorCount,
      icon: <TwoWheelerIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        {/* Header Title & Subtitle */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
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
            <span>Katalog Komponen & Produk Presisi</span>
          </Box>
          <Typography
            variant="h2"
            component="h1"
            fontWeight={900}
            color="#0F172A"
            sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-0.02em' }}
          >
            {currentCategory === 'mobil'
              ? 'Komponen Plastik Mobil (4-Wheeler)'
              : currentCategory === 'motor'
              ? 'Komponen Sepeda Motor (2-Wheeler)'
              : 'Komponen Presisi & Modul Otomotif'}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1.5, maxWidth: 720, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.7 }}
          >
            {currentCategory === 'mobil'
              ? 'Koleksi suku cadang interior & eksterior kendaraan roda empat (Instrument Panel, Door Trim, Console Box, Bumper, & Cowl Top) berstandar OEM global.'
              : currentCategory === 'motor'
              ? 'Portofolio perakitan jok (Seat Assembly), foaming, under seat luggage box, dan panel trim sepeda motor berstandar presisi tinggi.'
              : 'Portofolio suku cadang plastik injeksi, interior assembly, dan finishing painting berstandar OEM global untuk produsen otomotif roda empat dan roda dua.'}
          </Typography>
        </Box>

        {/* Sub-Category Filter Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'inline-flex',
              p: 0.7,
              bgcolor: '#FFFFFF',
              borderRadius: '32px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              flexWrap: 'wrap',
              gap: 0.5,
              maxWidth: '100%',
            }}
          >
            {tabs.map((tab) => {
              const isActive = currentCategory === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="text"
                    startIcon={tab.icon}
                    sx={{
                      borderRadius: '26px',
                      px: { xs: 2, sm: 2.8 },
                      py: 1.1,
                      textTransform: 'none',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: { xs: '0.825rem', sm: '0.9rem' },
                      whiteSpace: 'nowrap',
                      color: isActive ? '#FFFFFF' : '#475569',
                      background: isActive
                        ? 'linear-gradient(135deg, #018730 0%, #009e3a 100%)'
                        : 'transparent',
                      boxShadow: isActive ? '0 4px 12px rgba(1, 135, 48, 0.28)' : 'none',
                      '&:hover': {
                        background: isActive
                          ? 'linear-gradient(135deg, #016f27 0%, #018730 100%)'
                          : 'rgba(1, 135, 48, 0.06)',
                        color: isActive ? '#FFFFFF' : '#018730',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{tab.label}</span>
                    <Box
                      component="span"
                      sx={{
                        ml: 1.2,
                        px: 1,
                        py: 0.15,
                        borderRadius: '12px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#64748B',
                      }}
                    >
                      {tab.count}
                    </Box>
                  </Button>
                </Link>
              );
            })}
          </Paper>
        </Box>

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px dashed #CBD5E1',
              bgcolor: '#FFFFFF',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#334155" sx={{ mb: 1 }}>
              Belum ada produk dalam kategori ini.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Silakan pilih kategori lain atau kembali ke seluruh katalog produk.
            </Typography>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#018730',
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: '#016f27' },
                }}
              >
                Lihat Semua Produk
              </Button>
            </Link>
          </Paper>
        ) : (
          <Grid container spacing={3.5}>
            {products.map((product) => {
              const isMotor = product.category === 'motor';

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: isMotor ? '#F59E0B' : '#018730',
                        transform: 'translateY(-4px)',
                        boxShadow: isMotor
                          ? '0 16px 36px rgba(245, 158, 11, 0.15)'
                          : '0 16px 36px rgba(1, 135, 48, 0.12)',
                        '& img': {
                          transform: 'scale(1.04)',
                        },
                      },
                    }}
                  >
                    {/* Product Image Thumbnail */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 220,
                        bgcolor: '#0B1320',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1.5,
                      }}
                    >
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      ) : (
                        <PrecisionManufacturingIcon sx={{ fontSize: 56, color: '#475569' }} />
                      )}

                      {/* Top Badges */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.8,
                        }}
                      >
                        {/* Category Badge */}
                        <Box
                          sx={{
                            bgcolor: isMotor ? 'rgba(217, 119, 6, 0.92)' : 'rgba(1, 135, 48, 0.92)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            px: 1.2,
                            py: 0.35,
                            borderRadius: '12px',
                            backdropFilter: 'blur(6px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {isMotor ? (
                            <TwoWheelerIcon sx={{ fontSize: 13 }} />
                          ) : (
                            <DirectionsCarIcon sx={{ fontSize: 13 }} />
                          )}
                          <span>{isMotor ? 'Sepeda Motor (2W)' : 'Mobil (4W)'}</span>
                        </Box>

                        {/* OEM Badge */}
                        <Box
                          sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.85)',
                            color: '#F8FAFC',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            px: 1,
                            py: 0.25,
                            borderRadius: '10px',
                            backdropFilter: 'blur(6px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.4,
                            width: 'fit-content',
                          }}
                        >
                          <VerifiedIcon sx={{ fontSize: 11, color: '#38BDF8' }} />
                          <span>OEM Standard</span>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="#0F172A"
                        sx={{ mb: 1, lineHeight: 1.35, minHeight: '2.7em' }}
                      >
                        {product.title}
                      </Typography>

                      {product.price && (
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fc4509', mb: 1 }}>
                          Rp {Number(product.price).toLocaleString('id-ID')}
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flexGrow: 1,
                          mb: 2.5,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description}
                      </Typography>

                      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', marginTop: 'auto' }}>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
                          fullWidth
                          sx={{
                            background: isMotor
                              ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
                              : 'linear-gradient(135deg, #018730 0%, #009e3a 100%)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            borderRadius: '20px',
                            py: 1.1,
                            textTransform: 'none',
                            boxShadow: isMotor
                              ? '0 4px 12px rgba(217, 119, 6, 0.28)'
                              : '0 4px 12px rgba(1, 135, 48, 0.22)',
                            '&:hover': {
                              background: isMotor
                                ? 'linear-gradient(135deg, #B45309 0%, #D97706 100%)'
                                : 'linear-gradient(135deg, #016f27 0%, #018730 100%)',
                            },
                          }}
                        >
                          Lihat Spesifikasi & Detail
                        </Button>
                      </Link>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
