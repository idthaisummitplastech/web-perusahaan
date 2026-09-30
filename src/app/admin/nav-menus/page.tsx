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
  Tabs,
  Tab,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import WebIcon from '@mui/icons-material/Web';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface NavMenu {
  id: number;
  title: string;
  url: string;
  location: string;
  section: string | null;
  sortOrder: number;
  isActive: boolean;
  isMaintenance?: boolean;
  is_maintenance?: boolean;
  parentId: number | null;
}

export default function AdminNavMenusPage() {
  const [items, setItems] = useState<NavMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'navbar' | 'footer'>('navbar');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavMenu | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    location: 'navbar',
    section: '',
    parentId: '' as string | number,
    sortOrder: 0,
    isActive: true,
    isMaintenance: false,
  });

  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Drag & Drop state
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/cms/nav-menus');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data && data.error) {
        setError(`Gagal memuat menu navigasi: ${data.error}`);
      } else if (data && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat menu navigasi.');
    } finally {
      setLoading(false);
    }
  };

  // Filter items by active tab
  const navbarItems = items.filter((i) => i.location === 'navbar');
  const footerItems = items.filter((i) => i.location === 'footer');

  // Top-level navbar items (parentId === null)
  const topLevelNavbarItems = navbarItems
    .filter((i) => !i.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Sub-items for a given parentId
  const getSubItems = (parentId: number) => {
    return navbarItems
      .filter((i) => i.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Footer grouped by section
  const footerSections = Array.from(
    new Set(footerItems.map((i) => i.section || 'Lainnya'))
  );

  const handleOpenDialog = (item?: NavMenu, presetParentId?: number) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        url: item.url,
        location: item.location,
        section: item.section || '',
        parentId: item.parentId || '',
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        isMaintenance: Boolean(item.isMaintenance ?? item.is_maintenance),
      });
    } else {
      setEditingItem(null);
      const isNavbar = activeTab === 'navbar';
      setFormData({
        title: '',
        url: isNavbar ? '/' : '/about',
        location: activeTab,
        section: activeTab === 'footer' ? 'Perusahaan' : '',
        parentId: presetParentId || '',
        sortOrder: items.length + 1,
        isActive: true,
        isMaintenance: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleToggleMaintenance = async (item: NavMenu) => {
    const currentVal = Boolean(item.isMaintenance ?? item.is_maintenance);
    const nextVal = !currentVal;
    setTogglingId(item.id);

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isMaintenance: nextVal, is_maintenance: nextVal } : i))
    );

    try {
      const res = await fetch('/api/cms/nav-menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          url: item.url,
          location: item.location,
          section: item.section,
          sort_order: item.sortOrder,
          is_active: item.isActive,
          is_maintenance: nextVal,
          parent_id: item.parentId,
        }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status.');

      setMessage(
        `Mode maintenance "${item.title}" diubah: ${
          nextVal ? '🚧 AKTIF (Pengunjung dialihkan ke /maintenance)' : '🟢 NORMAL (Kembali ke halaman asli)'
        }`
      );
    } catch {
      // Revert if failed
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isMaintenance: currentVal, is_maintenance: currentVal } : i))
      );
      setError(`Gagal mengubah status maintenance untuk "${item.title}".`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = {
        ...(editingItem ? { id: editingItem.id } : {}),
        title: formData.title,
        url: formData.url,
        location: formData.location,
        section: formData.location === 'footer' ? formData.section || 'Perusahaan' : null,
        parentId: formData.location === 'navbar' && formData.parentId ? parseInt(String(formData.parentId)) : null,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        is_maintenance: formData.isMaintenance,
      };

      const res = await fetch('/api/cms/nav-menus', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan menu.');

      setMessage(editingItem ? 'Menu navigasi berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!');
      handleCloseDialog();
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan menu.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/nav-menus?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus menu.');
      setMessage(`Menu "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus.');
    } finally {
      setDeleting(false);
    }
  };

  // Batch reorder API call
  const persistReorder = async (reorderedList: { id: number; sortOrder: number }[]) => {
    setReordering(true);
    try {
      const res = await fetch('/api/cms/nav-menus/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderedList }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan urutan menu.');
      setMessage('Urutan menu berhasil diperbarui!');
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan urutan baru.');
    } finally {
      setReordering(false);
    }
  };

  // Move item Up or Down
  const handleMove = (list: NavMenu[], index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const newList = [...list];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    const reordered = newList.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    // Optimistically update local items state
    setItems((prev) =>
      prev.map((item) => {
        const found = reordered.find((r) => r.id === item.id);
        return found ? { ...item, sortOrder: found.sortOrder } : item;
      })
    );

    persistReorder(reordered);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnItem = (list: NavMenu[], targetId: number) => {
    if (!draggedItemId || draggedItemId === targetId) return;

    const draggedIndex = list.findIndex((i) => i.id === draggedItemId);
    const targetIndex = list.findIndex((i) => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newList = [...list];
    const [movedItem] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    // Optimistically update local items
    setItems((prev) =>
      prev.map((item) => {
        const found = reordered.find((r) => r.id === item.id);
        return found ? { ...item, sortOrder: found.sortOrder } : item;
      })
    );

    setDraggedItemId(null);
    persistReorder(reordered);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <WebIcon sx={{ color: '#018730', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={900} color="#0F172A">
              Manajemen Menu Navigasi
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Kelola menu Header Navbar (dengan dukungan dropdown sub-menu) dan Footer website dengan drag & drop yang terorganisir.
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
          Tambah Menu {activeTab === 'navbar' ? 'Navbar' : 'Footer'} Baru
        </Button>
      </Box>

      {/* Tabs Selection: Navbar vs Footer */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', mb: 3, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            px: 2,
            pt: 1,
            '& .MuiTabs-indicator': {
              backgroundColor: '#018730',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            value="navbar"
            icon={<WebIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Menu Header Navbar (Dropdown Sub-Menu)</span>
                <Chip
                  label={navbarItems.length}
                  size="small"
                  sx={{
                    bgcolor: activeTab === 'navbar' ? '#e8f6ed' : '#F1F5F9',
                    color: activeTab === 'navbar' ? '#018730' : '#64748B',
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              </Box>
            }
            sx={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: activeTab === 'navbar' ? '#018730 !important' : '#64748B',
              textTransform: 'none',
              py: 2,
            }}
          />
          <Tab
            value="footer"
            icon={<ViewColumnIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Menu Footer Website (Per Seksi)</span>
                <Chip
                  label={footerItems.length}
                  size="small"
                  sx={{
                    bgcolor: activeTab === 'footer' ? '#e8f6ed' : '#F1F5F9',
                    color: activeTab === 'footer' ? '#018730' : '#64748B',
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              </Box>
            }
            sx={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: activeTab === 'footer' ? '#018730 !important' : '#64748B',
              textTransform: 'none',
              py: 2,
            }}
          />
        </Tabs>
      </Paper>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {reordering && (
        <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ mb: 3, borderRadius: 2 }}>
          Menyimpan urutan menu baru ke server...
        </Alert>
      )}

      {/* TAB 1: HEADER NAVBAR TABLE WITH SUBMENU HIERARCHY & DRAG-AND-DROP */}
      {activeTab === 'navbar' && (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                Struktur Menu Header Navbar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gunakan ikon titik 6 di sebelah kiri untuk <strong>Drag & Drop</strong> urutan, atau gunakan tombol panah naik-turun. Klik <strong>+ Sub-Menu</strong> untuk membuat menu dropdown.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(undefined)}
              sx={{
                borderColor: '#018730',
                color: '#018730',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { borderColor: '#016f27', bgcolor: '#e8f6ed' },
              }}
            >
              Tambah Menu Utama
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#018730' }} />
            </Box>
          ) : topLevelNavbarItems.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Belum ada menu navbar yang terdaftar.
              </Typography>
              <Button variant="contained" onClick={() => handleOpenDialog(undefined)} sx={{ bgcolor: '#018730' }}>
                Tambah Menu Sekarang
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>Urutan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Judul Menu Navigasi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>URL Target</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 190 }}>Mode Maintenance</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tipe Menu</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topLevelNavbarItems.map((parent, pIndex) => {
                    const subItems = getSubItems(parent.id);
                    const hasChildren = subItems.length > 0;
                    const isParentMaint = Boolean(parent.isMaintenance ?? parent.is_maintenance);

                    return (
                      <React.Fragment key={parent.id}>
                        {/* Parent Row */}
                        <TableRow
                          hover
                          draggable
                          onDragStart={(e) => handleDragStart(e, parent.id)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDropOnItem(topLevelNavbarItems, parent.id)}
                          sx={{
                            bgcolor: isParentMaint ? '#fffdf7' : hasChildren ? '#fafbfd' : 'inherit',
                            cursor: 'grab',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          {/* Drag handle & Up/Down buttons */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Tooltip title="Geser (Drag) untuk mengubah urutan">
                                <Box sx={{ cursor: 'grab', color: '#94A3B8', display: 'flex', alignItems: 'center', '&:hover': { color: '#018730' } }}>
                                  <DragIndicatorIcon fontSize="small" />
                                </Box>
                              </Tooltip>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <IconButton
                                  size="small"
                                  disabled={pIndex === 0}
                                  onClick={() => handleMove(topLevelNavbarItems, pIndex, 'up')}
                                  sx={{ p: 0.2, color: '#64748B' }}
                                  title="Geser Naik"
                                >
                                  <ArrowUpwardIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  disabled={pIndex === topLevelNavbarItems.length - 1}
                                  onClick={() => handleMove(topLevelNavbarItems, pIndex, 'down')}
                                  sx={{ p: 0.2, color: '#64748B' }}
                                  title="Geser Turun"
                                >
                                  <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Menu Title */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={800} color="#0F172A">
                                {parent.title}
                              </Typography>
                              {hasChildren && (
                                <Chip
                                  label={`${subItems.length} Sub-Menu (Dropdown)`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#e8f6ed',
                                    color: '#018730',
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    border: '1px solid #01873033',
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>

                          {/* URL */}
                          <TableCell sx={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.85rem' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              <span>{parent.url}</span>
                              {isParentMaint && (
                                <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, fontSize: '0.7rem' }}>
                                  ↳ Dialihkan ke /maintenance
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Mode Maintenance 1-Click Toggle */}
                          <TableCell>
                            <Tooltip title={isParentMaint ? 'Mode Maintenance AKTIF (Pengunjung dialihkan ke halaman maintenance). Klik untuk kembalikan ke Normal.' : 'Mode Normal. Klik untuk mengaktifkan status Under Maintenance tanpa mengubah URL asli.'}>
                              <Box
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleMaintenance(parent);
                                }}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  cursor: 'pointer',
                                  px: 1.25,
                                  py: 0.4,
                                  borderRadius: 2,
                                  border: isParentMaint ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                                  bgcolor: isParentMaint ? '#FFFBEB' : '#FFFFFF',
                                  boxShadow: isParentMaint ? '0 1px 3px rgba(245,158,11,0.2)' : 'none',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    bgcolor: isParentMaint ? '#FEF3C7' : '#F8FAFC',
                                    borderColor: isParentMaint ? '#D97706' : '#CBD5E1',
                                  },
                                }}
                              >
                                <Switch
                                  size="small"
                                  checked={isParentMaint}
                                  disabled={togglingId === parent.id}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#D97706',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#F59E0B',
                                    },
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                    color: isParentMaint ? '#B45309' : '#64748B',
                                    userSelect: 'none',
                                  }}
                                >
                                  {isParentMaint ? '🚧 Maintenance' : '🟢 Normal'}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>

                          {/* Menu Type */}
                          <TableCell>
                            <Chip
                              label={hasChildren ? 'Menu Induk + Dropdown' : 'Tautan Tunggal'}
                              size="small"
                              sx={{
                                bgcolor: hasChildren ? '#E0F2FE' : '#F1F5F9',
                                color: hasChildren ? '#0369A1' : '#475569',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>

                          {/* Active Status */}
                          <TableCell>
                            <Chip
                              label={parent.isActive ? 'Aktif' : 'Nonaktif'}
                              size="small"
                              sx={{
                                bgcolor: parent.isActive ? '#ECFDF5' : '#F1F5F9',
                                color: parent.isActive ? '#047857' : '#64748B',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>

                          {/* Action Buttons */}
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<AddCircleIcon sx={{ fontSize: '15px !important' }} />}
                                onClick={() => handleOpenDialog(undefined, parent.id)}
                                sx={{
                                  color: '#fc4509',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  px: 1,
                                  '&:hover': { bgcolor: '#FFF7ED' },
                                }}
                              >
                                + Sub-Menu
                              </Button>
                              <IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(parent)} title="Ubah menu">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(parent.id, parent.title)} title="Hapus menu">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        {/* Nested Sub-Menu Rows */}
                        {subItems.map((child, cIndex) => {
                          const isChildMaint = Boolean(child.isMaintenance ?? child.is_maintenance);
                          return (
                            <TableRow
                              key={child.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, child.id)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDropOnItem(subItems, child.id)}
                              sx={{
                                bgcolor: isChildMaint ? '#fffdf7' : '#F8FAFC',
                                cursor: 'grab',
                                '&:hover': { bgcolor: isChildMaint ? '#fefae8' : '#F1F5F9' },
                              }}
                            >
                              {/* Sub-item reorder arrows */}
                              <TableCell sx={{ pl: 3.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Tooltip title="Geser urutan sub-menu">
                                    <Box sx={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', '&:hover': { color: '#018730' } }}>
                                      <DragIndicatorIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                  </Tooltip>
                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <IconButton
                                      size="small"
                                      disabled={cIndex === 0}
                                      onClick={() => handleMove(subItems, cIndex, 'up')}
                                      sx={{ p: 0.1, color: '#94A3B8' }}
                                    >
                                      <ArrowUpwardIcon sx={{ fontSize: 11 }} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      disabled={cIndex === subItems.length - 1}
                                      onClick={() => handleMove(subItems, cIndex, 'down')}
                                      sx={{ p: 0.1, color: '#94A3B8' }}
                                    >
                                      <ArrowDownwardIcon sx={{ fontSize: 11 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </TableCell>

                              {/* Indented Sub-item title */}
                              <TableCell sx={{ pl: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SubdirectoryArrowRightIcon sx={{ color: '#fc4509', fontSize: 18 }} />
                                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                                    {child.title}
                                  </Typography>
                                  <Chip
                                    label={`Sub-menu dari: ${parent.title}`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#FFF7ED',
                                      color: '#C2410C',
                                      fontWeight: 600,
                                      fontSize: '0.68rem',
                                      height: 18,
                                    }}
                                  />
                                </Box>
                              </TableCell>

                              {/* Sub-item URL */}
                              <TableCell sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.8rem' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                  <span>{child.url}</span>
                                  {isChildMaint && (
                                    <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, fontSize: '0.7rem' }}>
                                      ↳ Dialihkan ke /maintenance
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>

                              {/* Sub-item Mode Maintenance Toggle */}
                              <TableCell>
                                <Tooltip title={isChildMaint ? 'Mode Maintenance AKTIF (Pengunjung dialihkan ke halaman maintenance). Klik untuk kembalikan ke Normal.' : 'Mode Normal. Klik untuk mengaktifkan status Under Maintenance tanpa mengubah URL asli.'}>
                                  <Box
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleMaintenance(child);
                                    }}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      cursor: 'pointer',
                                      px: 1.25,
                                      py: 0.4,
                                      borderRadius: 2,
                                      border: isChildMaint ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                                      bgcolor: isChildMaint ? '#FFFBEB' : '#FFFFFF',
                                      boxShadow: isChildMaint ? '0 1px 3px rgba(245,158,11,0.2)' : 'none',
                                      transition: 'all 0.15s ease',
                                      '&:hover': {
                                        bgcolor: isChildMaint ? '#FEF3C7' : '#F8FAFC',
                                        borderColor: isChildMaint ? '#D97706' : '#CBD5E1',
                                      },
                                    }}
                                  >
                                    <Switch
                                      size="small"
                                      checked={isChildMaint}
                                      disabled={togglingId === child.id}
                                      sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: '#D97706',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: '#F59E0B',
                                        },
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        color: isChildMaint ? '#B45309' : '#64748B',
                                        userSelect: 'none',
                                      }}
                                    >
                                      {isChildMaint ? '🚧 Maintenance' : '🟢 Normal'}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </TableCell>

                              {/* Sub-item Type */}
                              <TableCell>
                                <Chip
                                  label="Dropdown Item"
                                  size="small"
                                  sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.72rem' }}
                                />
                              </TableCell>

                              {/* Sub-item Status */}
                              <TableCell>
                                <Chip
                                  label={child.isActive ? 'Aktif' : 'Nonaktif'}
                                  size="small"
                                  sx={{
                                    bgcolor: child.isActive ? '#ECFDF5' : '#F1F5F9',
                                    color: child.isActive ? '#047857' : '#64748B',
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                  }}
                                />
                              </TableCell>

                              {/* Sub-item Actions */}
                              <TableCell align="right">
                                <IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(child)} title="Ubah sub-menu">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete(child.id, child.title)} title="Hapus sub-menu">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* TAB 2: FOOTER MENU TABLE GROUPED BY SECTION */}
      {activeTab === 'footer' && (
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                Menu Footer Website (Dikelompokkan Berdasarkan Kolom Seksi)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tautan footer tampil rapi di kolom bawah website. Drag atau klik tombol panah untuk mengatur urutan dalam masing-masing kolom.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(undefined)}
              sx={{
                borderColor: '#018730',
                color: '#018730',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { borderColor: '#016f27', bgcolor: '#e8f6ed' },
              }}
            >
              Tambah Tautan Footer
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#018730' }} />
            </Box>
          ) : footerSections.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Belum ada tautan footer yang terdaftar.
              </Typography>
              <Button variant="contained" onClick={() => handleOpenDialog(undefined)} sx={{ bgcolor: '#018730' }}>
                Tambah Tautan Footer
              </Button>
            </Paper>
          ) : (
            footerSections.map((sectionName) => {
              const sectionItems = footerItems
                .filter((i) => (i.section || 'Lainnya') === sectionName)
                .sort((a, b) => a.sortOrder - b.sortOrder);

              return (
                <Paper
                  key={sectionName}
                  elevation={0}
                  sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}
                >
                  <Box sx={{ p: 2, px: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                        Seksi Kolom: {sectionName}
                      </Typography>
                      <Chip label={`${sectionItems.length} tautan`} size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }} />
                    </Box>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingItem(null);
                        setFormData({
                          title: '',
                          url: '/',
                          location: 'footer',
                          section: sectionName,
                          parentId: '',
                          sortOrder: sectionItems.length + 1,
                          isActive: true,
                        });
                        setDialogOpen(true);
                      }}
                      sx={{ color: '#018730', fontWeight: 700 }}
                    >
                      + Tambah ke Seksi Ini
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#FFFFFF' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, width: 70 }}>Urutan</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Judul Tautan Footer</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>URL Tujuan</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 180 }}>Mode Maintenance</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sectionItems.map((item, idx) => {
                          const isItemMaint = Boolean(item.isMaintenance ?? item.is_maintenance);
                          return (
                            <TableRow
                              key={item.id}
                              hover
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDropOnItem(sectionItems, item.id)}
                              sx={{
                                bgcolor: isItemMaint ? '#fffdf7' : 'inherit',
                                cursor: 'grab',
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Tooltip title="Geser urutan tautan">
                                    <Box sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', '&:hover': { color: '#018730' } }}>
                                      <DragIndicatorIcon fontSize="small" />
                                    </Box>
                                  </Tooltip>
                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <IconButton
                                      size="small"
                                      disabled={idx === 0}
                                      onClick={() => handleMove(sectionItems, idx, 'up')}
                                      sx={{ p: 0.1, color: '#64748B' }}
                                    >
                                      <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      disabled={idx === sectionItems.length - 1}
                                      onClick={() => handleMove(sectionItems, idx, 'down')}
                                      sx={{ p: 0.1, color: '#64748B' }}
                                    >
                                      <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{item.title}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace', color: '#64748B' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                  <span>{item.url}</span>
                                  {isItemMaint && (
                                    <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, fontSize: '0.7rem' }}>
                                      ↳ Dialihkan ke /maintenance
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Tooltip title={isItemMaint ? 'Mode Maintenance AKTIF (Pengunjung dialihkan ke halaman maintenance). Klik untuk kembalikan ke Normal.' : 'Mode Normal. Klik untuk mengaktifkan status Under Maintenance tanpa mengubah URL asli.'}>
                                  <Box
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleMaintenance(item);
                                    }}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      cursor: 'pointer',
                                      px: 1.25,
                                      py: 0.4,
                                      borderRadius: 2,
                                      border: isItemMaint ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                                      bgcolor: isItemMaint ? '#FFFBEB' : '#FFFFFF',
                                      boxShadow: isItemMaint ? '0 1px 3px rgba(245,158,11,0.2)' : 'none',
                                      transition: 'all 0.15s ease',
                                      '&:hover': {
                                        bgcolor: isItemMaint ? '#FEF3C7' : '#F8FAFC',
                                        borderColor: isItemMaint ? '#D97706' : '#CBD5E1',
                                      },
                                    }}
                                  >
                                    <Switch
                                      size="small"
                                      checked={isItemMaint}
                                      disabled={togglingId === item.id}
                                      sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: '#D97706',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: '#F59E0B',
                                        },
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        color: isItemMaint ? '#B45309' : '#64748B',
                                        userSelect: 'none',
                                      }}
                                    >
                                      {isItemMaint ? '🚧 Maintenance' : '🟢 Normal'}
                                    </Typography>
                                  </Box>
                                </Tooltip>
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
                                <IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(item)} title="Ubah">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: item.id, title: item.title, subtitle: `Menu Utama • Tautan: ${item.path}` })} title="Hapus">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            })
          )}
        </Stack>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingItem
              ? `Edit Menu: ${editingItem.title}`
              : formData.parentId
              ? 'Tambah Sub-Menu Dropdown Baru'
              : `Tambah Menu ${formData.location === 'navbar' ? 'Header Navbar' : 'Footer'} Baru`}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Judul Teks Menu"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: HVAC Presisi Industri"
              />

              <TextField
                label="URL Target"
                required
                fullWidth
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="Contoh: /products/hvac atau /services"
                helperText="Gunakan tautan lokal seperti /products, /about, atau URL eksternal lengkap https://..."
              />

              <TextField
                select
                label="Lokasi Penempatan"
                fullWidth
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value, parentId: '' })}
              >
                <MenuItem value="navbar">Header Navbar Utama (Atas)</MenuItem>
                <MenuItem value="footer">Footer Website (Bawah)</MenuItem>
              </TextField>

              {/* Parent menu selection for Navbar */}
              {formData.location === 'navbar' && (
                <TextField
                  select
                  label="Menu Induk (Parent Menu Dropdown)"
                  fullWidth
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  helperText="Pilih menu induk jika ingin item ini menjadi sub-menu dropdown (misal: sub-menu di bawah Produk)."
                >
                  <MenuItem value="">
                    <em>-- Menu Utama / Root (Bukan Sub-menu) --</em>
                  </MenuItem>
                  {topLevelNavbarItems
                    .filter((item) => !editingItem || item.id !== editingItem.id)
                    .map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.title} ({item.url})
                      </MenuItem>
                    ))}
                </TextField>
              )}

              {/* Section selection for Footer */}
              {formData.location === 'footer' && (
                <TextField
                  label="Nama Kolom Seksi Footer"
                  required
                  fullWidth
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="Misal: Perusahaan, Layanan, Legal, Dukungan"
                  helperText="Tautan footer akan dikelompokkan berdasarkan nama seksi ini."
                />
              )}

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: formData.isMaintenance ? '#FFFBEB' : '#F8FAFC',
                  borderColor: formData.isMaintenance ? '#FDE68A' : '#E2E8F0',
                  transition: 'all 0.2s ease',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isMaintenance}
                      onChange={(e) => setFormData({ ...formData, isMaintenance: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#D97706',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#F59E0B',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color={formData.isMaintenance ? '#B45309' : '#1E293B'}
                      >
                        {formData.isMaintenance
                          ? '🚧 Mode Under Maintenance: AKTIF'
                          : '🟢 Mode Normal: Aktif'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bila aktif, pengunjung yang mengklik menu ini otomatis diarahkan ke halaman <strong>/maintenance</strong> tanpa perlu menghapus URL asli.
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: 'flex-start' }}
                />
              </Paper>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#018730',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#018730',
                      },
                    }}
                  />
                }
                label="Tampilkan Menu (Status Aktif)"
              />
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
              {saving ? 'Menyimpan...' : editingItem ? 'Perbarui Menu' : 'Simpan Menu'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus Menu In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Menu"
        itemName={deleteTarget?.title}
        itemSubtitle={deleteTarget?.subtitle}
        description="Apakah Anda yakin ingin menghapus tautan menu navigasi ini?"
        warningText="Tindakan ini permanen. Menu (dan sub-menunya jika ada) tidak akan tampil lagi di bilah navigasi website."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
