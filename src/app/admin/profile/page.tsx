'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Card,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [togglingMfa, setTogglingMfa] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setName(data.name || '');
      }
    } catch {
      setProfileErr('Gagal memuat data profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMfa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextStatus = e.target.checked;
    setTogglingMfa(true);
    setProfileErr('');
    setProfileMsg('');

    try {
      const res = await fetch('/api/cms/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_mfa', enabled: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status MFA.');

      setProfileMsg(data.message || 'Status MFA berhasil diperbarui.');
      fetchProfile();
    } catch (err: any) {
      setProfileErr(err.message || 'Gagal memperbarui status MFA.');
    } finally {
      setTogglingMfa(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');
    setProfileErr('');

    try {
      const res = await fetch('/api/cms/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui profil.');
      setProfileMsg('Nama profil berhasil diperbarui.');
      fetchProfile();
    } catch (err: any) {
      setProfileErr(err.message || 'Gagal menyimpan.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (newPassword !== confirmPassword) {
      setPasswordErr('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/cms/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah kata sandi.');

      setPasswordMsg('Kata sandi berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordErr(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  const isMfaActive = Boolean(profile?.mfaEnabled);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} color="#0F172A">
          Profil & Keamanan Akun
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Kelola informasi akun, kata sandi, dan status Autentikasi Multi-Faktor (MFA) Anda.
        </Typography>
      </Box>

      {profileMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setProfileMsg('')}>{profileMsg}</Alert>}
      {profileErr && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setProfileErr('')}>{profileErr}</Alert>}

      <Grid container spacing={4}>
        {/* Profile Info & MFA Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={4}>
            {/* MFA Security Card */}
            <Card
              sx={{
                p: 3.5,
                borderRadius: 4,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                boxShadow: '0 15px 35px -10px rgba(15, 23, 42, 0.4)',
                border: isMfaActive ? '1px solid #01873044' : '1px solid #334155',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ShieldIcon sx={{ color: isMfaActive ? '#018730' : '#94A3B8', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={800} color="#FFFFFF">
                    Autentikasi Multi-Faktor (MFA)
                  </Typography>
                </Box>
                <Chip
                  label={isMfaActive ? 'Aktif & Terlindungi' : 'Dinonaktifkan (Standar)'}
                  size="small"
                  sx={{
                    bgcolor: isMfaActive ? '#01873022' : 'rgba(255, 255, 255, 0.1)',
                    color: isMfaActive ? '#4ade80' : '#94A3B8',
                    fontWeight: 700,
                    border: `1px solid ${isMfaActive ? '#01873066' : 'rgba(255, 255, 255, 0.2)'}`,
                  }}
                />
              </Box>

              {/* MFA Toggle Switch */}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  mb: 2.5,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#F8FAFC">
                    Status MFA Akun Saya
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    {isMfaActive ? 'MFA diaktifkan untuk keamanan ganda.' : 'MFA dinonaktifkan (login hanya sandi).'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isMfaActive}
                      disabled={togglingMfa}
                      onChange={handleToggleMfa}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#018730',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#018730',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7, mb: 3 }}>
                {isMfaActive
                  ? 'Akun administrator Anda terlindungi dengan standar TOTP Time-based One-Time Password. Setiap login memerlukan verifikasi aplikasi authenticator di smartphone Anda.'
                  : 'Autentikasi dua faktor dinonaktifkan. Anda dapat login langsung hanya dengan email dan kata sandi tanpa kode OTP.'}
              </Typography>

              {isMfaActive && (
                <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)', mb: 3 }}>
                  <Typography variant="caption" color="#CBD5E1" display="block">
                    Sisa Kode Cadangan (Backup Codes):
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#fc4509">
                    {profile?.backupCodesCount || 8} Kode Tersedia
                  </Typography>
                </Box>
              )}

              {isMfaActive ? (
                <Button
                  onClick={() => router.push('/admin/mfa-setup')}
                  variant="outlined"
                  startIcon={<QrCode2Icon />}
                  fullWidth
                  sx={{
                    borderColor: '#018730',
                    color: '#86efac',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: '#016f27',
                      bgcolor: 'rgba(1, 135, 48, 0.1)',
                    },
                  }}
                >
                  Konfigurasi Ulang / Pasangkan Perangkat Baru
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/admin/mfa-setup')}
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  fullWidth
                  sx={{
                    bgcolor: '#018730',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: '#016f27',
                    },
                  }}
                >
                  Pasang Authenticator (QR Code) Sekarang
                </Button>
              )}
            </Card>

            {/* Profile Form */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PersonIcon sx={{ color: '#018730' }} />
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Informasi Administrator
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleUpdateProfile}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Alamat Email (Login)"
                    fullWidth
                    disabled
                    value={profile?.email || ''}
                    helperText="Email tidak dapat diubah."
                  />

                  <TextField
                    label="Nama Tampilan"
                    required
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updatingProfile}
                    sx={{
                      bgcolor: '#018730',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      py: 1.25,
                      alignSelf: 'flex-start',
                      '&:hover': { bgcolor: '#016f27' },
                    }}
                  >
                    {updatingProfile ? 'Menyimpan...' : 'Perbarui Profil'}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Change Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <KeyIcon sx={{ color: '#fc4509' }} />
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                Ubah Kata Sandi
              </Typography>
            </Box>

            {passwordMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setPasswordMsg('')}>{passwordMsg}</Alert>}
            {passwordErr && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setPasswordErr('')}>{passwordErr}</Alert>}

            <Box component="form" onSubmit={handleChangePassword}>
              <Stack spacing={2.5}>
                <TextField
                  label="Kata Sandi Saat Ini"
                  type="password"
                  required
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <TextField
                  label="Kata Sandi Baru"
                  type="password"
                  required
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  helperText="Minimal 6 karakter kombinasi."
                />

                <TextField
                  label="Konfirmasi Kata Sandi Baru"
                  type="password"
                  required
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={changingPassword}
                  sx={{
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    py: 1.25,
                    alignSelf: 'flex-start',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  {changingPassword ? 'Menyimpan...' : 'Ganti Kata Sandi'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
