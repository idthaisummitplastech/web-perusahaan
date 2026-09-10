import * as React from 'react';
import { cmsApi } from '@/lib/api-client';
import { Box, Container } from '@mui/material';
import CertificateGridClient from './CertificateGridClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sertifikasi Mutu & Akreditasi ISO | PT Indonesia Thai Summit Plastech',
  description: 'Sertifikasi standar global industri otomotif PT ITSP: IATF 16949, ISO 9001 (Kualitas), ISO 14001 (Lingkungan), dan ISO 45001 (Keselamatan Kerja).',
};

export default async function CertificationsPage() {
  const rawCertifications = await cmsApi.getItems<any>('certifications').catch(() => []);
  const certifications = rawCertifications.filter((c: any) => (c.isActive ?? c.is_active) !== false);


  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <CertificateGridClient
          certifications={certifications.map((c: any) => ({
            ...c,
            issuedDate: c.issuedDate ?? c.issued_date ?? null,
            expiryDate: c.expiryDate ?? c.expiry_date ?? null,
          }))}

        />
      </Container>
    </Box>
  );
}

