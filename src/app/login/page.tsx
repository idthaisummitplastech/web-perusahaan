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
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
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
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: 4,
            bgcolor: '#FFFFFF',
            borderTop: '4px solid #018730',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <BrandLogo title="Indonesia Thai Summit Plastech" lightText={false} size="medium" />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              CMS Management Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.75 }}>
              Sign in to Admin Dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.75 }}>
                  Email Address
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@portal.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: '#94A3B8' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.75 }}>
                  Password
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: '#94A3B8' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  bgcolor: '#e8f6ed',
                  border: '1px solid #a3dfb7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <ShieldOutlinedIcon sx={{ color: '#018730', fontSize: 24, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#015e21', lineHeight: 1.5 }}>
                  Protected by <strong>Multi-Factor Authentication (MFA)</strong> to keep your account secure.
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.6,
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderRadius: 2.5,
                  boxShadow: '0 8px 20px rgba(1, 135, 48, 0.25)',
                  '&:hover': {
                    bgcolor: '#016f27',
                    boxShadow: '0 12px 24px rgba(1, 135, 48, 0.35)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue to Sign In'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/" style={{ color: '#018730', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              &larr; Back to Website Home
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
