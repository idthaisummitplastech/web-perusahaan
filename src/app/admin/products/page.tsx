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
  InputAdornment,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ImageUpload from '@/components/admin/ImageUpload';
import { CmsTableToolbar, CmsTablePagination } from '@/components/admin/CmsTablePagination';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';

interface Product {
  id: number;
  title: string;
  category: string;
  description: string | null;
  slug: string;
  price: number | null;
  image: string | null;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mobil' | 'motor'>('all');
  const [formData, setFormData] = useState({
    title: '',
    category: 'mobil',
    description: '',
    slug: '',
    price: '',
    image: '',
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
      const res = await fetch('/api/cms/products');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Product) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        category: item.category || 'mobil',
        description: item.description || '',
        slug: item.slug,
        price: item.price ? String(item.price) : '',
        image: item.image || '',
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        category: activeTab === 'motor' ? 'motor' : 'mobil',
        description: '',
        slug: '',
        price: '',
        image: '',
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

      const res = await fetch('/api/cms/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data produk.');

      setMessage(editingItem ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
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
      const res = await fetch(`/api/cms/products?id=${deleteTarget.id}`, { method: 'DELETE' });
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

  const filteredItems = items.filter((item) => {
    if (activeTab === 'mobil' && item.category === 'motor') return false;
    if (activeTab === 'motor' && item.category !== 'motor') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.slug.toLowerCase().includes(q)
    );
  });

  const paginatedItems = filteredItems.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">
            Manajemen Produk & Komponen
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Kelola katalog suku cadang plastik otomotif roda empat (mobil) dan roda dua (motor).
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
          Tambah Produk
        </Button>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Filter Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', px: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTabs-indicator': { bgcolor: '#018730', height: 3, borderRadius: 1.5 },
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', py: 1.8 },
            '& .Mui-selected': { color: '#018730 !important', fontWeight: 800 },
          }}
        >
          <Tab label="Semua Komponen" value="all" />
          <Tab
            icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Mobil / 4-Wheeler"
            value="mobil"
          />
          <Tab
            icon={<TwoWheelerIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Sepeda Motor / 2-Wheeler"
            value="motor"
          />
        </Tabs>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <CmsTableToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPage(0); }}
          placeholder="Cari produk (nama, deskripsi, slug)..."
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
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>Foto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nama Produk</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Harga / MOQ</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>URL Slug</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                        {searchQuery ? 'Tidak ada produk yang sesuai dengan kata kunci pencarian.' : 'Tidak ada produk dalam kategori ini.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          {item.image ? (
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid #E2E8F0',
                                bgcolor: '#0B1320',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 0.5,
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 2,
                                bgcolor: '#F1F5F9',
                                color: '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <ImageIcon fontSize="small" />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                          <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                          {item.description && (
                            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 360 }}>
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={item.category === 'motor' ? <TwoWheelerIcon sx={{ fontSize: '14px !important' }} /> : <DirectionsCarIcon sx={{ fontSize: '14px !important' }} />}
                            label={item.category === 'motor' ? 'Motor (2W)' : 'Mobil (4W)'}
                            size="small"
                            sx={{
                              bgcolor: item.category === 'motor' ? '#FEF3C7' : '#EFF6FF',
                              color: item.category === 'motor' ? '#B45309' : '#1D4ED8',
                              fontWeight: 800,
                              border: item.category === 'motor' ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#018730' }}>
                          {item.price ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : 'Hubungi Kami'}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.8rem' }}>
                          /products/{item.slug}
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
              onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem ? 'Edit Produk Solusi' : 'Tambah Produk Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                select
                label="Kategori Kendaraan"
                required
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                helperText="Pilih apakah suku cadang ini untuk mobil (roda empat) atau sepeda motor (roda dua)"
              >
                <MenuItem value="mobil">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCarIcon sx={{ fontSize: 18, color: '#1D4ED8' }} />
                    <span>🚗 Mobil / 4-Wheeler (Instrument Panel, Bumper, Door Trim, Console Box)</span>
                  </Box>
                </MenuItem>
                <MenuItem value="motor">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TwoWheelerIcon sx={{ fontSize: 18, color: '#D97706' }} />
                    <span>🏍️ Sepeda Motor / 2-Wheeler (Seat Assembly, Foaming, Luggage Box)</span>
                  </Box>
                </MenuItem>
              </TextField>

              <TextField
                label="Nama Produk"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Instrument Panel Set — Mitsubishi Xpander"
              />

              <TextField
                label="URL Slug"
                required
                fullWidth
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="instrument-panel-mitsubishi-xpander"
              />

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                label="Foto Komponen / Produk Pabrik"
                helperText="Unggah foto part injection molding atau komponen interior hasil manufaktur (JPG, PNG, WEBP)"
              />

              <TextField
                label="Perkiraan Harga / MOQ (Rp)"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Kosongkan jika harga berdasarkan spesifikasi penawaran"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  },
                }}
              />

              <TextField
                label="Deskripsi Lengkap Produk"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan spesifikasi material (PP, ABS, POM, PU Foam), proses finishing (Matted Painting, Laser Scoring Airbag), toleransi mikron..."
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
                label="Status Aktif (Tampilkan di katalog)"
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
              {saving ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Produk"
        itemName={deleteTarget?.title}
        itemSubtitle={`Kategori: ${deleteTarget?.category} • Slug: /${deleteTarget?.slug}`}
        description="Apakah Anda yakin ingin menghapus produk ini dari katalog?"
        warningText="Tindakan ini permanen. Gambar dan detail produk akan dihapus dari sistem."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
