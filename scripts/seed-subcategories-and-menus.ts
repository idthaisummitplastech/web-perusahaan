import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memulai pembaruan kategori produk & sub-menu navigasi...');

  // 1. Update existing products to 'mobil'
  await prisma.product.updateMany({
    where: {
      NOT: {
        slug: {
          contains: '2wheel',
        },
      },
    },
    data: {
      category: 'mobil',
    },
  });

  // 2. Update existing Suzuki 2 Wheel to 'motor'
  await prisma.product.updateMany({
    where: {
      slug: {
        contains: '2wheel',
      },
    },
    data: {
      category: 'motor',
    },
  });

  // 3. Upsert specific motorcycle products (from Slide 36)
  const motorProducts = [
    {
      title: 'Seat Assy Front & Rear — Suzuki GSX-R150 (Sport)',
      description: 'Komponen jok depan (Seat Assy FR) dan jok belakang (Seat Assy RR) untuk motor sport Suzuki GSX-R150. Diproduksi dengan busa cetak polyurethane berdensitas tinggi (seat foaming) dan cover kulit sintetis anti-slip dengan jahitan presisi tahan cuaca ekstrem.',
      slug: 'seat-assy-suzuki-gsxr150',
      category: 'motor',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
      price: null,
      isActive: true,
    },
    {
      title: 'Double Seat Assy — Suzuki Nex II (Matic)',
      description: 'Satu set jok utuh (Double Seat Assembly) untuk motor matic Suzuki Nex II dengan profil ergonomis dan bantalan empuk tahan lama. Dilengkapi rangka plastik injeksi bawah (seat pan) yang presisi dan tahan benturan.',
      slug: 'double-seat-suzuki-nex2',
      category: 'motor',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
      price: null,
      isActive: true,
    },
    {
      title: 'Double Seat Assy — Suzuki Address FI (Matic)',
      description: 'Komponen jok ganda untuk skutik komuter Suzuki Address FI berstandar ekspor global, memberikan kenyamanan maksimal bagi pengendara dan pembonceng dengan material pelapis UV-resistant.',
      slug: 'double-seat-suzuki-address',
      category: 'motor',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
      price: null,
      isActive: true,
    },
    {
      title: 'Under Seat Luggage Box & Plastic Trim — Suzuki 2-Wheel',
      description: 'Komponen kompartemen bagasi bawah jok (under-seat luggage box / helmet-in) dan panel cover frame trim plastik injeksi untuk sepeda motor Suzuki menggunakan material PP tahan panas dan beban berat.',
      slug: 'luggage-box-trim-suzuki-2wheel',
      category: 'motor',
      image: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0036.jpg',
      price: null,
      isActive: true,
    },
  ];

  for (const item of motorProducts) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  console.log('✅ Produk motor (2-Wheel) berhasil diperbarui.');

  // 4. Update NavMenu for Produk sub-menus
  const produkMenu = await prisma.navMenu.findFirst({
    where: {
      location: 'navbar',
      url: '/products',
      parentId: null,
    },
  });

  if (produkMenu) {
    console.log(`📌 Menu "Produk" ditemukan dengan ID: ${produkMenu.id}`);

    // Hapus sub-menu lama jika ada untuk mencegah duplikasi
    await prisma.navMenu.deleteMany({
      where: {
        parentId: produkMenu.id,
      },
    });

    // Buat sub-menu baru
    await prisma.navMenu.createMany({
      data: [
        {
          title: '🚗 Komponen Mobil (4-Wheeler)',
          url: '/products?category=mobil',
          location: 'navbar',
          sortOrder: 1,
          parentId: produkMenu.id,
          isActive: true,
        },
        {
          title: '🏍️ Komponen Sepeda Motor (2-Wheeler)',
          url: '/products?category=motor',
          location: 'navbar',
          sortOrder: 2,
          parentId: produkMenu.id,
          isActive: true,
        },
      ],
    });
    console.log('✅ Sub-menu Mobil dan Motor berhasil ditambahkan ke Menu Produk.');
  }

  // 5. Pastikan Partner memiliki logo yang terisi
  const existingPartners = await prisma.partner.findMany();
  console.log(`📌 Memeriksa ${existingPartners.length} data mitra/klien...`);
  for (const p of existingPartners) {
    if (!p.logo || p.logo === 'Itochu') {
      await prisma.partner.update({
        where: { id: p.id },
        data: {
          logo: '/company-profile/TSPT-ITSP Company Profile 20260604.pptx_page-0034.jpg',
          logoType: 'image',
        },
      });
    }
  }

  console.log('🎉 Selesai memperbarui data database!');
}

main()
  .catch((e) => {
    console.error('❌ Error migrasi data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
