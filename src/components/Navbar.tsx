'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Container,
  Stack,
  Divider,
  Slide,
  useScrollTrigger,
  Paper,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import BrandLogo from '@/components/BrandLogo';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/LanguageContext';

export interface NavItem {
  id: number;
  title: string;
  url: string;
  children?: NavItem[];
}

interface NavbarProps {
  siteTitle?: string;
  navItems?: NavItem[];
}

export default function Navbar({
  siteTitle = 'PT Indonesia Thai Summit Plastech',
  navItems = [
    { id: 1, title: 'Beranda', url: '/' },
    { id: 2, title: 'Produk', url: '/products' },
    { id: 3, title: 'Layanan', url: '/services' },
    { id: 4, title: 'Blog', url: '/blog' },
    { id: 5, title: 'Kontak', url: '/contact' },
    { id: 6, title: 'Karir', url: '/careers' },
  ],
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<number, boolean>>({});
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const getDisplayTitle = (title: string) => {
    if (language === 'id') return title;
    const map: Record<string, string> = {
      'beranda': 'Home',
      'produk': 'Products',
      'layanan': 'Services',
      'sertifikasi': 'Certifications',
      'fasilitas': 'Facilities',
      'tentang kami': 'About Us',
      'berita': 'News & Media',
      'berita & artikel': 'News & Articles',
      'artikel': 'Articles',
      'blog': 'News & Media',
      'kontak': 'Contact Us',
      'karir': 'Careers',
    };
    const key = title.trim().toLowerCase();
    return map[key] || title;
  };

  // Mobile drawer toggle
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const toggleMobileSubmenu = (id: number) => {
    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hide on scroll down, show on scroll up using MUI's useScrollTrigger
  const trigger = useScrollTrigger();

  // Filter out /contact from inline desktop navigation so it doesn't duplicate the dedicated 'Hubungi Kami' CTA button
  const desktopNavItems = navItems.filter((item) => item.url !== '/contact');

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
            zIndex: 1100,
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(16px)',
            borderTop: '3px solid #018730',
            borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            color: '#0F172A',
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Toolbar disableGutters sx={{ height: { xs: 68, md: 74 }, justifyContent: 'space-between', gap: 2 }}>
              {/* Brand Logo with Green & Orange Symbol */}
              <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <BrandLogo title={siteTitle} lightText={false} size="medium" />
              </Link>

              {/* Desktop Navigation Links */}
              <Stack
                direction="row"
                spacing={{ md: 0.5, lg: 1 }}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {desktopNavItems.map((item) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isParentActive =
                    pathname === item.url ||
                    (item.url !== '/' && pathname.startsWith(item.url)) ||
                    (hasChildren && item.children?.some((child) => pathname === child.url || pathname.startsWith(child.url)));
                  const isOpen = activeDropdownId === item.id;

                  if (hasChildren) {
                    return (
                      <Box
                        key={item.id}
                        onMouseEnter={() => setActiveDropdownId(item.id)}
                        onMouseLeave={() => setActiveDropdownId(null)}
                        sx={{ position: 'relative', py: 1 }}
                      >
                        <Button
                          component={Link}
                          href={item.url}
                          endIcon={
                            <KeyboardArrowDownIcon
                              sx={{
                                fontSize: '18px !important',
                                ml: -0.2,
                                transition: 'transform 0.2s ease',
                                transform: isOpen ? 'rotate(180deg)' : 'none',
                                color: isOpen || isParentActive ? '#018730' : '#64748B',
                              }}
                            />
                          }
                          sx={{
                            color: isParentActive ? '#018730' : '#334155',
                            fontWeight: isParentActive ? 700 : 500,
                            fontSize: { md: '0.88rem', lg: '0.925rem' },
                            whiteSpace: 'nowrap',
                            textTransform: 'none',
                            letterSpacing: '-0.01em',
                            px: { md: 1.4, lg: 1.8 },
                            py: 1,
                            borderRadius: '8px',
                            position: 'relative',
                            bgcolor: isParentActive || isOpen ? 'rgba(1, 135, 48, 0.05)' : 'transparent',
                            '&:hover': {
                              color: '#018730',
                              bgcolor: 'rgba(1, 135, 48, 0.05)',
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: 3,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: isParentActive ? '36px' : '0px',
                              height: '2.5px',
                              borderRadius: '3px',
                              bgcolor: '#018730',
                              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                            '&:hover::after': {
                              width: '36px',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {getDisplayTitle(item.title)}
                        </Button>

                        {/* Dropdown Menu Container */}
                        <Paper
                          elevation={4}
                          sx={{
                            position: 'absolute',
                            top: 'calc(100% - 2px)',
                            left: 0,
                            minWidth: 240,
                            zIndex: 1300,
                            opacity: isOpen ? 1 : 0,
                            visibility: isOpen ? 'visible' : 'hidden',
                            transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
                            transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease',
                            pointerEvents: isOpen ? 'auto' : 'none',
                            borderRadius: '12px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid rgba(226, 232, 240, 0.9)',
                            borderTop: '3px solid #018730',
                            boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 6px 16px -4px rgba(0, 0, 0, 0.04)',
                            overflow: 'hidden',
                            p: 1,
                          }}
                        >
                          {/* Parent overview link */}
                          {item.url && item.url !== '#' && (
                            <Box
                              component={Link}
                              href={item.url}
                              onClick={() => setActiveDropdownId(null)}
                              sx={{
                                display: 'block',
                                px: 1.8,
                                py: 1,
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#018730',
                                borderRadius: 1.5,
                                textDecoration: 'none',
                                borderBottom: '1px solid #F1F5F9',
                                mb: 0.5,
                                '&:hover': { bgcolor: 'rgba(1, 135, 48, 0.06)' },
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {language === 'en' ? `All ${getDisplayTitle(item.title)} →` : `Semua ${item.title} →`}
                            </Box>
                          )}

                          {/* Sub-menu items */}
                          {item.children?.map((child) => {
                            const isChildActive = pathname === child.url;
                            return (
                              <Box
                                key={child.id}
                                component={Link}
                                href={child.url}
                                onClick={() => setActiveDropdownId(null)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  px: 1.8,
                                  py: 1,
                                  fontSize: '0.875rem',
                                  fontWeight: isChildActive ? 700 : 500,
                                  color: isChildActive ? '#018730' : '#1E293B',
                                  borderRadius: 1.5,
                                  textDecoration: 'none',
                                  bgcolor: isChildActive ? 'rgba(1, 135, 48, 0.06)' : 'transparent',
                                  borderLeft: isChildActive ? '3px solid #018730' : '3px solid transparent',
                                  '&:hover': {
                                    bgcolor: 'rgba(1, 135, 48, 0.04)',
                                    color: '#018730',
                                    borderLeft: '3px solid #fc4509',
                                    pl: 2.2,
                                  },
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {getDisplayTitle(child.title)}
                              </Box>
                            );
                          })}
                        </Paper>
                      </Box>
                    );
                  }

                  // Single menu item without children
                  return (
                    <Button
                      key={item.id}
                      component={Link}
                      href={item.url}
                      sx={{
                        color: isParentActive ? '#018730' : '#334155',
                        fontWeight: isParentActive ? 700 : 500,
                        fontSize: { md: '0.88rem', lg: '0.925rem' },
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                        letterSpacing: '-0.01em',
                        px: { md: 1.4, lg: 1.8 },
                        py: 1,
                        borderRadius: '8px',
                        position: 'relative',
                        bgcolor: isParentActive ? 'rgba(1, 135, 48, 0.05)' : 'transparent',
                        '&:hover': {
                          color: '#018730',
                          bgcolor: 'rgba(1, 135, 48, 0.05)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 3,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: isParentActive ? '36px' : '0px',
                          height: '2.5px',
                          borderRadius: '3px',
                          bgcolor: '#018730',
                          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                        '&:hover::after': {
                          width: '36px',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {getDisplayTitle(item.title)}
                    </Button>
                  );
                })}
              </Stack>

              {/* Action Buttons: Brand Green Primary CTA & Clean Admin */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {/* Modern Bilingual Language Switcher (Default: English) */}
                <LanguageToggle size="small" />

                <Button
                  component={Link}
                  href="/login"
                  variant="text"
                  size="small"
                  startIcon={<LockPersonIcon sx={{ fontSize: '16px !important', color: '#64748B' }} />}
                  sx={{
                    borderColor: '#E2E8F0',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#F8FAFC',
                    color: '#475569',
                    borderRadius: '8px',
                    px: 1.6,
                    py: 0.8,
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      borderColor: '#018730',
                      color: '#018730',
                      bgcolor: 'rgba(1, 135, 48, 0.05)',
                      '& .MuiSvgIcon-root': { color: '#018730' },
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Login
                </Button>

                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  size="small"
                  startIcon={<SupportAgentIcon sx={{ fontSize: '18px !important' }} />}
                  sx={{
                    background: pathname === '/contact'
                      ? 'linear-gradient(135deg, #016e27 0%, #018730 100%)'
                      : 'linear-gradient(135deg, #018730 0%, #009e3a 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: '30px',
                    px: { md: 2.2, lg: 2.6 },
                    py: 0.9,
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    boxShadow: pathname === '/contact'
                      ? '0 0 0 3px rgba(1, 135, 48, 0.35), 0 4px 14px rgba(1, 135, 48, 0.4)'
                      : '0 4px 14px rgba(1, 135, 48, 0.28)',
                    letterSpacing: '0.01em',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #016f27 0%, #018730 100%)',
                      boxShadow: '0 6px 20px rgba(1, 135, 48, 0.42)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {t('nav_contact_cta', 'Contact Us')}
                </Button>
              </Stack>

              {/* Mobile Right Controls: Language Switcher & Hamburger */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
                <LanguageToggle size="small" />
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={toggleDrawer(true)}
                  sx={{ color: '#018730' }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '85%', sm: 340 },
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <BrandLogo title={siteTitle} lightText={false} size="small" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageToggle size="small" />
            <IconButton onClick={toggleDrawer(false)} sx={{ color: '#64748B' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider sx={{ borderColor: '#E2E8F0', mb: 2 }} />

        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isParentActive =
              pathname === item.url ||
              (item.url !== '/' && pathname.startsWith(item.url)) ||
              (hasChildren && item.children?.some((child) => pathname === child.url || pathname.startsWith(child.url)));
            const isExpanded = Boolean(mobileExpanded[item.id]);

            if (hasChildren) {
              return (
                <Box key={item.id} sx={{ mb: 0.5 }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => toggleMobileSubmenu(item.id)}
                      sx={{
                        borderRadius: 2,
                        color: isParentActive ? '#018730' : '#334155',
                        bgcolor: isParentActive ? 'rgba(1, 135, 48, 0.08)' : 'transparent',
                        borderLeft: isParentActive ? '3px solid #018730' : '3px solid transparent',
                        fontWeight: isParentActive ? 800 : 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        '&:hover': { backgroundColor: 'rgba(1, 135, 48, 0.05)' },
                      }}
                    >
                      <Typography sx={{ fontWeight: isParentActive ? 700 : 600, fontSize: '0.95rem' }}>
                        {getDisplayTitle(item.title)}
                      </Typography>
                      {isExpanded ? <ExpandLess sx={{ color: '#018730' }} /> : <ExpandMore sx={{ color: '#64748B' }} />}
                    </ListItemButton>
                  </ListItem>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2, mt: 0.5 }}>
                      {item.url && item.url !== '#' && (
                        <ListItemButton
                          component={Link}
                          href={item.url}
                          onClick={toggleDrawer(false)}
                          sx={{
                            borderRadius: 1.5,
                            py: 0.8,
                            mb: 0.5,
                            color: '#018730',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#018730' }}>
                            {language === 'en' ? `All ${getDisplayTitle(item.title)} →` : `Semua ${item.title} →`}
                          </Typography>
                        </ListItemButton>
                      )}

                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.url;
                        return (
                          <ListItemButton
                            key={child.id}
                            component={Link}
                            href={child.url}
                            onClick={toggleDrawer(false)}
                            sx={{
                              borderRadius: 1.5,
                              py: 0.8,
                              mb: 0.5,
                              color: isChildActive ? '#018730' : '#475569',
                              bgcolor: isChildActive ? 'rgba(1, 135, 48, 0.06)' : 'transparent',
                              borderLeft: isChildActive ? '3px solid #018730' : '3px solid transparent',
                              '&:hover': { bgcolor: 'rgba(1, 135, 48, 0.04)' },
                            }}
                          >
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: isChildActive ? 700 : 500 }}>
                              {getDisplayTitle(child.title)}
                            </Typography>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.url}
                  onClick={toggleDrawer(false)}
                  sx={{
                    borderRadius: 2,
                    color: isParentActive ? '#018730' : '#334155',
                    bgcolor: isParentActive ? 'rgba(1, 135, 48, 0.08)' : 'transparent',
                    borderLeft: isParentActive ? '3px solid #018730' : '3px solid transparent',
                    '&:hover': { backgroundColor: 'rgba(1, 135, 48, 0.05)' },
                  }}
                >
                  <Typography sx={{ fontWeight: isParentActive ? 700 : 500, fontSize: '0.95rem' }}>
                    {getDisplayTitle(item.title)}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', pt: 2.5, borderTop: '1px solid #E2E8F0' }}>
          <Button
            component={Link}
            href="/contact"
            fullWidth
            variant="contained"
            startIcon={<SupportAgentIcon />}
            sx={{
              background: 'linear-gradient(135deg, #018730 0%, #009e3a 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              mb: 1.5,
              py: 1.2,
              borderRadius: '25px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(1, 135, 48, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #016f27 0%, #018730 100%)',
              },
            }}
          >
            Hubungi Kami
          </Button>

          <Button
            component={Link}
            href="/login"
            fullWidth
            variant="outlined"
            startIcon={<LockPersonIcon />}
            sx={{
              borderColor: '#CBD5E1',
              color: '#475569',
              borderRadius: '10px',
              py: 1.1,
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#018730',
                color: '#018730',
                bgcolor: 'rgba(1, 135, 48, 0.05)',
              },
            }}
          >
            Login
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
