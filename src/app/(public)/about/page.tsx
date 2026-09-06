import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VerifiedIcon from '@mui/icons-material/Verified';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil Perusahaan, Fasilitas Pabrik & Sertifikasi ISO | Thai Summit Group',
  description: 'Mengenal kapabilitas fasilitas pabrik manufaktur otomotif, mesin stamping press tonase tinggi, sel pengelasan robotik, serta sertifikasi IATF 16949 dan ISO.',
};

export default async function AboutPage() {
  const [certifications, facilities, stats, partners] = await Promise.all([
    prisma.certification.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.facility.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.statistic.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.partner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  return (
    <Box>
      {/* 1. Header Banner */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #071f11 0%, #015e21 50%, #018730 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '4px solid #018730',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem',
              mb: 2,
              px: 2,
              py: 0.6,
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <FactoryIcon sx={{ fontSize: 18, color: '#fc4509' }} />
            <span>Profil & Kapabilitas Pabrik</span>
          </Box>
          <Typography
            variant="h2"
            component="h1"
            fontWeight={900}
            sx={{
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Membangun Keunggulan Manufaktur Presisi Tinggi
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 780,
              mx: 'auto',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.7,
            }}
          >
            Sebagai mitra manufaktur tier-1 terpercaya bagi produsen otomotif global, kami memadukan mesin berkapasitas besar, otomasi robotik canggih, dan sistem manajemen mutu tanpa kompromi.
          </Typography>
        </Container>
      </Box>

      {/* 2. Company Overview */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="Komitmen Mutu & Integritas"
                sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 800, mb: 2, border: '1px solid #a3dfb7' }}
              />
              <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ mb: 2.5, lineHeight: 1.25 }}>
                Dedikasi Puluhan Tahun dalam Presisi Otomotif
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                Pabrik kami berlokasi di kawasan industri terpadu, dirancang secara khusus untuk memenuhi standar ketat OEM otomotif roda empat dan roda dua. Setiap proses kerja diintegrasikan dengan sistem kontrol mutu berbasis standar global IATF 16949.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                Mulai dari perancangan die & cetakan, proses stamping lembaran baja berkekuatan tinggi, perakitan robotik, hingga inspeksi laboratorium 3D CMM mikron—semua dijalankan di bawah satu atap dengan efisiensi prima.
              </Typography>

              <Stack spacing={1.5}>
                {[
                  'Kapasitas Stamping Press hingga 2000 Ton dengan transfer otomatis',
                  'Sel pengelasan robotik multi-axis untuk sambungan struktural bodi',
                  'Laboratorium metrologi 3D ZEISS untuk verifikasi dimensi akurat',
                  'Fasilitas ramah lingkungan bersertifikasi ISO 14001',
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#018730', fontSize: 22 }} />
                    <Typography variant="body2" fontWeight={600} color="#334155">
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 3, sm: 5 },
                  borderRadius: 4,
                  bgcolor: '#F4FAF6',
                  border: '2px solid #a3dfb7',
                  position: 'relative',
                }}
              >
                <Typography variant="h5" fontWeight={800} color="#015e21" sx={{ mb: 2 }}>
                  Nilai Utama Pabrik (Core Values)
                </Typography>

                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      1. Zero Defect Quality
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                      Penerapan metodologi Poka-Yoke dan inspeksi in-line berkelanjutan untuk memastikan setiap komponen bebas dari cacat.
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      2. Otomasi & Efisiensi Berkelanjutan
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                      Pemanfaatan robot transfer press dan robot welding untuk mencapai efisiensi siklus tinggi serta keselamatan kerja maksimal.
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      3. Keselamatan Kerja & Pabrik Hijau
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                      Standar K3 ISO 45001 dan pengelolaan limbah terpadu ISO 14001 untuk mewujudkan lingkungan industri yang aman dan hijau.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Plant Facilities Showcase */}
      {facilities.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC', borderTop: '1px solid #E2EFE6' }}>
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
                <span>Fasilitas & Kondisi Pabrik</span>
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A">
                Lini Produksi & Mesin Manufaktur Terkini
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 700, mx: 'auto' }}>
                Berikut adalah gambaran lini permesinan utama dan fasilitas pendukung yang siap melayani kebutuhan pesanan komponen industri Anda.
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
                      boxShadow: '0 4px 20px rgba(1, 135, 48, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    {fac.image ? (
                      <Box sx={{ width: '100%', height: 240, overflow: 'hidden', bgcolor: '#0B1320' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={fac.image} alt={fac.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 180,
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
                          sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 800 }}
                        />
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.6,
                            bgcolor: '#F0FDF4',
                            color: '#166534',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            px: 1.2,
                            py: 0.35,
                            borderRadius: '16px',
                            border: '1px solid #bbf7d0',
                          }}
                        >
                          <VerifiedIcon sx={{ fontSize: 14, color: '#018730' }} />
                          <span>Aktif Beroperasi</span>
                        </Box>
                      </Box>

                      <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                        {fac.title}
                      </Typography>

                      {fac.specifications && (
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
                          <Typography variant="caption" fontWeight={700} color="#018730" display="block" sx={{ mb: 0.25 }}>
                            SPESIFIKASI TEKNIS:
                          </Typography>
                          <Typography variant="caption" color="#334155" sx={{ lineHeight: 1.5 }}>
                            {fac.specifications}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {fac.description}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* 4. ISO Certifications Showcase */}
      {certifications.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2EFE6' }}>
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
                <WorkspacePremiumIcon sx={{ fontSize: 18, color: '#018730' }} />
                <span>Standar Internasional</span>
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A">
                Sertifikasi Mutu & Kepatuhan Global
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 700, mx: 'auto' }}>
                Seluruh aktivitas manufaktur diverifikasi oleh badan sertifikasi independen terkemuka di dunia.
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
                      bgcolor: '#F4FAF6',
                      boxShadow: '0 4px 16px rgba(1, 135, 48, 0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          bgcolor: '#FFFFFF',
                          color: '#018730',
                          border: '1px solid #cbead5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ShieldIcon />
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
                          bgcolor: '#FFFFFF',
                          border: '1px solid #cbead5',
                          p: 0.75,
                          borderRadius: 1.5,
                          color: '#015e21',
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

                    <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #cbead5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: '#018730',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          px: 1.2,
                          py: 0.3,
                          borderRadius: '14px',
                        }}
                      >
                        <VerifiedIcon sx={{ fontSize: 13, color: '#FFFFFF' }} />
                        <span>Aktif</span>
                      </Box>
                      <Typography variant="caption" color="#64748B" fontWeight={600}>
                        {cert.expiryDate ? `s/d ${new Date(cert.expiryDate).getFullYear()}` : 'Berlaku'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* OEM Partners & Clients Showcase */}
      {partners.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2EFE6' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#e8f6ed',
                  color: '#018730',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  border: '1px solid #a3dfb7',
                  borderRadius: '20px',
                  mb: 2,
                  px: 2,
                  py: 0.5,
                }}
              >
                <VerifiedIcon sx={{ fontSize: 16, color: '#018730' }} />
                <span>Klien & Mitra OEM Global</span>
              </Box>
              <Typography variant="h3" fontWeight={900} color="#0F172A" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                Kepercayaan Merek Otomotif Dunia
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680, mx: 'auto' }}>
                PT Indonesia Thai Summit Plastech bangga menjadi pemasok Tier-1 terpercaya bagi prinsipal otomotif roda empat dan roda dua.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 3,
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
                      p: 2,
                      borderRadius: 3,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.25s ease',
                      textDecoration: 'none',
                      minWidth: { xs: 140, sm: 170 },
                      maxWidth: { xs: 170, sm: 220 },
                      height: 84,
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
                          maxHeight: 48,
                          maxWidth: '100%',
                          objectFit: 'contain',
                          filter: 'grayscale(15%)',
                          transition: 'all 0.25s ease',
                        }}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#334155', textAlign: 'center' }}>
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

      {/* 5. Contact CTA */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#018730', color: '#FFFFFF', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>
            Siap Bekerja Sama dengan Mitra Manufaktur Terbaik?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4, fontSize: '1.1rem' }}>
            Hubungi tim marketing dan rekayasa kami untuk menjadwalkan kunjungan fasilitas pabrik atau konsultasi spesifikasi part otomotif Anda.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                mx: 'auto',
              }}
            >
              <Link href="/contact" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#fc4509',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    px: 4,
                    py: 1.5,
                    borderRadius: '30px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(252, 69, 9, 0.35)',
                    '&:hover': { bgcolor: '#e03d08' },
                  }}
                >
                  Hubungi Tim Marketing
                </Button>
              </Link>
              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.5,
                    borderRadius: '30px',
                    whiteSpace: 'nowrap',
                    '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.12)' },
                  }}
                >
                  Lihat Katalog Produk
                </Button>
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
