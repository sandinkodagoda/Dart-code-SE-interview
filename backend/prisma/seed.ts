import { PrismaClient, AdminRole, InventoryTransactionType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();

  // 2. Seed Default Admin User
  const passwordHash = await argon2.hash('AdminPassword123!');
  const admin = await prisma.adminUser.create({
    data: {
      name: 'Development Super Admin',
      email: 'admin@techgadgets.com',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Seeded Super Admin: ${admin.email} (Password: AdminPassword123!)`);

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Mobile Phones',
      slug: 'mobile-phones',
      description: 'Latest flagship and budget smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    },
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'High-performance laptops, ultrabooks, and workstations',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    },
    {
      name: 'Tablets',
      slug: 'tablets',
      description: 'Portable tablets and digital canvases for work and play',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
    },
    {
      name: 'Smart Watches',
      slug: 'smart-watches',
      description: 'Connected fitness trackers and luxury smartwatches',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    },
    {
      name: 'Audio',
      slug: 'audio',
      description: 'Premium noise-canceling headphones, earbuds, and speakers',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Cables, high-speed GaN chargers, adapters, and mounts',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log(`✅ Seeded ${Object.keys(categories).length} Categories`);

  // 4. Seed Brands
  const brandsData = [
    { name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Samsung', slug: 'samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Sony', slug: 'sony', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
    { name: 'Dell', slug: 'dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
    { name: 'HP', slug: 'hp', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_630x630.png' },
    { name: 'Lenovo', slug: 'lenovo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg' },
  ];

  const brands: Record<string, string> = {};
  for (const brand of brandsData) {
    const created = await prisma.brand.create({ data: brand });
    brands[brand.slug] = created.id;
  }
  console.log(`✅ Seeded ${Object.keys(brands).length} Brands`);

  // 5. Seed Realistic Products
  const productsData = [
    {
      name: 'iPhone 15 Pro Max 256GB Natural Titanium',
      slug: 'iphone-15-pro-max-256gb',
      sku: 'APL-IP15PM-256-NAT',
      description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
      categoryId: categories['mobile-phones'],
      brandId: brands['apple'],
      price: 435000.0,
      compareAtPrice: 460000.0,
      stockQuantity: 15,
      warranty: '1 Year Apple Care Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        display: '6.7-inch Super Retina XDR with ProMotion',
        chip: 'A17 Pro with 6-core GPU',
        storage: '256GB',
        ram: '8GB',
        camera: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
        battery: 'Up to 29 hours video playback',
        color: 'Natural Titanium',
        connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C (USB 3)',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', altText: 'iPhone 15 Pro Max Natural Titanium', isPrimary: true, displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', altText: 'iPhone 15 Pro Max Back', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black',
      slug: 'samsung-galaxy-s24-ultra-512gb',
      sku: 'SAM-S24U-512-BLK',
      description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
      categoryId: categories['mobile-phones'],
      brandId: brands['samsung'],
      price: 410000.0,
      compareAtPrice: 445000.0,
      stockQuantity: 12,
      warranty: '1 Year Company Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        display: '6.8-inch Dynamic AMOLED 2X 120Hz',
        chip: 'Snapdragon 8 Gen 3 for Galaxy',
        storage: '512GB',
        ram: '12GB',
        camera: '200MP Wide + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultra-wide',
        battery: '5000 mAh 45W Fast Charging',
        color: 'Titanium Black',
        spen: 'Integrated S Pen included',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', altText: 'Galaxy S24 Ultra Front', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'MacBook Pro 16-inch M3 Max 36GB 1TB Space Black',
      slug: 'macbook-pro-16-m3-max-space-black',
      sku: 'APL-MBP16-M3MAX-BLK',
      description: 'The most advanced Mac laptop ever for demanding workflows. M3 Max brings phenomenal compute and GPU speed with incredible battery life.',
      categoryId: categories['laptops'],
      brandId: brands['apple'],
      price: 1050000.0,
      compareAtPrice: 1120000.0,
      stockQuantity: 5,
      warranty: '1 Year Apple Authorized Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        display: '16.2-inch Liquid Retina XDR (3456 x 2234) 120Hz',
        chip: 'Apple M3 Max (14-core CPU, 30-core GPU)',
        ram: '36GB Unified Memory',
        storage: '1TB Superfast NVMe SSD',
        battery: 'Up to 22 hours',
        ports: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3',
        weight: '2.16 kg',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', altText: 'MacBook Pro 16 Space Black', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Dell XPS 15 9530 Core i9 32GB 1TB RTX 4070',
      slug: 'dell-xps-15-9530-oled-i9',
      sku: 'DEL-XPS15-9530-I9',
      description: 'Immerse yourself in content with stunning 3.5K OLED touch panel, 13th Gen Intel Core i9 processor, and NVIDIA GeForce RTX 4070 studio graphics.',
      categoryId: categories['laptops'],
      brandId: brands['dell'],
      price: 780000.0,
      compareAtPrice: 830000.0,
      stockQuantity: 8,
      warranty: '2 Years Dell Premier Onsite Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        display: '15.6-inch 3.5K (3456x2160) OLED InfinityEdge Touch',
        processor: '13th Gen Intel Core i9-13900H (14 cores)',
        gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
        ram: '32GB DDR5 4800MHz',
        storage: '1TB PCIe Gen4 M.2 NVMe SSD',
        os: 'Windows 11 Pro',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', altText: 'Dell XPS 15 OLED', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Lenovo Legion Pro 7i Gen 9 Core i9 RTX 4080',
      slug: 'lenovo-legion-pro-7i-gen-9',
      sku: 'LEN-LEG-PRO7I-4080',
      description: 'AI-tuned extreme gaming laptop powered by Legion Coldfront Vapor cooling and Lenovo LA-2 AI engine.',
      categoryId: categories['laptops'],
      brandId: brands['lenovo'],
      price: 890000.0,
      compareAtPrice: 940000.0,
      stockQuantity: 6,
      warranty: '2 Years Lenovo Legion Ultimate Support',
      isFeatured: false,
      isActive: true,
      specifications: {
        display: '16-inch WQXGA 240Hz 500 nits 100% DCI-P3',
        processor: 'Intel Core i9-14900HX',
        gpu: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (175W TGP)',
        ram: '32GB DDR5 5600MHz',
        storage: '1TB M.2 PCIe Gen4 NVMe SSD',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', altText: 'Lenovo Legion Pro 7i', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'HP Spectre x360 2-in-1 14-inch Intel Core Ultra 7',
      slug: 'hp-spectre-x360-14-core-ultra-7',
      sku: 'HP-SPC14-U7-1TB',
      description: 'Versatile 2-in-1 AI-powered convertible laptop with 2.8K OLED 120Hz display and magnetic rechargeable tilt pen.',
      categoryId: categories['laptops'],
      brandId: brands['hp'],
      price: 595000.0,
      compareAtPrice: 630000.0,
      stockQuantity: 10,
      warranty: '2 Years HP Authorized Warranty',
      isFeatured: false,
      isActive: true,
      specifications: {
        display: '14-inch 2.8K (2880 x 1800) OLED 120Hz 500 nits',
        processor: 'Intel Core Ultra 7 155H with Intel AI Boost NPU',
        ram: '16GB LPDDR5x 7467MHz',
        storage: '1TB PCIe Gen4 NVMe',
        security: 'Fingerprint reader + IR Facial Recognition',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800', altText: 'HP Spectre x360 convertible', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Apple iPad Pro 13-inch M4 OLED 256GB Space Black',
      slug: 'ipad-pro-13-m4-oled-256gb',
      sku: 'APL-IPADP-13M4-256',
      description: 'Unbelievably thin design with outrageous performance from the revolutionary Apple M4 chip and breakthrough Ultra Retina XDR Tandem OLED.',
      categoryId: categories['tablets'],
      brandId: brands['apple'],
      price: 490000.0,
      compareAtPrice: 520000.0,
      stockQuantity: 14,
      warranty: '1 Year Apple Care Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        display: '13-inch Ultra Retina XDR Tandem OLED (2752 x 2064) 1000 nits full screen',
        chip: 'Apple M4 chip (9-core CPU, 10-core GPU, 16-core NPU)',
        storage: '256GB',
        thickness: '5.1 mm (thinnest Apple product ever)',
        weight: '579 grams',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', altText: 'iPad Pro 13 OLED', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Samsung Galaxy Tab S9 Ultra 5G 256GB',
      slug: 'samsung-galaxy-tab-s9-ultra',
      sku: 'SAM-TABS9U-256-5G',
      description: 'The premier Android tablet with massive 14.6-inch Dynamic AMOLED 2X display, IP68 water resistance, and included S Pen.',
      categoryId: categories['tablets'],
      brandId: brands['samsung'],
      price: 385000.0,
      compareAtPrice: 410000.0,
      stockQuantity: 8,
      warranty: '1 Year Samsung Warranty',
      isFeatured: false,
      isActive: true,
      specifications: {
        display: '14.6-inch Dynamic AMOLED 2X 120Hz (2960 x 1848)',
        processor: 'Qualcomm Snapdragon 8 Gen 2 for Galaxy',
        ram: '12GB',
        storage: '256GB (microSD expandable up to 1TB)',
        durability: 'IP68 water and dust resistant',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800', altText: 'Galaxy Tab S9 Ultra', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
      slug: 'apple-watch-ultra-2-49mm',
      sku: 'APL-AW-ULTRA2-49',
      description: 'The most rugged and capable Apple Watch. Built for endurance athletes, outdoor adventurers, and water sports enthusiasts.',
      categoryId: categories['smart-watches'],
      brandId: brands['apple'],
      price: 295000.0,
      compareAtPrice: 320000.0,
      stockQuantity: 18,
      warranty: '1 Year Apple Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        case: '49mm Aerospace-grade Titanium Case',
        display: '3000 nits Always-On Retina Display',
        chip: 'S9 SiP with 64-bit dual-core processor and Double Tap gesture',
        waterResistance: '100m water resistant with EN13319 dive computer certification',
        battery: 'Up to 36 hours regular use, up to 72 hours in Low Power Mode',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', altText: 'Apple Watch Ultra 2 Titanium', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Samsung Galaxy Watch 6 Classic 47mm LTE',
      slug: 'samsung-galaxy-watch-6-classic-47mm',
      sku: 'SAM-GW6C-47-LTE',
      description: 'Timeless style with a rotating bezel, advanced sleep coaching, body composition analysis, and sapphire crystal glass.',
      categoryId: categories['smart-watches'],
      brandId: brands['samsung'],
      price: 135000.0,
      compareAtPrice: 155000.0,
      stockQuantity: 20,
      warranty: '1 Year Samsung Warranty',
      isFeatured: false,
      isActive: true,
      specifications: {
        bezel: 'Physical rotating bezel',
        display: '1.5-inch Super AMOLED (480 x 480) with Sapphire Crystal',
        sensors: 'BioActive Sensor (Optical Heart Rate + Electrical Heart Signal + Bioelectrical Impedance Analysis)',
        battery: '425 mAh Fast wireless charging',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800', altText: 'Galaxy Watch 6 Classic', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-black',
      sku: 'SNY-WH1000XM5-BLK',
      description: 'Industry-leading noise cancellation powered by two processors and 8 microphones. Magnificent High-Resolution Audio with LDAC support.',
      categoryId: categories['audio'],
      brandId: brands['sony'],
      price: 125000.0,
      compareAtPrice: 140000.0,
      stockQuantity: 25,
      warranty: '1 Year Sony Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        driverUnit: '30mm precision-engineered carbon fiber dome',
        noiseCanceling: 'Auto NC Optimizer with Integrated Processor V1 + HD QN1',
        batteryLife: '30 hours with ANC ON, quick 3-min charge provides 3 hours',
        codecs: 'LDAC, AAC, SBC',
        weight: '250 grams',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', altText: 'Sony WH-1000XM5 Black', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Apple AirPods Pro (2nd Generation) USB-C',
      slug: 'apple-airpods-pro-2-usbc',
      sku: 'APL-APP2-USBC',
      description: 'Up to 2x more Active Noise Cancellation, Transparency mode, Adaptive Audio, and Personalized Spatial Audio with dynamic head tracking.',
      categoryId: categories['audio'],
      brandId: brands['apple'],
      price: 89000.0,
      compareAtPrice: 99000.0,
      stockQuantity: 30,
      warranty: '1 Year Apple Warranty',
      isFeatured: true,
      isActive: true,
      specifications: {
        chip: 'Apple H2 headphone chip + Apple U1 chip in case',
        chargingCase: 'MagSafe Charging Case (USB-C) with speaker and lanyard loop',
        dustAndWater: 'IP54 dust, sweat, and water resistant',
        battery: 'Up to 6 hours listening time with ANC on',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', altText: 'AirPods Pro 2 USB-C', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Sony WF-1000XM5 Truly Wireless Earbuds',
      slug: 'sony-wf-1000xm5-earbuds-silver',
      sku: 'SNY-WF1000XM5-SLV',
      description: 'Astonishing sound quality and the best noise-canceling performance in wireless earbuds. Dynamic Driver X for rich vocals and deep bass.',
      categoryId: categories['audio'],
      brandId: brands['sony'],
      price: 95000.0,
      compareAtPrice: 110000.0,
      stockQuantity: 15,
      warranty: '1 Year Sony Warranty',
      isFeatured: false,
      isActive: true,
      specifications: {
        driver: '8.4mm Dynamic Driver X',
        microphones: '3 microphones per earbud with bone conduction sensors',
        battery: '8 hours + 16 hours in case (24 hours total with ANC)',
        waterResistance: 'IPX4 splash proof',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', altText: 'Sony WF-1000XM5 Earbuds', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Apple 140W USB-C Power Adapter (GaN)',
      slug: 'apple-140w-usbc-power-adapter',
      sku: 'APL-140W-ADPT',
      description: 'Fast, efficient charging at home, in the office, or on the go. Perfect companion for MacBook Pro 16-inch fast charging (0 to 50% in 30 mins).',
      categoryId: categories['accessories'],
      brandId: brands['apple'],
      price: 36000.0,
      compareAtPrice: 40000.0,
      stockQuantity: 40,
      warranty: '6 Months Replacement Warranty',
      isFeatured: false,
      isActive: true,
      specifications: {
        powerOutput: '140 Watts USB-PD 3.1 Extended Power Range',
        port: 'USB-C',
        compatibility: 'MacBook Pro, iPad, iPhone, and all USB-PD compatible devices',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', altText: 'Apple 140W GaN Adapter', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Sony DualSense Wireless Controller Midnight Black',
      slug: 'sony-dualsense-wireless-controller-black',
      sku: 'SNY-DS-PS5-BLK',
      description: 'Discover a deeper, highly immersive gaming experience with haptic feedback, dynamic adaptive triggers, and built-in microphone.',
      categoryId: categories['accessories'],
      brandId: brands['sony'],
      price: 26500.0,
      compareAtPrice: 29000.0,
      stockQuantity: 22,
      warranty: '6 Months Warranty',
      isFeatured: false,
      isActive: true,
      specifications: {
        feedback: 'Dual haptic actuators replace traditional rumble motors',
        triggers: 'Dynamic adaptive triggers with varying force levels',
        connectivity: 'Bluetooth 5.1 and USB Type-C wired',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1606318801954-d4684609274e?w=800', altText: 'Sony DualSense Controller Black', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Out of Stock Test Product - Dell Precision 7780 Workstation',
      slug: 'dell-precision-7780-workstation',
      sku: 'DEL-PREC-7780-OOS',
      description: '17.3-inch desktop replacement workstation for AI and scientific rendering. Intentionally seeded with 0 stock to test inventory & checkout limits.',
      categoryId: categories['laptops'],
      brandId: brands['dell'],
      price: 1450000.0,
      compareAtPrice: 1550000.0,
      stockQuantity: 0, // 0 stock for testing
      warranty: '3 Years ProSupport Plus',
      isFeatured: false,
      isActive: true,
      specifications: {
        display: '17.3-inch UHD 4K (3840 x 2160) 120Hz 500 nits',
        processor: 'Intel Core i9-13950HX (24 cores)',
        gpu: 'NVIDIA RTX 5000 Ada Generation 16GB ECC',
        ram: '64GB ECC DDR5 CAMM memory',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', altText: 'Dell Precision Workstation', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'Inactive Test Product - Prototype Smartphone Concept',
      slug: 'prototype-smartphone-concept',
      sku: 'TEST-INACTIVE-001',
      description: 'Intentionally marked isActive: false to verify that public APIs filter it out and only admin APIs can view it.',
      categoryId: categories['mobile-phones'],
      brandId: brands['samsung'],
      price: 500000.0,
      compareAtPrice: null,
      stockQuantity: 10,
      warranty: 'No Warranty',
      isFeatured: false,
      isActive: false, // Inactive for testing public API filter
      specifications: {
        note: 'Internal test device only',
      },
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', altText: 'Prototype Phone', isPrimary: true, displayOrder: 0 },
      ],
    },
  ];

  for (const productData of productsData) {
    const { images, ...prodFields } = productData;
    const createdProduct = await prisma.product.create({
      data: {
        ...prodFields,
        images: {
          create: images,
        },
      },
    });

    // Record initial inventory transaction if initial stock > 0
    if (prodFields.stockQuantity > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: createdProduct.id,
          type: InventoryTransactionType.STOCK_IN,
          quantity: prodFields.stockQuantity,
          previousStock: 0,
          newStock: prodFields.stockQuantity,
          reason: 'Initial system seed stock',
          reference: 'SEED-INIT',
        },
      });
    }
  }

  console.log(`✅ Seeded ${productsData.length} Products with images and initial stock transactions`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
