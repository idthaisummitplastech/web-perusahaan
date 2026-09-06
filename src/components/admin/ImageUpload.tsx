'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Foto / Gambar Berkas',
  helperText = 'Format JPG, PNG, atau WEBP (Maksimal 5MB)',
}: ImageUploadProps) {
  const [tabIndex, setTabIndex] = useState<number>(value && value.startsWith('http') ? 1 : 0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Hanya berkas gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran berkas maksimal 5MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah gambar.');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengunggah berkas.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
          {label}
        </Typography>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          sx={{ minHeight: 'auto', '& .MuiTab-root': { py: 0.5, px: 1, minHeight: 'auto', fontSize: '0.75rem' } }}
        >
          <Tab icon={<CloudUploadIcon sx={{ fontSize: '1rem !important', mr: 0.5 }} />} iconPosition="start" label="Upload Berkas" />
          <Tab icon={<LinkIcon sx={{ fontSize: '1rem !important', mr: 0.5 }} />} iconPosition="start" label="Input URL" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5, fontSize: '0.8125rem' }}>
          {error}
        </Alert>
      )}

      {/* Mode 1: File Upload */}
      {tabIndex === 0 && (
        <Box>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {value ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: '1.5px solid #a3dfb7',
                bgcolor: '#f4faf6',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} color="#015e21" noWrap>
                  Gambar Berhasil Diunggah
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all', mt: 0.5 }}>
                  {value}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RefreshIcon fontSize="small" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    sx={{ color: '#018730', borderColor: '#018730', fontSize: '0.75rem', py: 0.25 }}
                  >
                    Ganti Berkas
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onChange('')}
                    title="Hapus gambar"
                    sx={{ border: '1px solid #FCA5A5' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: 3,
                borderRadius: 2.5,
                border: isDragOver ? '2px dashed #018730' : '2px dashed #CBD5E1',
                bgcolor: isDragOver ? '#e8f6ed' : '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#018730',
                  bgcolor: '#f4faf6',
                },
              }}
            >
              {uploading ? (
                <Box sx={{ py: 2 }}>
                  <CircularProgress size={32} sx={{ color: '#018730', mb: 1 }} />
                  <Typography variant="body2" color="#018730" fontWeight={600}>
                    Mengunggah berkas ke server...
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: '#e8f6ed',
                      color: '#018730',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <CloudUploadIcon />
                  </Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    Tarik berkas gambar ke sini, atau <span style={{ color: '#018730' }}>klik untuk memilih</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {helperText}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Mode 2: Manual URL Input */}
      {tabIndex === 1 && (
        <Box>
          <TextField
            fullWidth
            size="small"
            placeholder="https://example.com/images/sample.jpg atau /uploads/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <ImageIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
              },
            }}
          />
          {value && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview URL"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Pratinjau tautan gambar eksternal
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
