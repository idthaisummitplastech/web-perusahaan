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

import { CmsTableToolbar, CmsTablePagination } from '@/components/admin/CmsTablePagination';

interface HeroSection {
  id: number;
  page: string;
  title: string;
  subtitle: string | null;
  primaryBtnText: string | null;
  primaryBtnUrl: string | null;
  secondaryBtnText: string | null;
  secondaryBtnUrl: string | null;
  isActive: boolean;
}

export default function AdminHeroSectionsPage() {
  const [items, setItems] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroSection | null>(null);
  const [formData, setFormData] = useState({
    page: 'home',
    title: '',
    subtitle: '',
    primaryBtnText: '',
    primaryBtnUrl: '',
    secondaryBtnText: '',
    secondaryBtnUrl: '',
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
      const res = await fetch('/api/cms/hero-sections');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat hero sections.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: HeroSection) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        page: item.page,
        title: item.title,
        subtitle: item.subtitle || '',
        primaryBtnText: item.primaryBtnText || '',
        primaryBtnUrl: item.primaryBtnUrl || '',
        secondaryBtnText: item.secondaryBtnText || '',
        secondaryBtnUrl: item.secondaryBtnUrl || '',
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        page: 'home',
        title: '',
        subtitle: '',
        primaryBtnText: 'Mulai Sekarang',
        primaryBtnUrl: '/contact',
        secondaryBtnText: 'Pelajari Layanan',
        secondaryBtnUrl: '/services',
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

      const res = await fetch('/api/cms/hero-sections', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan hero section.');

      setMessage(editingItem ? 'Hero section berhasil diperbarui!' : 'Hero section baru berhasil ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus hero section ini?')) return;
    try {
      const res = await fetch(`/api/cms/hero-sections?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setMessage('Hero section berhasil dihapus!');
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
            Manajemen Hero Sections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ubah judul banner utama, subjudul, dan tombol Call to Action pada setiap halaman.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
        >
          Tambah Hero
        </Button>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <CmsTableToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPage(0); }}
          placeholder="Cari hero section (halaman, judul, tombol)..."
          totalCount={items.length}
          filteredCount={items.filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              item.page.toLowerCase().includes(q) ||
              item.title.toLowerCase().includes(q) ||
              (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
              (item.primaryBtnText && item.primaryBtnText.toLowerCase().includes(q)) ||
              (item.secondaryBtnText && item.secondaryBtnText.toLowerCase().includes(q))
            );
          }).length}
        />

        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#F59E0B' }} />
          </Box>
        ) : (
          (() => {
            const filteredItems = items.filter((item) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                item.page.toLowerCase().includes(q) ||
                item.title.toLowerCase().includes(q) ||
                (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
                (item.primaryBtnText && item.primaryBtnText.toLowerCase().includes(q)) ||
                (item.secondaryBtnText && item.secondaryBtnText.toLowerCase().includes(q))
              );
            });
            const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

            return (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 720, tableLayout: 'fixed' }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 110 }}>Halaman</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '36%' }}>Judul Hero</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '22%' }}>Tombol Utama</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '22%' }}>Tombol Sekunder</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 95 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, width: 90 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                            {searchQuery ? 'Tidak ada hero section yang sesuai dengan kata kunci pencarian.' : 'Belum ada data hero section.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>
                              <Chip label={item.page} size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }} />
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden', pr: 2 }}>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  color: '#0F172A',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.3,
                                }}
                              >
                                {item.title.replace(/<[^>]*>?/gm, '')}
                              </Typography>
                              {item.subtitle && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    mt: 0.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {item.subtitle}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden', pr: 2 }}>
                              {item.primaryBtnText ? (
                                <Box sx={{ wordBreak: 'break-word' }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A', fontSize: '0.82rem' }}>
                                    {item.primaryBtnText}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', wordBreak: 'break-all' }}>
                                    {item.primaryBtnUrl}
                                  </Typography>
                                </Box>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden', pr: 2 }}>
                              {item.secondaryBtnText ? (
                                <Box sx={{ wordBreak: 'break-word' }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A', fontSize: '0.82rem' }}>
                                    {item.secondaryBtnText}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', wordBreak: 'break-all' }}>
                                    {item.secondaryBtnUrl}
                                  </Typography>
                                </Box>
                              ) : (
                                '-'
                              )}
                            </TableCell>
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
                  onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            );
          })()
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Hero Section' : 'Tambah Hero Section Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Target Halaman (slug)"
                required
                fullWidth
                value={formData.page}
                onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                placeholder="home, services, contact, dll."
              />

              <TextField
                label="Judul Hero (Bisa gunakan tag <span> untuk warna highlight)"
                required
                fullWidth
                multiline
                rows={2}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Membangun Masa Depan <span style='color:#f59e0b;'>Digital</span>"
              />

              <TextField
                label="Subjudul Hero"
                fullWidth
                multiline
                rows={3}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Deskripsi pendukung judul hero..."
              />

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Tombol Aksi Utama (Primary CTA)
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Teks Tombol"
                    fullWidth
                    value={formData.primaryBtnText}
                    onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                  />
                  <TextField
                    label="URL Tujuan"
                    fullWidth
                    value={formData.primaryBtnUrl}
                    onChange={(e) => setFormData({ ...formData, primaryBtnUrl: e.target.value })}
                  />
                </Stack>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Tombol Aksi Sekunder (Secondary CTA)
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Teks Tombol"
                    fullWidth
                    value={formData.secondaryBtnText}
                    onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                  />
                  <TextField
                    label="URL Tujuan"
                    fullWidth
                    value={formData.secondaryBtnUrl}
                    onChange={(e) => setFormData({ ...formData, secondaryBtnUrl: e.target.value })}
                  />
                </Stack>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="warning"
                  />
                }
                label="Status Aktif (Tampilkan pada halaman)"
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
              {saving ? 'Menyimpan...' : 'Simpan Hero Section'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
