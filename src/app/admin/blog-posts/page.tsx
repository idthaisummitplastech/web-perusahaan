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

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function AdminBlogPostsPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Admin Portal',
    isPublished: true,
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
      const res = await fetch('/api/cms/blog-posts');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat artikel.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: BlogPost) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || '',
        content: item.content,
        author: item.author || 'Admin Portal',
        isPublished: item.isPublished,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '<h2>Pendahuluan</h2><p>Tuliskan konten artikel Anda di sini...</p>',
        author: 'Admin Portal',
        isPublished: true,
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
      const body = editingItem
        ? { id: editingItem.id, ...formData, publishedAt: new Date().toISOString() }
        : { ...formData, publishedAt: new Date().toISOString() };

      const res = await fetch('/api/cms/blog-posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan artikel.');
      }

      setMessage(editingItem ? 'Artikel berhasil diperbarui!' : 'Artikel baru berhasil diterbitkan!');
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
      const res = await fetch(`/api/cms/blog-posts?id=${deleteTarget.id}`, { method: 'DELETE' });
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
            Manajemen Artikel & Blog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tulis, sunting, dan publikasikan artikel wawasan teknologi serta pengumuman perusahaan.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
        >
          Tulis Artikel
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
            (item.author && item.author.toLowerCase().includes(q)) ||
            (item.slug && item.slug.toLowerCase().includes(q)) ||
            (item.excerpt && item.excerpt.toLowerCase().includes(q))
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
              placeholder="Cari artikel, penulis, slug, kutipan..."
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
                        <TableCell sx={{ fontWeight: 700 }}>Judul Artikel</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Penulis</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>URL Slug</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada artikel yang cocok dengan pencarian.' : 'Belum ada data artikel. Klik tombol "Tulis Artikel" di atas untuk menambahkan.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                              <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                              {item.excerpt && (
                                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 350 }}>
                                  {item.excerpt}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>{item.author || '-'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#64748B' }}>/blog/{item.slug}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.isPublished ? 'Terbit' : 'Draf'}
                                size="small"
                                sx={{
                                  bgcolor: item.isPublished ? '#ECFDF5' : '#F1F5F9',
                                  color: item.isPublished ? '#047857' : '#64748B',
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
            {editingItem ? 'Edit Artikel Blog' : 'Tulis Artikel Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Judul Artikel"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Mengapa Multi-Factor Authentication Wajib untuk Keamanan Perusahaan"
              />

              <TextField
                label="URL Slug"
                required
                fullWidth
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="mengapa-mfa-wajib"
              />

              <TextField
                label="Nama Penulis"
                fullWidth
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />

              <TextField
                label="Ringkasan Singkat (Excerpt)"
                fullWidth
                multiline
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Ringkasan 1-2 kalimat yang tampil pada kartu daftar artikel..."
              />

              <TextField
                label="Isi Konten Artikel (Format HTML didukung)"
                required
                fullWidth
                multiline
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<h2>Subjudul</h2><p>Paragraf isi artikel...</p>"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    color="warning"
                  />
                }
                label="Status Terbit (Publikasikan ke pembaca)"
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
              {saving ? 'Menyimpan...' : 'Simpan & Publikasikan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Artikel Blog"
        itemName={deleteTarget?.title}
        itemSubtitle={deleteTarget?.slug ? `URL: /blog/${deleteTarget.slug}` : undefined}
        description="Apakah Anda yakin ingin menghapus artikel blog ini?"
        warningText="Tindakan ini permanen. Seluruh konten artikel akan dihapus dari sistem."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
