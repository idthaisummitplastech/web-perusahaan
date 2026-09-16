import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'Pemberitahuan Pemeliharaan Sistem — PT Indonesia Thai Summit Plastech',
  description: 'Halaman ini sedang dalam tahap pemeliharaan dan peningkatan sistem oleh tim PT Indonesia Thai Summit Plastech.',
};

export default function MaintenancePage() {
  return (
    <MaintenanceNotice
      title="Halaman Sedang Dalam Tahap Pemeliharaan & Integrasi"
      subtitle="Layanan dan konten pada halaman ini sedang ditingkatkan oleh tim kami untuk memastikan informasi yang disajikan akurat, mutakhir, dan berstandar internasional."
      isNotFound={false}
    />
  );
}
