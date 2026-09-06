'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import ImageUpload from '@/components/admin/ImageUpload';

interface Partner {
  id: number;
  name: string;
  logo: string;
  logoType: string;
  url: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminPartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    logoType: 'image',
    url: '',
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/partners');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat mitra.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Partner) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        logo: item.logo || '',
        logoType: item.logoType || 'image',
        url: item.url || '',
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        logo: '',
        logoType: 'image',
        url: '',
        sortOrder: items.length + 1,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch('/api/cms/partners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data mitra.');

      setMessage(editingItem ? 'Mitra berhasil diperbarui!' : 'Mitra baru berhasil ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus mitra ini?')) return;
    try {
      const res = await fetch(`/api/cms/partners?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setMessage('Mitra berhasil dihapus!');
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">
            Manajemen Mitra & Klien
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Kelola logo dan nama perusahaan partner OEM/industri yang ditampilkan di website.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #018730 0%, #009e3a 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            textTransform: 'none',
            '&:hover': { background: 'linear-gradient(135deg, #016f27 0%, #018730 100%)' },
          }}
        >
          Tambah Mitra
        </Button>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#018730' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 100 }}>Logo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nama Perusahaan / Klien</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>URL Website</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Urutan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                      Belum ada data mitra atau klien.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {item.logo ? (
                          <Box
                            sx={{
                              width: 80,
                              height: 48,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid #E2E8F0',
                              bgcolor: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 0.5,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.logo}
                              alt={item.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 80,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: '#F1F5F9',
                              color: '#94A3B8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <BusinessIcon fontSize="small" />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {item.name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.85rem' }}>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#018730', textDecoration: 'none' }}>
                            {item.url}
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.isActive ? 'Aktif' : 'Nonaktif'}
                          size="small"
                          sx={{
                            bgcolor: item.isActive ? '#e8f6ed' : '#F1F5F9',
                            color: item.isActive ? '#018730' : '#64748B',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Mitra & Klien' : 'Tambah Mitra Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Nama Perusahaan / Klien"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Mitsubishi Motors Krama Yudha Indonesia (MMKI)"
              />

              <ImageUpload
                value={formData.logo}
                onChange={(url) => setFormData((prev) => ({ ...prev, logo: url, logoType: 'image' }))}
                label="Logo Perusahaan / Klien"
                helperText="Unggah file logo resmi (PNG dengan background transparan disarankan, JPG, SVG, WEBP)"
              />

              <TextField
                label="URL Website Klien (Opsional)"
                fullWidth
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://www.mitsubishi-motors.co.id"
              />

              <TextField
                label="Urutan Tampil"
                type="number"
                fullWidth
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#018730' },
                    }}
                  />
                }
                label="Status Aktif"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDialog} color="inherit">Batal</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #018730 0%, #009e3a 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: '8px',
                px: 3,
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #016f27 0%, #018730 100%)' },
              }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Mitra'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
