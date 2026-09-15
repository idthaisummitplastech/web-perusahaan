import * as React from 'react';
import { cmsApi } from '@/lib/api-client';
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
  // 1. Fetch Announcement via Python Backend
  const announcements = await cmsApi.getItems('announcements').catch(() => []);
  const announcement = announcements.find((a: any) => a.is_active ?? a.isActive) || null;

  // 2. Fetch Nav Menus via Python Backend
  const allNavMenus = await cmsApi.getItems('nav-menus').catch(() => []);
  const activeMenus = allNavMenus.filter((m: any) => m.is_active ?? m.isActive);

  // Top-level navbar items with active children
  let navMenus: any[] = [];
  if (activeMenus.length > 0) {
    let ensuredMenus = [...activeMenus];
    if (!ensuredMenus.some((m: any) => m.url === '/news' && m.location === 'navbar')) {
      ensuredMenus.push({ id: 9001, title: 'News', url: '/news', location: 'navbar', sort_order: 6, sortOrder: 6, is_active: true, isActive: true, parent_id: null, parentId: null });
    }
    if (!ensuredMenus.some((m: any) => (m.url === '/blog' || m.url?.startsWith('/blog')) && m.location === 'navbar')) {
      ensuredMenus.push({ id: 9002, title: 'Blog', url: '/blog', location: 'navbar', sort_order: 7, sortOrder: 7, is_active: true, isActive: true, parent_id: null, parentId: null });
    }
    navMenus = ensuredMenus
      .filter((m: any) => m.location === 'navbar' && !m.parent_id && !m.parentId)
      .sort((a: any, b: any) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0))
      .map((parent: any) => ({
        ...parent,
        sortOrder: parent.sort_order ?? parent.sortOrder ?? 0,
        children: ensuredMenus
          .filter((c: any) => (c.parent_id ?? c.parentId) === parent.id)
          .sort((a: any, b: any) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0)),
      }));
  }

  // 3. Fetch Footer Menus
  let ensuredFooter = [...activeMenus.filter((m: any) => m.location === 'footer')];
  if (!ensuredFooter.some((m: any) => m.url === '/blog' || m.url?.startsWith('/blog'))) {
    ensuredFooter.push({ id: 9003, title: 'Blog & Artikel', url: '/blog', location: 'footer', sort_order: 15, sortOrder: 15, is_active: true, isActive: true, section: 'Informasi' });
  }
  const footerMenus = ensuredFooter
    .sort((a: any, b: any) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0));

  // 4. Fetch Site Settings via Python Backend
  const settingsRows = await cmsApi.getItems('settings').catch(() => []);
  const settings = (settingsRows || []).reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AnnouncementBanner announcement={announcement} />
      <Navbar siteTitle={settings['site_title'] || 'PT Indonesia Thai Summit Plastech'} navItems={navMenus.length > 0 ? navMenus : undefined} />
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
