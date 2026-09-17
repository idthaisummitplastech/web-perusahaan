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
import CollectionsIcon from '@mui/icons-material/Collections';
import ImageUpload from '@/components/admin/ImageUpload';
import { CmsTableToolbar, CmsTablePagination } from '@/components/admin/CmsTablePagination';
import { parseFacilityImages, serializeFacilityImages } from '@/lib/facilities';

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
  'Injection Molding',
  'Painting',
  'Welding & Assembly',
  'Assembly',
  'Quality & CMM Laboratory',
  'Automated Warehouse & Logistics',
  'Eco Factory & Solar PV',
];

export default function AdminFacilitiesPage() {
  const [items, setItems] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Facility | null>(null);
  const [facilityImages, setFacilityImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Injection Molding',
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
        category: item.category || 'Injection Molding',
        image: item.image || '',
        description: item.description || '',
        specifications: item.specifications || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive,
      });
      setFacilityImages(parseFacilityImages(item.image));
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        category: 'Injection Molding',
        image: '',
        description: '',
        specifications: '',
        sortOrder: items.length + 1,
        isActive: true,
      });
      setFacilityImages([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFacilityImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const finalImage = serializeFacilityImages(facilityImages);
      const payload = { ...formData, image: finalImage };
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...payload } : payload;

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
        <CmsTableToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPage(0); }}
          placeholder="Cari fasilitas (nama, kategori, spesifikasi)..."
          totalCount={items.length}
          filteredCount={items.filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              item.title.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q)) ||
              (item.specifications && item.specifications.toLowerCase().includes(q))
            );
          }).length}
        />

        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#018730' }} />
          </Box>
        ) : (
          (() => {
            const filteredItems = items.filter((item) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                item.title.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                (item.description && item.description.toLowerCase().includes(q)) ||
                (item.specifications && item.specifications.toLowerCase().includes(q))
              );
            });
            const paginatedItems = filteredItems.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

            return (
              <>
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
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada fasilitas pabrik yang sesuai dengan kata kunci pencarian.' : 'Belum ada data fasilitas pabrik.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              {(() => {
                                const rowImages = parseFacilityImages(item.image);
                                const firstImg = rowImages[0];
                                const hasMultiple = rowImages.length > 1;

                                return firstImg ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
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
                                      <img
                                        src={firstImg}
                                        alt={item.title}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    </Box>
                                    {hasMultiple && (
                                      <Chip
                                        size="small"
                                        icon={<CollectionsIcon sx={{ fontSize: '11px !important' }} />}
                                        label={`${rowImages.length} Foto`}
                                        sx={{
                                          height: 18,
                                          fontSize: '0.625rem',
                                          fontWeight: 800,
                                          bgcolor: '#e8f6ed',
                                          color: '#018730',
                                          px: 0.3,
                                        }}
                                      />
                                    )}
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      width: 54,
                                      height: 54,
                                      borderRadius: 2,
                                      bgcolor: '#F1F5F9',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#94A3B8',
                                    }}
                                  >
                                    <PrecisionManufacturingIcon />
                                  </Box>
                                );
                              })()}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                              <Typography variant="body2" fontWeight={700}>
                                {item.title}
                              </Typography>
                              {item.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    mt: 0.5,
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.category}
                                size="small"
                                sx={{
                                  bgcolor: '#E0F2FE',
                                  color: '#0369A1',
                                  fontWeight: 700,
                                  border: '1px solid #BAE6FD',
                                }}
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

              {/* Multi-Photo Facility Upload Section */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                  Foto Galeri Fasilitas / Mesin Pabrik
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                  Anda dapat mengunggah beberapa foto sekaligus untuk 1 mesin/fasilitas (contoh: tampak depan mesin, sudut samping, panel kontrol otomatis, atau hasil komponen).
                </Typography>

                {/* List of uploaded facility photos */}
                {facilityImages.length > 0 && (
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {facilityImages.map((imgUrl, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.2,
                          bgcolor: '#FFFFFF',
                          borderRadius: 2,
                          border: '1px solid #CBD5E1',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 1.5,
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '1px solid #E2E8F0',
                              bgcolor: '#F1F5F9',
                              p: 0.2,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {idx === 0 ? 'Foto 1 (Foto Utama / Sampul)' : `Foto ${idx + 1} (Foto Tambahan / Sudut ${idx + 1})`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontFamily: 'monospace' }} noWrap>
                              {imgUrl}
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setFacilityImages((prev) => prev.filter((_, i) => i !== idx))}
                          title="Hapus foto ini"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}

                <ImageUpload
                  value=""
                  onChange={(url) => {
                    if (url) {
                      setFacilityImages((prev) => [...prev, url]);
                    }
                  }}
                  label={facilityImages.length === 0 ? 'Unggah Foto Fasilitas / Mesin' : '+ Tambah Foto Tambahan'}
                  helperText="Unggah foto area produksi, mesin press, robotic cell, atau lab QC (JPG, PNG, WEBP). Bisa lebih dari 1 foto."
                />
              </Box>

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
