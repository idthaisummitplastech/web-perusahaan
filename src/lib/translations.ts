export type Language = 'en' | 'id';

export interface Translations {
  // Navigation
  nav_home: string;
  nav_products: string;
  nav_services: string;
  nav_certifications: string;
  nav_facilities: string;
  nav_about: string;
  nav_blog: string;
  nav_contact: string;
  nav_careers: string;
  nav_admin_login: string;
  nav_view_all: string;
  nav_contact_cta: string;

  // Hero Section
  hero_badge: string;
  hero_title_default: string;
  hero_subtitle_default: string;
  hero_primary_btn: string;
  hero_secondary_btn: string;

  // Certifications Page
  cert_badge: string;
  cert_title: string;
  cert_subtitle: string;
  cert_active: string;
  cert_valid_until: string;
  cert_zoom: string;
  cert_number: string;
  cert_issuer: string;
  cert_cta_title: string;
  cert_cta_desc: string;
  cert_cta_btn: string;

  // Products & Services
  prod_title: string;
  prod_subtitle: string;
  prod_category: string;
  prod_explore: string;
  prod_specifications: string;
  serv_title: string;
  serv_subtitle: string;
  serv_learn_more: string;

  // Contact Page
  contact_badge: string;
  contact_title: string;
  contact_subtitle: string;
  contact_name: string;
  contact_email: string;
  contact_subject: string;
  contact_message: string;
  contact_send: string;
  contact_sending: string;
  contact_success: string;

  // Footer
  footer_about_title: string;
  footer_quick_links: string;
  footer_plant_location: string;
  footer_rights: string;
  footer_group: string;

  // Common UI
  btn_back: string;
  btn_close: string;
  btn_download: string;
  status_active: string;
  status_inactive: string;
  loading: string;

  // Admin CMS & Layout
  admin_panel_title: string;
  admin_role_admin: string;
  admin_role_marketing: string;
  admin_mfa_active: string;
  admin_settings_btn: string;
  admin_view_site_btn: string;
  admin_dashboard_title: string;
  admin_dashboard_desc: string;
  admin_mfa_banner_title: string;
  admin_mfa_banner_desc: string;
  admin_manage_security: string;

  // Admin Stats
  admin_stat_products: string;
  admin_stat_certs: string;
  admin_stat_facilities: string;
  admin_stat_inbox: string;
  admin_stat_new: string;
  admin_stat_blog: string;
  admin_stat_reports: string;
  admin_stat_users: string;

  // Admin Menus
  menu_dashboard: string;
  menu_products: string;
  menu_certs: string;
  menu_facilities: string;
  menu_services: string;
  menu_blog: string;
  menu_reports: string;
  menu_hero: string;
  menu_announcements: string;
  menu_features: string;
  menu_partners: string;
  menu_testimonials: string;
  menu_faqs: string;
  menu_stats: string;
  menu_contacts: string;
  menu_users: string;
  menu_settings: string;
  menu_nav: string;
  menu_security: string;

  // Admin Tables
  admin_table_recent_contacts: string;
  admin_table_view_all: string;
  admin_table_col_sender: string;
  admin_table_col_email: string;
  admin_table_col_subject: string;
  admin_table_col_status: string;
  admin_table_unread: string;
  admin_table_read: string;
  admin_table_empty: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_products: 'Products',
    nav_services: 'Services',
    nav_certifications: 'Certifications',
    nav_facilities: 'Facilities',
    nav_about: 'About Us',
    nav_blog: 'News & Media',
    nav_contact: 'Contact Us',
    nav_careers: 'Careers',
    nav_admin_login: 'Staff Login',
    nav_view_all: 'View All',
    nav_contact_cta: 'Contact Us',

    // Hero Section
    hero_badge: 'Tier-1 Automotive Plastic Injection & Assembly',
    hero_title_default: 'Precision Automotive Plastic Engineering',
    hero_subtitle_default: 'High-precision plastic injection molding, robotic spray painting, and interior assembly trusted by leading global automotive OEMs.',
    hero_primary_btn: 'Explore Products',
    hero_secondary_btn: 'Inquire Now',

