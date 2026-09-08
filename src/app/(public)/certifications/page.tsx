import * as React from 'react';
import prisma from '@/lib/prisma';
import { Box, Container } from '@mui/material';
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
        <CertificateGridClient
          certifications={certifications.map((c) => ({
            ...c,
            issuedDate: c.issuedDate ? c.issuedDate.toISOString() : null,
            expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null,
          }))}
        />
      </Container>
    </Box>
  );
}

