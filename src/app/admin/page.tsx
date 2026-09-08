import * as React from 'react';
import prisma from '@/lib/prisma';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    productCount,
    certCount,
    facilityCount,
    serviceCount,
    blogCount,
    contactCount,
    unreadContacts,
    userCount,
    recentContacts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.certification.count(),
    prisma.facility.count(),
    prisma.service.count(),
    prisma.blogPost.count(),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { isRead: false } }),
    prisma.user.count(),
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return (
    <AdminDashboardClient
      productCount={productCount}
      certCount={certCount}
      facilityCount={facilityCount}
      contactCount={contactCount}
      unreadContacts={unreadContacts}
      blogCount={blogCount}
      userCount={userCount}
      recentContacts={recentContacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        createdAt: c.createdAt.toISOString(),
        isRead: c.isRead,
      }))}
    />
  );
}
