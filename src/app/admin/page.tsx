import * as React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ArticleIcon from '@mui/icons-material/Article';
import MailIcon from '@mui/icons-material/Mail';
import NavigationIcon from '@mui/icons-material/Navigation';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    productCount,
    certCount,
    facilityCount,
    serviceCount,
    blogCount,
    contactCount,
    unreadContacts,
    userCount,
    recentContacts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.certification.count(),
    prisma.facility.count(),
    prisma.service.count(),
    prisma.blogPost.count(),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { isRead: false } }),
    prisma.user.count(),
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const STATS_CARDS = [
    { title: 'Produk Manufaktur', count: productCount, icon: <Inventory2Icon sx={{ fontSize: 28 }} />, href: '/admin/products', color: '#D97706', bg: '#FEF3C7' },
    { title: 'Sertifikasi ISO', count: certCount, icon: <WorkspacePremiumIcon sx={{ fontSize: 28 }} />, href: '/admin/certifications', color: '#018730', bg: '#e8f6ed' },
    { title: 'Fasilitas Pabrik', count: facilityCount, icon: <PrecisionManufacturingIcon sx={{ fontSize: 28 }} />, href: '/admin/facilities', color: '#0284C7', bg: '#E0F2FE' },
    { title: 'Pesan Masuk', count: contactCount, badge: unreadContacts > 0 ? `${unreadContacts} Baru` : null, icon: <MailIcon sx={{ fontSize: 28 }} />, href: '/admin/contacts', color: '#059669', bg: '#D1FAE5' },
    { title: 'Artikel Blog', count: blogCount, icon: <ArticleIcon sx={{ fontSize: 28 }} />, href: '/admin/blog-posts', color: '#7C3AED', bg: '#EDE9FE' },
    { title: 'Pengguna CMS', count: userCount, icon: <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />, href: '/admin/users', color: '#fc4509', bg: '#FFF7ED' },
  ];

  return (
    <Box>
      {/* Header Banner */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">
            Dashboard Pengelola Konten
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Kelola seluruh konten website Anda mulai dari navigasi header hingga footer secara instan.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button component="a" href="/admin/settings" variant="outlined" startIcon={<SettingsIcon />} sx={{ bgcolor: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}>
            Pengaturan Web
          </Button>
          <Button component="a" href="/" target="_blank" variant="contained" sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, '&:hover': { bgcolor: '#016f27' } }}>
            Lihat Website
          </Button>
        </Stack>
      </Box>

      {/* Security MFA Status Alert */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          mb: 4,
          bgcolor: '#e8f6ed',
          border: '1px solid #a3dfb7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldIcon sx={{ color: '#018730', fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#015e21">
              Autentikasi Multi-Faktor (MFA) Berjalan Aktif
            </Typography>
            <Typography variant="caption" color="#018730">
              Akun Anda terlindungi dengan standar enkripsi TOTP 2-Langkah setiap kali login.
            </Typography>
          </Box>
        </Box>
        <Button component="a" href="/admin/profile" size="small" sx={{ color: '#018730', fontWeight: 700 }}>
          Kelola Keamanan →
        </Button>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STATS_CARDS.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
            <Link href={card.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <Card
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: '#018730', boxShadow: '0 12px 24px -10px rgba(1, 135, 48, 0.15)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </Box>
                  {card.badge && (
                    <Chip label={card.badge} size="small" sx={{ bgcolor: '#fc4509', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }} />
                  )}
                </Box>
                <Typography variant="h4" fontWeight={900} color="#0F172A">
                  {card.count}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                  {card.title}
                </Typography>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Recent Contact Inquiries */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Pesan Masuk Terbaru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pertanyaan dan prospek bisnis yang dikirim oleh pengunjung melalui formulir kontak.
            </Typography>
          </Box>
          <Button component="a" href="/admin/contacts" endIcon={<ArrowForwardIcon />} sx={{ color: '#018730', fontWeight: 700 }}>
            Lihat Semua Pesan
          </Button>
        </Box>

        {recentContacts.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Pengirim</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subjek</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Waktu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentContacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.subject || '-'}</TableCell>
                    <TableCell>
                      {new Date(contact.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.isRead ? 'Dibaca' : 'Baru'}
                        size="small"
                        sx={{
                          bgcolor: contact.isRead ? '#F1F5F9' : '#FEF3C7',
                          color: contact.isRead ? '#64748B' : '#B45309',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Belum ada pesan masuk dari formulir kontak.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
