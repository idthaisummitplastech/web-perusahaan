'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageUpload from '@/components/admin/ImageUpload';
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';

export interface GalleryImageItem {
  url: string;
  title?: string;
  category?: string;
  description?: string;
}

export interface CustomPageItem {
  id: number;
  title: string;
  slug: string;
  templateType: 'gallery' | 'rich_text' | 'document';
  template_type?: 'gallery' | 'rich_text' | 'document';
  content: string | null;
  galleryImages: GalleryImageItem[] | string;
  gallery_images?: GalleryImageItem[] | string;
  metaTitle: string | null;
  meta_title?: string | null;
  metaDescription: string | null;
  meta_description?: string | null;
  sortOrder: number;
  sort_order?: number;
  isActive: boolean;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const TEMPLATE_OPTIONS = [
  {
    value: 'gallery',
    label: '📸 Galeri Foto / Dokumentasi',
    desc: 'Tampilan grid foto interaktif, kategori album, zoom modal (lightbox). Cocok untuk Galeri Pabrik, Event, Dokumentasi.',
    icon: <CollectionsIcon sx={{ color: '#018730' }} />,
  },
  {
    value: 'rich_text',
    label: '📝 Halaman Artikel Bebas / Profil',
    desc: 'Layout artikel elegan dengan typography modern. Cocok untuk Kebijakan Perusahaan, CSR, Visi Misi.',
    icon: <ArticleIcon sx={{ color: '#0284C7' }} />,
  },
  {
    value: 'document',
    label: '📄 Dokumen & Unduhan PDF',
    desc: 'Daftar unduhan berkas laporan, sertifikat, atau dokumen resmi perusahaan.',
    icon: <DescriptionIcon sx={{ color: '#D97706' }} />,
  },
];

export default function AdminCustomPagesPage() {
  const [items, setItems] = useState<CustomPageItem[]>([]); 
  const [deleteTarget, setDeleteTarget] = useState<DynamicPage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomPageItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template_type: 'gallery' as 'gallery' | 'rich_text' | 'document',
    content: '',
    meta_title: '',
    meta_description: '',
    sort_order: 0,
    is_active: true,
  });

  const [galleryList, setGalleryList] = useState<GalleryImageItem[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/pages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch {
      setError('Gagal memuat daftar halaman kustom.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: CustomPageItem) => {
    if (item) {
      setEditingItem(item);
      const template = (item.templateType || item.template_type || 'gallery') as any;
      let parsedGallery: GalleryImageItem[] = [];
      const rawG = item.galleryImages ?? item.gallery_images;
      if (Array.isArray(rawG)) {
        parsedGallery = rawG;
      } else if (typeof rawG === 'string') {
        try {
          parsedGallery = JSON.parse(rawG);
        } catch {
          parsedGallery = [];
        }
      }

      setFormData({
        title: item.title,
        slug: item.slug,
        template_type: template,
        content: item.content || '',
        meta_title: item.metaTitle || item.meta_title || '',
        meta_description: item.metaDescription || item.meta_description || '',
        sort_order: item.sortOrder ?? item.sort_order ?? 0,
        is_active: (item.isActive ?? item.is_active) !== false,
      });
      setGalleryList(parsedGallery);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        slug: '',
        template_type: 'gallery',
        content: '',
        meta_title: '',
        meta_description: '',
        sort_order: items.length + 1,
        is_active: true,
      });
      setGalleryList([]);
    }

    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoCategory('');
    setNewPhotoDesc('');
    setDialogOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const generatedSlug = prev.slug && editingItem ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        ...prev,
        title: val,
        slug: generatedSlug,
        meta_title: prev.meta_title ? prev.meta_title : `${val} — PT Indonesia Thai Summit Plastech`,
      };
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleAddPhotoToGallery = () => {
    if (!newPhotoUrl) {
      alert('Silakan pilih atau masukkan URL gambar terlebih dahulu.');
      return;
    }
    const newItem: GalleryImageItem = {
      url: newPhotoUrl,
      title: newPhotoTitle || undefined,
      category: newPhotoCategory || undefined,
      description: newPhotoDesc || undefined,
    };
    setGalleryList((prev) => [...prev, newItem]);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoCategory('');
    setNewPhotoDesc('');
  };

  const handleRemovePhotoFromGallery = (index: number) => {
    setGalleryList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const cleanSlug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (!cleanSlug) {
        throw new Error('Slug URL tidak boleh kosong.');
      }

      const payload = {
        title: formData.title,
        slug: cleanSlug,
        template_type: formData.template_type,
        content: formData.content,
        gallery_images: galleryList,
        meta_title: formData.meta_title || `${formData.title} — PT Indonesia Thai Summit Plastech`,
        meta_description: formData.meta_description || formData.content.slice(0, 160),
        sort_order: Number(formData.sort_order) || 0,
        is_active: formData.is_active,
      };

      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...payload } : payload;

      const res = await fetch('/api/cms/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan halaman.');
      }

      setMessage(editingItem ? 'Halaman berhasil diperbarui!' : 'Halaman kustom baru berhasil dibuat!');
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
      const res = await fetch(`/api/cms/pages?id=${deleteTarget.id}`, { method: 'DELETE' });
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
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <WebAssetIcon sx={{ color: '#018730', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={900} color="#0F172A">
              Kelola Halaman Dinamis (Pages CMS)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Buat dan atur halaman baru kapan saja (misal: Galeri Foto, Kebijakan K3, CSR, Event) tanpa perlu mengubah kode sumber.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#018730',
            color: '#FFFFFF',
            fontWeight: 800,
            borderRadius: '24px',
            px: 3,
            boxShadow: '0 4px 14px rgba(1, 135, 48, 0.25)',
            '&:hover': { bgcolor: '#016c27' },
          }}
        >
          Tambah Halaman Baru
        </Button>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Table Section */}
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <CmsTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari judul halaman atau slug URL..."
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
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Judul Halaman</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Tautan URL (Slug)</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Template Tampilan</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                        Belum ada halaman kustom. Klik tombol di atas untuk menambah halaman pertama!
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => {
                      const template = item.templateType || item.template_type || 'gallery';
                      const isActive = (item.isActive ?? item.is_active) !== false;
                      const rawImages = item.galleryImages ?? item.gallery_images;
                      const imgCount = Array.isArray(rawImages) ? rawImages.length : 0;

                      return (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {item.title}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0369A1', bgcolor: '#E0F2FE', px: 1, py: 0.3, borderRadius: 1 }}>
                                /{item.slug}
                              </Typography>
                              <IconButton
                                size="small"
                                component={Link}
                                href={`/${item.slug}`}
                                target="_blank"
                                sx={{ color: '#64748B', '&:hover': { color: '#018730' } }}
                                title="Buka Halaman Publik"
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={template === 'gallery' ? <CollectionsIcon fontSize="small" /> : <ArticleIcon fontSize="small" />}
                              label={
                                template === 'gallery'
                                  ? `Galeri Foto (${imgCount} item)`
                                  : template === 'rich_text'
                                  ? 'Artikel Bebas'
                                  : 'Dokumen Unduhan'
                              }
                              size="small"
                              sx={{
                                bgcolor: template === 'gallery' ? '#E8F6ED' : '#E0F2FE',
                                color: template === 'gallery' ? '#018730' : '#0369A1',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isActive ? 'Aktif' : 'Draft / Nonaktif'}
                              size="small"
                              sx={{
                                bgcolor: isActive ? '#E8F6ED' : '#F1F5F9',
                                color: isActive ? '#018730' : '#64748B',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id, item.slug)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>

      {/* Form Modal Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 900, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {editingItem ? 'Edit Halaman Dinamis' : 'Buat Halaman Dinamis Baru'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <TextField
                    label="Judul Halaman"
                    required
                    fullWidth
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Galeri Dokumentasi & Fasilitas Pabrik"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="URL Slug (Tautan Halaman)"
                    required
                    fullWidth
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="galery"
                    helperText={`Akan dapat diakses di: /${formData.slug || 'url-halaman'}`}
                  />
                </Grid>
              </Grid>

              {/* Template Selector */}
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
                  Pilih Template Tampilan Halaman:
                </Typography>
                <Grid container spacing={2}>
                  {TEMPLATE_OPTIONS.map((tpl) => {
                    const isSelected = formData.template_type === tpl.value;
                    return (
                      <Grid item xs={12} sm={4} key={tpl.value}>
                        <Card
                          onClick={() => setFormData({ ...formData, template_type: tpl.value as any })}
                          sx={{
                            cursor: 'pointer',
                            p: 2,
                            height: '100%',
                            border: isSelected ? '2px solid #018730' : '1px solid #E2E8F0',
                            bgcolor: isSelected ? '#F0FDF4' : '#FFFFFF',
                            boxShadow: isSelected ? '0 4px 14px rgba(1, 135, 48, 0.15)' : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: '#018730' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {tpl.icon}
                            <Typography variant="subtitle2" fontWeight={800} color={isSelected ? '#018730' : '#1E293B'}>
                              {tpl.label}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                            {tpl.desc}
                          </Typography>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Description / Content Text */}
              <TextField
                label="Deskripsi / Teks Pengantar Halaman"
                multiline
                rows={3}
                fullWidth
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tuliskan kata pengantar atau isi teks lengkap untuk halaman ini..."
              />

              {/* Gallery Section if template is gallery */}
              {formData.template_type === 'gallery' && (
                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CollectionsIcon sx={{ color: '#018730' }} />
                    Foto Dokumentasi Galeri ({galleryList.length} Foto)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Tambahkan foto dokumentasi pabrik, fasilitas, event, atau kunjungan audit ke dalam galeri halaman ini.
                  </Typography>

                  {/* Existing Photos Grid */}
                  {galleryList.length > 0 && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {galleryList.map((item, idx) => (
                        <Grid item xs={12} sm={4} md={3} key={idx}>
                          <Card sx={{ borderRadius: 2, position: 'relative', border: '1px solid #E2E8F0' }}>
                            <CardMedia component="img" height="120" image={item.url} alt={item.title || `Foto ${idx + 1}`} />
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography variant="caption" fontWeight={800} color="#0F172A" noWrap sx={{ display: 'block' }}>
                                {item.title || `Foto #${idx + 1}`}
                              </Typography>
                              {item.category && (
                                <Chip label={item.category} size="small" sx={{ fontSize: '0.65rem', height: 18, mt: 0.5 }} />
                              )}
                            </CardContent>
                            <IconButton
                              size="small"
                              onClick={() => handleRemovePhotoFromGallery(idx)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(239, 68, 68, 0.85)',
                                color: '#FFFFFF',
                                '&:hover': { bgcolor: '#DC2626' },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* Add New Photo Form */}
                  <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#1E293B" sx={{ mb: 1.5 }}>
                      + Unggah & Tambahkan Foto Baru:
                    </Typography>
                    <ImageUpload
                      value={newPhotoUrl}
                      onChange={setNewPhotoUrl}
                      label="Pilih / Unggah Berkas Foto"
                      helperText="Unggah foto beresolusi tinggi (JPG, PNG, WEBP)"
                    />
                    {newPhotoUrl && (
                      <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Judul Foto / Keterangan"
                            value={newPhotoTitle}
                            onChange={(e) => setNewPhotoTitle(e.target.value)}
                            placeholder="Contoh: Lini Produksi Mesin 3000T"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Kategori / Album"
                            value={newPhotoCategory}
                            onChange={(e) => setNewPhotoCategory(e.target.value)}
                            placeholder="Contoh: Fasilitas Pabrik, Event, dll."
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Deskripsi Tambahan (Opsional)"
                            value={newPhotoDesc}
                            onChange={(e) => setNewPhotoDesc(e.target.value)}
                            placeholder="Penjelasan singkat mengenai foto ini..."
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'right' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddPhotoToGallery}
                            startIcon={<AddPhotoAlternateIcon />}
                            sx={{ bgcolor: '#018730', '&:hover': { bgcolor: '#016c27' } }}
                          >
                            Masukkan ke Galeri
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                </Box>
              )}

              {/* Status & Sort Order */}
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      color="success"
                    />
                  }
                  label="Publikasikan Halaman Ini (Aktif)"
                />
                <TextField
                  type="number"
                  size="small"
                  label="Nomor Urutan"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  sx={{ width: 140 }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#64748B' }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: '#018730', fontWeight: 800, '&:hover': { bgcolor: '#016c27' } }}
            >
              {saving ? <CircularProgress size={22} color="inherit" /> : 'Simpan Halaman'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Halaman Dinamis"
        itemName={deleteTarget?.title}
        itemSubtitle={`URL: /${deleteTarget?.slug}`}
        description="Apakah Anda yakin ingin menghapus halaman kustom ini?"
        warningText="Tindakan ini permanen. Halaman beserta seluruh konten di dalamnya akan dihapus dari web."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
