import bcrypt from 'bcryptjs';
import { Coupon, Order, Product, Review, User } from './models.js';

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1100&q=80`;

const catalog = [
  {
    name: 'Shore Linen Shirt',
    slug: 'shore-linen-shirt',
    brand: 'Loom & Co',
    category: 'Apparel',
    price: 2490,
    compareAtPrice: 3200,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Sand', 'Ink', 'Olive'],
    stock: 32,
    featured: true,
    tags: ['linen', 'shirt', 'summer'],
    sku: 'VL-APP-014',
    images: [img('1596755094514-f87e34085b2c'), img('1620799140408-edc6dcb6d633')],
    description:
      'An easy, slightly oversized shirt in garment-washed linen. Cut to be worn open over a vest or buttoned for a lecture.',
    details: '100% linen. Mother-of-pearl buttons. Machine wash cold, hang dry. Made in a small Tiruppur unit.',
  },
  {
    name: 'Handloom Day Kurta',
    slug: 'handloom-day-kurta',
    brand: 'Kaveri Studio',
    category: 'Apparel',
    price: 3450,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Indigo'],
    stock: 24,
    featured: true,
    justIn: true,
    tags: ['kurta', 'handloom', 'cotton'],
    sku: 'VL-APP-022',
    images: [img('1617627143750-d86bc21e42bb'), img('1583391733956-6c78276477e2')],
    description:
      'A straight-cut cotton kurta with a narrow collar and side slits. Light enough for a Varanasi afternoon, formal enough for a viva.',
    details: 'Handloom cotton. Side pockets. Gentle machine wash. Colour may soften slightly after the first wash.',
  },
  {
    name: 'Merino Crew',
    slug: 'merino-crew',
    brand: 'Field & Form',
    category: 'Apparel',
    price: 3890,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Oat'],
    stock: 18,
    tags: ['sweater', 'wool', 'winter'],
    sku: 'VL-APP-031',
    images: [img('1434389677669-e08b4cac3105'), img('1576566588028-4147f3842f27')],
    description: 'A fine-gauge merino crew that layers under a jacket without bulk. Ribbed cuffs, quiet shoulders.',
    details: '100% merino wool. Hand wash or wool cycle. Dry flat. Do not tumble.',
  },
  {
    name: 'Indigo Denim Jacket',
    slug: 'indigo-denim-jacket',
    brand: 'Field & Form',
    category: 'Apparel',
    price: 4650,
    compareAtPrice: 5400,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo'],
    stock: 16,
    featured: true,
    tags: ['denim', 'jacket'],
    sku: 'VL-APP-040',
    images: [img('1551537482-f2075a1d41f2'), img('1544022613-e87ca75a784a')],
    description: 'A mid-weight indigo jacket with a slightly cropped hem. The wash is uneven on purpose.',
    details: '12oz cotton denim. Metal shank buttons. Wash inside out, cold. Expect the indigo to settle.',
  },
  {
    name: 'City Runner',
    slug: 'city-runner',
    brand: 'Field & Form',
    category: 'Footwear',
    price: 5499,
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Clay', 'Black'],
    stock: 22,
    featured: true,
    tags: ['shoes', 'trainers', 'running'],
    sku: 'VL-FT-018',
    images: [img('1549298916-b41d501d3772'), img('1460353581641-37baddab0fa2')],
    description: 'A daily trainer with a cushioned sole and a clay-coloured upper. Built for campus walks more than marathons.',
    details: 'Mesh and suede upper. Rubber outsole. Wipe clean. True to size for most feet.',
  },
  {
    name: 'Court Canvas',
    slug: 'court-canvas',
    brand: 'Loom & Co',
    category: 'Footwear',
    price: 2799,
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['White', 'Forest'],
    stock: 30,
    tags: ['sneakers', 'canvas'],
    sku: 'VL-FT-007',
    images: [img('1525966222134-fcfa99b8ae77'), img('1463100099107-aa0980c362e6')],
    description: 'Low canvas sneakers with a vulcanised sole and no logo shouting from the side.',
    details: 'Cotton canvas. Vulcanised rubber sole. Spot clean. They soften after a week of wear.',
  },
  {
    name: 'Market Tote',
    slug: 'market-tote',
    brand: 'Sable Leather',
    category: 'Accessories',
    price: 4200,
    colors: ['Tan', 'Black'],
    stock: 14,
    featured: true,
    tags: ['bag', 'leather', 'tote'],
    sku: 'VL-ACC-011',
    images: [img('1590874103328-eac38a683ce7'), img('1548036328-c9fa89d128fa')],
    description: 'An unstructured leather tote that holds a laptop, a notebook, and the week’s sabzi without looking like luggage.',
    details: 'Full-grain leather. Unlined. Cotton webbing handles. Condition with a colourless balm twice a year.',
  },
  {
    name: 'Silk Bandana',
    slug: 'silk-bandana',
    brand: 'Kaveri Studio',
    category: 'Accessories',
    price: 1290,
    colors: ['Madder', 'Sage'],
    stock: 20,
    tags: ['scarf', 'silk'],
    sku: 'VL-ACC-019',
    images: [img('1520903920243-00d872a2d1c9'), img('1601924994987-69e26d50dc26')],
    description: 'A square of hand-rolled silk, printed with a small botanical repeat. Tie it, pocket it, gift it.',
    details: 'Silk twill. Dry clean or cold hand wash. 70 × 70 cm.',
  },
  {
    name: 'Field Watch',
    slug: 'field-watch',
    brand: 'Atelier North',
    category: 'Accessories',
    price: 6750,
    colors: ['Steel', 'Gold'],
    stock: 11,
    justIn: true,
    tags: ['watch'],
    sku: 'VL-ACC-028',
    images: [img('1524805444758-089113d48a6d'), img('1523275335684-37898b6baf30')],
    description: 'A 38mm field watch with a clean dial and a leather strap. No smart notifications. That is the feature.',
    details: 'Stainless case. Japanese quartz movement. 5 ATM. Strap is leather, interchangeable.',
  },
  {
    name: 'Oval Sunglasses',
    slug: 'oval-sunglasses',
    brand: 'Atelier North',
    category: 'Accessories',
    price: 2150,
    colors: ['Tortoise', 'Black'],
    stock: 19,
    tags: ['sunglasses'],
    sku: 'VL-ACC-033',
    images: [img('1511499767150-a48a237f0083'), img('1473496169904-658ba7c44d8a')],
    description: 'Narrow oval frames with UV400 lenses. Light enough to forget on your head through a lab session.',
    details: 'Acetate frame. UV400 lenses. Comes with a cotton pouch.',
  },
  {
    name: 'Studio Headphones',
    slug: 'studio-headphones',
    brand: 'Nila Audio',
    category: 'Audio',
    price: 8999,
    compareAtPrice: 10999,
    colors: ['Graphite'],
    stock: 15,
    featured: true,
    tags: ['headphones', 'audio', 'wireless'],
    sku: 'VL-AUD-002',
    images: [img('1505740420928-5e560c06d30e'), img('1583394838336-acd977736f90')],
    description: 'Closed-back wireless headphones tuned a little warm. Thirty hours, a physical button, and a case that actually closes.',
    details: 'Bluetooth 5.3. USB-C charging. 30-hour battery. Fold-flat earcups. Includes a 3.5mm cable.',
  },
  {
    name: 'Pocket Speaker',
    slug: 'pocket-speaker',
    brand: 'Nila Audio',
    category: 'Audio',
    price: 3499,
    colors: ['Sand'],
    stock: 0,
    tags: ['speaker', 'audio'],
    sku: 'VL-AUD-009',
    images: [img('1608043152269-423dbba4e7e1'), img('1545454675-3531b543be5d')],
    description: 'A palm-sized speaker for hostel rooms and train berths. Currently sold through — join the wait by wishing it.',
    details: 'IPX5. 12-hour playback. USB-C. Pair two for a wider stereo image.',
  },
  {
    name: 'Brass Task Lamp',
    slug: 'brass-task-lamp',
    brand: 'Ghara Home',
    category: 'Home',
    price: 2850,
    stock: 13,
    featured: true,
    tags: ['lamp', 'desk', 'brass'],
    sku: 'VL-HOM-004',
    images: [img('1507473885765-e6ed057f782c'), img('1513506003901-1e6a229e2d15')],
    description: 'A small brass lamp with a linen shade. Meant for the corner of a desk, not a showroom.',
    details: 'Solid brass base, linen shade. E14 bulb not included. Wipe with a dry cloth — patina is welcome.',
  },
  {
    name: 'Pour-Over Set',
    slug: 'pour-over-set',
    brand: 'Terra Table',
    category: 'Home',
    price: 1890,
    stock: 21,
    justIn: true,
    tags: ['coffee', 'ceramic'],
    sku: 'VL-HOM-015',
    images: [img('1514228742587-6b1558fcca3d'), img('1495474472287-4d71bcdd2085')],
    description: 'A ceramic dripper and a 300ml server. The morning ritual, minus the plastic cone.',
    details: 'Stoneware. Dishwasher safe. Fits 01 paper filters. Holds one generous mug.',
  },
  {
    name: 'Stoneware Bowls',
    slug: 'stoneware-bowls',
    brand: 'Terra Table',
    category: 'Home',
    price: 2640,
    stock: 17,
    tags: ['bowls', 'ceramic', 'dinner'],
    sku: 'VL-HOM-021',
    images: [img('1610701596007-11502861dcfa'), img('1578749556568-bc2c1954c6d2')],
    description: 'A set of four shallow bowls with a speckled glaze. Dal, yoghurt, or late noodles — they do not mind.',
    details: 'Set of 4. Stoneware, microwave and dishwasher safe. Diameter 16 cm.',
  },
  {
    name: 'Wool Throw',
    slug: 'wool-throw',
    brand: 'Ghara Home',
    category: 'Home',
    price: 3450,
    colors: ['Rust', 'Ivory'],
    stock: 12,
    tags: ['blanket', 'wool'],
    sku: 'VL-HOM-027',
    images: [img('1584100936595-c0654b55a2e2'), img('1616486338812-3dadae4b4ace')],
    description: 'A brushed wool throw for the end of a bed or the back of a chair. Heavy enough to matter in December.',
    details: '80% wool, 20% cotton. 130 × 180 cm. Dry clean. Fringe is hand-knotted.',
  },
  {
    name: 'Fig & Cedar Candle',
    slug: 'fig-cedar-candle',
    brand: 'Atelier North',
    category: 'Beauty',
    price: 980,
    stock: 26,
    tags: ['candle', 'home fragrance'],
    sku: 'VL-BTY-003',
    images: [img('1603006905003-be475563bc59'), img('1602607385932-c80511313b0c')],
    description: 'Fig leaf, cedar, and a little smoke. A 40-hour burn in amber glass.',
    details: 'Soy blend wax. Cotton wick. 220 g. Trim the wick to 5 mm before each light.',
  },
  {
    name: 'Neroli Hand Balm',
    slug: 'neroli-hand-balm',
    brand: 'Atelier North',
    category: 'Beauty',
    price: 640,
    stock: 40,
    justIn: true,
    tags: ['balm', 'skincare'],
    sku: 'VL-BTY-008',
    images: [img('1556228720-195a672e8a03'), img('1608248543803-ba4f8c70ae0b')],
    description: 'A small tin of neroli balm for hands that have been on a keyboard since morning.',
    details: 'Shea, beeswax, neroli oil. 30 ml tin. For external use.',
  },
];

const NOTES = [
  'Cloth feels substantial. Washed it twice and the colour held.',
  'Fits the way the photos suggest. Rare, and appreciated.',
  'Packed cleanly. Reached Varanasi in four days.',
  'Quiet object. It does not shout, which is the point.',
  'I would buy the second colour without thinking.',
  'Weight and finish are better than the price suggests.',
  'Gifted one and ordered another for myself.',
  'True to the description. The stitching is even.',
];

const addresses = {
  rohan: {
    fullName: 'Rohan Mehta',
    phone: '9876543210',
    line1: '42, Lanka',
    line2: 'Near BHU',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    postalCode: '221005',
  },
  meera: {
    fullName: 'Meera Iyer',
    phone: '9845011122',
    line1: '18, Indiranagar 12th Main',
    line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
  },
  arjun: {
    fullName: 'Arjun Shah',
    phone: '9820099001',
    line1: '7, Bandra West',
    line2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
  },
  sara: {
    fullName: 'Sara Qureshi',
    phone: '9811122233',
    line1: '3, C-Scheme',
    line2: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302001',
  },
};

function daysAgo(n, hour = 11) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(hour, 20, 0, 0);
  return date;
}

export async function seedIfEmpty() {
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log('Catalog already present — skipping seed');
    return;
  }

  const password = await bcrypt.hash('Demo@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const [admin, rohan, meera, arjun, sara] = await User.create([
    {
      name: 'Aisha Kapoor',
      email: 'admin@velora.com',
      password: adminPassword,
      role: 'admin',
      phone: '9810001122',
    },
    {
      name: 'Rohan Mehta',
      email: 'demo@velora.com',
      password,
      role: 'customer',
      phone: '9876543210',
      addresses: [addresses.rohan],
    },
    {
      name: 'Meera Iyer',
      email: 'meera@example.com',
      password,
      role: 'customer',
      phone: '9845011122',
      addresses: [addresses.meera],
    },
    {
      name: 'Arjun Shah',
      email: 'arjun@example.com',
      password,
      role: 'customer',
      phone: '9820099001',
      addresses: [addresses.arjun],
    },
    {
      name: 'Sara Qureshi',
      email: 'sara@example.com',
      password,
      role: 'customer',
      phone: '9811122233',
      addresses: [addresses.sara],
    },
  ]);

  const products = await Product.create(catalog);
  for (let i = 0; i < products.length; i += 1) {
    const date = new Date(Date.now() - (products.length - i) * 5 * 60 * 60 * 1000);
    await Product.collection.updateOne({ _id: products[i]._id }, { $set: { createdAt: date, updatedAt: date } });
  }

  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  const customers = [rohan, meera, arjun, sara];

  const reviewDocs = [];
  products.forEach((product, index) => {
    const count = product.featured ? 4 : 2;
    for (let n = 0; n < count; n += 1) {
      const user = customers[(index + n) % customers.length];
      reviewDocs.push({
        user: user._id,
        name: user.name,
        product: product._id,
        rating: [5, 4, 5, 4, 5][(index + n) % 5],
        comment: NOTES[(index + n) % NOTES.length],
        createdAt: daysAgo(3 + ((index + n) % 12)),
      });
    }
  });
  await Review.insertMany(reviewDocs);

  for (const product of products) {
    const rows = await Review.find({ product: product._id });
    const avg = rows.reduce((sum, row) => sum + row.rating, 0) / rows.length;
    product.rating = Math.round(avg * 10) / 10;
    product.numReviews = rows.length;
    await product.save();
  }

  await Coupon.create([
    { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 999, label: '10% off your first edit', active: true },
    { code: 'STUDENT15', type: 'percent', value: 15, minSubtotal: 1499, maxDiscount: 800, label: '15% student note', active: true },
    { code: 'VELORA20', type: 'percent', value: 20, minSubtotal: 2999, maxDiscount: 1500, label: '20% on orders over ₹2,999', active: true },
  ]);

  const orderPlan = [
    { user: rohan, address: addresses.rohan, days: 0, status: 'Placed', pay: 'UPI', lines: [['shore-linen-shirt', 1, 'M', 'Sand'], ['neroli-hand-balm', 1]] },
    { user: meera, address: addresses.meera, days: 1, status: 'Packed', pay: 'Card', lines: [['studio-headphones', 1, '', 'Graphite']] },
    { user: arjun, address: addresses.arjun, days: 1, status: 'Shipped', pay: 'UPI', lines: [['city-runner', 1, '9', 'Clay'], ['silk-bandana', 1, '', 'Madder']] },
    { user: sara, address: addresses.sara, days: 2, status: 'Delivered', pay: 'COD', lines: [['market-tote', 1, '', 'Tan']] },
    { user: rohan, address: addresses.rohan, days: 3, status: 'Delivered', pay: 'UPI', lines: [['brass-task-lamp', 1], ['pour-over-set', 1]] },
    { user: meera, address: addresses.meera, days: 4, status: 'Delivered', pay: 'Card', lines: [['handloom-day-kurta', 1, 'M', 'Ivory']] },
    { user: arjun, address: addresses.arjun, days: 5, status: 'Shipped', pay: 'UPI', lines: [['indigo-denim-jacket', 1, 'L', 'Indigo']] },
    { user: sara, address: addresses.sara, days: 6, status: 'Cancelled', pay: 'UPI', lines: [['wool-throw', 1, '', 'Rust']] },
    { user: rohan, address: addresses.rohan, days: 6, status: 'Delivered', pay: 'COD', lines: [['court-canvas', 1, '8', 'White'], ['fig-cedar-candle', 2]] },
    { user: meera, address: addresses.meera, days: 8, status: 'Delivered', pay: 'UPI', lines: [['stoneware-bowls', 1], ['merino-crew', 1, 'S', 'Oat']] },
  ];

  for (const plan of orderPlan) {
    const items = plan.lines.map(([slug, qty, size = '', color = '']) => {
      const product = bySlug[slug];
      return {
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        qty,
        size,
        color,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = subtotal >= 2999 ? 0 : 99;
    const createdAt = daysAgo(plan.days, 10 + (plan.days % 5));
    const order = await Order.create({
      user: plan.user._id,
      orderNumber: `VEL-${Math.floor(100000 + Math.random() * 900000)}`,
      items,
      shippingAddress: plan.address,
      paymentMethod: plan.pay,
      subtotal,
      discount: 0,
      shipping,
      total: subtotal + shipping,
      isPaid: plan.pay !== 'COD' && plan.status !== 'Cancelled',
      paidAt: plan.pay !== 'COD' && plan.status !== 'Cancelled' ? createdAt : null,
      status: plan.status,
      deliveredAt: plan.status === 'Delivered' ? createdAt : null,
    });
    await Order.collection.updateOne({ _id: order._id }, { $set: { createdAt, updatedAt: createdAt } });
    if (plan.status !== 'Cancelled') {
      for (const item of items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.qty } });
      }
    }
  }

  await Product.updateOne({ slug: 'pocket-speaker' }, { stock: 0 });
  await Product.updateOne({ slug: 'fig-cedar-candle' }, { stock: 4 });
  await Product.updateOne({ slug: 'silk-bandana' }, { stock: 6 });

  rohan.wishlist = [bySlug['field-watch']._id, bySlug['studio-headphones']._id];
  await rohan.save();

  console.log('Seeded Velora catalog, customers, reviews, coupons, and orders');
  console.log('Customer  demo@velora.com  /  Demo@123');
  console.log('Admin     admin@velora.com /  Admin@123');
}
