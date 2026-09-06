import * as React from 'react';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { Box } from '@mui/material';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch Announcement
  const announcement = await prisma.announcement.findFirst({
    where: { isActive: true },
    orderBy: { id: 'desc' },
  });

  // 2. Fetch Nav Menus (Top-level items with active children for dropdowns)
  const navMenus = await prisma.navMenu.findMany({
    where: { location: 'navbar', isActive: true, parentId: null },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  // 3. Fetch Footer Menus
  const footerMenus = await prisma.navMenu.findMany({
    where: { location: 'footer', isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // 4. Fetch Site Settings
  const settingsRows = await prisma.siteSetting.findMany();
  const settings = settingsRows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AnnouncementBanner announcement={announcement} />
      <Navbar siteTitle={settings['site_title'] || 'PT Indonesia Thai Summit Plastech'} navItems={navMenus} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer
        siteTitle={settings['site_title'] || 'PT Indonesia Thai Summit Plastech'}
        siteDescription={settings['site_description']}
        contactEmail={settings['contact_email']}
        contactPhone={settings['contact_phone']}
        contactAddress={settings['contact_address']}
        footerItems={footerMenus}
      />
    </Box>
  );
}
