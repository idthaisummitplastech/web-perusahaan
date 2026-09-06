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
import BrandLogo from '@/components/BrandLogo';

const DRAWER_WIDTH = 260;

const MENU_ITEMS = [
  { text: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
  { text: 'Produk Manufaktur', href: '/admin/products', icon: <Inventory2Icon /> },
  { text: 'Sertifikasi ISO', href: '/admin/certifications', icon: <WorkspacePremiumIcon /> },
  { text: 'Fasilitas Pabrik', href: '/admin/facilities', icon: <PrecisionManufacturingIcon /> },
  { text: 'Layanan', href: '/admin/services', icon: <MiscellaneousServicesIcon /> },
  { text: 'Artikel Blog', href: '/admin/blog-posts', icon: <ArticleIcon /> },
  { text: 'Hero Sections', href: '/admin/hero-sections', icon: <ViewCarouselIcon /> },
  { text: 'Pengumuman', href: '/admin/announcements', icon: <CampaignIcon /> },
  { text: 'Fitur Utama', href: '/admin/features', icon: <StarIcon /> },
  { text: 'Mitra & Klien', href: '/admin/partners', icon: <HandshakeIcon /> },
  { text: 'Testimoni', href: '/admin/testimonials', icon: <FormatQuoteIcon /> },
  { text: 'Tanya Jawab (FAQ)', href: '/admin/faqs', icon: <QuizIcon /> },
  { text: 'Statistik', href: '/admin/statistics', icon: <BarChartIcon /> },
  { text: 'Pesan Masuk', href: '/admin/contacts', icon: <MailIcon /> },
  { text: 'Manajemen Pengguna', href: '/admin/users', icon: <AdminPanelSettingsIcon />, adminOnly: true },
  { text: 'Pengaturan Web', href: '/admin/settings', icon: <SettingsIcon />, adminOnly: true },
  { text: 'Menu Navigasi', href: '/admin/nav-menus', icon: <NavigationIcon />, adminOnly: true },
  { text: 'Keamanan & MFA', href: '/admin/profile', icon: <ShieldIcon /> },
];

export default function AdminLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; mfaVerified: boolean };
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
        <BrandLogo title="Thai Summit" size="small" lightText={true} />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
        <List disablePadding>
          {MENU_ITEMS.filter((item) => !item.adminOnly || user.role === 'admin').map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
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
                    primary={item.text}
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
          Lihat Website Publik
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
              Panel Pengelola Konten
            </Typography>
            <Chip
              label={user.role === 'admin' ? 'Administrator' : 'Tim Marketing'}
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
              label="MFA Aktif"
              size="small"
              sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  elevation: 3,
                  sx: { width: 220, borderRadius: 2, mt: 1, p: 0.5 },
                },
              }}
            >
              <MenuItem component={Link} href="/admin/profile" onClick={handleProfileMenuClose}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Profil & Keamanan" />
              </MenuItem>
              <MenuItem component={Link} href="/" target="_blank" onClick={handleProfileMenuClose}>
                <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Website Publik" />
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
                <ListItemText primary="Keluar (Logout)" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' },
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
