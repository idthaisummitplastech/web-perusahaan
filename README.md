# Web Perusahaan & Portal CMS Modern

Platform Website Perusahaan & Content Management System (CMS) modern yang dibangun dengan Next.js 16 (App Router), React 19, Material UI (MUI), PostgreSQL, dan Prisma ORM.

<!-- Continuous Deployment: PM2 Windows Runner Active -->

## 🚀 Fitur Utama

### 1. Website Publik
- **Brand Identity**: Desain elegan dan profesional berstandar korporat manufaktur otomotif dengan palet warna brand hijau logo (`#018730`) dan oranye (`#fc4509`).
- **Navbar Dinamis & Cerdas**: Otomatis bersembunyi saat di-scroll ke bawah dan muncul saat di-scroll ke atas, dilengkapi menu dropdown bertingkat (*hierarchical sub-menus*).
- **Halaman Lengkap**: Beranda (*Hero, Statistik, Mitra, Produk Unggulan, Layanan, Testimoni*), Tentang Kami (*Profil, Fasilitas Pabrik, Sertifikasi ISO*), Katalog Produk, Detail Layanan, Blog, dan Kontak.

### 2. Panel CMS & Manajemen Konten
- **Manajemen Menu Navigasi**: Tab terpisah untuk Menu Header Navbar (dengan dukungan dropdown sub-menu) dan Footer (dikelompokkan per kolom seksi), dilengkapi fitur **Drag & Drop** urutan menu.
- **Katalog Produk Manufaktur**: Pengelolaan produk lengkap dengan galeri gambar, spesifikasi teknis, harga, dan fitur utama.
- **Sertifikasi ISO**: Manajemen sertifikat standar mutu (ISO 9001, IATF 16949, ISO 14001, ISO 45001) dengan upload dokumen dan masa berlaku.
- **Fasilitas Pabrik & Alat Berat**: Dokumentasi mesin produksi, kapasitas manufaktur, dan spesifikasi teknologi.
- **Layanan, Blog, FAQ, Testimoni, Hero Banner, & Pengumuman**.

### 3. Keamanan & Hak Akses (RBAC)
- **Role-Based Access Control**: Pembagian hak akses terstruktur untuk *Administrator*, *Marketing (Pengelola Konten)*, dan *Editor*.
- **Autentikasi Multi-Faktor (MFA / 2FA)**: Standar keamanan TOTP (Google Authenticator / Microsoft Authenticator) dan 8 kode cadangan login (*backup codes*) yang dapat diaktifkan atau dinonaktifkan per pengguna oleh Administrator.

---

## 🛠️ Panduan Instalasi & Menjalankan

### Prasyarat
- Node.js >= 18.x
- PostgreSQL Database

### Langkah-langkah

1. **Clone repositori**:
   ```bash
   git clone https://github.com/alfaridzi28/web-perusahaan.git
   cd web-perusahaan
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin berkas `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Sesuaikan konfigurasi kredensial `DATABASE_URL` PostgreSQL dan `NEXTAUTH_SECRET`.

4. **Sinkronisasi Database & Seed**:
   ```bash
   npx prisma db push
   npm run prisma:seed # atau npx ts-node prisma/seed.ts
   ```

5. **Jalankan Aplikasi (Development)**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.
