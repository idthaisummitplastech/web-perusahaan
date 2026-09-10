import * as React from 'react';
import { fetchFromBackend } from '@/lib/api-client';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await fetchFromBackend('/cms/dashboard-stats').catch((err) => {
    console.error('Failed to fetch dashboard stats:', err);
    return {
      productCount: 0,
      certCount: 0,
      facilityCount: 0,
      serviceCount: 0,
      blogCount: 0,
      reportCount: 0,
      contactCount: 0,
      unreadContacts: 0,
      userCount: 0,
      recentContacts: [],
    };
  });

  return (
    <AdminDashboardClient
      productCount={stats.productCount ?? stats.product_count ?? 0}
      certCount={stats.certCount ?? stats.cert_count ?? 0}
      facilityCount={stats.facilityCount ?? stats.facility_count ?? 0}
      contactCount={stats.contactCount ?? stats.contact_count ?? 0}
      unreadContacts={stats.unreadContacts ?? stats.unread_contacts ?? 0}
      blogCount={stats.blogCount ?? stats.blog_count ?? 0}
      reportCount={stats.reportCount ?? stats.report_count ?? 0}
      userCount={stats.userCount ?? stats.user_count ?? 0}
      recentContacts={(stats.recentContacts ?? stats.recent_contacts ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        createdAt: c.createdAt || c.created_at || new Date().toISOString(),
        isRead: c.isRead ?? c.is_read ?? false,
      }))}
    />
  );
}
