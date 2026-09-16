import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'Halaman Dalam Pemeliharaan — PT Indonesia Thai Summit Plastech',
  description: 'Halaman ini sedang dalam tahap penyusunan dan pemeliharaan oleh tim PT Indonesia Thai Summit Plastech.',
};

export default function PublicNotFound() {
  return (
    <MaintenanceNotice
      title="Halaman Sedang Dalam Tahap Penyusunan & Pemeliharaan"
      subtitle="Menu atau tautan yang Anda buka saat ini sedang disiapkan oleh tim kami. Silakan jelajahi menu lain atau hubungi kami bila memerlukan informasi lebih lanjut."
      isNotFound={true}
    />
  );
}
