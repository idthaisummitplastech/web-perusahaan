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
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';

interface Service {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    slug: '',
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
      const res = await fetch('/api/cms/services');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat layanan.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Service) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        subtitle: item.subtitle || '',
        description: item.description || '',
        slug: item.slug,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        slug: '',
        sortOrder: items.length + 1,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
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

      const res = await fetch('/api/cms/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan layanan.');
      }

      setMessage(editingItem ? 'Layanan berhasil diperbarui!' : 'Layanan baru berhasil ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/services?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || data?.message || 'Gagal menghapus.');
      }
      setMessage('Data berhasil dihapus!');
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">
            Manajemen Layanan Perusahaan
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Kelola daftar layanan profesional, deskripsi keahlian, dan URL slug halaman detail.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
        >
          Tambah Layanan
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
            (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.slug && item.slug.toLowerCase().includes(q))
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
              placeholder="Cari layanan, kategori, deskripsi, slug..."
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
                        <TableCell sx={{ fontWeight: 700 }}>Nama Layanan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subjudul / Kategori</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>URL Slug</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Urutan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada layanan yang cocok dengan pencarian.' : 'Belum ada data layanan. Klik tombol "Tambah Layanan" di atas untuk menambahkan.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{item.title}</TableCell>
                            <TableCell>{item.subtitle || '-'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#64748B' }}>/services/{item.slug}</TableCell>
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
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Nama Layanan"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Pengembangan Web Skala Enterprise"
              />

              <TextField
                label="Subjudul / Tagline Singkat"
                fullWidth
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Aplikasi Web Kustom & Responsif"
              />

              <TextField
                label="URL Slug"
                required
                fullWidth
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="pengembangan-web-enterprise"
              />

              <TextField
                label="Deskripsi Lengkap Layanan"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan secara rinci ruang lingkup layanan, keunggulan, teknologi yang digunakan..."
              />

              <TextField
                label="Urutan Tampil (Sort Order)"
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
                label="Status Aktif (Tampilkan di halaman publik)"
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
              {saving ? 'Menyimpan...' : 'Simpan Layanan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Layanan"
        itemName={deleteTarget?.title}
        itemSubtitle={deleteTarget?.slug ? `URL: /services/${deleteTarget.slug}` : undefined}
        description="Apakah Anda yakin ingin menghapus layanan ini?"
        warningText="Tindakan ini permanen. Layanan ini tidak akan tampil lagi di website."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
