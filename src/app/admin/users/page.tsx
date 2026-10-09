'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CampaignIcon from '@mui/icons-material/Campaign';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';

interface UserItem {
  id: number;
  username?: string | null;
  email: string;
  employeeId?: string | null; // immutable Employee ID e.g. ITSP.004.02.16
  employee_id?: string | null;
  name: string;
  role: string;
  department?: string | null;
  mfaEnabled: boolean;
  backupCodes?: string | null;
  isActive: boolean;
  portalAccess: string; // perusahaan | karir | both
  createdAt: string;
}

const ROLES = [
  {
    value: 'admin',
    label: 'Administrator (Akses Penuh)',
    desc: 'Memiliki kontrol total terhadap seluruh fitur CMS, pengaturan sistem, konfigurasi navigasi, dan manajemen pengguna.',
    color: '#0F172A',
    bg: '#F1F5F9',
    icon: <AdminPanelSettingsIcon fontSize="small" />,
  },
  {
    value: 'hr',
    label: 'HR Recruitment (Portal Karir)',
    desc: 'Pengelola seleksi pelamar, bank soal psikotes, jadwal interview, klinik MCU, offering letter, dan kartu orientasi.',
    color: '#0284C7',
    bg: '#E0F2FE',
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    value: 'user_dept',
    label: 'User Departemen (Portal Karir)',
    desc: 'Pembuat soal tes teknis kejuruan, reviewer CV spesialis, dan pewawancara teknis kandidat.',
    color: '#7C3AED',
    bg: '#F3E8FF',
    icon: <EngineeringIcon fontSize="small" />,
  },
  {
    value: 'marketing',
    label: 'Marketing (Pengelola Konten)',
    desc: 'Dapat mengunggah produk, sertifikat ISO, fasilitas pabrik, artikel blog, dan melihat pesan masuk. Tidak dapat mengubah konfigurasi sistem web.',
    color: '#018730',
    bg: '#e8f6ed',
    icon: <CampaignIcon fontSize="small" />,
  },
  {
    value: 'editor',
    label: 'Editor Konten',
    desc: 'Dapat menulis dan memperbarui artikel blog, berita perusahaan, dan FAQ.',
    color: '#fc4509',
    bg: '#FFF7ED',
    icon: <EditNoteIcon fontSize="small" />,
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '', // immutable Employee ID e.g. ITSP.004.02.16 — email retained for audit, fallback 6 months
    name: '',
    email: '',
    password: '',
    role: 'marketing',
    mfaEnabled: false,
    isActive: true,
    portalAccess: 'both' as string,
  });
  const [saving, setSaving] = useState(false);
  const [togglingMfaId, setTogglingMfaId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Backup codes modal
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [activeBackupUser, setActiveBackupUser] = useState<{
    id: number;
    name: string;
    email: string;
    codes: string[];
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const normalizeUser = (u: any): UserItem => ({
    ...u,
    employeeId: u.employeeId ?? u.employee_id ?? u.employeeID ?? null,
    employee_id: u.employee_id ?? u.employeeId ?? u.employeeID ?? null,
    isActive: u.isActive ?? u.is_active ?? true,
    portalAccess: u.portalAccess ?? u.portal_access ?? 'both',
    mfaEnabled: u.mfaEnabled ?? u.mfa_enabled ?? false,
    department: u.department ?? null,
    username: u.username ?? null,
  });
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/users');
      if (res.status === 403) {
        setError('Akses terbatas. Anda tidak memiliki izin untuk mengelola pengguna.');
        return;
      }
      const raw = await res.json();
      const arr: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.users ?? []);
      if (Array.isArray(arr)) setUsers(arr.map(normalizeUser));
    } catch {
      setError('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMfa = async (user: UserItem) => {
    const nextStatus = !user.mfaEnabled;
    setTogglingMfaId(user.id);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/cms/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          mfaEnabled: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change MFA status.');

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                mfaEnabled: nextStatus,
                backupCodes: data.user?.backupCodes !== undefined ? data.user.backupCodes : u.backupCodes,
              }
            : u
        )
      );

      setMessage(
        `Autentikasi MFA untuk ${user.name} berhasil ${nextStatus ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}.`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update user MFA status.');
    } finally {
      setTogglingMfaId(null);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    const next = !user.isActive;
    setError(''); setMessage('');
    try {
      const res = await fetch('/api/cms/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, isActive: next }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change active status.');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: next } : u));
      setMessage(`${user.name} sekarang ${next ? 'AKTIF' : 'NON-AKTIF'}.`);
    } catch (e: any) { setError(e.message || 'Failed to toggle active status.'); }
  };
  const handleChangePortal = async (user: UserItem, portalAccess: string) => {
    try {
      const res = await fetch('/api/cms/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, portalAccess }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change portal access.');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, portalAccess } : u));
      setMessage(`Akses portal ${user.name} → ${portalAccess}.`);
    } catch (e: any) { setError(e.message || 'Failed to change portal access.'); }
  };

  const handleOpenDialog = (user?: UserItem) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        employeeId: user.employeeId ?? (user as any).employee_id ?? '',
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        mfaEnabled: Boolean(user.mfaEnabled),
        isActive: Boolean(user.isActive),
        portalAccess: user.portalAccess || 'both',
      });
    } else {
      setEditingUser(null);
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        password: `Itsp@${new Date().getFullYear()}`,
        role: 'marketing',
        mfaEnabled: false,
        isActive: true,
        portalAccess: 'both',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser
        ? {
            id: editingUser.id,
            employee_id: (formData.employeeId || '').trim(),
            employeeId: (formData.employeeId || '').trim(),
            name: formData.name,
            email: formData.email,
            role: formData.role,
            newPassword: formData.password,
            mfaEnabled: formData.mfaEnabled,
            isActive: formData.isActive,
            portalAccess: formData.portalAccess,
          }
        : {
            ...formData,
            employee_id: (formData.employeeId || '').trim(),
            employeeId: (formData.employeeId || '').trim(),
          };

      const res = await fetch('/api/cms/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save user.');
      }

      setMessage(editingUser ? 'Data pengguna berhasil diperbarui!' : 'Pengguna baru berhasil dibuat!');
      handleCloseDialog();
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to save data.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/users?id=${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user.');

      setMessage(`Pengguna ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  // View backup codes handler
  const handleOpenBackupCodes = (user: UserItem) => {
    let parsedCodes: string[] = [];
    if (user.backupCodes) {
      try {
        parsedCodes = JSON.parse(user.backupCodes);
      } catch {}
    }

    setActiveBackupUser({
      id: user.id,
      name: user.name,
      email: user.email,
      codes: parsedCodes,
    });
    setCopiedIndex(null);
    setCopiedAll(false);
    setBackupDialogOpen(true);
  };

  const handleCopySingleCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllCodes = () => {
    if (!activeBackupUser) return;
    const text = activeBackupUser.codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleRegenerateCodes = async () => {
    if (!activeBackupUser) return;
    // confirmed via dialog

    setRegeneratingCodes(true);
    try {
      const res = await fetch('/api/cms/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeBackupUser.id,
          regenerateBackupCodes: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update backup codes.');

      let newCodes: string[] = [];
      if (data.user?.backupCodes) {
        try {
          newCodes = JSON.parse(data.user.backupCodes);
        } catch {}
      }

      setActiveBackupUser((prev) => (prev ? { ...prev, codes: newCodes } : null));
      setMessage(`8 Kode Cadangan baru berhasil dibuat untuk ${activeBackupUser.name}.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to generate new backup codes.');
    } finally {
      setRegeneratingCodes(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <AdminPanelSettingsIcon sx={{ color: '#018730', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={900} color="#0F172A">
              Manajemen Hak Akses & Keamanan Pengguna
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Beri akses peran (RBAC) serta kendalikan status Multi-Factor Authentication (MFA) untuk masing-masing pengguna CMS.
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
          Tambah Pengguna Baru
        </Button>
      </Box>

      {/* Role explanation cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {ROLES.map((r) => (
          <Grid size={{ xs: 12, md: 4 }} key={r.value}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', height: '100%', bgcolor: '#FFFFFF' }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: r.bg, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {r.label}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                  {r.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Users Table — Employee ID immutable (ITSP.004.02.16), email retained for audit, fallback 6 months */}
      {(() => {
        const filteredUsers = users.filter((u) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            ((u.employeeId || (u as any).employee_id) && String(u.employeeId || (u as any).employee_id).toLowerCase().includes(q)) ||
            (u.role && u.role.toLowerCase().includes(q))
          );
        });

        const paginatedUsers = filteredUsers.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        return (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
            <CmsTableToolbar
              searchQuery={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val);
                setPage(0);
              }}
              placeholder="Cari nama, Employee ID (ITSP.004.02.16), email, role…"
              totalCount={users.length}
              filteredCount={filteredUsers.length}
            />
            {loading ? (
              <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#018730' }} />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 1050 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Pengguna</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Email Login</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Peran</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>MFA</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Aktif</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Portal Access</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Terdaftar</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada data pengguna.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((u) => {
                          const roleConfig = ROLES.find((r) => r.value === u.role) || ROLES[0];
                          const isToggling = togglingMfaId === u.id;

                          return (
                            <TableRow key={u.id} hover sx={{ opacity: u.isActive ? 1 : 0.6 }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 38, height: 38, bgcolor: roleConfig.color, color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>
                                    {u.name?.charAt(0).toUpperCase() || 'U'}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                                      {u.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ID: #{u.id}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#018730', letterSpacing: '0.02em' }}>
                                  {u.employeeId || (u as any).employee_id || '—'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
                                  {(u.employeeId || (u as any).employee_id) ? 'immutable' : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: '#334155', fontWeight: 500 }}>
                                {u.email}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={roleConfig.icon}
                                  label={u.role.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: roleConfig.bg,
                                    color: roleConfig.color,
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    '& .MuiChip-icon': { color: 'inherit' },
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={u.mfaEnabled}
                                        disabled={isToggling}
                                        onChange={() => handleToggleMfa(u)}
                                        sx={{
                                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' },
                                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#018730' },
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography variant="caption" fontWeight={700} color={u.mfaEnabled ? '#018730' : 'text.secondary'}>
                                        {isToggling ? 'Saving...' : u.mfaEnabled ? 'Aktif' : 'Nonaktif'}
                                      </Typography>
                                    }
                                    sx={{ m: 0 }}
                                  />

                                  {u.mfaEnabled && (
                                    <Chip
                                      icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                                      label="MFA 2FA"
                                      size="small"
                                      sx={{
                                        bgcolor: '#e8f6ed',
                                        color: '#018730',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                      }}
                                    />
                                  )}

                                  {u.mfaEnabled && (
                                    <Tooltip title="Lihat / Salin Kode Cadangan Pengguna">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenBackupCodes(u)}
                                        sx={{
                                          color: '#fc4509',
                                          p: 0.6,
                                          bgcolor: '#FFF7ED',
                                          border: '1px solid #FFEDD5',
                                          '&:hover': { bgcolor: '#FFEDD5' },
                                        }}
                                      >
                                        <VpnKeyIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Tooltip title={u.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}>
                                  <Switch size="small" checked={u.isActive} onChange={() => handleToggleActive(u)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#018730' } }} />
                                </Tooltip>
                                <Chip label={u.isActive ? 'Aktif' : 'Non-aktif'} size="small" sx={{ ml: 1, bgcolor: u.isActive ? '#DCFCE7' : '#F1F5F9', color: u.isActive ? '#15803D' : '#64748B', fontWeight: 700, fontSize: '0.7rem' }} />
                              </TableCell>
                              <TableCell>
                                <TextField select size="small" value={u.portalAccess} onChange={(e) => handleChangePortal(u, e.target.value)} sx={{ minWidth: 140, '& .MuiInputBase-root': { fontSize: '0.8rem', fontWeight: 700 } }}>
                                  <MenuItem value="perusahaan">Company</MenuItem>
                                  <MenuItem value="karir">Karir</MenuItem>
                                  <MenuItem value="both">Keduanya</MenuItem>
                                </TextField>
                              </TableCell>
                              <TableCell sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                                {new Date(u.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" sx={{ color: '#018730' }} onClick={() => handleOpenDialog(u)} title="Ubah data atau reset password">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)} title="Delete user">
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
                  count={filteredUsers.length}
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

      {/* Dialog Form Tambah / Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingUser ? `Edit Pengguna: ${editingUser.name}` : 'Tambah Pengguna CMS Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Employee ID *"
                required
                fullWidth
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="ITSP.004.02.16"
                helperText={editingUser && (editingUser.employeeId || (editingUser as any).employee_id) ? 'immutable — tidak dapat diubah (hubungi HR jika salah)' : 'immutable — contoh: ITSP.004.02.16 • Email tetap tercatat untuk audit, fallback 6 bulan'}
                disabled={Boolean(editingUser && (editingUser.employeeId || (editingUser as any).employee_id))}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
              />

              <TextField
                label="Nama Lengkap"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso (Tim Marketing)"
              />

              <TextField
                label="Email Address"
                required
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@itsp.co.id"
                helperText={editingUser ? 'Perubahan email akan menjadi alamat login baru pengguna di CMS & Portal Karir' : 'Digunakan untuk login ke panel sistem'}
              />

              <TextField
                select
                label="Peran / Hak Akses"
                required
                fullWidth
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {r.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {r.desc}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label={editingUser ? 'Reset Password Baru (Opsional)' : 'Password Awal'}
                required={!editingUser}
                fullWidth
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah kata sandi' : `Default: Itsp@${new Date().getFullYear()}`}
                helperText={!editingUser ? `Kata sandi awal standar tahun: Itsp@${new Date().getFullYear()}` : ''}
                slotProps={{
                  input: {
                    startAdornment: <KeyIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
                  },
                }}
              />

              <Stack direction="row" spacing={2}>
                <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label={<Typography variant="body2" fontWeight={800}>{formData.isActive ? 'Active Account' : 'Inactive Account'}</Typography>} />
                <TextField select label="Portal Access" value={formData.portalAccess} onChange={(e) => setFormData({ ...formData, portalAccess: e.target.value })} sx={{ minWidth: 180 }}><MenuItem value="perusahaan">Web Company</MenuItem><MenuItem value="karir">Web Karir</MenuItem><MenuItem value="both">Keduanya</MenuItem></TextField>
              </Stack>
              <Box sx={{ p: 2, bgcolor: formData.mfaEnabled ? '#e8f6ed' : '#F8FAFC', borderRadius: 2.5, border: `1px solid ${formData.mfaEnabled ? '#01873044' : '#E2E8F0'}` }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.mfaEnabled}
                      onChange={(e) => setFormData({ ...formData, mfaEnabled: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#018730' } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">{formData.mfaEnabled ? 'MFA Diaktifkan' : 'MFA Dinonaktifkan'}</Typography>
                      <Typography variant="caption" color="text.secondary">{formData.mfaEnabled ? 'Perlu kode Authenticator saat login.' : 'Login hanya email + password.'}</Typography>
                    </Box>
                  }
                />
              </Box>
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
              {saving ? 'Saving...' : editingUser ? 'Perbarui Pengguna' : 'Buat Pengguna'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog Kode Cadangan MFA */}
      <Dialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: '#fc4509' }} />
          Kode Cadangan Login (MFA)
        </DialogTitle>
        <DialogContent dividers>
          {activeBackupUser && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pengguna: <strong>{activeBackupUser.name}</strong> ({activeBackupUser.email})
              </Typography>

              <Alert severity="info" sx={{ mb: 2, fontSize: '0.8125rem' }}>
                Jika pengguna tidak membawa HP / authenticator, gunakan salah satu kode cadangan ini untuk login. Tiap kode hanya dapat digunakan 1 kali.
              </Alert>

              {activeBackupUser.codes.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Belum ada kode cadangan yang tersimpan untuk pengguna ini.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => setConfirmRegenerateOpen(true)}
                    disabled={regeneratingCodes}
                    sx={{ bgcolor: '#018730', '&:hover': { bgcolor: '#016f27' } }}
                  >
                    {regeneratingCodes ? 'Membuat...' : 'Buat 8 Kode Cadangan Baru'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 1.2,
                      mb: 2,
                    }}
                  >
                    {activeBackupUser.codes.map((code, idx) => (
                      <Box
                        key={idx}
                        onClick={() => handleCopySingleCode(code, idx)}
                        sx={{
                          p: 1.2,
                          bgcolor: '#F8FAFC',
                          borderRadius: 1.5,
                          border: '1px dashed #CBD5E1',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.8,
                          color: copiedIndex === idx ? '#018730' : '#0F172A',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: '#FFF7ED',
                            borderColor: '#fc4509',
                          },
                        }}
                      >
                        {copiedIndex === idx ? <CheckIcon fontSize="small" /> : <ContentCopyIcon sx={{ fontSize: 13, color: '#94A3B8' }} />}
                        <span>{code}</span>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={copiedAll ? <CheckIcon /> : <ContentCopyIcon />}
                      onClick={handleCopyAllCodes}
                      sx={{
                        borderColor: '#018730',
                        color: '#018730',
                        fontWeight: 700,
                        '&:hover': { borderColor: '#016f27', bgcolor: '#e8f6ed' },
                      }}
                    >
                      {copiedAll ? 'Tersalin Semua!' : 'Salin Semua Kode'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleRegenerateCodes}
                      disabled={regeneratingCodes}
                      title="Reset dan buat 8 kode baru"
                    >
                      <RefreshIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBackupDialogOpen(false)} color="inherit">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    
      {/* Dialog Confirm Delete User In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Confirm Delete User"
        itemName={deleteTarget ? `${deleteTarget.name} (@${deleteTarget.username})` : undefined}
        itemSubtitle={deleteTarget ? `Peran: ${deleteTarget.role.toUpperCase()} • Email: ${deleteTarget.email}` : undefined}
        description="Are you sure you want to permanently delete this CMS user account?"
        warningText="This action is permanent. The user will no longer be able to access the admin panel."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Dialog Konfirmasi Regenerasi Kode Cadangan MFA */}
      <ConfirmDeleteDialog
        open={confirmRegenerateOpen}
        title="Regenerate MFA Backup Codes"
        itemName={activeBackupUser ? `Akun: ${activeBackupUser.name} (${activeBackupUser.email})` : undefined}
        description="Are you sure you want to regenerate 8 new backup codes?"
        warningText="All previous backup codes will be immediately invalidated and cannot be reused."
        confirmButtonText="Yes, Generate New Codes"
        loading={regeneratingCodes}
        onClose={() => setConfirmRegenerateOpen(false)}
        onConfirm={async () => {
          setConfirmRegenerateOpen(false);
          await handleRegenerateCodes();
        }}
      />
    </Box>
  );
}
