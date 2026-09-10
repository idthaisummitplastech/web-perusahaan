import * as React from 'react';
import type { Metadata } from 'next';
import { cmsApi } from '@/lib/api-client';
import NewsClient from './NewsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News & Sustainability Reports | PT Indonesia Thai Summit Plastech',
  description:
    'Waste, GHG emissions, hazardous B3, and water management reports from PT ITSP — verified ESG documents ready for tender, audit, and buyer questionnaires.',
};

export default async function NewsPage() {
  // SSR prefetch from FastAPI CMS (single source of truth). Client will
  // revalidate via /api/public/sustainability-reports and fall back to
  // static categories if backend is unreachable.
  let initialRows: any[] = [];
  try {
    const rows = await cmsApi.getItems<any>('sustainability-reports').catch(() => []);
    initialRows = (rows || []).filter(
      (r: any) => (r.is_active ?? r.isActive ?? true) !== false,
    );
  } catch {
    initialRows = [];
  }

  return <NewsClient initialRows={initialRows} />;
}
