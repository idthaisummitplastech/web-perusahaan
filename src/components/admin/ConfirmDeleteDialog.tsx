'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  itemName?: string;
  itemSubtitle?: string;
  description?: string;
  warningText?: string;
  loading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  title = 'Konfirmasi Hapus Data',
  itemName,
  itemSubtitle,
  description = 'Apakah Anda yakin ingin menghapus data berikut?',
  warningText = 'Tindakan ini permanen dan tidak dapat dibatalkan. Data akan dihapus dari sistem.',
  loading = false,
  confirmButtonText = 'Ya, Hapus Sekarang',
  cancelButtonText = 'Batal',
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: '#d32f2f',
          fontWeight: 800,
          fontSize: '1.15rem',
          pt: 2.5,
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            bgcolor: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d32f2f',
            flexShrink: 0,
          }}
        >
          <DeleteIcon sx={{ fontSize: 22 }} />
        </Box>
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
            {description}
          </Typography>
        )}

        {itemName && (
          <Box
            sx={{
              p: 2,
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
              {itemName}
            </Typography>
            {itemSubtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: '#0284c7',
                  fontFamily: 'monospace',
                  display: 'block',
                  mt: 0.5,
                  wordBreak: 'break-all',
                }}
              >
                {itemSubtitle}
              </Typography>
            )}
          </Box>
        )}

        <Typography
          variant="caption"
          sx={{
            color: '#b91c1c',
            bgcolor: '#fef2f2',
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 18, color: "#b91c1c", flexShrink: 0 }} />
          <span>{warningText}</span>
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            '&:hover': { bgcolor: '#e2e8f0' },
          }}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            bgcolor: '#d32f2f',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(211,47,47,0.3)',
            '&:hover': {
              bgcolor: '#b71c1c',
            },
          }}
        >
          {loading ? 'Menghapus...' : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
