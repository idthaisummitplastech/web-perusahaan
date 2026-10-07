'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import NavigationIcon from '@mui/icons-material/Navigation';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import CampaignIcon from '@mui/icons-material/Campaign';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StarIcon from '@mui/icons-material/Star';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ArticleIcon from '@mui/icons-material/Article';
import ReportIcon from '@mui/icons-material/Assessment';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import MailIcon from '@mui/icons-material/Mail';
import ShieldIcon from '@mui/icons-material/Shield';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import BrandLogo from '@/components/BrandLogo';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/LanguageContext';
import { Translations } from '@/lib/translations';

const DRAWER_WIDTH = 280;

interface MenuItemConfig {
  key: keyof Translations;
  defaultText: string;
  href: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
}

const MENU_ITEMS: MenuItemConfig[] = [
  { key: 'menu_dashboard', defaultText: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
  { key: 'menu_products', defaultText: 'Manufactured Products', href: '/admin/products', icon: <Inventory2Icon /> },
  { key: 'menu_certs', defaultText: 'ISO Certifications', href: '/admin/certifications', icon: <WorkspacePremiumIcon /> },
  { key: 'menu_facilities', defaultText: 'Plant Facilities', href: '/admin/facilities', icon: <PrecisionManufacturingIcon /> },
  { key: 'menu_services', defaultText: 'Services', href: '/admin/services', icon: <MiscellaneousServicesIcon /> },
  { key: 'menu_blog', defaultText: 'Blog Articles', href: '/admin/blog-posts', icon: <ArticleIcon /> },
  { key: 'menu_reports', defaultText: 'Sustainability Reports', href: '/admin/sustainability-reports', icon: <ReportIcon /> },
  { key: 'menu_hero', defaultText: 'Hero Banners', href: '/admin/hero-sections', icon: <ViewCarouselIcon /> },
  { key: 'menu_announcements', defaultText: 'Announcements', href: '/admin/announcements', icon: <CampaignIcon /> },
  { key: 'menu_features', defaultText: 'Key Features', href: '/admin/features', icon: <StarIcon /> },
  { key: 'menu_partners', defaultText: 'Partners & Clients', href: '/admin/partners', icon: <HandshakeIcon /> },
  { key: 'menu_testimonials', defaultText: 'Testimonials', href: '/admin/testimonials', icon: <FormatQuoteIcon /> },
  { key: 'menu_faqs', defaultText: 'FAQs', href: '/admin/faqs', icon: <QuizIcon /> },
  { key: 'menu_stats', defaultText: 'Statistics', href: '/admin/statistics', icon: <BarChartIcon /> },
  { key: 'menu_contacts', defaultText: 'Inbox Messages', href: '/admin/contacts', icon: <MailIcon /> },
  { key: 'menu_users', defaultText: 'User Management', href: '/admin/users', icon: <AdminPanelSettingsIcon />, adminOnly: true },
  { key: 'menu_settings', defaultText: 'Site Settings', href: '/admin/settings', icon: <SettingsIcon />, adminOnly: true },
  { key: 'menu_nav', defaultText: 'Navigation Menus', href: '/admin/nav-menus', icon: <NavigationIcon />, adminOnly: true },
  { key: 'menu_pages' as any, defaultText: 'Kelola Halaman (Pages)', href: '/admin/pages', icon: <WebAssetIcon /> },
  { key: 'menu_security', defaultText: 'Security & MFA', href: '/admin/profile', icon: <ShieldIcon /> },
];

function iconFor(name?: string | null): React.ReactElement {
  const map: Record<string, React.ReactElement> = {
    DashboardIcon: <DashboardIcon />, Inventory2Icon: <Inventory2Icon />, WorkspacePremiumIcon: <WorkspacePremiumIcon />, PrecisionManufacturingIcon: <PrecisionManufacturingIcon />, MiscellaneousServicesIcon: <MiscellaneousServicesIcon />, ArticleIcon: <ArticleIcon />, AssessmentIcon: <ReportIcon />, ViewCarouselIcon: <ViewCarouselIcon />, CampaignIcon: <CampaignIcon />, StarIcon: <StarIcon />, HandshakeIcon: <HandshakeIcon />, FormatQuoteIcon: <FormatQuoteIcon />, QuizIcon: <QuizIcon />, BarChartIcon: <BarChartIcon />, MailIcon: <MailIcon />, AdminPanelSettingsIcon: <AdminPanelSettingsIcon />, NavigationIcon: <NavigationIcon />, WebAssetIcon: <WebAssetIcon />, ShieldIcon: <ShieldIcon />, SettingsIcon: <SettingsIcon />,
  };
  return map[name || ''] || <WebAssetIcon />;
}

export default function AdminLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; mfaVerified: boolean };
}) {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [dynamicMenus, setDynamicMenus] = useState<MenuItemConfig[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/cms/admin-menus?portal=perusahaan&role=${encodeURIComponent(user.role)}`, { cache: 'no-store' })
      .then(r => r.json().catch(() => ({}))).then((j: any) => {
        const arr = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : []);
        if (!cancelled && Array.isArray(arr) && arr.length > 0) {
          const mapped: MenuItemConfig[] = arr.sort((a: any, b: any) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0)).map((m: any) => ({
            key: (m.url?.replace(/[^a-zA-Z0-9]/g, '_') || 'menu_dynamic') as any, defaultText: m.title, href: m.url, icon: iconFor(m.icon),
            adminOnly: (m.allowed_roles || m.allowedRoles || '').toLowerCase().includes('admin') && !(m.allowed_roles || m.allowedRoles || '').includes('hr'),
          }));
          setDynamicMenus(mapped);
        }
      }).catch(() => {});
    return () => { cancelled = true; };
  }, [user.role]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0F172A', color: '#FFFFFF' }}>
      {/* Brand Logo Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <BrandLogo
          title="Indonesia Thai Summit Plastech"
          subtitle="Automotive Plastic & Interior Systems"
          size="small"
          lightText={true}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
        <List disablePadding>
          {(dynamicMenus || MENU_ITEMS).filter((item) => !item.adminOnly || user.role === 'admin').map((item) => {
            const isActive = pathname === item.href;
            const label = t(item.key, item.defaultText);
            return (
              <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    bgcolor: isActive ? '#018730' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    fontWeight: isActive ? 700 : 500,
                    '&:hover': {
                      bgcolor: isActive ? '#017228' : 'rgba(255, 255, 255, 0.06)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? '#a3dfb7' : '#94A3B8',
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    slotProps={{
                      primary: {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* User Info & Public Site Link in Drawer Footer */}
      <Box sx={{ p: 2 }}>
        <Button
          component={Link}
          href="/"
          target="_blank"
          fullWidth
          size="small"
          startIcon={<OpenInNewIcon fontSize="small" />}
          sx={{
            color: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            fontSize: '0.75rem',
            mb: 1.5,
            '&:hover': { color: '#fc4509', borderColor: '#fc4509' },
          }}
          variant="outlined"
        >
          {t('admin_view_site_btn', 'View Website')}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>
            {user.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={700} color="#FFFFFF" noWrap>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Chip
                label={user.role.toUpperCase()}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: user.role === 'admin' ? '#0284C7' : '#018730',
                  color: '#FFFFFF',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F1F5F9' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#FFFFFF',
          color: '#0F172A',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
              {t('admin_panel_title', 'Content Management Panel')}
            </Typography>
            <Chip
              label={user.role === 'admin' ? t('admin_role_admin', 'Administrator') : t('admin_role_marketing', 'Marketing Team')}
              size="small"
              sx={{
                bgcolor: user.role === 'admin' ? '#F1F5F9' : '#e8f6ed',
                color: user.role === 'admin' ? '#0F172A' : '#018730',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #E2E8F0',
              }}
            />
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#018730 !important' }} />}
              label={t('admin_mfa_active', 'MFA Active')}
              size="small"
              sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Bilingual Toggle Button in Admin CMS AppBar */}
            <LanguageToggle />

            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>
                {user.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: { width: 220, mt: 1.5, borderRadius: 2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem component={Link} href="/admin/profile" onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                {t('menu_security', 'Security & MFA')}
              </MenuItem>
              {user.role === 'admin' && (
                <MenuItem component={Link} href="/admin/settings" onClick={handleProfileMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  {t('menu_settings', 'Site Settings')}
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#DC2626' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: '#DC2626' }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Persistent Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              sx: { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#0F172A' },
            },
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          slotProps={{
            paper: {
              sx: { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#0F172A', borderRight: 'none' },
            },
          }}
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
