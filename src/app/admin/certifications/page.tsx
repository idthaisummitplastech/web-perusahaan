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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ImageUpload from '@/components/admin/ImageUpload';
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';

interface Certification {
  id: number;
  title: string;
  issuer: string;
  certificateNumber: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  image: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    certificateNumber: '',
    issuedDate: '',
    expiryDate: '',
    image: '',
    description: '',
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
      const res = await fetch('/api/cms/certifications');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat daftar sertifikasi ISO.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Certification) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        issuer: item.issuer,
        certificateNumber: item.certificateNumber || '',
        issuedDate: item.issuedDate ? item.issuedDate.split('T')[0] : '',
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
        image: item.image || '',
        description: item.description || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        issuer: '',
        certificateNumber: '',
        issuedDate: '',
        expiryDate: '',
        image: '',
        description: '',
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
      const cleanFormData = {
        ...formData,
        issuedDate: formData.issuedDate && formData.issuedDate.trim() ? formData.issuedDate.trim() : null,
        expiryDate: formData.expiryDate && formData.expiryDate.trim() ? formData.expiryDate.trim() : null,
      };

      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...cleanFormData } : cleanFormData;

      const res = await fetch('/api/cms/certifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan sertifikasi.');
      }

      setMessage(editingItem ? 'Sertifikasi berhasil diperbarui!' : 'Sertifikasi baru berhasil ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) return;

    try {
      const res = await fetch(`/api/cms/certifications?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus sertifikasi.');
      setMessage('Sertifikasi berhasil dihapus.');
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus sertifikasi.');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <WorkspacePremiumIcon sx={{ color: '#018730', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={900} color="#0F172A">
              Sertifikasi ISO & Standar Mutu Pabrik
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Kelola sertifikat akreditasi internasional (IATF 16949, ISO 9001, ISO 14001, ISO 45001) sebagai bukti keunggulan mutu bagi klien & investor.
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
          Tambah Sertifikat ISO
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
            (item.issuer && item.issuer.toLowerCase().includes(q)) ||
            (item.certificateNumber && item.certificateNumber.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
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
              placeholder="Cari sertifikasi, penerbit, nomor sertifikat..."
              totalCount={items.length}
              filteredCount={filteredItems.length}
            />
            {loading ? (
              <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#018730' }} />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 80 }}>Badge</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Nama Sertifikasi</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Badan Penerbit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>No. Sertifikat</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Masa Berlaku</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada sertifikat yang cocok dengan pencarian.' : 'Belum ada data sertifikasi ISO. Klik tombol "Tambah Sertifikat ISO" di atas untuk menambahkan.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              {item.image ? (
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
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
                                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: '#e8f6ed',
                                    color: '#018730',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <VerifiedUserIcon fontSize="small" />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                              <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                              {item.description && (
                                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 300 }}>
                                  {item.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                              {item.issuer}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.8125rem' }}>
                              {item.certificateNumber || '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8125rem', color: '#475569' }}>
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Tetap Aktif'}
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

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Sertifikasi ISO' : 'Tambah Sertifikat ISO Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Nama Standar / Sertifikasi ISO"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: IATF 16949:2016 (Automotive Quality Management)"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Badan Sertifikasi / Penerbit"
                  required
                  fullWidth
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="Contoh: TÜV Rheinland / Lloyd's Register"
                />
                <TextField
                  label="Nomor Sertifikat / Akreditasi"
                  fullWidth
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  placeholder="Contoh: 01 111 024567"
                />
              </Stack>

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                label="Unggah Scan / Logo Sertifikat ISO"
                helperText="Unggah scan dokumen sertifikat atau badge resmi ISO (JPG, PNG, WEBP)"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Tanggal Terbit"
                  type="date"
                  fullWidth
                  value={formData.issuedDate}
                  onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: '1970-01-01', max: '2099-12-31' },
                  }}
                />
                <TextField
                  label="Masa Berlaku Hingga"
                  type="date"
                  fullWidth
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: '1970-01-01', max: '2099-12-31' },
                  }}
                />
              </Stack>

              <TextField
                label="Cakupan Mutu / Deskripsi Sertifikasi"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan ruang lingkup sertifikasi, misalnya: Manufaktur komponen stamping, pengelasan presisi, dan perakitan rangka bodi otomotif..."
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
              {saving ? 'Menyimpan...' : 'Simpan Sertifikat'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
