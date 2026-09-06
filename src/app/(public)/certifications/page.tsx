import * as React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Box, Container, Grid, Typography, Card, Chip, Button } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sertifikasi Mutu & Akreditasi ISO | PT Indonesia Thai Summit Plastech',
  description: 'Sertifikasi standar global industri otomotif PT ITSP: IATF 16949, ISO 9001 (Kualitas), ISO 14001 (Lingkungan), dan ISO 45001 (Keselamatan Kerja).',
};

export default async function CertificationsPage() {
  const certifications = await prisma.certification.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

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
            <WorkspacePremiumIcon sx={{ fontSize: 18, color: '#018730' }} />
            <span>Standar & Kepatuhan Global</span>
          </Box>
          <Typography variant="h2" component="h1" fontWeight={900} color="#0F172A" sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}>
            Sertifikasi Internasional Otomotif
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 700, mx: 'auto', fontSize: '1.05rem' }}>
            Seluruh sistem manajemen mutu, manufaktur injeksi plastik, keselamatan kerja, dan kelestarian lingkungan PT ITSP telah terakreditasi oleh lembaga audit global.
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
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
                  boxShadow: '0 6px 20px rgba(1, 135, 48, 0.05)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#018730',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 32px rgba(1, 135, 48, 0.12)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2.5,
                      bgcolor: '#F4FAF6',
                      color: '#018730',
                      border: '1px solid #cbead5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.25 }}>
                      {cert.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, fontWeight: 600 }}>
                      {cert.issuer}
                    </Typography>
                  </Box>
                </Box>

                {cert.certificateNumber && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      p: 0.75,
                      borderRadius: 1.5,
                      color: '#015e21',
                      fontWeight: 700,
                      mb: 1.5,
                      display: 'block',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    No: {cert.certificateNumber}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, fontSize: '0.825rem', lineHeight: 1.6, mb: 2.5 }}>
                  {cert.description}
                </Typography>

                <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      py: 0.35,
                      borderRadius: '14px',
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 12, color: '#FFFFFF' }} />
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

        {/* CTA */}
        <Box sx={{ mt: 10, p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: '#018730', color: '#FFFFFF', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5 }}>
            Butuh Dokumen Sertifikat Resmi untuk Due Diligence OEM?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3.5, maxWidth: 640, mx: 'auto' }}>
            Hubungi departemen Quality Assurance (QA) kami untuk salinan sertifikat resmi terlegalisir.
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
              Hubungi Tim QA / Marketing
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
