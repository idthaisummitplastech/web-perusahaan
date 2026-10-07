'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSuccessMsg(data.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim formulir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Hubungi Kami"
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
          <Typography variant="h2" component="h1" fontWeight={800} color="#0F172A" sx={{ fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' } }}>
            Mari Berdiskusi & Berkolaborasi
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, mx: 'auto', fontSize: '1.1rem' }}>
            Punya pertanyaan mengenai komponen otomotif, kemitraan manufaktur, atau layanan kami? Tim kami siap membantu Anda.
          </Typography>
        </Box>

        <Grid container spacing={5}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={2} sx={{ p: { xs: 3.5, sm: 5 }, borderRadius: 4, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                Kirimkan Pesan Anda
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
                Isi formulir di bawah ini dan perwakilan kami akan merespon dalam waktu 1x24 jam kerja.
              </Typography>

              {successMsg && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }}>
                  {successMsg}
                </Alert>
              )}

              {errorMsg && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
                  {errorMsg}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.75 }}>
                      Nama Lengkap *
                    </Typography>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama Anda"
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.75 }}>
                      Email Address *
                    </Typography>
                    <TextField
                      type="email"
                      variant="outlined"
                      required
                      fullWidth
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@perusahaan.com"
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.75 }}>
                      Subjek / Topik Kebutuhan
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Contoh: Permintaan Penawaran Komponen Otomotif"
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: 'block', mb: 0.75 }}>
                      Pesan Anda *
                    </Typography>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      multiline
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Jelaskan kebutuhan, spesifikasi teknis, atau ruang lingkup pertanyaan Anda..."
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={<SendIcon />}
                    sx={{
                      py: 1.6,
                      bgcolor: '#018730',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '1rem',
                      borderRadius: 25,
                      boxShadow: '0 8px 20px rgba(1, 135, 48, 0.3)',
                      '&:hover': {
                        bgcolor: '#016f27',
                        boxShadow: '0 12px 24px rgba(1, 135, 48, 0.45)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Kirim Pesan Sekarang'}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Details Card - Executive Deep Navy */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3.5, sm: 5 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, #0B1320 0%, #152238 100%)',
                color: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 32px rgba(11, 19, 32, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', mb: 1 }}>
                  Informasi Kantor & Pabrik
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 4 }}>
                  Kunjungi fasilitas kami atau hubungi kami melalui saluran komunikasi resmi.
                </Typography>

                <Stack spacing={3.5}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(252, 69, 9, 0.15)',
                        borderRadius: 2.5,
                        color: '#fc4509',
                        height: 'fit-content',
                      }}
                    >
                      <LocationOnIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#018730" fontWeight={700}>
                        Lokasi Pabrik & Kantor
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#F8FAFC" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                        Kawasan Industri GIIC Blok AA No. 1, Kota Deltamas, Cikarang Pusat, Bekasi 17530
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(252, 69, 9, 0.15)',
                        borderRadius: 2.5,
                        color: '#fc4509',
                        height: 'fit-content',
                      }}
                    >
                      <EmailIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#018730" fontWeight={700}>
                        Official Email
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#F8FAFC" sx={{ mt: 0.5 }}>
                        info@thaisummit.co.id
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(252, 69, 9, 0.15)',
                        borderRadius: 2.5,
                        color: '#fc4509',
                        height: 'fit-content',
                      }}
                    >
                      <PhoneIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#018730" fontWeight={700}>
                        Telepon Langsung
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#F8FAFC" sx={{ mt: 0.5 }}>
                        +62 21 8980 1234
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        color: '#FB923C',
                        height: 'fit-content',
                      }}
                    >
                      <AccessTimeIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#86EFAC" fontWeight={700}>
                        Jam Operasional
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#F8FAFC" sx={{ mt: 0.5 }}>
                        Senin - Jumat: 08:00 - 17:00 WIB
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ pt: 4, mt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <Typography variant="caption" color="#CBD5E1">
                  Seluruh pesan dan permintaan penawaran akan diproses secara profesional oleh divisi terkait.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
