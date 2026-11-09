import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchFromBackend } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ANTI_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Fallback mirror: GET /api/admin/employees?search=&employee_status=all — same as /api/cms/employees for dropdown compatibility
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Administrator.' }, { status: 403, headers: ANTI_CACHE_HEADERS });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const employeeStatus = searchParams.get('employee_status') || searchParams.get('employeeStatus') || 'all';
    const department = searchParams.get('department') || '';
    const contractStatus = searchParams.get('contract_status') || searchParams.get('contractStatus') || '';
    const sort = searchParams.get('sort') || 'desc';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (employeeStatus) params.set('employee_status', employeeStatus);
    if (department) params.set('department', department);
    if (contractStatus) params.set('contract_status', contractStatus);
    if (sort) params.set('sort', sort);
    const data = await fetchFromBackend<{ success: boolean; total: number; employees: any[] }>(
      `/recruitment/employees?${params.toString()}`,
      { headers: { 'X-Admin-Role': user.role } }
    );
    return NextResponse.json(
      { success: true, total: data?.total || 0, employees: data?.employees || [] },
      { headers: ANTI_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Fetch admin employees error:', error);
    return NextResponse.json({ error: 'Failed to load employee data.' }, { status: 500, headers: ANTI_CACHE_HEADERS });
  }
}
