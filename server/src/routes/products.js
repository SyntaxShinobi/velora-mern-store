import { Router } from 'express';
import { Order, Product, Review } from '../models.js';
import { AppError, asyncHandler, protect } from '../middleware.js';

const router = Router();

router.get(
  '/meta',
  asyncHandler(async (req, res) => {
    const products = await Product.find({}, 'category brand price');
    const categories = {};
    const brands = {};
    let min = Infinity;
    let max = 0;
    for (const product of products) {
      categories[product.category] = (categories[product.category] || 0) + 1;
      brands[product.brand] = (brands[product.brand] || 0) + 1;
      min = Math.min(min, product.price);
      max = Math.max(max, product.price);
    }
    res.json({
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      brands: Object.keys(brands).sort(),
      price: { min: min === Infinity ? 0 : min, max },
    });
  })
);

router.get(
  '/featured',
  asyncHandler(async (req, res) => {
    const items = await Product.find({ featured: true }).limit(8);
    res.json({ items });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, brand, sort = 'newest', min, max, rating, page = 1, limit = 9, featured } = req.query;
    const filter = {};

    if (q) {
      const escaped = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(escaped, 'i');
      filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { tags: rx }, { description: rx }];
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (featured === 'true') filter.featured = true;
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }
    if (rating) filter.rating = { $gte: Number(rating) };

    const sortMap = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      popular: { numReviews: -1 },
    };

    const lim = Math.min(Math.max(Number(limit) || 9, 1), 24);
    const pg = Math.max(Number(page) || 1, 1);
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pg - 1) * lim)
        .limit(lim),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page: pg, pages: Math.max(Math.ceil(total / lim), 1) });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) throw new AppError('Product not found.', 404);
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(12);
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.json({ product, reviews, related });
  })
);

router.post(
  '/:id/reviews',
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found.', 404);

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    if (!rating || rating < 1 || rating > 5) throw new AppError('Choose a rating from 1 to 5.');
    if (comment.length < 8) throw new AppError('Write a short note — at least a sentence.');

    const bought = await Order.findOne({
      user: req.user._id,
      status: { $ne: 'Cancelled' },
      'items.product': product._id,
    });
    if (!bought) {
      throw new AppError('Reviews are limited to customers who ordered this item.', 403);
    }

    const existing = await Review.findOne({ user: req.user._id, product: product._id });
    if (existing) throw new AppError('You have already reviewed this piece.');

    await Review.create({
      user: req.user._id,
      name: req.user.name,
      product: product._id,
      rating,
      comment,
    });

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    product.rating = Math.round((stats[0]?.avg || 0) * 10) / 10;
    product.numReviews = stats[0]?.count || 0;
    await product.save();

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(12);
    res.status(201).json({ product, reviews });
  })
);

export default router;
