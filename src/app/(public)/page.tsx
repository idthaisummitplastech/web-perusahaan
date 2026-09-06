import * as React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import HeroSection from '@/components/HeroSection';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  Button,
  Stack,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LayersIcon from '@mui/icons-material/Layers';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedIcon from '@mui/icons-material/Verified';

export const dynamic = 'force-dynamic';

function getFeatureIcon(iconName: string | null) {
  if (iconName === 'Speed') return <SpeedIcon sx={{ fontSize: 36, color: '#018730' }} />;
  if (iconName === 'Security') return <SecurityIcon sx={{ fontSize: 36, color: '#018730' }} />;
  if (iconName === 'Dashboard') return <DashboardIcon sx={{ fontSize: 36, color: '#018730' }} />;
  return <LayersIcon sx={{ fontSize: 36, color: '#018730' }} />;
}

export default async function HomePage() {
  const [hero, partners, features, services, products, stats, testimonials, faqs, certifications, facilities] = await Promise.all([
    prisma.heroSection.findFirst({ where: { page: 'home', isActive: true } }),
    prisma.partner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 4 }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { id: 'asc' }, take: 3 }),
    prisma.statistic.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.testimonial.findMany({ where: { isActive: true }, take: 3 }),
    prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.certification.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 4 }),
    prisma.facility.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 4 }),
  ]);

  return (
    <Box>
      {/* 1. Hero Section */}
      <HeroSection
        title={hero?.title || 'Pemimpin Manufaktur Komponen Otomotif & Inovasi <span>Teknologi</span> Asia'}
        subtitle={
          hero?.subtitle ||
          'Menghadirkan keunggulan manufaktur presisi tinggi, inovasi berkelanjutan, dan sistem manajemen terpadu berstandar internasional.'
        }
        primaryBtnText={hero?.primaryBtnText || 'Hubungi Kami'}
        primaryBtnUrl={hero?.primaryBtnUrl || '/contact'}
        secondaryBtnText={hero?.secondaryBtnText || 'Jelajahi Produk & Layanan'}
        secondaryBtnUrl={hero?.secondaryBtnUrl || '/products'}
      />

      {/* 2. Partners / Clients Bar */}
      {partners.length > 0 && (
        <Box sx={{ py: 5, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2EFE6' }}>
          <Container maxWidth="lg">
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#018730',
                mb: 3,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Dipercaya oleh Mitra Industri Otomotif & Klien OEM Terkemuka
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 2, sm: 3 },
              }}
            >
              {partners.map((partner) => {
                const hasLogo = Boolean(partner.logo && partner.logo.trim() !== '');

                return (
                  <Box
                    key={partner.id}
                    component={partner.url ? 'a' : 'div'}
                    {...(partner.url ? { href: partner.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 3,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.25s ease',
                      textDecoration: 'none',
                      minWidth: { xs: 130, sm: 160 },
                      maxWidth: { xs: 160, sm: 200 },
                      height: 80,
                      '&:hover': {
                        borderColor: '#018730',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 24px rgba(1, 135, 48, 0.12)',
                        '& img': {
                          filter: 'grayscale(0%)',
                          transform: 'scale(1.05)',
                        },
                      },
                    }}
                  >
                    {hasLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        style={{
                          maxHeight: 46,
                          maxWidth: '100%',
                          objectFit: 'contain',
                          filter: 'grayscale(20%)',
                          transition: 'all 0.25s ease',
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{
                          color: '#334155',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          '&:hover': { color: '#018730' },
                        }}
                      >
                        {partner.name}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>
      )}

      {/* 3. Key Features */}
      {features.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Keunggulan Utama"
                sx={{
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  border: '1px solid #a3dfb7',
                  mb: 2,
                  px: 1,
                }}
              />
              <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                Presisi Tinggi & Standar Mutu Kelas Dunia
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, mx: 'auto' }}>
                Setiap komponen dan sistem diproduksi dengan teknologi terkini, kepatuhan mutu internasional, serta efisiensi operasional optimal.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {features.map((feature) => (
                <Grid size={{ xs: 12, md: 4 }} key={feature.id}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3.5,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '1px solid #cbead5',
                      borderTop: '4px solid #018730',
                      boxShadow: '0 4px 16px rgba(1, 135, 48, 0.06)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 20px 35px -10px rgba(1, 135, 48, 0.2)',
                        borderColor: '#018730',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        bgcolor: '#e8f6ed',
                        border: '1px solid #a3dfb7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      {getFeatureIcon(feature.svgIcon)}
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mb: 1.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 4. Services Section */}
      {services.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                mb: 6,
                gap: 2,
              }}
            >
              <Box>
                <Chip
                  label="Layanan & Solusi"
                  sx={{
                    bgcolor: '#e8f6ed',
                    color: '#018730',
                    fontWeight: 800,
                    border: '1px solid #a3dfb7',
                    mb: 1.5,
                  }}
                />
                <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                  Keahlian Manufaktur & Perakitan
                </Typography>
              </Box>
              <Button
                component="a"
                href="/services"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: '#018730',
                  fontWeight: 700,
                  '&:hover': { color: '#016f27', bgcolor: '#e8f6ed' },
                }}
              >
                Lihat Semua Layanan
              </Button>
            </Box>

            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={service.id}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid #cbead5',
                      borderTop: '3.5px solid #018730',
                      boxShadow: '0 4px 16px rgba(1, 135, 48, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#018730',
                        boxShadow: '0 12px 24px rgba(1, 135, 48, 0.16)',
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mb: 1 }}>
                      {service.title}
                    </Typography>
                    {service.subtitle && (
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#018730', mb: 1.5, display: 'block' }}>
                        {service.subtitle}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2, lineHeight: 1.6 }}>
                      {service.description}
                    </Typography>
                    <Button
                      component="a"
                      href={`/services/${service.slug}`}
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: '#018730',
                        p: 0,
                        fontWeight: 700,
                        justifyContent: 'flex-start',
                        '&:hover': { color: '#016f27', bgcolor: 'transparent' },
                      }}
                    >
                      Detail Layanan
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 5. Statistics Section - Full Brand Green (#018730) Showcase */}
      {stats.length > 0 && (
        <Box
          sx={{
            py: { xs: 8, md: 10 },
            background: 'linear-gradient(135deg, #018730 0%, #01752a 50%, #015e21 100%)',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle lighting dot overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              opacity: 0.7,
              pointerEvents: 'none',
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {stats.map((stat) => (
                <Grid size={{ xs: 6, md: 3 }} key={stat.id}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: { xs: 3, sm: 4 },
                      borderRadius: 3.5,
                      bgcolor: 'rgba(255, 255, 255, 0.14)',
                      backdropFilter: 'blur(10px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255, 255, 255, 0.22)',
                        borderColor: '#FFFFFF',
                        boxShadow: '0 14px 36px rgba(0, 0, 0, 0.22)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: '#fc4509' }} />
                    <Typography
                      variant="h2"
                      fontWeight={900}
                      sx={{
                        color: '#FFFFFF',
                        mb: 0.5,
                        fontSize: { xs: '2.4rem', sm: '3rem', md: '3.4rem' },
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700, fontSize: '0.95rem' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 6. Products Section */}
      {products.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Produk Unggulan"
                sx={{
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  border: '1px solid #a3dfb7',
                  mb: 2,
                  px: 1,
                }}
              />
              <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                Komponen Presisi & Solusi Otomotif
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, mx: 'auto' }}>
                Katalog komponen interior, eksterior, chassis, dan modul rekayasa presisi tinggi berstandar OEM.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {products.map((product) => (
                <Grid size={{ xs: 12, md: 4 }} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3.5,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '1px solid #cbead5',
                      borderTop: '4px solid #018730',
                      boxShadow: '0 4px 20px rgba(1, 135, 48, 0.06)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#018730',
                        boxShadow: '0 16px 30px rgba(1, 135, 48, 0.18)',
                      },
                    }}
                  >
                    {product.image && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 180,
                          borderRadius: 2.5,
                          overflow: 'hidden',
                          mb: 2,
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    )}
                    <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                      {product.title}
                    </Typography>
                    {product.price && (
                      <Typography variant="h5" fontWeight={900} sx={{ color: '#fc4509', my: 1 }}>
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, my: 2, lineHeight: 1.6 }}>
                      {product.description}
                    </Typography>
                    <Button
                      component="a"
                      href={`/products/${product.slug}`}
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#018730',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        mt: 'auto',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#016f27' },
                      }}
                    >
                      Lihat Detail Produk
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 6B. Factory Facilities & Infrastructure Section */}
      {facilities.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2EFE6' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<PrecisionManufacturingIcon sx={{ fontSize: '18px !important', color: '#018730 !important' }} />}
                label="Infrastruktur & Fasilitas Pabrik"
                sx={{
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  border: '1px solid #a3dfb7',
                  mb: 2,
                  px: 1.5,
                }}
              />
              <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                Fasilitas Manufaktur Berteknologi Modern
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 700, mx: 'auto' }}>
                Dilengkapi mesin stamping press tonase tinggi, sel pengelasan robotik presisi, dan laboratorium inspeksi mutu bersertifikasi global.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {facilities.map((facility) => (
                <Grid size={{ xs: 12, md: 6 }} key={facility.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      border: '1px solid #cbead5',
                      borderTop: '4px solid #018730',
                      boxShadow: '0 4px 20px rgba(1, 135, 48, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: '#018730',
                        boxShadow: '0 16px 32px rgba(1, 135, 48, 0.16)',
                      },
                    }}
                  >
                    {facility.image ? (
                      <Box sx={{ width: '100%', height: 220, overflow: 'hidden', bgcolor: '#0B1320' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={facility.image} alt={facility.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 160,
                          bgcolor: 'linear-gradient(135deg, #018730 0%, #0F2A1E 100%)',
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
                        <Chip
                          label={facility.category}
                          size="small"
                          sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 800, fontSize: '0.75rem' }}
                        />
                        <Chip
                          icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#018730 !important' }} />}
                          label="Siap Produksi"
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: '#a3dfb7', color: '#015e21', fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </Box>

                      <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                        {facility.title}
                      </Typography>

                      {facility.specifications && (
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
                          <Typography variant="caption" fontWeight={700} color="#018730" display="block" sx={{ mb: 0.25 }}>
                            SPESIFIKASI TEKNIS:
                          </Typography>
                          <Typography variant="caption" color="#334155" sx={{ lineHeight: 1.5 }}>
                            {facility.specifications}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, lineHeight: 1.6 }}>
                        {facility.description}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 6C. ISO Certifications Section */}
      {certifications.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC', borderTop: '1px solid #E2EFE6' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<WorkspacePremiumIcon sx={{ fontSize: '18px !important', color: '#018730 !important' }} />}
                label="Standar Mutu & Akreditasi"
                sx={{
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  border: '1px solid #a3dfb7',
                  mb: 2,
                  px: 1.5,
                }}
              />
              <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                Sertifikasi Mutu Standar Internasional
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 700, mx: 'auto' }}>
                Kepatuhan ketat terhadap sistem mutu otomotif, keberlanjutan lingkungan, dan keselamatan kerja bertaraf dunia.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {certifications.map((cert) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cert.id}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '1.5px solid #cbead5',
                      borderTop: '4px solid #018730',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 4px 16px rgba(1, 135, 48, 0.05)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: '#018730',
                        boxShadow: '0 12px 28px rgba(1, 135, 48, 0.15)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          bgcolor: '#e8f6ed',
                          color: '#018730',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <WorkspacePremiumIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                          {cert.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          {cert.issuer}
                        </Typography>
                      </Box>
                    </Box>

                    {cert.certificateNumber && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: '#F1F5F9',
                          p: 0.75,
                          borderRadius: 1.5,
                          color: '#475569',
                          fontWeight: 700,
                          mb: 1.5,
                          display: 'block',
                          textAlign: 'center',
                        }}
                      >
                        No: {cert.certificateNumber}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, fontSize: '0.8125rem', lineHeight: 1.6, mb: 2 }}>
                      {cert.description}
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '13px !important' }} />}
                        label="Terverifikasi"
                        size="small"
                        sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="#64748B" fontWeight={600}>
                        {cert.expiryDate ? `s/d ${new Date(cert.expiryDate).getFullYear()}` : 'Aktif'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 7. Testimonials */}
      {testimonials.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Kepercayaan Mitra"
                sx={{
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  border: '1px solid #a3dfb7',
                  mb: 2,
                  px: 1,
                }}
              />
              <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                Apresiasi dari Rekanan Kami
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {testimonials.map((testi) => (
                <Grid size={{ xs: 12, md: 4 }} key={testi.id}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3.5,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      bgcolor: '#F4FAF6',
                      border: '1px solid #cbead5',
                      borderLeft: '4px solid #018730',
                      boxShadow: '0 4px 16px rgba(1, 135, 48, 0.05)',
                    }}
                  >
                    <Rating value={testi.rating} readOnly sx={{ color: '#fc4509', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#334155', fontStyle: 'italic', flexGrow: 1, mb: 3, lineHeight: 1.7 }}>
                      &ldquo;{testi.content}&rdquo;
                    </Typography>
                    <Box sx={{ pt: 2, borderTop: '1px solid #E2E8F0' }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                        {testi.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testi.role} {testi.company && ` - ${testi.company}`}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 8. FAQs Section */}
      {faqs.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                label="Pertanyaan Umum"
                sx={{
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  border: '1px solid #a3dfb7',
                  mb: 2,
                  px: 1,
                }}
              />
              <Typography variant="h3" component="h2" fontWeight={800} color="#0F172A">
                Sering Ditanyakan (FAQ)
              </Typography>
            </Box>

            <Stack spacing={2}>
              {faqs.map((faq) => (
                <Accordion
                  key={faq.id}
                  sx={{
                    borderRadius: '12px !important',
                    border: '1px solid #cbead5',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    '&:hover': {
                      borderColor: '#018730',
                      boxShadow: '0 4px 16px rgba(1, 135, 48, 0.08)',
                    },
                    '&.Mui-expanded': {
                      border: '1.5px solid #018730',
                      boxShadow: '0 6px 20px rgba(1, 135, 48, 0.1)',
                    },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#018730' }} />}>
                    <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Container>
        </Box>
      )}

      {/* 9. Final Call to Action - Brand Green (#018730) with Orange Accent */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAF9' }}>
        <Container maxWidth="md">
          <Box
            sx={{
              borderRadius: { xs: 4, md: 5 },
              py: { xs: 6, md: 7 },
              px: { xs: 3, sm: 6 },
              background: 'linear-gradient(135deg, #018730 0%, #01752a 50%, #015e21 100%)',
              color: '#FFFFFF',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 45px rgba(1, 135, 48, 0.28)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Ambient Lighting Accents */}
            <Box
              sx={{
                position: 'absolute',
                top: -60,
                left: -60,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(252, 69, 9, 0.4) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <Typography variant="h3" fontWeight={900} sx={{ mb: 2, letterSpacing: '-0.02em', position: 'relative', zIndex: 1, color: '#FFFFFF' }}>
              Siap Berkolaborasi Bersama Kami?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.95)', mb: 4, lineHeight: 1.7, maxWidth: 600, mx: 'auto', position: 'relative', zIndex: 1, fontSize: '1.05rem' }}>
              Diskusikan kebutuhan komponen manufaktur, teknologi otomotif, atau kerja sama bisnis dengan tim spesialis kami.
            </Typography>
            <Button
              component="a"
              href="/contact"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#fc4509',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.05rem',
                borderRadius: 25,
                py: 1.75,
                px: 5,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                zIndex: 1,
                '&:hover': {
                  bgcolor: '#e03800',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
                },
                transition: 'all 0.2s',
              }}
            >
              Hubungi Kami Sekarang
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
