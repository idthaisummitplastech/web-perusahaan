import * as React from 'react';
import type { Metadata } from 'next';
import PublicLayout from './(public)/layout';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'Halaman Dalam Pemeliharaan — PT Indonesia Thai Summit Plastech',
  description: 'Halaman ini sedang dalam tahap penyusunan dan pemeliharaan oleh tim PT Indonesia Thai Summit Plastech.',
};

export default async function RootNotFound() {
  return (
    <PublicLayout>
      <MaintenanceNotice
        title="Halaman Sedang Dalam Tahap Penyusunan & Pemeliharaan"
        subtitle="Menu atau tautan yang Anda tuju sedang dipersiapkan dan diintegrasikan oleh tim PT Indonesia Thai Summit Plastech. Silakan gunakan navigasi di atas atau tombol di bawah untuk menjelajah."
        isNotFound={true}
      />
    </PublicLayout>
  );
}
