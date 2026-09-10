import { NextResponse } from 'next/server';
import { cmsApi } from '@/lib/api-client';

export async function GET() {
  try {
    const rows = await cmsApi.getItems<any>('sustainability-reports').catch(() => []);
    const active = (rows || []).filter((r: any) => (r.is_active ?? r.isActive ?? true) !== false);
    return NextResponse.json(active);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}
