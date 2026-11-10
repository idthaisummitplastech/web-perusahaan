import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function getSeedPassword(envName: string): string {
  const v = process.env[envName];
  if (v && v.length >= 12) return v;
  // Tanpa hardcoded di code: generate acak aman bila env tidak diisi.
  return `Seed-${crypto.randomBytes(12).toString('hex')}!Aa1`;
}

// Password akun utama (it-04) WAJIB dari env, minimal 12 karakter. Tanpa fallback,
// dan nilainya tidak boleh dicetak ke console/log.
function requireSeedPassword(envName: string): string {
  const v = process.env[envName];
  if (!v || v.trim().length < 12) {
    throw new Error(`FATAL: ${envName} wajib disetel di .env dengan panjang minimal 12 karakter.`);
  }
  return v;
}

async function main() {
  console.log('🌱 Seeding database with PT ITSP authentic data...');

  // 1. Admin user — password WAJIB via env (SEED_ADMIN_PASSWORD), tanpa hardcoded.
  const hashedPassword = await bcrypt.hash(getSeedPassword('SEED_ADMIN_PASSWORD'), 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@itsp.co.id' },
    update: {},
    create: {
      email: 'admin@itsp.co.id',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
      mfaEnabled: false,
    },
  });
  console.log('✅ Admin user ready:', admin.email);

  // 1b. Primary Superadmin 1526.08.26 / it-04@thaisummit.co.id — Employee ID immutable, role admin portal both
  const hashedIT04 = await bcrypt.hash(requireSeedPassword('SEED_IT04_PASSWORD'), 12);
  const it04 = await prisma.user.upsert({
    where: { email: 'it-04@thaisummit.co.id' },
    // Update hanya metadata identitas; password dan isFirstLogin tidak disentuh.
    update: {
      employeeId: '1526.08.26',
      username: 'it-04',
      name: 'IT Admin',
      role: 'admin',
      department: 'IT',
      isActive: true,
      portalAccess: 'both',
    } as any,
    create: {
      employeeId: '1526.08.26',
      username: 'it-04',
      email: 'it-04@thaisummit.co.id',
      password: hashedIT04,
      name: 'IT Admin',
      role: 'admin',
      department: 'IT',
      mfaEnabled: false,
      isActive: true,
      portalAccess: 'both',
      isFirstLogin: true,
    } as any,
  });
  try {
    await prisma.user.upsert({
      where: { employeeId: '1526.08.26' } as any,
      update: { email: 'it-04@thaisummit.co.id', username: 'it-04', role: 'admin', isActive: true, portalAccess: 'both' } as any,
      create: {
        employeeId: '1526.08.26',
        username: 'it-04',
        email: 'it-04@thaisummit.co.id',
        password: hashedIT04,
        name: 'IT Admin',
        role: 'admin',
        department: 'IT',
        mfaEnabled: false,
        isActive: true,
        portalAccess: 'both',
        isFirstLogin: true,
      } as any,
    });
  } catch {}
  console.log('✅ Primary superadmin ready:', it04.email, (it04 as any).employeeId);

  // 2. Site Settings — PT Indonesia Thai Summit Plastech (ITSP)
  const settings = [
    { key: 'site_title', value: 'PT Indonesia Thai Summit Plastech' },
    { key: 'site_tagline', value: 'High Quality Automotive Plastic Injection, Spray Painting & Interior Assembly' },
    { key: 'site_description', value: 'PT Indonesia Thai Summit Plastech (ITSP) adalah perusahaan manufaktur komponen plastik otomotif berkualitas tinggi yang mengkhususkan diri dalam plastic injection molding, spray painting, dan perakitan interior kendaraan untuk merek-merek ternama seperti Mitsubishi, Hyundai, Toyota, Suzuki, dan Wuling.' },
    { key: 'contact_email', value: 'info@itsp.co.id' },
    { key: 'contact_phone', value: '+62 267 864 1234' },
    { key: 'contact_address', value: 'Jl. Permata Raya Lot FF-5, KIIC Karawang, Jawa Barat 41361, Indonesia' },
    { key: 'contact_address_2', value: 'Pasir Ranji, GIIC Deltamas, Cikarang, Jawa Barat, Indonesia' },
    { key: 'primary_color', value: '#018730' },
    { key: 'secondary_color', value: '#fc4509' },
    { key: 'company_motto', value: 'Before We Build Parts, We Build People.' },
    { key: 'established_year', value: '2015' },
    { key: 'capital', value: '3.75 Million USD' },
  ];
  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Site settings ready');

  // Clean and re-seed tables without unique natural keys
  await prisma.navMenu.deleteMany();
  await prisma.heroSection.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.statistic.deleteMany();
  await prisma.announcement.deleteMany();

  // 3. Navbar Menus
  const navMenus = [
    { title: 'Beranda', url: '/', location: 'navbar', sortOrder: 1 },
    { title: 'Tentang Kami', url: '/about', location: 'navbar', sortOrder: 2 },
    { title: 'Produk', url: '/products', location: 'navbar', sortOrder: 3 },
    { title: 'Fasilitas', url: '/facilities', location: 'navbar', sortOrder: 4 },
    { title: 'Sertifikasi', url: '/certifications', location: 'navbar', sortOrder: 5 },
    { title: 'News', url: '/news', location: 'navbar', sortOrder: 6 },
    { title: 'Kontak', url: '/contact', location: 'navbar', sortOrder: 7 },
    // Footer menus
    { title: 'Tentang ITSP', url: '/about', location: 'footer', section: 'Perusahaan', sortOrder: 1 },
    { title: 'Produk Kami', url: '/products', location: 'footer', section: 'Perusahaan', sortOrder: 2 },
    { title: 'Fasilitas Pabrik', url: '/facilities', location: 'footer', section: 'Perusahaan', sortOrder: 3 },
    { title: 'Sertifikasi', url: '/certifications', location: 'footer', section: 'Mutu & Standar', sortOrder: 1 },
    { title: 'Kebijakan Mutu', url: '/quality-policy', location: 'footer', section: 'Mutu & Standar', sortOrder: 2 },
    { title: 'Hubungi Kami', url: '/contact', location: 'footer', section: 'Dukungan', sortOrder: 1 },
    { title: 'Karir', url: '/careers', location: 'footer', section: 'Dukungan', sortOrder: 2 },
  ];
  for (const menu of navMenus) {
    await prisma.navMenu.create({ data: menu });
  }
  console.log('✅ Nav menus ready');

  // 4. Hero Section
  await prisma.heroSection.create({
    data: {
      page: 'home',
      title: 'PT Indonesia Thai Summit <span style="color: #fc4509;">Plastech</span>',
      subtitle: 'Manufaktur komponen plastik otomotif berkualitas tinggi — Plastic Injection, Spray Painting & Interior Assembly untuk merek-merek terkemuka dunia.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0001.jpg',
      imageAlt: 'PT Indonesia Thai Summit Plastech - Automotive Plastic Parts Manufacturer',
      primaryBtnText: 'Lihat Produk Kami',
      primaryBtnUrl: '/products',
      secondaryBtnText: 'Tentang ITSP',
      secondaryBtnUrl: '/about',
      isActive: true,
    },
  });
  await prisma.heroSection.create({
    data: {
      page: 'about',
      title: 'Tentang PT Indonesia Thai Summit Plastech',
      subtitle: 'Didirikan tahun 2015, ITSP adalah anak perusahaan Thai Summit Group yang bergerak dalam manufaktur komponen plastik otomotif berkualitas tinggi di Indonesia dengan dua pabrik modern di Karawang dan Cikarang.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0023.jpg',
      imageAlt: 'ITSP Company Profile',
      isActive: true,
    },
  });
  await prisma.heroSection.create({
    data: {
      page: 'products',
      title: 'Produk Unggulan ITSP',
      subtitle: 'Instrument Panel (Dashboard Mobil), Door Trim Assembly, Console Box, Bumper, dan komponen interior & eksterior otomotif untuk kendaraan-kendaraan ternama.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0010.jpg',
      imageAlt: 'ITSP Product Line Up',
      isActive: true,
    },
  });
  await prisma.heroSection.create({
    data: {
      page: 'facilities',
      title: 'Fasilitas & Teknologi Produksi',
      subtitle: '18 Mesin Injection hingga 3000 Ton, Robot Paint Booth, Vibration Welding, Laser Scoring SRS Airbag, dan jalur perakitan otomatis di dua pabrik modern.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0025.jpg',
      imageAlt: 'ITSP Production Facilities',
      isActive: true,
    },
  });
  await prisma.heroSection.create({
    data: {
      page: 'certifications',
      title: 'Sertifikasi & Standar Mutu',
      subtitle: 'Komitmen kami terhadap kualitas dibuktikan dengan sertifikasi IATF 16949, ISO 9001, ISO 14001, dan ISO 45001 yang berlaku internasional.',
      isActive: true,
    },
  });
  console.log('✅ Hero sections ready');

  // 5. Partners — Real OEM Customers
  const partners = [
    { name: 'Mitsubishi Motors (MMKI)', logo: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0026.jpg', logoType: 'image', sortOrder: 1 },
    { name: 'Hyundai Motor (HMMI)', logo: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0030.jpg', logoType: 'image', sortOrder: 2 },
    { name: 'Toyota Motor (TMMIN)', logo: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0033.jpg', logoType: 'image', sortOrder: 3 },
    { name: 'Suzuki Indonesia', logo: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0035.jpg', logoType: 'image', sortOrder: 4 },
    { name: 'Wuling Motors (SGMW)', logo: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0032.jpg', logoType: 'image', sortOrder: 5 },
    { name: 'Itochu Corporation', logo: 'Itochu', logoType: 'text', sortOrder: 6 },
  ];
  for (const partner of partners) {
    await prisma.partner.create({ data: partner });
  }
  console.log('✅ Partners (OEM Customers) ready');

  // 6. Features — Core Capabilities
  const features = [
    {
      title: 'Plastic Injection Molding',
      description: '18 mesin injection berkekuatan 450T hingga 3000T (Woojin & Mitsubishi) dengan teknologi Heat & Cool Injection untuk komponen presisi tinggi.',
      section: 'capability',
      sortOrder: 1,
      svgIcon: 'Factory',
    },
    {
      title: 'Spray Painting & Coating',
      description: '10 unit painting booth (2 Robot Booth & 8 Manual Booth) dengan finishing Matted, Silver, dan Piano Black untuk tampilan premium.',
      section: 'capability',
      sortOrder: 2,
      svgIcon: 'Brush',
    },
    {
      title: 'Interior Assembly Line',
      description: 'Jalur perakitan Instrument Panel, Door Trim dengan PVC Wrapping & Stitching, Console Box, dan komponen interior lainnya.',
      section: 'capability',
      sortOrder: 3,
      svgIcon: 'Build',
    },
    {
      title: 'Vibration & Laser Welding',
      description: 'Branson Vibration Welding dan Jenoptik Laser Scoring untuk SRS Airbag deployment line — teknologi keamanan otomotif tingkat tinggi.',
      section: 'capability',
      sortOrder: 4,
      svgIcon: 'Precision',
    },
    {
      title: 'Quality Assurance Lab',
      description: 'Laboratorium mutu lengkap dengan CMM (Coordinate Measuring Machine), environmental chamber, dan impact tester untuk jaminan kualitas terbaik.',
      section: 'capability',
      sortOrder: 5,
      svgIcon: 'Verified',
    },
    {
      title: 'Dua Pabrik Modern',
      description: 'Plant 1 di KIIC Karawang (11.000 m²) dan Plant 2 di GIIC Deltamas Cikarang (16.000 m²) dengan total 422+ karyawan terampil.',
      section: 'capability',
      sortOrder: 6,
      svgIcon: 'LocationCity',
    },
  ];
  for (const feature of features) {
    await prisma.feature.create({ data: feature });
  }
  console.log('✅ Features (Capabilities) ready');

  // 7. Services — Manufacturing Services
  const services = [
    {
      title: 'Plastic Injection Molding',
      subtitle: 'High Tonnage Injection hingga 3000T',
      description: 'Layanan cetak injeksi plastik presisi tinggi menggunakan mesin berkapasitas 450T hingga 3000T dari Woojin dan Mitsubishi. Mendukung teknologi Heat & Cool Injection untuk permukaan komponen yang sempurna tanpa weld line. Kapabilitas produksi mencakup Instrument Panel, Console Box, Bumper, Radiator Grille, Cowl Top, Fender Liner, dan berbagai komponen interior & eksterior otomotif.',
      slug: 'plastic-injection-molding',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0025.jpg',
      sortOrder: 1,
    },
    {
      title: 'Spray Painting & Finishing',
      subtitle: 'Robot & Manual Paint Booth',
      description: 'Fasilitas pengecatan otomotif dengan 2 Robot Paint Booth dan 8 Manual Paint Booth untuk finishing berkualitas OEM. Tersedia pilihan finishing Matted Painting, Silver Metallic, dan Piano Black sesuai spesifikasi pelanggan. Proses meliputi surface preparation, primer coating, base coat, clear coat, dan quality inspection dengan standar ketat.',
      slug: 'spray-painting-finishing',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0037.jpg',
      sortOrder: 2,
    },
    {
      title: 'Interior Assembly',
      subtitle: 'Instrument Panel & Door Trim Assembly',
      description: 'Layanan perakitan modul interior otomotif lengkap meliputi Instrument Panel Assembly, Door Trim Assembly dengan PVC Wrapping & Stitching, Console Box Assembly, dan komponen trim lainnya. Dilengkapi dengan Vibration Welding (Branson), Laser Scoring untuk SRS Airbag (Jenoptik), dan jalur perakitan semi-otomatis (Keber/Branson).',
      slug: 'interior-assembly',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0010.jpg',
      sortOrder: 3,
    },
    {
      title: 'Blow Molding',
      subtitle: 'Air Duct & Side Step Production',
      description: 'Produksi komponen blow molding untuk kebutuhan otomotif seperti Air Duct (saluran udara), Side Step, dan komponen hollow lainnya dengan konsistensi ketebalan dinding yang terjaga.',
      slug: 'blow-molding',
      sortOrder: 4,
    },
    {
      title: 'Seat Covering & Foaming',
      subtitle: 'Motorcycle & Automotive Seat Manufacturing',
      description: 'Layanan pembuatan dan pelapisan jok kendaraan roda dua dan empat dengan material premium. Proses meliputi seat foam injection, PVC/leather covering, stitching pattern, dan quality finishing untuk brand Suzuki 2-Wheel dan lainnya.',
      slug: 'seat-covering-foaming',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
      sortOrder: 5,
    },
  ];
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log('✅ Services ready');

  // 8. Products — Real Automotive Parts by Vehicle
  const products = [
    // Mitsubishi Xpander
    {
      title: 'Instrument Panel Set — Mitsubishi Xpander',
      description: 'Dashboard / Instrument Panel lengkap untuk Mitsubishi Xpander dengan finishing Matted Painting dan Silver Metallic. Diproduksi dengan teknologi plastic injection molding presisi tinggi, dilengkapi Laser Scoring untuk jalur deployment SRS Airbag dan perakitan komponen sub-assembly.',
      slug: 'instrument-panel-mitsubishi-xpander',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0026.jpg',
    },
    {
      title: 'Box Assy Console — Mitsubishi Xpander',
      description: 'Center Console Box Assembly untuk Mitsubishi Xpander. Komponen pusat kokpit yang mengintegrasikan tempat penyimpanan, cup holder, dan panel kontrol dengan finishing premium.',
      slug: 'console-box-mitsubishi-xpander',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0026.jpg',
    },
    // Mitsubishi Pajero Sport
    {
      title: 'Instrument Panel Set — Mitsubishi Pajero Sport',
      description: 'Dashboard / Instrument Panel Assembly untuk Mitsubishi Pajero Sport dengan finishing Piano Black premium. Meliputi I/P main body, meter cluster hood, glove box, dan sub-assembly defroster duct.',
      slug: 'instrument-panel-mitsubishi-pajero-sport',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0027.jpg',
    },
    {
      title: 'Front & Rear Door Trim Panel — Mitsubishi Pajero Sport',
      description: 'Panel Door Trim depan dan belakang untuk Mitsubishi Pajero Sport dengan PVC Wrapping dan Stitching premium. Dilengkapi dengan armrest, pocket, dan speaker grille terintegrasi.',
      slug: 'door-trim-mitsubishi-pajero-sport',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0027.jpg',
    },
    {
      title: 'Grille Radiator LWR — Mitsubishi Pajero Sport',
      description: 'Lower Radiator Grille untuk Mitsubishi Pajero Sport. Komponen eksterior depan kendaraan yang diproduksi dengan injection molding presisi untuk fitment sempurna.',
      slug: 'grille-radiator-mitsubishi-pajero-sport',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0027.jpg',
    },
    // Mitsubishi X-Force
    {
      title: 'Instrument Panel Set — Mitsubishi X-Force',
      description: 'Instrument Panel Set Dashboard terbaru untuk Mitsubishi X-Force dengan desain modern dan teknologi terkini. Komponen diproduksi dengan Heat & Cool Injection untuk permukaan yang halus sempurna.',
      slug: 'instrument-panel-mitsubishi-xforce',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0028.jpg',
    },
    {
      title: 'Panel Assy Door Trim FR/RR — Mitsubishi X-Force',
      description: 'Door Trim Panel Assembly depan dan belakang untuk Mitsubishi X-Force. Diproduksi dengan proses PVC Wrapping dan Stitching otomatis untuk tampilan interior premium.',
      slug: 'door-trim-mitsubishi-xforce',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0028.jpg',
    },
    {
      title: 'Louver Cowl Top — Mitsubishi X-Force',
      description: 'Komponen Cowl Top Louver untuk Mitsubishi X-Force, dipasang di area antara kap mesin dan kaca depan untuk ventilasi dan drainage.',
      slug: 'louver-cowl-top-mitsubishi-xforce',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0028.jpg',
    },
    // Mitsubishi Destinator
    {
      title: 'Instrument Panel Set — Mitsubishi Destinator',
      description: 'Instrument Panel Set lengkap untuk Mitsubishi Destinator (model terbaru) mencakup I/P main body dan seluruh sub-assembly termasuk Box Assy Console, Liner Fender, Over Fender, Grille Cowl Top, dan Cover FR Door Corner.',
      slug: 'instrument-panel-mitsubishi-destinator',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0029.jpg',
    },
    // Hyundai Creta
    {
      title: 'Panel Assy Door Trim FR & RR — Hyundai Creta',
      description: 'Panel Door Trim Assembly depan (FR) dan belakang (RR) kanan/kiri untuk Hyundai Creta. Komponen interior berkualitas tinggi dengan material dan finishing sesuai standar Hyundai Global.',
      slug: 'door-trim-hyundai-creta',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0030.jpg',
    },
    // Hyundai Stargazer
    {
      title: 'Box Assy Console — Hyundai Stargazer',
      description: 'Center Console Box Assembly untuk Hyundai Stargazer MPV. Komponen kokpit terintegrasi dengan desain ergonomis dan finishing premium sesuai standar Hyundai.',
      slug: 'console-box-hyundai-stargazer',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0031.jpg',
    },
    // Wuling Alvez
    {
      title: 'Fascia Front & Rear Bumper — Wuling Alvez',
      description: 'Front Bumper dan Rear Bumper Fascia untuk Wuling Alvez. Komponen eksterior besar yang diproduksi dengan mesin injection 3000T untuk hasil yang presisi dan konsisten.',
      slug: 'bumper-wuling-alvez',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0032.jpg',
    },
    {
      title: 'Louver Cowl Top & Console ASM — Wuling Alvez',
      description: 'Cowl Top Louver dan Floor Console Assembly untuk Wuling Alvez. Termasuk Bolster I/P Driver Side Knee untuk proteksi penumpang.',
      slug: 'cowl-top-console-wuling-alvez',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0032.jpg',
    },
    // Toyota
    {
      title: 'Garnish Deck Floor & Box Jack — Toyota Innova Zenix / Yaris Cross',
      description: 'Garnish Deck Floor RH/LH untuk Toyota Innova Zenix dan Box Jack Assembly untuk Toyota Yaris Cross. Komponen interior dan utilitas kendaraan Toyota.',
      slug: 'parts-toyota-innova-yaris',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0033.jpg',
    },
    // Suzuki Fronx
    {
      title: 'Under Cover & Cowl Top — Suzuki Fronx 4 Wheel',
      description: 'Cover Main Floor Under, Cover Engine Under Side, Garnish Cowl Top Side, dan Garnish Comp Cowl Top CTR untuk Suzuki Fronx. Komponen undercover dan cowl untuk proteksi mesin dan drainage.',
      slug: 'undercover-cowl-suzuki-fronx',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0035.jpg',
    },
    // Suzuki 2 Wheel
    {
      title: 'Seat Assembly — Suzuki 2 Wheel',
      description: 'Seat Assy Front, Seat Assy Rear, dan Double Seat Assy untuk motor Suzuki sport dan matic. Diproduksi dengan proses seat covering dan foaming berkualitas tinggi.',
      slug: 'seat-assy-suzuki-2wheel',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
    },
  ];
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log('✅ Products ready');

  // 9. Blog Posts
  const posts = [
    {
      title: 'Teknologi Heat & Cool Injection Molding untuk Komponen Dashboard Otomotif',
      slug: 'teknologi-heat-cool-injection-molding',
      excerpt: 'Pelajari bagaimana teknologi Heat & Cool Injection menghasilkan permukaan Instrument Panel yang sempurna tanpa weld line untuk standar kualitas OEM tertinggi.',
      content: '<h2>Apa itu Heat & Cool Injection?</h2><p>Heat & Cool Injection Molding adalah teknologi cetak injeksi plastik canggih yang mengatur suhu mold secara dinamis selama siklus produksi. Mold dipanaskan sebelum injeksi material, kemudian didinginkan secara cepat setelah material terbentuk.</p><h2>Keunggulan untuk Instrument Panel</h2><p>Teknologi ini menghasilkan permukaan komponen yang sangat halus, bebas dari weld line, flow mark, dan silver streak — standar kualitas yang diwajibkan oleh OEM seperti Mitsubishi Motors dan Hyundai untuk komponen dashboard kendaraan mereka.</p><h2>Implementasi di ITSP</h2><p>PT Indonesia Thai Summit Plastech mengimplementasikan teknologi ini pada mesin injection berkapasitas 2500T dan 3000T untuk produksi Instrument Panel Set Mitsubishi Xpander, Pajero Sport, X-Force, dan Hyundai Creta.</p>',
      author: 'Tim Engineering ITSP',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'Laser Scoring SRS Airbag: Teknologi Keselamatan di Balik Dashboard Mobil',
      slug: 'laser-scoring-srs-airbag-dashboard',
      excerpt: 'Sistem Laser Scoring Jenoptik memastikan deployment airbag yang tepat dan aman melalui dashboard kendaraan — komponen keselamatan kritis yang diproduksi di ITSP.',
      content: '<h2>Pentingnya Laser Scoring</h2><p>Di balik setiap Instrument Panel kendaraan modern, terdapat garis skor tak terlihat yang dibuat oleh laser presisi tinggi. Garis-garis ini adalah jalur deployment SRS Airbag yang memungkinkan kantung udara keluar dengan tepat saat terjadi tabrakan.</p><h2>Teknologi Jenoptik</h2><p>ITSP menggunakan sistem Laser Scoring dari Jenoptik, produsen teknologi laser terkemuka asal Jerman. Sistem ini mampu membuat garis skor dengan kedalaman yang sangat presisi pada permukaan dalam Instrument Panel tanpa meninggalkan bekas pada permukaan luar.</p><h2>Standar Keselamatan Global</h2><p>Setiap unit Instrument Panel yang diproduksi melewati serangkaian pengujian ketat termasuk deployment test untuk memastikan airbag dapat keluar dengan sempurna sesuai standar keselamatan OEM global.</p>',
      author: 'Quality Assurance ITSP',
      isPublished: true,
      publishedAt: new Date(),
    },
  ];
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log('✅ Blog posts ready');

  // 10. Testimonials — Industry Partners
  const testimonials = [
    {
      name: 'Procurement Team',
      role: 'Vendor Quality Division',
      company: 'PT Mitsubishi Motors Krama Yudha Indonesia (MMKI)',
      content: 'ITSP konsisten memenuhi standar kualitas tinggi kami untuk komponen Instrument Panel dan Door Trim. Delivery performance dan respons terhadap quality concern sangat baik.',
      rating: 5,
    },
    {
      name: 'Supply Chain Management',
      role: 'Parts Procurement',
      company: 'PT Hyundai Motor Manufacturing Indonesia (HMMI)',
      content: 'Sebagai supplier Door Trim dan Console Box, ITSP menunjukkan komitmen kuat terhadap quality dan on-time delivery sesuai standar Hyundai Global.',
      rating: 5,
    },
    {
      name: 'Purchasing Department',
      role: 'Supplier Development',
      company: 'SGMW Motor Indonesia (Wuling)',
      content: 'Kapabilitas injection molding ITSP dengan mesin hingga 3000T mampu memproduksi bumper front dan rear untuk Wuling Alvez dengan kualitas yang sangat memuaskan.',
      rating: 5,
    },
  ];
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log('✅ Testimonials ready');

  // 11. FAQs
  const faqs = [
    {
      question: 'Apa produk utama yang diproduksi oleh PT ITSP?',
      answer: 'Produk utama kami meliputi Instrument Panel Set (Dashboard Mobil), Door Trim Assembly, Console Box Assembly, Front & Rear Bumper, Radiator Grille, Cowl Top, Fender Liner, dan Motorcycle Seat Assembly. Kami memproduksi komponen untuk merek Mitsubishi, Hyundai, Toyota, Suzuki, dan Wuling.',
      sortOrder: 1,
    },
    {
      question: 'Dimana lokasi pabrik PT ITSP?',
      answer: 'ITSP memiliki 2 pabrik: Plant 1 berlokasi di Jl. Permata Raya Lot FF-5, KIIC Karawang (11.000 m², didirikan 2015, SOP 2017) dan Plant 2 di Pasir Ranji, GIIC Deltamas Cikarang (16.000 m², didirikan 2021). Total karyawan mencapai 422+ orang.',
      sortOrder: 2,
    },
    {
      question: 'Sertifikasi apa saja yang dimiliki PT ITSP?',
      answer: 'ITSP telah bersertifikasi IATF 16949:2016 (Standar Mutu Otomotif Global), ISO 9001:2015 (Sistem Manajemen Mutu), ISO 14001:2015 (Sistem Manajemen Lingkungan), dan ISO 45001:2018 (Sistem Manajemen Kesehatan & Keselamatan Kerja).',
      sortOrder: 3,
    },
    {
      question: 'Berapa kapasitas mesin injection molding terbesar?',
      answer: 'Mesin injection terbesar kami berkapasitas 3000 Ton (2 unit Woojin di GIIC Plant). Total kami memiliki 18 mesin injection mulai dari 450T hingga 3000T yang tersebar di kedua plant.',
      sortOrder: 4,
    },
    {
      question: 'Apa keunggulan teknologi painting di ITSP?',
      answer: 'Kami memiliki 10 unit painting booth di KIIC Plant, terdiri dari 2 Robot Booth untuk konsistensi tinggi dan 8 Manual Booth untuk fleksibilitas finishing. Kami menawarkan finishing Matted Painting, Silver Metallic, dan Piano Black sesuai spesifikasi pelanggan.',
      sortOrder: 5,
    },
    {
      question: 'Apakah ITSP bagian dari Thai Summit Group?',
      answer: 'Ya, PT Indonesia Thai Summit Plastech (ITSP) adalah anak perusahaan Thai Summit Group yang didirikan tahun 1977 di Thailand. Thai Summit Group memiliki annual sales $2.607 Juta dengan 19.200 karyawan dan beroperasi di berbagai negara termasuk Thailand, Indonesia, dan lainnya.',
      sortOrder: 6,
    },
  ];
  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }
  console.log('✅ FAQs ready');

  // 12. Statistics — Real Company Data
  const statistics = [
    { label: 'Mesin Injection', value: '18', page: 'home', sortOrder: 1 },
    { label: 'Total Karyawan', value: '422+', page: 'home', sortOrder: 2 },
    { label: 'Luas Pabrik', value: '27.000 m²', page: 'home', sortOrder: 3 },
    { label: 'Pelanggan OEM', value: '6+', page: 'home', sortOrder: 4 },
    // About page stats
    { label: 'Tahun Didirikan', value: '2015', page: 'about', sortOrder: 1 },
    { label: 'Modal Investasi', value: '$3.75 Juta', page: 'about', sortOrder: 2 },
    { label: 'Jumlah Plant', value: '2', page: 'about', sortOrder: 3 },
    { label: 'Kapasitas Maks Injection', value: '3000T', page: 'about', sortOrder: 4 },
  ];
  for (const stat of statistics) {
    await prisma.statistic.create({ data: stat });
  }
  console.log('✅ Statistics ready');

  // 13. Announcement
  await prisma.announcement.create({
    data: {
      message: '🏭 PT Indonesia Thai Summit Plastech — Manufaktur Komponen Plastik Otomotif Berkualitas Tinggi. "Before We Build Parts, We Build People."',
      btnText: 'Lihat Produk',
      btnUrl: '/products',
      isActive: true,
    },
  });
  console.log('✅ Announcement ready');

  // 14. Marketing User — password WAJIB via env (SEED_MARKETING_PASSWORD), tanpa hardcoded.
  const marketingPassword = await bcrypt.hash(getSeedPassword('SEED_MARKETING_PASSWORD'), 12);
  const marketingUser = await prisma.user.upsert({
    where: { email: 'marketing@itsp.co.id' },
    update: {},
    create: {
      email: 'marketing@itsp.co.id',
      password: marketingPassword,
      name: 'Tim Marketing ITSP',
      role: 'marketing',
      mfaEnabled: false,
    },
  });
  console.log('✅ Marketing user ready:', marketingUser.email);

  // 15. Factory ISO Certifications
  await prisma.certification.deleteMany();
  const certifications = [
    {
      title: 'IATF 16949:2016',
      issuer: 'International Automotive Task Force',
      certificateNumber: 'IATF-ITSP-2023-001',
      issuedDate: new Date('2023-01-15'),
      expiryDate: new Date('2028-12-31'),
      description: 'Standar Sistem Manajemen Mutu Otomotif Global — sertifikasi wajib bagi supplier Tier-1 industri otomotif dunia yang menjamin konsistensi kualitas proses manufaktur komponen injection molding, painting, dan assembly.',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'ISO 9001:2015',
      issuer: 'International Organization for Standardization',
      certificateNumber: 'QMS-ITSP-2022-002',
      issuedDate: new Date('2022-05-10'),
      expiryDate: new Date('2027-10-15'),
      description: 'Sistem Manajemen Mutu untuk seluruh proses operasional dari penerimaan material, injection molding, painting, assembly, quality inspection, hingga pengiriman ke pelanggan OEM.',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'ISO 14001:2015',
      issuer: 'International Organization for Standardization',
      certificateNumber: 'EMS-ITSP-2022-003',
      issuedDate: new Date('2022-06-20'),
      expiryDate: new Date('2027-06-20'),
      description: 'Sistem Manajemen Lingkungan untuk operasional pabrik yang ramah lingkungan, pengelolaan limbah B3 dari proses painting, efisiensi energi, dan pengurangan jejak karbon.',
      sortOrder: 3,
      isActive: true,
    },
    {
      title: 'ISO 45001:2018',
      issuer: 'International Organization for Standardization',
      certificateNumber: 'OHS-ITSP-2023-004',
      issuedDate: new Date('2023-03-10'),
      expiryDate: new Date('2028-04-10'),
      description: 'Sistem Manajemen Kesehatan & Keselamatan Kerja (K3) standar internasional dengan komitmen target Zero Accident di seluruh area produksi injection, painting, dan assembly.',
      sortOrder: 4,
      isActive: true,
    },
  ];
  for (const cert of certifications) {
    await prisma.certification.create({ data: cert });
  }
  console.log('✅ Factory certifications ready');

  // 16. Plant Facilities — Real ITSP Equipment
  await prisma.facility.deleteMany();
  const facilities = [
    // KIIC Karawang Plant
    {
      title: 'Injection Machine 2500T — Mitsubishi (KIIC)',
      category: 'Injection Molding',
      specifications: '2 unit Mitsubishi 2500 Ton, Heat & Cool Injection capable, lokasi KIIC Karawang Plant',
      description: 'Mesin injection molding berkapasitas 2500 Ton dari Mitsubishi untuk produksi komponen besar seperti Instrument Panel, Bumper, dan Console Box. Dilengkapi teknologi Heat & Cool untuk permukaan presisi tinggi.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0025.jpg',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Injection Machine 1800T (KIIC)',
      category: 'Injection Molding',
      specifications: '1 unit 1800 Ton, lokasi KIIC Karawang Plant',
      description: 'Mesin injection 1800 Ton untuk komponen berukuran medium-large seperti Door Trim substrat, Panel Quarter Trim, dan Garnish Deck.',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Injection Machine 1300T (KIIC)',
      category: 'Injection Molding',
      specifications: '2 unit 1300 Ton, lokasi KIIC Karawang Plant',
      description: 'Mesin injection 1300 Ton untuk komponen interior dan eksterior berukuran medium seperti Cowl Top, Liner Fender, dan Radiator Grille.',
      sortOrder: 3,
      isActive: true,
    },
    {
      title: 'Injection Machine 850T, 550T, 450T (KIIC)',
      category: 'Injection Molding',
      specifications: '1 unit 850T, 2 unit 550T, 1 unit 450T — lokasi KIIC Karawang Plant',
      description: 'Mesin injection untuk komponen kecil hingga medium seperti Cover Door Corner, Cover Seat Belt, Garnish CTR Pillar, dan berbagai bracket & clip.',
      sortOrder: 4,
      isActive: true,
    },
    {
      title: 'Robot Paint Booth (KIIC)',
      category: 'Painting',
      specifications: '2 unit Robot Paint Booth, automated spray painting, lokasi KIIC Karawang Plant',
      description: 'Dua unit Robot Paint Booth untuk pengecatan otomatis Instrument Panel dan komponen interior dengan konsistensi finishing tinggi. Mampu menghasilkan finishing Matted, Silver Metallic, dan Piano Black.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0037.jpg',
      sortOrder: 5,
      isActive: true,
    },
    {
      title: 'Manual Paint Booth (KIIC)',
      category: 'Painting',
      specifications: '8 unit Manual Paint Booth, multiple color capability, lokasi KIIC Karawang Plant',
      description: 'Delapan unit Manual Paint Booth untuk fleksibilitas pengecatan berbagai komponen dan warna sesuai spesifikasi pelanggan OEM.',
      sortOrder: 6,
      isActive: true,
    },
    {
      title: 'Vibration Welding Machine — Branson',
      category: 'Welding & Assembly',
      specifications: 'Branson Vibration Welding, untuk penyambungan komponen plastik, lokasi KIIC Plant',
      description: 'Mesin las vibrasi Branson untuk penyambungan komponen plastik presisi tinggi seperti penyatuan upper dan lower Instrument Panel, air duct mounting, dan komponen structural assembly lainnya.',
      sortOrder: 7,
      isActive: true,
    },
    {
      title: 'Laser Scoring Machine — Jenoptik',
      category: 'Welding & Assembly',
      specifications: 'Jenoptik SRS Airbag Laser Scoring, CO2/Fiber laser, presisi sub-milimeter',
      description: 'Mesin Laser Scoring dari Jenoptik (Jerman) untuk membuat jalur deployment SRS Airbag pada permukaan dalam Instrument Panel. Garis skor invisible dari luar namun memungkinkan airbag keluar dengan tepat saat tabrakan.',
      sortOrder: 8,
      isActive: true,
    },
    // GIIC Cikarang Plant
    {
      title: 'Injection Machine 3000T — Woojin (GIIC)',
      category: 'Injection Molding',
      specifications: '2 unit Woojin 3000 Ton, High Performance, lokasi GIIC Deltamas Cikarang Plant',
      description: 'Dua unit mesin injection terbesar ITSP berkapasitas 3000 Ton dari Woojin di GIIC Plant. Untuk produksi komponen ekstra besar seperti Front & Rear Bumper Wuling Alvez dan komponen besar lainnya.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0025.jpg',
      sortOrder: 9,
      isActive: true,
    },
    {
      title: 'Injection Machine 2500T — Woojin (GIIC)',
      category: 'Injection Molding',
      specifications: '2 unit Woojin 2500 Ton, lokasi GIIC Deltamas Cikarang Plant',
      description: 'Dua unit mesin injection 2500 Ton Woojin di GIIC Plant untuk produksi Instrument Panel dan komponen berukuran besar lainnya.',
      sortOrder: 10,
      isActive: true,
    },
    {
      title: 'Injection Machine 1800T (GIIC)',
      category: 'Injection Molding',
      specifications: '5 unit 1800 Ton, lokasi GIIC Deltamas Cikarang Plant',
      description: 'Lima unit mesin injection 1800 Ton di GIIC Plant untuk volume produksi tinggi komponen Door Trim, Quarter Trim, dan panel eksterior.',
      sortOrder: 11,
      isActive: true,
    },
    {
      title: 'Auto/Semi-Auto Door Trim Assembly Line',
      category: 'Assembly',
      specifications: 'Keber/Branson semi-auto assembly, PVC Wrapping, Stitching line, lokasi GIIC Plant',
      description: 'Jalur perakitan Door Trim otomatis dan semi-otomatis dengan proses PVC Wrapping, Stitching, dan component assembly. Menggunakan teknologi dari Keber dan Branson.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0038.jpg',
      sortOrder: 12,
      isActive: true,
    },
    {
      title: 'Seat Covering & Foaming Line',
      category: 'Assembly',
      specifications: 'Seat foam injection, PVC/leather covering, stitching pattern line',
      description: 'Fasilitas pembuatan jok kendaraan roda dua (Suzuki) meliputi injeksi foam, pelapisan PVC/kulit, dan stitching pattern untuk Seat Assy Front, Rear, dan Double Seat Matic.',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
      sortOrder: 13,
      isActive: true,
    },
  ];
  for (const fac of facilities) {
    await prisma.facility.create({ data: fac });
  }
  console.log('✅ Plant facilities ready');

  console.log('\n🎉 Seeding completed successfully with ITSP authentic data!');
  console.log('📧 Akun Admin: admin@itsp.co.id (password via SEED_ADMIN_PASSWORD)');
  console.log('📧 Akun Marketing: marketing@itsp.co.id (password via SEED_MARKETING_PASSWORD)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
