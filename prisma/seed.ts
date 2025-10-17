import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ==================== ROLES ====================
  console.log('📝 Seeding Roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER' },
  });

  const vendorRole = await prisma.role.upsert({
    where: { name: 'VENDOR' },
    update: {},
    create: { name: 'VENDOR' },
  });
  console.log('✅ Roles seeded\n');

  // ==================== USERS ====================
  console.log('👤 Seeding Users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      name: 'Admin User',
      password: hashedPassword,
      phone: '+1234567890',
      roleId: adminRole.roleId,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: hashedPassword,
      phone: '+1234567891',
      roleId: customerRole.roleId,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      phone: '+1234567892',
      roleId: customerRole.roleId,
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@ecommerce.com' },
    update: {},
    create: {
      email: 'vendor@ecommerce.com',
      name: 'Vendor User',
      password: hashedPassword,
      phone: '+1234567893',
      roleId: vendorRole.roleId,
    },
  });
  console.log('✅ Users seeded\n');

  // ==================== CATEGORIES ====================
  console.log('📁 Seeding Categories...');
  
  // Root categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      isActive: true,
    },
  });

  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      isActive: true,
    },
  });

  const home = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home decor and garden supplies',
      imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a',
      isActive: true,
    },
  });

  // Electronics subcategories
  const computers = await prisma.category.create({
    data: {
      name: 'Computers',
      slug: 'computers',
      description: 'Laptops, desktops, and accessories',
      parentId: electronics.categoryId,
      isActive: true,
    },
  });

  const smartphones = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronics.categoryId,
      isActive: true,
    },
  });

  const audio = await prisma.category.create({
    data: {
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      description: 'Headphones, speakers, and audio equipment',
      parentId: electronics.categoryId,
      isActive: true,
    },
  });

  // Fashion subcategories
  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: "Men's fashion and accessories",
      parentId: fashion.categoryId,
      isActive: true,
    },
  });

  const womensClothing = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: "Women's fashion and accessories",
      parentId: fashion.categoryId,
      isActive: true,
    },
  });

  // Deeper level - Computers subcategories
  const laptops = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portable computers',
      parentId: computers.categoryId,
      isActive: true,
    },
  });

  const desktops = await prisma.category.create({
    data: {
      name: 'Desktops',
      slug: 'desktops',
      description: 'Desktop computers',
      parentId: computers.categoryId,
      isActive: true,
    },
  });
  console.log('✅ Categories seeded\n');

  // ==================== PRODUCTS ====================
  console.log('📦 Seeding Products...');
  
  const products = await Promise.all([
    // Laptops
    prisma.product.create({
      data: {
        categoryId: laptops.categoryId,
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        description: 'Apple MacBook Pro 16-inch with M3 Pro chip, 16GB RAM, 512GB SSD',
        price: 2499.99,
        discount: 10,
        stock: 15,
        sku: 'LAPTOP-MBP16-001',
        brand: 'Apple',
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: laptops.categoryId,
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        description: 'Dell XPS 15 with Intel i7, 16GB RAM, 1TB SSD',
        price: 1899.99,
        stock: 20,
        sku: 'LAPTOP-DELLXPS-001',
        brand: 'Dell',
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: laptops.categoryId,
        name: 'HP Pavilion 14',
        slug: 'hp-pavilion-14',
        description: 'HP Pavilion 14-inch laptop with AMD Ryzen 5, 8GB RAM, 256GB SSD',
        price: 699.99,
        discount: 5,
        stock: 30,
        sku: 'LAPTOP-HP14-001',
        brand: 'HP',
        isActive: true,
      },
    }),
    
    // Smartphones
    prisma.product.create({
      data: {
        categoryId: smartphones.categoryId,
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Apple iPhone 15 Pro with A17 Pro chip, 256GB storage',
        price: 1199.99,
        stock: 50,
        sku: 'PHONE-IP15PRO-001',
        brand: 'Apple',
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: smartphones.categoryId,
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Samsung Galaxy S24 with Snapdragon 8 Gen 3, 256GB storage',
        price: 999.99,
        discount: 15,
        stock: 40,
        sku: 'PHONE-SGS24-001',
        brand: 'Samsung',
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: smartphones.categoryId,
        name: 'Google Pixel 8',
        slug: 'google-pixel-8',
        description: 'Google Pixel 8 with Tensor G3 chip, 128GB storage',
        price: 699.99,
        stock: 35,
        sku: 'PHONE-PIXEL8-001',
        brand: 'Google',
        isActive: true,
      },
    }),
    
    // Audio
    prisma.product.create({
      data: {
        categoryId: audio.categoryId,
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        description: 'Sony wireless noise-cancelling headphones',
        price: 399.99,
        stock: 60,
        sku: 'AUDIO-SONY1000XM5-001',
        brand: 'Sony',
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: audio.categoryId,
        name: 'AirPods Pro 2',
        slug: 'airpods-pro-2',
        description: 'Apple AirPods Pro (2nd generation) with MagSafe',
        price: 249.99,
        discount: 10,
        stock: 100,
        sku: 'AUDIO-AIRPODSPRO2-001',
        brand: 'Apple',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: audio.categoryId,
        name: 'Bose QuietComfort 45',
        slug: 'bose-qc45',
        description: 'Bose QuietComfort 45 wireless noise-cancelling headphones',
        price: 329.99,
        stock: 45,
        sku: 'AUDIO-BOSEQC45-001',
        brand: 'Bose',
        isActive: true,
      },
    }),
    
    // Men's Clothing
    prisma.product.create({
      data: {
        categoryId: mensClothing.categoryId,
        name: 'Classic Fit Jeans',
        slug: 'classic-fit-jeans',
        description: 'Comfortable blue denim jeans for men',
        price: 59.99,
        stock: 150,
        sku: 'MENS-JEANS-001',
        brand: "Levi's",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: mensClothing.categoryId,
        name: 'Cotton T-Shirt Pack',
        slug: 'cotton-tshirt-pack',
        description: 'Pack of 3 premium cotton t-shirts',
        price: 39.99,
        discount: 20,
        stock: 200,
        sku: 'MENS-TSHIRT-001',
        brand: 'Hanes',
        isActive: true,
      },
    }),
    
    // Women's Clothing
    prisma.product.create({
      data: {
        categoryId: womensClothing.categoryId,
        name: 'Summer Floral Dress',
        slug: 'summer-floral-dress',
        description: 'Beautiful floral print summer dress',
        price: 79.99,
        stock: 80,
        sku: 'WOMENS-DRESS-001',
        brand: 'Zara',
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: womensClothing.categoryId,
        name: 'Yoga Pants',
        slug: 'yoga-pants',
        description: 'High-waisted yoga pants with compression',
        price: 49.99,
        stock: 120,
        sku: 'WOMENS-YOGA-001',
        brand: 'Lululemon',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Products seeded\n');

  // ==================== PRODUCT IMAGES ====================
  console.log('🖼️  Seeding Product Images...');
  await Promise.all([
    // MacBook Pro images
    prisma.productImage.create({
      data: {
        productId: products[0].productId,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        altText: 'MacBook Pro front view',
        isPrimary: true,
        sortOrder: 1,
      },
    }),
    prisma.productImage.create({
      data: {
        productId: products[0].productId,
        imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef',
        altText: 'MacBook Pro side view',
        isPrimary: false,
        sortOrder: 2,
      },
    }),
    // Dell XPS images
    prisma.productImage.create({
      data: {
        productId: products[1].productId,
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
        altText: 'Dell XPS 15',
        isPrimary: true,
        sortOrder: 1,
      },
    }),
    // iPhone images
    prisma.productImage.create({
      data: {
        productId: products[3].productId,
        imageUrl: 'https://images.unsplash.com/photo-1592286927505-55e8c7f03c7d',
        altText: 'iPhone 15 Pro',
        isPrimary: true,
        sortOrder: 1,
      },
    }),
    // Samsung Galaxy images
    prisma.productImage.create({
      data: {
        productId: products[4].productId,
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
        altText: 'Samsung Galaxy S24',
        isPrimary: true,
        sortOrder: 1,
      },
    }),
    // Headphones images
    prisma.productImage.create({
      data: {
        productId: products[6].productId,
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
        altText: 'Sony WH-1000XM5',
        isPrimary: true,
        sortOrder: 1,
      },
    }),
  ]);
  console.log('✅ Product Images seeded\n');

  // ==================== SHIPPING ADDRESSES ====================
  console.log('🏠 Seeding Shipping Addresses...');
  const address1 = await prisma.shippingAddress.create({
    data: {
      userId: customer1.userId,
      fullName: 'John Doe',
      phone: '+1234567891',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isDefault: true,
    },
  });

  const address2 = await prisma.shippingAddress.create({
    data: {
      userId: customer1.userId,
      fullName: 'John Doe',
      phone: '+1234567891',
      addressLine1: '456 Park Avenue',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11201',
      country: 'USA',
      isDefault: false,
    },
  });

  const address3 = await prisma.shippingAddress.create({
    data: {
      userId: customer2.userId,
      fullName: 'Jane Smith',
      phone: '+1234567892',
      addressLine1: '789 Oak Street',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
      isDefault: true,
    },
  });
  console.log('✅ Shipping Addresses seeded\n');

  // ==================== CARTS ====================
  console.log('🛒 Seeding Carts...');
  const cart1 = await prisma.cart.create({
    data: {
      userId: customer1.userId,
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      userId: customer2.userId,
    },
  });

  // Cart Items
  await Promise.all([
    prisma.cartItem.create({
      data: {
        cartId: cart1.cartId,
        productId: products[0].productId, // MacBook Pro
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: cart1.cartId,
        productId: products[6].productId, // Sony Headphones
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: cart2.cartId,
        productId: products[3].productId, // iPhone
        quantity: 1,
      },
    }),
  ]);
  console.log('✅ Carts seeded\n');

  // ==================== WISHLISTS ====================
  console.log('❤️  Seeding Wishlists...');
  await Promise.all([
    prisma.wishlist.create({
      data: {
        userId: customer1.userId,
        productId: products[3].productId, // iPhone
      },
    }),
    prisma.wishlist.create({
      data: {
        userId: customer1.userId,
        productId: products[4].productId, // Samsung Galaxy
      },
    }),
    prisma.wishlist.create({
      data: {
        userId: customer2.userId,
        productId: products[0].productId, // MacBook Pro
      },
    }),
  ]);
  console.log('✅ Wishlists seeded\n');

  // ==================== ORDERS ====================
  console.log('📋 Seeding Orders...');
  
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-0001',
      userId: customer1.userId,
      shippingAddressId: address1.addressId,
      subtotal: 1899.99,
      tax: 189.99,
      shippingCost: 15.00,
      discount: 50.00,
      totalAmount: 2054.98,
      status: 'DELIVERED',
      notes: 'Please leave at front door',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-0002',
      userId: customer2.userId,
      shippingAddressId: address3.addressId,
      subtotal: 1199.99,
      tax: 119.99,
      shippingCost: 0,
      totalAmount: 1319.98,
      status: 'SHIPPED',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-0003',
      userId: customer1.userId,
      shippingAddressId: address2.addressId,
      subtotal: 399.99,
      tax: 39.99,
      shippingCost: 10.00,
      totalAmount: 449.98,
      status: 'PROCESSING',
    },
  });
  console.log('✅ Orders seeded\n');

  // ==================== ORDER ITEMS ====================
  console.log('📦 Seeding Order Items...');
  await Promise.all([
    // Order 1 items
    prisma.orderItem.create({
      data: {
        orderId: order1.orderId,
        productId: products[1].productId, // Dell XPS
        quantity: 1,
        unitPrice: 1899.99,
        totalPrice: 1899.99,
      },
    }),
    // Order 2 items
    prisma.orderItem.create({
      data: {
        orderId: order2.orderId,
        productId: products[3].productId, // iPhone
        quantity: 1,
        unitPrice: 1199.99,
        totalPrice: 1199.99,
      },
    }),
    // Order 3 items
    prisma.orderItem.create({
      data: {
        orderId: order3.orderId,
        productId: products[6].productId, // Sony Headphones
        quantity: 1,
        unitPrice: 399.99,
        totalPrice: 399.99,
      },
    }),
  ]);
  console.log('✅ Order Items seeded\n');

  // ==================== PAYMENTS ====================
  console.log('💳 Seeding Payments...');
  await Promise.all([
    prisma.payment.create({
      data: {
        orderId: order1.orderId,
        userId: customer1.userId,
        amount: 2054.98,
        paymentMethod: 'CREDIT_CARD',
        status: 'COMPLETED',
        transactionId: 'TXN-2024-001',
        paymentDate: new Date('2024-01-15'),
      },
    }),
    prisma.payment.create({
      data: {
        orderId: order2.orderId,
        userId: customer2.userId,
        amount: 1319.98,
        paymentMethod: 'PAYPAL',
        status: 'COMPLETED',
        transactionId: 'TXN-2024-002',
        paymentDate: new Date('2024-01-20'),
      },
    }),
    prisma.payment.create({
      data: {
        orderId: order3.orderId,
        userId: customer1.userId,
        amount: 449.98,
        paymentMethod: 'STRIPE',
        status: 'PROCESSING',
        transactionId: 'TXN-2024-003',
      },
    }),
  ]);
  console.log('✅ Payments seeded\n');

  // ==================== SHIPMENTS ====================
  console.log('🚚 Seeding Shipments...');
  await Promise.all([
    prisma.shipment.create({
      data: {
        orderId: order1.orderId,
        trackingNumber: 'TRACK-001-2024',
        carrier: 'FedEx',
        status: 'DELIVERED',
        shippedAt: new Date('2024-01-16'),
        estimatedDelivery: new Date('2024-01-20'),
        deliveredAt: new Date('2024-01-19'),
      },
    }),
    prisma.shipment.create({
      data: {
        orderId: order2.orderId,
        trackingNumber: 'TRACK-002-2024',
        carrier: 'UPS',
        status: 'IN_TRANSIT',
        shippedAt: new Date('2024-01-21'),
        estimatedDelivery: new Date('2024-01-25'),
      },
    }),
    prisma.shipment.create({
      data: {
        orderId: order3.orderId,
        trackingNumber: 'TRACK-003-2024',
        carrier: 'DHL',
        status: 'PICKED_UP',
        shippedAt: new Date('2024-01-22'),
        estimatedDelivery: new Date('2024-01-26'),
      },
    }),
  ]);
  console.log('✅ Shipments seeded\n');

  // ==================== ORDER TRACKING ====================
  console.log('📍 Seeding Order Tracking...');
  await Promise.all([
    // Order 1 tracking (Delivered)
    prisma.orderTracking.create({
      data: {
        orderId: order1.orderId,
        status: 'Order Placed',
        description: 'Your order has been placed successfully',
        location: 'New York, NY',
        createdAt: new Date('2024-01-15'),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: order1.orderId,
        status: 'Processing',
        description: 'Order is being processed',
        location: 'Warehouse, NJ',
        createdAt: new Date('2024-01-16'),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: order1.orderId,
        status: 'Shipped',
        description: 'Package has been shipped',
        location: 'Distribution Center, PA',
        createdAt: new Date('2024-01-17'),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: order1.orderId,
        status: 'Out for Delivery',
        description: 'Package is out for delivery',
        location: 'New York, NY',
        createdAt: new Date('2024-01-19'),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: order1.orderId,
        status: 'Delivered',
        description: 'Package delivered successfully',
        location: 'New York, NY',
        createdAt: new Date('2024-01-19'),
      },
    }),
    // Order 2 tracking (In Transit)
    prisma.orderTracking.create({
      data: {
        orderId: order2.orderId,
        status: 'Order Placed',
        description: 'Your order has been placed successfully',
        location: 'Los Angeles, CA',
        createdAt: new Date('2024-01-20'),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: order2.orderId,
        status: 'Shipped',
        description: 'Package has been shipped',
        location: 'Distribution Center, CA',
        createdAt: new Date('2024-01-21'),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: order2.orderId,
        status: 'In Transit',
        description: 'Package is in transit',
        location: 'Phoenix, AZ',
        createdAt: new Date('2024-01-22'),
      },
    }),
  ]);
  console.log('✅ Order Tracking seeded\n');

  // ==================== REVIEWS ====================
  console.log('⭐ Seeding Reviews...');
  await Promise.all([
    prisma.review.create({
      data: {
        productId: products[1].productId, // Dell XPS
        userId: customer1.userId,
        rating: 5,
        title: 'Excellent laptop!',
        comment: 'This laptop exceeded my expectations. Great performance and build quality.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[3].productId, // iPhone
        userId: customer2.userId,
        rating: 4,
        title: 'Great phone',
        comment: 'Love the camera quality. Battery life could be better.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[6].productId, // Sony Headphones
        userId: customer1.userId,
        rating: 5,
        title: 'Best headphones ever',
        comment: 'Amazing noise cancellation and sound quality. Worth every penny!',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[4].productId, // Samsung Galaxy
        userId: customer1.userId,
        rating: 4,
        title: 'Solid Android phone',
        comment: 'Great display and performance. UI could be cleaner.',
        isVerified: false,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[0].productId, // MacBook Pro
        userId: customer2.userId,
        rating: 5,
        title: 'Premium laptop',
        comment: 'The M3 chip is incredibly fast. Best laptop I have ever owned.',
        isVerified: false,
      },
    }),
  ]);
  console.log('✅ Reviews seeded\n');

  console.log('🎉 Seed completed successfully!\n');
  console.log('Summary:');
  console.log('- 3 Roles');
  console.log('- 4 Users');
  console.log('- 10 Categories (with hierarchy)');
  console.log(`- ${products.length} Products`);
  console.log('- 6 Product Images');
  console.log('- 3 Shipping Addresses');
  console.log('- 2 Carts with items');
  console.log('- 3 Wishlist items');
  console.log('- 3 Orders');
  console.log('- 3 Order Items');
  console.log('- 3 Payments');
  console.log('- 3 Shipments');
  console.log('- 11 Order Tracking records');
  console.log('- 5 Reviews');
  console.log('\n✨ Database is ready for use!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

