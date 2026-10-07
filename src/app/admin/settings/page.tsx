'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_title: '',
    site_tagline: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    primary_color: '#F59E0B',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/settings');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => {
          mapped[item.key] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...mapped }));
      }
    } catch (err: any) {
      setError('Gagal memuat pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan pengaturan.');

      setSuccess('Pengaturan website berhasil diperbarui!');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#F59E0B' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} color="#0F172A">
          Pengaturan Umum Website
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Kelola informasi identitas perusahaan, metadata SEO, kontak resmi, dan preferensi tampilan.
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box component="form" onSubmit={handleSave}>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>
            Identitas & SEO
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Nama / Judul Website (Site Title)"
                fullWidth
                required
                value={settings.site_title || ''}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                placeholder="PT Indonesia Thai Summit Plastech"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Tagline Company"
                fullWidth
                value={settings.site_tagline || ''}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                placeholder="Solusi Digital Terpercaya"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Deskripsi Singkat (Meta Description)"
                fullWidth
                multiline
                rows={3}
                value={settings.site_description || ''}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                placeholder="Deskripsi profil perusahaan yang tampil pada mesin pencari dan footer..."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>
            Informasi Kontak & Alamat
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Official Email Company"
                type="email"
                fullWidth
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="info@portal.com"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Nomor Telepon / WhatsApp"
                fullWidth
                value={settings.contact_phone || ''}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="+62 812 3456 7890"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Alamat Lengkap Kantor"
                fullWidth
                multiline
                rows={2}
                value={settings.contact_address || ''}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            startIcon={<SaveIcon />}
            sx={{
              py: 1.5,
              px: 4,
              bgcolor: '#F59E0B',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '0.95rem',
              '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' },
            }}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
