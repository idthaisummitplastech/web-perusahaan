'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Card,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import ShieldIcon from '@mui/icons-material/Shield';

export default function MfaSetupPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    fetchSetupData();
  }, []);

  const fetchSetupData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth/mfa/setup');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat data setup MFA.');
      }

      setQrCodeUrl(data.qrCodeDataUrl);
      setSecretKey(data.secret);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil konfigurasi QR Code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          secret: secretKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verifikasi kode gagal.');
      }

      setBackupCodes(data.backupCodes || []);
      setActiveStep(1); // Move to backup codes step
    } catch (err: any) {
      setError(err.message || 'Gagal memverifikasi kode MFA.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
        }}
      >
        <CircularProgress sx={{ color: '#F59E0B' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        p: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={5}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.99)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <ShieldIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" component="h1" fontWeight={800} color="#0F172A">
              Setup Keamanan Multi-Factor (MFA)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Wajib untuk seluruh akun Administrator demi menjaga integritas data perusahaan.
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Pindai & Verifikasi</StepLabel>
            </Step>
            <Step>
              <StepLabel>Simpan Kode Cadangan</StepLabel>
            </Step>
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 ? (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#1E293B" sx={{ mb: 1 }}>
                Langkah 1: Pindai Kode QR
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Buka aplikasi Authenticator (seperti Google Authenticator atau Microsoft Authenticator), pilih Tambah Akun (+), lalu pindai kode berikut:
              </Typography>

              {/* QR Code Container */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: '#F8FAFC',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  mb: 3,
                }}
              >
                {qrCodeUrl && (
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="MFA QR Code"
                    sx={{
                      width: 200,
                      height: 200,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  Tidak bisa memindai? Masukkan kode rahasia ini secara manual:
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#FFFFFF',
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    border: '1px solid #CBD5E1',
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    fontWeight={700}
                    letterSpacing="1px"
                    color="#0F172A"
                  >
                    {secretKey}
                  </Typography>
                  <Tooltip title={copiedSecret ? 'Tersalin!' : 'Salin Kode'}>
                    <IconButton size="small" onClick={handleCopySecret} color={copiedSecret ? 'success' : 'default'}>
                      {copiedSecret ? <CheckCircleOutlineIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Verification Form */}
              <Box component="form" onSubmit={handleVerifySetup}>
                <Typography variant="subtitle2" fontWeight={700} color="#1E293B" sx={{ mb: 1 }}>
                  Langkah 2: Masukkan 6-Digit Kode Konfirmasi
                </Typography>
                <TextField
                  label="Kode Verifikasi"
                  placeholder="123456"
                  variant="outlined"
                  fullWidth
                  required
                  value={verificationCode}
                  error={!!error}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  slotProps={{
                    htmlInput: {
                      maxLength: 6,
                      inputMode: 'numeric',
                      style: { textAlign: 'center', fontSize: '1.4rem', letterSpacing: '4px', fontWeight: 700 },
                    },
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                    💡 Masukkan 6-digit angka terbaru dari aplikasi Authenticator di HP Anda. Kode berganti otomatis setiap 30 detik.
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting || verificationCode.length < 6}
                  className="notranslate"
                  translate="no"
                  sx={{
                    py: 1.5,
                    bgcolor: '#F59E0B',
                    color: '#0F172A',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' },
                  }}
                >
                  <span className="notranslate" translate="no" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Verifikasi & Aktifkan MFA'}
                  </span>
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                MFA Berhasil Diaktifkan! Simpan kode cadangan (backup codes) berikut di tempat yang aman.
              </Alert>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Jika ponsel Anda hilang atau tidak dapat diakses, Anda dapat menggunakan salah satu kode di bawah untuk login ke Dashboard Admin:
              </Typography>

              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  bgcolor: '#F8FAFC',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  mb: 3,
                }}
              >
                <Grid container spacing={1.5}>
                  {backupCodes.map((code, idx) => (
                    <Grid size={{ xs: 6 }} key={idx}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: '#FFFFFF',
                          borderRadius: 2,
                          border: '1px solid #CBD5E1',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#0F172A',
                        }}
                      >
                        {code}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    startIcon={copiedBackup ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                    variant="outlined"
                    size="small"
                    onClick={handleCopyBackupCodes}
                    color={copiedBackup ? 'success' : 'primary'}
                  >
                    {copiedBackup ? 'Semua Kode Tersalin!' : 'Salin Semua Kode Cadangan'}
                  </Button>
                </Box>
              </Card>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleFinish}
                sx={{
                  py: 1.5,
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '1rem',
                  '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' },
                }}
              >
                Lanjutkan ke Dashboard Admin ?
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
