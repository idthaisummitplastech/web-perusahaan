import * as React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If user is accessing /admin/mfa-setup directly without completing setup,
  // let page handle setup, otherwise ensure auth
  if (!user) {
    // In server component layout, allow mfa-setup through if handled by page/middleware
    // But for general admin pages:
    return <>{children}</>;
  }

  return (
    <AdminLayoutClient
      user={{
        name: user.name || 'Administrator',
        email: user.email,
        role: user.role,
        mfaVerified: user.mfaVerified,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
