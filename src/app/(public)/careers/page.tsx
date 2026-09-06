import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import LaunchIcon from '@mui/icons-material/Launch';

export const metadata: Metadata = {
  title: 'Pusat Karir & Rekrutmen — PT Indonesia Thai Summit Plastech',
  description: 'Bergabunglah dengan PT Indonesia Thai Summit Plastech (Thai Summit Group). Informasi lowongan kerja aktif dan portal rekrutmen terpadu.',
};

const STAGES = [
  { step: 1, title: 'Screening Dokumen & CV', desc: 'Verifikasi kualifikasi dan berkas CV PDF (maks. 100 KB).' },
  { step: 2, title: 'Tes Psikotes Online', desc: 'Ujian potensi akademik & logika online dengan token sesi & anti-cheat.' },
  { step: 3, title: 'Tes Teknis Departemen', desc: 'Uji kompetensi manufaktur, mold injection, dan standar otomotif.' },
  { step: 4, title: 'Interview HR', desc: 'Wawancara via Microsoft Teams/Zoom atau Onsite di pabrik.' },
  { step: 5, title: 'Interview User', desc: 'Wawancara bersama Kepala Departemen & Supervisor terkait.' },
  { step: 6, title: 'Medical Check-Up (MCU)', desc: 'Pemeriksaan kesehatan di Klinik/RS rekanan resmi PT ITSP.' },
  { step: 7, title: 'Offering & Kontrak Fisik', desc: 'Penerbitan surat penawaran resmi dan tanda tangan kontrak di pabrik.' },
];

export default function CareersGatewayPage() {
  const careerAppUrl = process.env.NEXT_PUBLIC_CAREER_URL || 'http://localhost:3001';

  return (
    <Box sx={{ bgcolor: '#F8FAFC', pb: 10 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #018730 0%, #004d1b 100%)',
          color: '#FFFFFF',
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 10 },
          borderBottom: '4px solid #fc4509',
        }}
      >
        <Container maxWidth="lg">
          <Chip
            label="PORTAL KARIR TERPADU & ATS (APPLICANT TRACKING SYSTEM)"
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#FED7AA',
              fontWeight: 700,
              fontSize: 12,
              mb: 2,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 32, md: 46 },
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Membangun Masa Depan Gemilang di Industri Otomotif Global
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#D1FAE5',
              fontSize: { xs: 16, md: 18 },
              maxWidth: 720,
              lineHeight: 1.65,
              mb: 4,
            }}
          >
            Sebagai bagian dari Thai Summit Group, PT Indonesia Thai Summit Plastech berkomitmen menyediakan lingkungan kerja profesional, aman, berteknologi mutakhir, dan mendorong pengembangan kompetensi setiap karyawan.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              component="a"
              href={`${careerAppUrl}/#lowongan`}
              target="_blank"
              endIcon={<LaunchIcon />}
              sx={{
                bgcolor: '#fc4509',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 4,
                py: 1.4,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(252,69,9,0.3)',
                '&:hover': { bgcolor: '#e03a03' },
              }}
            >
              Buka Portal Rekrutmen & Lamar Lowongan &rarr;
            </Button>
            <Button
              variant="outlined"
              size="large"
              component="a"
              href={`${careerAppUrl}/login`}
              target="_blank"
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                px: 3.5,
                py: 1.4,
                borderRadius: 2,
                '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Login ke Portal Pelamar (Cek Status)
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 7 Stages Overview */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#018730', fontWeight: 800, fontSize: 13 }}>
            STANDAR SELEKSI REKRUTMEN PT ITSP
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, mb: 1 }}>
            Alur Seleksi 7 Tahap Calon Karyawan
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 640, mx: 'auto' }}>
            Seluruh tahapan seleksi dipantau secara transparan melalui portal mandiri, notifikasi email resmi, serta penjadwalan terpadu.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {STAGES.map((s) => (
            <Card
              key={s.step}
              sx={{
                borderRadius: 2.5,
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#018730',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(1, 135, 48, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: s.step % 2 === 0 ? '#018730' : '#fc4509',
                  color: '#FFFFFF',
                  py: 1,
                  px: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
                  TAHAP {s.step}
                </Typography>
              </Box>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, fontSize: 13, flex: 1 }}>
                  {s.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Security & Isolation Banner */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 3,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
            boxShadow: '0 12px 36px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ maxWidth: 650 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4ADE80', mb: 1 }}>
              <SecurityIcon />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
                SISTEM REKRUTMEN MANDIRI & AMAN (ATS)
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Siap Bergabung dengan Tim Unggul Kami?
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
              Aplikasi pendaftaran karir berjalan secara terisolasi pada portal rekrutmen resmi (Port 3001) dengan proteksi anti-cheat, batasan file CV 100 KB, dan autentikasi aman.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            component="a"
            href={careerAppUrl}
            target="_blank"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#018730',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 15,
              px: 4,
              py: 1.4,
              borderRadius: 2,
              '&:hover': { bgcolor: '#005c21' },
            }}
          >
            Menuju Portal Karir PT ITSP &rarr;
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