    // Certifications Page
    cert_badge: 'Global Compliance & Quality Standards',
    cert_title: 'International Automotive Certifications',
    cert_subtitle: 'All quality management, plastic injection molding, occupational health & safety, and environmental stewardship systems at PT ITSP are certified by international audit bodies.',
    cert_active: 'Active',
    cert_valid_until: 'Valid until',
    cert_zoom: 'Zoom Certificate',
    cert_number: 'Certificate No.',
    cert_issuer: 'Issuing Body',
    cert_cta_title: 'Need Official Certificate Documents for OEM Due Diligence?',
    cert_cta_desc: 'Contact our Quality Assurance (QA) and sales department for certified official copies.',
    cert_cta_btn: 'Contact QA / Marketing Team',

    // Products & Services
    prod_title: 'Automotive Components Catalog',
    prod_subtitle: 'OEM certified interior and exterior plastic parts engineered for durability and precision.',
    prod_category: 'Category',
    prod_explore: 'View Product Line',
    prod_specifications: 'Technical Specifications',
    serv_title: 'Manufacturing Capabilities & Services',
    serv_subtitle: 'End-to-end industrial manufacturing from tooling design to robotic assembly.',
    serv_learn_more: 'Learn More',

    // Contact Page
    contact_badge: 'Direct Communication',
    contact_title: 'Get in Touch With Our Engineering & Sales Team',
    contact_subtitle: 'Inquire about manufacturing partnerships, OEM supply quotes, or facility tours.',
    contact_name: 'Full Name',
    contact_email: 'Corporate Email Address',
    contact_subject: 'Subject / Department',
    contact_message: 'Inquiry Details / Message',
    contact_send: 'Send Inquiry',
    contact_sending: 'Submitting Message...',
    contact_success: 'Your message has been sent successfully to PT ITSP.',

    // Footer
    footer_about_title: 'PT Indonesia Thai Summit Plastech',
    footer_quick_links: 'Quick Navigation',
    footer_plant_location: 'Plant & Office Address',
    footer_rights: 'All Rights Reserved',
    footer_group: 'A Member of Thai Summit Group',

    // Common UI
    btn_back: 'Back',
    btn_close: 'Close',
    btn_download: 'Download Document',
    status_active: 'Active',
    status_inactive: 'Inactive',
    loading: 'Loading...',

    // Admin CMS & Layout
    admin_panel_title: 'Content Management Panel',
    admin_role_admin: 'Administrator',
    admin_role_marketing: 'Marketing Team',
    admin_mfa_active: 'MFA Active',
    admin_settings_btn: 'Site Settings',
    admin_view_site_btn: 'View Website',
    admin_dashboard_title: 'Content Management Dashboard',
    admin_dashboard_desc: 'Instantly manage all your website content from header navigation to footer.',
    admin_mfa_banner_title: 'Multi-Factor Authentication (MFA) Active',
    admin_mfa_banner_desc: 'Your account is secured with 2-Step TOTP encryption upon every login.',
    admin_manage_security: 'Manage Security →',

    // Admin Stats
    admin_stat_products: 'Manufactured Products',
    admin_stat_certs: 'ISO Certifications',
    admin_stat_facilities: 'Plant Facilities',
    admin_stat_inbox: 'Inbox Messages',
    admin_stat_new: 'New',
    admin_stat_blog: 'Blog Articles',
    admin_stat_reports: 'Sustainability Reports',
    admin_stat_users: 'CMS Users',

