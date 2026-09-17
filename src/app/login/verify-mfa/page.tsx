'use client';

import * as React from 'react';
import { useState } from 'react';
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
  Link as MuiLink,
} from '@mui/material';
import PhonelinkLockIcon from '@mui/icons-material/PhonelinkLock';
import KeyIcon from '@mui/icons-material/Key';
import Link from 'next/link';

export default function VerifyMfaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verifikasi MFA gagal.');
      }

      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memverifikasi kode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B1320 0%, #0F2A1E 50%, #018730 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            borderTop: '4px solid #018730',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#e8f6ed',
              color: '#018730',
              border: '1px solid #a3dfb7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            {isBackupMode ? <KeyIcon sx={{ fontSize: 34 }} /> : <PhonelinkLockIcon sx={{ fontSize: 34 }} />}
          </Box>

          <Typography variant="h5" component="h1" fontWeight={700} color="#0F172A">
            {isBackupMode ? 'Kode Pemulihan Cadangan' : 'Verifikasi MFA 2-Langkah'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {isBackupMode
              ? 'Masukkan salah satu dari 8-karakter backup code Anda.'
              : 'Buka aplikasi Google Authenticator atau aplikasi TOTP Anda dan masukkan 6 digit kode keamanan.'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleVerify}>
            <Stack spacing={2.5}>
              <TextField
                label={isBackupMode ? 'Kode Cadangan (misal: A1B2-C3D4)' : 'Kode Otentikasi 6-Digit'}
                variant="outlined"
                fullWidth
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(isBackupMode ? /[^a-zA-Z0-9-]/g : /\D/g, ''));
                  if (error) setError('');
                }}
                autoFocus
                placeholder={isBackupMode ? 'XXXX-XXXX' : '123456'}
                inputProps={{
                  maxLength: isBackupMode ? 12 : 6,
                  inputMode: isBackupMode ? 'text' : 'numeric',
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: isBackupMode ? '2px' : '6px',
                    fontWeight: 700,
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !code.trim()}
                className="notranslate"
                translate="no"
                sx={{
                  py: 1.5,
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#016f27',
                  },
                }}
              >
                <span className="notranslate" translate="no" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Verifikasi & Masuk'}
                </span>
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
            <MuiLink
              component="button"
              type="button"
              onClick={() => {
                setIsBackupMode(!isBackupMode);
                setCode('');
                setError('');
              }}
              sx={{
                fontSize: '0.875rem',
                color: '#fc4509',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'block',
                mb: 1.5,
              }}
            >
              {isBackupMode ? '← Gunakan Aplikasi Authenticator' : 'Kehilangan akses ke ponsel? Gunakan Kode Cadangan'}
            </MuiLink>

            <Link href="/login" style={{ color: '#64748B', fontSize: '0.875rem', textDecoration: 'none' }}>
              Kembali ke Halaman Login
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
