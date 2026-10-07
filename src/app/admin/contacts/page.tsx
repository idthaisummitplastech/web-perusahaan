'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Button,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { CmsTablePagination, CmsTableToolbar } from '@/components/admin/CmsTablePagination';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/contacts');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError('Failed to load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      try {
        await fetch('/api/cms/contacts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: contact.id, isRead: true }),
        });
        setItems((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, isRead: true } : c))
        );
      } catch {}
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/contacts?id=${deleteTarget.id}`, { method: 'DELETE' });
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} color="#0F172A">
          Pesan Masuk (Formulir Kontak)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Daftar pesan, pertanyaan, dan permohonan konsultasi yang dikirim oleh calon klien website.
        </Typography>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {(() => {
        const filteredItems = items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.email && item.email.toLowerCase().includes(q)) ||
            (item.subject && item.subject.toLowerCase().includes(q)) ||
            (item.message && item.message.toLowerCase().includes(q))
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
              placeholder="Cari nama, email, subjek, pesan..."
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
                        <TableCell sx={{ fontWeight: 700 }}>Nama Pengirim</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subjek</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Waktu Diterima</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            {searchQuery ? 'Tidak ada pesan kontak yang cocok dengan pencarian.' : 'Belum ada pesan yang diterima.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id} hover sx={{ bgcolor: item.isRead ? 'inherit' : 'rgba(254, 243, 199, 0.2)' }}>
                            <TableCell sx={{ fontWeight: item.isRead ? 500 : 700, color: '#0F172A' }}>{item.name}</TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell sx={{ fontWeight: item.isRead ? 400 : 600 }}>{item.subject || '-'}</TableCell>
                            <TableCell>
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.isRead ? 'Dibaca' : 'Baru'}
                                size="small"
                                sx={{
                                  bgcolor: item.isRead ? '#F1F5F9' : '#FEF3C7',
                                  color: item.isRead ? '#64748B' : '#B45309',
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="primary" onClick={() => handleOpenDetail(item)}>
                                <VisibilityIcon fontSize="small" />
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

      {/* Message Details Modal */}
      <Dialog open={Boolean(selectedContact)} onClose={() => setSelectedContact(null)} maxWidth="sm" fullWidth>
        {selectedContact && (
          <>
            <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
              Detail Pesan dari {selectedContact.name}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address:</Typography>
                  <Typography variant="body1" fontWeight={600} color="#0F172A">{selectedContact.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Subjek:</Typography>
                  <Typography variant="body1" fontWeight={600} color="#0F172A">{selectedContact.subject || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Waktu Kirim:</Typography>
                  <Typography variant="body2" color="#64748B">
                    {new Date(selectedContact.createdAt).toLocaleString('id-ID')}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Isi Pesan:</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#1E293B' }}>
                      {selectedContact.message}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setSelectedContact(null)} color="inherit">Tutup</Button>
              <Button
                component="a"
                href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || 'Balasan Kontak')}`}
                variant="contained"
                sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 700, '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' } }}
              >
                Balas via Email
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    
      {/* Dialog Konfirmasi Hapus In-App */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Pesan"
        itemName={`Pengirim: ${deleteTarget?.name} (${deleteTarget?.email})`}
        itemSubtitle={deleteTarget?.subject ? `Subjek: ${deleteTarget.subject}` : undefined}
        description="Apakah Anda yakin ingin menghapus pesan masuk ini?"
        warningText="Tindakan ini permanen. Pesan dari klien ini akan dihapus dari sistem."
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