    // Admin Menus
    menu_dashboard: 'Dashboard',
    menu_products: 'Manufactured Products',
    menu_certs: 'ISO Certifications',
    menu_facilities: 'Plant Facilities',
    menu_services: 'Services',
    menu_blog: 'Blog Articles',
    menu_reports: 'Sustainability Reports',
    menu_hero: 'Hero Banners',
    menu_announcements: 'Announcements',
    menu_features: 'Key Features',
    menu_partners: 'Partners & Clients',
    menu_testimonials: 'Testimonials',
    menu_faqs: 'FAQs',
    menu_stats: 'Statistics',
    menu_contacts: 'Inbox Messages',
    menu_users: 'User Management',
    menu_settings: 'Site Settings',
    menu_nav: 'Navigation Menus',
    menu_security: 'Security & MFA',

    // Admin Tables
    admin_table_recent_contacts: 'Recent Contact Inquiries',
    admin_table_view_all: 'View All Messages',
    admin_table_col_sender: 'Sender Name',
    admin_table_col_email: 'Email',
    admin_table_col_subject: 'Subject',
    admin_table_col_status: 'Status',
    admin_table_unread: 'Unread',
    admin_table_read: 'Read',
    admin_table_empty: 'No contact inquiries received yet.',
  },
  id: {
    // Navigation
    nav_home: 'Beranda',
    nav_products: 'Produk',
    nav_services: 'Layanan',
    nav_certifications: 'Sertifikasi',
    nav_facilities: 'Fasilitas',
    nav_about: 'Tentang Kami',
    nav_blog: 'Berita & Artikel',
    nav_contact: 'Kontak',
    nav_careers: 'Karir',
    nav_admin_login: 'Login Pegawai',
    nav_view_all: 'Semua',
    nav_contact_cta: 'Hubungi Kami',

    // Hero Section
    hero_badge: 'Manufaktur Injeksi Plastik & Perakitan Otomotif Tier-1',
    hero_title_default: 'Rekayasa Plastik Otomotif Presisi Tinggi',
    hero_subtitle_default: 'Manufaktur injeksi plastik berpresisi tinggi, pengecatan robotik, dan perakitan interior yang dipercaya oleh OEM otomotif terkemuka dunia.',
    hero_primary_btn: 'Jelajahi Produk',
    hero_secondary_btn: 'Hubungi Kami',

    // Certifications Page
    cert_badge: 'Standar & Kepatuhan Global',
    cert_title: 'Sertifikasi Internasional Otomotif',
    cert_subtitle: 'Seluruh sistem manajemen mutu, manufaktur injeksi plastik, keselamatan kerja, dan kelestarian lingkungan PT ITSP telah terakreditasi oleh lembaga audit global.',
    cert_active: 'Aktif',
    cert_valid_until: 'Berlaku s/d',
    cert_zoom: 'Perbesar Sertifikat',
    cert_number: 'No. Sertifikat',
    cert_issuer: 'Badan Penerbit',
    cert_cta_title: 'Butuh Dokumen Sertifikat Resmi untuk Due Diligence OEM?',
    cert_cta_desc: 'Hubungi departemen Quality Assurance (QA) dan pemasaran kami untuk salinan sertifikat resmi terlegalisir.',
    cert_cta_btn: 'Hubungi Tim QA / Marketing',

    // Products & Services
    prod_title: 'Katalog Komponen Otomotif',
    prod_subtitle: 'Suku cadang plastik interior dan eksterior bersertifikasi OEM yang dirancang untuk daya tahan dan presisi.',
    prod_category: 'Kategori',
    prod_explore: 'Lihat Lini Produk',
    prod_specifications: 'Spesifikasi Teknis',
    serv_title: 'Kapabilitas Manufaktur & Layanan',
    serv_subtitle: 'Manufaktur industri terpadu mulai dari desain cetakan hingga perakitan robotik.',
    serv_learn_more: 'Pelajari Lebih Lanjut',

    // Contact Page
    contact_badge: 'Komunikasi Langsung',
    contact_title: 'Hubungi Tim Engineering & Pemasaran Kami',
    contact_subtitle: 'Konsultasikan kebutuhan kemitraan manufaktur, penawaran pasokan OEM, atau kunjungan fasilitas pabrik.',
    contact_name: 'Nama Lengkap',
    contact_email: 'Alamat Email Perusahaan',
    contact_subject: 'Subjek / Departemen',
    contact_message: 'Rincian Pertanyaan / Pesan',
    contact_send: 'Kirim Pesan',
    contact_sending: 'Mengirim Pesan...',
    contact_success: 'Pesan Anda telah berhasil dikirim ke tim PT ITSP.',

    // Footer
    footer_about_title: 'PT Indonesia Thai Summit Plastech',
    footer_quick_links: 'Navigasi Cepat',
    footer_plant_location: 'Alamat Pabrik & Kantor',
    footer_rights: 'Hak Cipta Dilindungi Undang-Undang',
    footer_group: 'Bagian dari Thai Summit Group',

    // Common UI
    btn_back: 'Kembali',
    btn_close: 'Tutup',
    btn_download: 'Unduh Dokumen',
    status_active: 'Aktif',
    status_inactive: 'Nonaktif',
    loading: 'Memuat...',

    // Admin CMS & Layout
    admin_panel_title: 'Panel Pengelola Konten',
    admin_role_admin: 'Administrator',
    admin_role_marketing: 'Tim Marketing',
    admin_mfa_active: 'MFA Aktif',
    admin_settings_btn: 'Pengaturan Web',
    admin_view_site_btn: 'Lihat Website',
    admin_dashboard_title: 'Dashboard Pengelola Konten',
    admin_dashboard_desc: 'Kelola seluruh konten website Anda mulai dari navigasi header hingga footer secara instan.',
    admin_mfa_banner_title: 'Autentikasi Multi-Faktor (MFA) Berjalan Aktif',
    admin_mfa_banner_desc: 'Akun Anda terlindungi dengan standar enkripsi TOTP 2-Langkah setiap kali login.',
    admin_manage_security: 'Kelola Keamanan →',

    // Admin Stats
    admin_stat_products: 'Produk Manufaktur',
    admin_stat_certs: 'Sertifikasi ISO',
    admin_stat_facilities: 'Fasilitas Pabrik',
    admin_stat_inbox: 'Pesan Masuk',
    admin_stat_new: 'Baru',
    admin_stat_blog: 'Artikel Blog',
    admin_stat_reports: 'Laporan Sustainability',
    admin_stat_users: 'Pengguna CMS',

    // Admin Menus
    menu_dashboard: 'Dashboard',
    menu_products: 'Produk Manufaktur',
    menu_certs: 'Sertifikasi ISO',
    menu_facilities: 'Fasilitas Pabrik',
    menu_services: 'Layanan',
    menu_blog: 'Artikel Blog',
    menu_reports: 'Laporan Sustainability',
    menu_hero: 'Hero Sections',
    menu_announcements: 'Pengumuman',
    menu_features: 'Fitur Utama',
    menu_partners: 'Mitra & Klien',
    menu_testimonials: 'Testimoni',
    menu_faqs: 'Tanya Jawab (FAQ)',
    menu_stats: 'Statistik',
    menu_contacts: 'Pesan Masuk',
    menu_users: 'Manajemen Pengguna',
    menu_settings: 'Pengaturan Web',
    menu_nav: 'Menu Navigasi',
    menu_security: 'Keamanan & MFA',

    // Admin Tables
    admin_table_recent_contacts: 'Pesan Kontak Masuk Terbaru',
    admin_table_view_all: 'Lihat Semua Pesan',
    admin_table_col_sender: 'Nama Pengirim',
    admin_table_col_email: 'Email',
    admin_table_col_subject: 'Subjek',
    admin_table_col_status: 'Status',
    admin_table_unread: 'Belum Dibaca',
    admin_table_read: 'Sudah Dibaca',
    admin_table_empty: 'Belum ada pesan kontak yang masuk.',
  },
};
