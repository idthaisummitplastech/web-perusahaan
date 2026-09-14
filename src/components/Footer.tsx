'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, Grid, Divider } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BrandLogo from '@/components/BrandLogo';

interface FooterItem {
  id: number;
  title: string;
  url: string;
  section?: string | null;
}

interface FooterProps {
  siteTitle?: string;
  siteDescription?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  footerItems?: FooterItem[];
}

export default function Footer({
  siteTitle = 'PT Indonesia Thai Summit Plastech',
  siteDescription = 'Pemimpin industri manufaktur komponen plastik otomotif dengan komitmen mutu tinggi, inovasi teknologi berkelanjutan, dan kepuasan mitra global.',
  contactEmail = 'info@itsp.co.id',
  contactPhone = '+62 267 864 1234',
  contactAddress = 'Jl. Permata Raya Lot FF-5, KIIC Karawang, Jawa Barat 41361, Indonesia',
  footerItems = [],
}: FooterProps) {
  // Group footer items by section
  const sections = footerItems.reduce((acc, item) => {
    const sectionName = item.section || 'Tautan';
    if (!acc[sectionName]) acc[sectionName] = [];
    acc[sectionName].push(item);
    return acc;
  }, {} as Record<string, FooterItem[]>);

  const sectionKeys = Object.keys(sections);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0B1320',
        color: '#94A3B8',
        pt: { xs: 8, md: 10 },
        pb: 5,
        borderTop: '3px solid #018730',
        position: 'relative',
      }}
    >
      {/* Dual Brand Accent Strip at the very top of Footer */}
      <Box
        sx={{
          position: 'absolute',
          top: -3,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #018730 0%, #018730 50%, #fc4509 50%, #fc4509 100%)',
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={5} sx={{ justifyContent: 'space-between' }}>
          {/* Brand Info with TS Dual-Color Logo */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 2.5 }}>
              <BrandLogo title={siteTitle} lightText={true} size="medium" />
            </Box>

            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 3.5, color: '#94A3B8' }}>
              {siteDescription}
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(252, 69, 9, 0.12)',
                    border: '1px solid rgba(252, 69, 9, 0.25)',
                    p: 0.75,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ color: '#fc4509', fontSize: 18 }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#E2E8F0', lineHeight: 1.6, pt: 0.25 }}>
                  {contactAddress}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(252, 69, 9, 0.12)',
                    border: '1px solid rgba(252, 69, 9, 0.25)',
                    p: 0.75,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmailOutlinedIcon sx={{ color: '#fc4509', fontSize: 18 }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                  {contactEmail}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(252, 69, 9, 0.12)',
                    border: '1px solid rgba(252, 69, 9, 0.25)',
                    p: 0.75,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhoneOutlinedIcon sx={{ color: '#fc4509', fontSize: 18 }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                  {contactPhone}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Dynamic Footer Link Columns */}
          {sectionKeys.length > 0 ? (
            sectionKeys.map((sectionName) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={sectionName}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    mb: 2.5,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: '0.8125rem',
                    borderLeft: '3px solid #018730',
                    pl: 1,
                  }}
                >
                  {sectionName}
                </Typography>
                <Stack spacing={1.75}>
                  {sections[sectionName].map((link) => {
                    const isCareer =
                      link.url === '/careers' ||
                      link.url?.includes('career') ||
                      link.title?.trim().toLowerCase() === 'karir' ||
                      link.title?.trim().toLowerCase() === 'careers';
                    return (
                      <Link
                        key={link.id}
                        href={isCareer ? '#' : link.url}
                        onClick={
                          isCareer
                            ? (e: React.MouseEvent) => {
                                e.preventDefault();
                                // SEMENTARA DINONAKTIFKAN: Bisa diklik tapi tidak ke mana-mana dahulu (tidak terhubung ke web-karir)
                              }
                            : undefined
                        }
                        style={{
                          color: '#94A3B8',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          transition: 'color 0.2s',
                          cursor: 'pointer',
                        }}
                      >
                        {link.title}
                      </Link>
                    );
                  })}
                </Stack>
              </Grid>
            ))
          ) : (
            <>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    mb: 2.5,
                    textTransform: 'uppercase',
                    fontSize: '0.8125rem',
                    borderLeft: '3px solid #018730',
                    pl: 1,
                  }}
                >
                  Perusahaan
                </Typography>
                <Stack spacing={1.75}>
                  <Link href="/services" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Layanan</Link>
                  <Link href="/products" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Produk</Link>
                  <Link href="/news" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>News & Sustainability</Link>
                  <Link href="/blog" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Artikel & Berita</Link>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    mb: 2.5,
                    textTransform: 'uppercase',
                    fontSize: '0.8125rem',
                    borderLeft: '3px solid #fc4509',
                    pl: 1,
                  }}
                >
                  Legal & Akses
                </Typography>
                <Stack spacing={1.75}>
                  <Link href="/privacy" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Kebijakan Mutu</Link>
                  <Link href="/terms" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Syarat & Ketentuan</Link>
                  <Link href="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Portal Karyawan</Link>
                </Stack>
              </Grid>
            </>
          )}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 5 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            &copy; {new Date().getFullYear()} {siteTitle}. Hak Cipta Dilindungi.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/privacy" style={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none' }}>
              Privasi
            </Link>
            <Link href="/terms" style={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none' }}>
              Ketentuan
            </Link>
            <Link href="/login" style={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none' }}>
              Admin CMS
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
