import * as React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Box, Container, Grid, Typography, Card, Chip, Button } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CertificateGridClient from './CertificateGridClient';

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

        <CertificateGridClient certifications={certifications.map(c => ({
          ...c,
          issuedDate: c.issuedDate ? c.issuedDate.toISOString() : null,
          expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null,
        }))} />

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
