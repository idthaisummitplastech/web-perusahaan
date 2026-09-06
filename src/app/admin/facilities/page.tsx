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
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ImageUpload from '@/components/admin/ImageUpload';

interface Facility {
  id: number;
  title: string;
  category: string;
  image: string | null;
  description: string | null;
  specifications: string | null;
  sortOrder: number;
  isActive: boolean;
}

const FACILITY_CATEGORIES = [
  'Stamping Press',
  'Robotic Welding',
  'Tool & Die Shop',
  'Quality & CMM Laboratory',
  'Assembly & Sub-Assembly',
  'Automated Warehouse & Logistics',
  'Eco Factory & Solar PV',
];

export default function AdminFacilitiesPage() {
  const [items, setItems] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Stamping Press',
    image: '',
    description: '',
    specifications: '',
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
      const res = await fetch('/api/cms/facilities');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat data fasilitas pabrik.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Facility) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        category: item.category || 'Stamping Press',
        image: item.image || '',
        description: item.description || '',
        specifications: item.specifications || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        category: 'Stamping Press',
        image: '',
        description: '',
        specifications: '',
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

      const res = await fetch('/api/cms/facilities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan fasilitas.');
      }

      setMessage(editingItem ? 'Fasilitas pabrik berhasil diperbarui!' : 'Fasilitas pabrik baru berhasil ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data fasilitas ini?')) return;

    try {
      const res = await fetch(`/api/cms/facilities?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus fasilitas.');
      setMessage('Data fasilitas berhasil dihapus.');
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus fasilitas.');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <PrecisionManufacturingIcon sx={{ color: '#018730', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={900} color="#0F172A">
              Fasilitas Manufaktur & Kondisi Pabrik
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Dokumentasikan mesin berteknologi tinggi, jalur stamping, robot welding, dan lab kendali mutu untuk meyakinkan calon pelanggan & auditor.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#018730',
            color: '#FFFFFF',
            fontWeight: 700,
            borderRadius: 2.5,
            px: 3,
            '&:hover': { bgcolor: '#016f27' },
          }}
        >
          Tambah Fasilitas Pabrik
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
                  <TableCell sx={{ fontWeight: 700, width: 80 }}>Foto</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nama Fasilitas / Mesin</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Spesifikasi Teknis</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      Belum ada data fasilitas pabrik. Klik tombol &quot;Tambah Fasilitas Pabrik&quot; di atas untuk menambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {item.image ? (
                          <Box
                            sx={{
                              width: 54,
                              height: 54,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid #E2E8F0',
                              bgcolor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 54,
                              height: 54,
                              borderRadius: 2,
                              bgcolor: '#e8f6ed',
                              color: '#018730',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PrecisionManufacturingIcon fontSize="small" />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                        <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 320 }}>
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{ bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.8125rem' }}>
                        <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.specifications || '-'}
                        </Typography>
                      </TableCell>
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

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Fasilitas Pabrik' : 'Tambah Fasilitas Pabrik Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Nama Fasilitas / Mesin Produksi"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Tandem Stamping Press Line 2000T & 1000T"
              />

              <TextField
                select
                label="Kategori Fasilitas"
                required
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {FACILITY_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                label="Foto Fasilitas / Mesin Pabrik"
                helperText="Unggah foto area produksi, mesin press, robotic cell, atau lab QC (JPG, PNG, WEBP)"
              />

              <TextField
                label="Spesifikasi Teknis Fasilitas"
                fullWidth
                multiline
                rows={2}
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                placeholder="Contoh: Kapasitas 2000 Ton, Bed Size 4500x2500mm, Automatic Feeder & Transfer Robot, SPM 15-25"
              />

              <TextField
                label="Deskripsi & Peran Produksi"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan peran mesin dalam proses manufaktur, output komponen otomotif yang dihasilkan, standar toleransi, dan kapasitas..."
              />

              <Stack direction="row" spacing={3} alignItems="center">
                <TextField
                  label="Urutan Tampil"
                  type="number"
                  sx={{ width: 140 }}
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
                  label="Status Aktif (Tampilkan di website)"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: '#018730', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#016f27' } }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Fasilitas'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
