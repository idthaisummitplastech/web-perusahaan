'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Chip, Alert, CircularProgress, Stack, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';

interface SustainabilityReport {
  id: number; title: string; category: string;
  categoryTitleEn: string | null; categoryTitleId: string | null;
  categoryDescEn: string | null; categoryDescId: string | null;
  categoryBadge: string | null; fileUrl: string; fileType: string;
  fileSize: string | null; tag: string | null; sortOrder: number; isActive: boolean;
}

const REPORT_CATEGORIES = [
  { id: 'general-waste', label: 'General Waste (Sampah Umum)' },
  { id: 'ghg', label: 'GHG / Karbon (Gas Rumah Kaca)' },
  { id: 'b3', label: 'Limbah B3 (Hazardous)' },
  { id: 'water', label: 'Air & Air Limbah (Water)' },
  { id: 'general', label: 'Umum / Lainnya' },
];
const FILE_TYPES = ['PDF', 'XLSX', 'XLS', 'DOCX', 'CSV'];

export default function AdminSustainabilityReportsPage() {
  const [items, setItems] = useState<SustainabilityReport[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SustainabilityReport | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SustainabilityReport | null>(null);
  const [formData, setFormData] = useState({ title: '', category: 'general-waste', categoryTitleEn: '', categoryTitleId: '', categoryDescEn: '', categoryDescId: '', categoryBadge: '', fileUrl: '', fileType: 'PDF', fileSize: '', tag: '', sortOrder: 0, isActive: true });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/sustainability-reports');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch { setError('Gagal memuat laporan sustainability.'); }
    finally { setLoading(false); }
  };
  const handleOpenDialog = (item?: SustainabilityReport) => {
    if (item) {
      setEditingItem(item);
      setFormData({ title: item.title, category: item.category || 'general-waste', categoryTitleEn: item.categoryTitleEn || '', categoryTitleId: item.categoryTitleId || '', categoryDescEn: item.categoryDescEn || '', categoryDescId: item.categoryDescId || '', categoryBadge: item.categoryBadge || '', fileUrl: item.fileUrl || '', fileType: item.fileType || 'PDF', fileSize: item.fileSize || '', tag: item.tag || '', sortOrder: item.sortOrder || 0, isActive: item.isActive });
    } else {
      setEditingItem(null);
      setFormData({ title: '', category: 'general-waste', categoryTitleEn: '', categoryTitleId: '', categoryDescEn: '', categoryDescId: '', categoryBadge: '', fileUrl: '', fileType: 'PDF', fileSize: '', tag: '', sortOrder: items.length + 1, isActive: true });
    }
    setDialogOpen(true);
  };
  const handleCloseDialog = () => { setDialogOpen(false); setEditingItem(null); };
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true); setError('');
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload.');
      const kb = file.size / 1024;
      const label = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${Math.round(kb)} KB`;
      const ext = file.name.toLowerCase();
      const ftype = (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv')) ? 'XLSX' : 'PDF';
      setFormData((p) => ({ ...p, fileUrl: data.url, fileSize: label, fileType: ftype }));
    } catch (e: any) { setError(e.message || 'Failed to upload.'); }
    finally { setUploading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Judul wajib diisi.'); return; }
    if (!formData.fileUrl.trim()) { setError('File URL wajib diisi.'); return; }
    setSaving(true); setError('');
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...formData } : formData;
      const res = await fetch('/api/cms/sustainability-reports', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to save.'); }
      setMessage(editingItem ? 'Laporan diperbarui!' : 'Laporan ditambahkan, tampil di /news!');
      handleCloseDialog(); fetchItems();
    } catch (e: any) { setError(e.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/sustainability-reports?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || data?.message || 'Failed to delete.');
      }
      setMessage('Data berhasil dihapus!');
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };
  const catLabel = (id: string) => REPORT_CATEGORIES.find((c) => c.id === id)?.label || id;
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <AssessmentIcon sx={{ color: '#018730', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={900} color="#0F172A">News & Sustainability Reports</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Kelola dokumen ESG untuk halaman publik /news. Perubahan langsung tampil.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#018730', fontWeight: 700, borderRadius: 2.5, px: 3, '&:hover': { bgcolor: '#016f27' } }}>Tambah Dokumen</Button>
      </Box>
      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {(() => {
        const fq = searchQuery.trim().toLowerCase();
        const filtered = items.filter((it) => !fq || (it.title || '').toLowerCase().includes(fq) || (it.category || '').toLowerCase().includes(fq) || (it.tag || '').toLowerCase().includes(fq));
        const paged = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
        return (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <CmsTableToolbar searchQuery={searchQuery} onSearchChange={(v) => { setSearchQuery(v); setPage(0); }} placeholder="Cari dokumen, kategori, tag..." totalCount={items.length} filteredCount={filtered.length} />
            {loading ? (<Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: '#018730' }} /></Box>) : (
              <>
                <TableContainer><Table><TableHead sx={{ bgcolor: '#F8FAFC' }}><TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>Tipe</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Judul Dokumen</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Berkas</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                </TableRow></TableHead><TableBody>
                  {paged.length === 0 ? (<TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>{searchQuery ? 'Tidak cocok.' : 'Belum ada dokumen.'}</TableCell></TableRow>) : (paged.map((it) => (
                    <TableRow key={it.id} hover>
                      <TableCell>{it.fileType === 'PDF' ? <PictureAsPdfIcon sx={{ color: '#dc2626' }} /> : <TableChartIcon sx={{ color: '#018730' }} />}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}><Typography variant="body2" fontWeight={700}>{it.title}</Typography><Typography variant="caption" color="text.secondary">{it.fileSize || '-'} {it.tag ? `• ${it.tag}` : ''}</Typography></TableCell>
                      <TableCell><Chip label={catLabel(it.category)} size="small" sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 700 }} /></TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.fileUrl}</TableCell>
                      <TableCell><Chip label={it.isActive ? 'Aktif' : 'Nonaktif'} size="small" sx={{ bgcolor: it.isActive ? '#e8f6ed' : '#F1F5F9', color: it.isActive ? '#018730' : '#64748B', fontWeight: 700 }} /></TableCell>
                      <TableCell align="right"><IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(it)}><EditIcon fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  )))}
                </TableBody></Table></TableContainer>
                <CmsTablePagination count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={setPage} onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }} />
              </>
            )}
          </Paper>
        );
      })()}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>{editingItem ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}</DialogTitle>
          <DialogContent dividers><Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField label="Judul Dokumen" required fullWidth value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Kategori" required fullWidth value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>{REPORT_CATEGORIES.map((c) => (<MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>))}</TextField>
              <TextField select label="Tipe" fullWidth value={formData.fileType} onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}>{FILE_TYPES.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}</TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Judul Kategori (EN)" fullWidth value={formData.categoryTitleEn} onChange={(e) => setFormData({ ...formData, categoryTitleEn: e.target.value })} />
              <TextField label="Judul Kategori (ID)" fullWidth value={formData.categoryTitleId} onChange={(e) => setFormData({ ...formData, categoryTitleId: e.target.value })} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Badge" fullWidth value={formData.categoryBadge} onChange={(e) => setFormData({ ...formData, categoryBadge: e.target.value })} />
              <TextField label="Tag" fullWidth value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} />
            </Stack>
            <Box sx={{ p: 2, borderRadius: 2, border: '1.5px dashed #CBD5E1', bgcolor: '#F8FAFC' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Berkas Dokumen</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                <Button variant="outlined" component="label" disabled={uploading} sx={{ fontWeight: 700 }}>{uploading ? 'Mengunggah...' : 'Upload PDF / Excel'}<input type="file" hidden accept=".pdf,.xlsx,.xls,.csv,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} /></Button>
                <TextField label="atau tempel URL" fullWidth size="small" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} />
              </Stack>
              {formData.fileUrl && (<Typography variant="caption" color="#018730" sx={{ mt: 1, display: 'block', wordBreak: 'break-all' }}>✓ {formData.fileUrl} {formData.fileSize ? `(${formData.fileSize})` : ''}</Typography>)}
            </Box>
            <Stack direction="row" spacing={3} alignItems="center">
              <TextField label="Urutan" type="number" sx={{ width: 140 }} value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
              <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Aktif di /news" />
            </Stack>
          </Stack></DialogContent>
          <DialogActions sx={{ p: 2.5 }}><Button onClick={handleCloseDialog} color="inherit">Batal</Button><Button type="submit" variant="contained" disabled={saving || uploading} sx={{ bgcolor: '#018730', fontWeight: 700 }}>Simpan</Button></DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Sustainability Report"
        itemName={deleteTarget?.title}
        itemSubtitle={`Tahun Laporan: ${deleteTarget?.year || "-"}`}
        description="Apakah Anda yakin ingin menghapus laporan keberlanjutan ini?"
        warningText="Tindakan ini permanen. File PDF laporan akan dihapus dari sistem."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

