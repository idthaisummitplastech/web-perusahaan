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

interface Faq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFaqsPage() {
  const [items, setItems] = useState<Faq[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Faq | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
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
      const res = await fetch('/api/cms/faqs');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat FAQ.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Faq) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question: item.question,
        answer: item.answer,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        question: '',
        answer: '',
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

      const res = await fetch('/api/cms/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan FAQ.');

      setMessage(editingItem ? 'FAQ diperbarui!' : 'FAQ baru ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/faqs?id=${deleteTarget.id}`, { method: 'DELETE' });
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
            Manajemen Tanya Jawab (FAQ)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Kelola daftar pertanyaan yang sering diajukan dan jawaban resminya.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
        >
          Tambah FAQ
        </Button>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {(() => {
        const filteredItems = items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            (item.question && item.question.toLowerCase().includes(q)) ||
            (item.answer && item.answer.toLowerCase().includes(q))
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
              placeholder="Cari pertanyaan, jawaban..."
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
                        <TableCell sx={{ fontWeight: 700 }}>Pertanyaan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Jawaban</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Urutan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada FAQ yang cocok dengan pencarian.' : 'Belum ada data tanya jawab (FAQ).'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A', maxWidth: 300 }}>{item.question}</TableCell>
                            <TableCell sx={{ color: 'text.secondary', maxWidth: 400 }}>
                              <Typography variant="body2" noWrap>{item.answer}</Typography>
                            </TableCell>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit FAQ' : 'Tambah FAQ Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Pertanyaan"
                required
                fullWidth
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Apakah seluruh konten dapat diedit?"
              />

              <TextField
                label="Jawaban Lengkap"
                required
                fullWidth
                multiline
                rows={4}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Ya, tentu saja. Seluruh bagian dapat disesuaikan langsung dari dashboard..."
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
              {saving ? 'Menyimpan...' : 'Simpan FAQ'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Tanya Jawab (FAQ)"
        itemName={deleteTarget?.question}
        itemSubtitle={deleteTarget?.category ? `Kategori: ${deleteTarget.category}` : undefined}
        description="Apakah Anda yakin ingin menghapus butir FAQ ini?"
        warningText="Tindakan ini permanen. Pertanyaan ini tidak akan tampil lagi di halaman bantuan FAQ."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
