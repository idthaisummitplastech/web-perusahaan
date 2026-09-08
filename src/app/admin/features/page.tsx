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
  MenuItem,
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
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';

interface Feature {
  id: number;
  title: string;
  description: string;
  svgIcon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFeaturesPage() {
  const [items, setItems] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Feature | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    svgIcon: 'Speed',
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
      const res = await fetch('/api/cms/features');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat fitur.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Feature) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        svgIcon: item.svgIcon || 'Speed',
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        svgIcon: 'Speed',
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

      const res = await fetch('/api/cms/features', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan fitur.');

      setMessage(editingItem ? 'Fitur diperbarui!' : 'Fitur baru ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus fitur ini?')) return;
    try {
      const res = await fetch(`/api/cms/features?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setMessage('Fitur berhasil dihapus!');
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">
            Manajemen Fitur Utama
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Kelola pilar keunggulan produk dan nilai tambah yang tampil di halaman beranda.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
        >
          Tambah Fitur
        </Button>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {(() => {
        const filteredItems = items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.svgIcon && item.svgIcon.toLowerCase().includes(q))
          );
        });

        const paginatedItems = filteredItems.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        return (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
            <CmsTableToolbar
              searchQuery={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val);
                setPage(0);
              }}
              placeholder="Cari fitur, ikon, deskripsi..."
              totalCount={items.length}
              filteredCount={filteredItems.length}
            />
            {loading ? (
              <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#F59E0B' }} />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Judul Fitur</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Ikon</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Deskripsi</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Urutan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada fitur yang cocok dengan pencarian.' : 'Belum ada data fitur. Klik tombol "Tambah Fitur" di atas untuk menambahkan.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{item.title}</TableCell>
                            <TableCell>
                              <Chip label={item.svgIcon || 'Default'} size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }} />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary', maxWidth: 350 }}>{item.description}</TableCell>
                            <TableCell>{item.sortOrder}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.isActive ? 'Aktif' : 'Nonaktif'}
                                size="small"
                                sx={{
                                  bgcolor: item.isActive ? '#ECFDF5' : '#F1F5F9',
                                  color: item.isActive ? '#047857' : '#64748B',
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="primary" onClick={() => handleOpenDialog(item)}>
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
                <CmsTablePagination
                  count={filteredItems.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setPage}
                  onRowsPerPageChange={(newRpp) => {
                    setRowsPerPage(newRpp);
                    setPage(0);
                  }}
                />
              </>
            )}
          </Paper>
        );
      })()}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Fitur' : 'Tambah Fitur Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Judul Fitur"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Keamanan Tingkat Tinggi"
              />

              <TextField
                select
                label="Jenis Ikon"
                fullWidth
                value={formData.svgIcon}
                onChange={(e) => setFormData({ ...formData, svgIcon: e.target.value })}
              >
                <MenuItem value="Speed">Kecepatan & Performa (Speed)</MenuItem>
                <MenuItem value="Security">Keamanan & MFA (Security)</MenuItem>
                <MenuItem value="Dashboard">Pengelolaan Konten (Dashboard)</MenuItem>
                <MenuItem value="Layers">Arsitektur Modular (Layers)</MenuItem>
              </TextField>

              <TextField
                label="Deskripsi Fitur"
                required
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan manfaat fitur ini bagi pengguna..."
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
                    color="warning"
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
              sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Fitur'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
