import * as React from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Grid, Typography, Card, Button, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const rawServices = await cmsApi.getItems<any>('services').catch(() => []);
  const services = rawServices.filter((s: any) => (s.isActive ?? s.is_active) !== false);


  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Services & Solusi Manufaktur"
            sx={{
              bgcolor: '#e8f6ed',
              color: '#018730',
              fontWeight: 800,
              border: '1px solid #a3dfb7',
              mb: 2,
            }}
          />
          <Typography variant="h2" component="h1" fontWeight={900} color="#0F172A">
            Solusi Rekayasa & Manufaktur Terpadu
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, mx: 'auto' }}>
            Dari rekayasa presisi komponen interior/eksterior hingga perakitan modul otomatisasi berstandar internasional.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#018730',
                    boxShadow: '0 16px 32px rgba(1, 135, 48, 0.12)',
                  },
                }}
              >
                <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                  {service.title}
                </Typography>
                {service.subtitle && (
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#018730', mb: 2 }}>
                    {service.subtitle}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3, lineHeight: 1.8 }}>
                  {service.description}
                </Typography>
                <Button
                  component="a"
                  href={`/services/${service.slug}`}
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: '#018730',
                    borderColor: '#CBD5E1',
                    fontWeight: 700,
                    borderRadius: 2,
                    alignSelf: 'flex-start',
                    '&:hover': { borderColor: '#018730', bgcolor: '#e8f6ed', color: '#016f27' },
                  }}
                >
                  Pelajari Lebih Lanjut
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
