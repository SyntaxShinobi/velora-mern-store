import { Router } from 'express';
import { Order, Product, Review, User } from '../models.js';
import { AppError, adminOnly, asyncHandler, protect } from '../middleware.js';

const router = Router();
router.use(protect, adminOnly);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function asList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uniqueSlug(name, ignoreId) {
  const base = slugify(name) || 'product';
  let slug = base;
  let n = 2;
  while (await Product.findOne({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function payload(body, slug) {
  const images = asList(body.images);
  return {
    name: String(body.name || '').trim(),
    slug,
    description: String(body.description || '').trim(),
    details: String(body.details || '').trim(),
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : 0,
    category: String(body.category || '').trim(),
    brand: String(body.brand || '').trim(),
    images: images.length ? images : ['/placeholder.svg'],
    stock: Number(body.stock) || 0,
    featured: Boolean(body.featured),
    justIn: Boolean(body.justIn),
    sizes: asList(body.sizes),
    colors: asList(body.colors),
    tags: asList(body.tags),
    sku: String(body.sku || '').trim(),
  };
}

function assertProduct(data) {
  if (data.name.length < 2) throw new AppError('Product name is required.');
  if (!data.category) throw new AppError('Category is required.');
  if (!data.brand) throw new AppError('Brand is required.');
  if (!Number.isFinite(data.price) || data.price <= 0) throw new AppError('Price must be greater than 0.');
}

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [orders, productCount, customerCount, lowStock, recentUsers] = await Promise.all([
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.find({ stock: { $lte: 8 } }).sort({ stock: 1 }).limit(6),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
    ]);

    const active = orders.filter((order) => order.status !== 'Cancelled');
    const revenue = active.reduce((sum, order) => sum + order.total, 0);
    const byStatus = {};
    for (const order of orders) byStatus[order.status] = (byStatus[order.status] || 0) + 1;

    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      const total = active
        .filter((order) => order.createdAt >= start && order.createdAt < end)
        .reduce((sum, order) => sum + order.total, 0);
      days.push({
        label: start.toLocaleDateString('en-IN', { weekday: 'short' }),
        total,
      });
    }

    const units = {};
    for (const order of active) {
      for (const item of order.items) units[item.name] = (units[item.name] || 0) + item.qty;
    }
    const top = Object.entries(units)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    res.json({
      revenue,
      orders: orders.length,
      products: productCount,
      customers: customerCount,
      aov: active.length ? Math.round(revenue / active.length) : 0,
      byStatus,
      days,
      top,
      lowStock,
      recentOrders: orders.slice(0, 7),
      recentUsers,
    });
  })
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const items = await Product.find().sort({ createdAt: -1 });
    res.json({ items });
  })
);

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found.', 404);
    res.json({ product });
  })
);

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const data = payload(req.body, await uniqueSlug(req.body.name));
    assertProduct(data);
    const product = await Product.create(data);
    res.status(201).json({ product });
  })
);

router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const existing = await Product.findById(req.params.id);
    if (!existing) throw new AppError('Product not found.', 404);
    const slug =
      req.body.name && req.body.name !== existing.name
        ? await uniqueSlug(req.body.name, existing._id)
        : existing.slug;
    const data = payload(req.body, slug);
    assertProduct(data);
    const product = await Product.findByIdAndUpdate(existing._id, data, { new: true });
    res.json({ product });
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found.', 404);
    await Review.deleteMany({ product: product._id });
    await User.updateMany({}, { $pull: { wishlist: product._id } });
    await product.deleteOne();
    res.json({ message: 'Product removed.' });
  })
);

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  })
);

router.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const status = req.body.status;
    const allowed = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) throw new AppError('Unknown order status.');

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);

    const wasCancelled = order.status === 'Cancelled';
    if (status === 'Cancelled' && !wasCancelled) {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } });
      }
    }
    order.status = status;
    if (status === 'Delivered') order.deliveredAt = order.deliveredAt || new Date();
    await order.save();
    const fresh = await Order.findById(order._id).populate('user', 'name email');
    res.json({ order: fresh });
  })
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  })
);

export default router;
