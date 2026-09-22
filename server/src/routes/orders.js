import { Router } from 'express';
import { Order, Product } from '../models.js';
import { AppError, asyncHandler, protect } from '../middleware.js';
import { priceOrder, resolveItems } from '../pricing.js';

const router = Router();

function orderNumber() {
  return `VEL-${Math.floor(100000 + Math.random() * 900000)}`;
}

function cleanAddress(input = {}) {
  const address = {
    fullName: String(input.fullName || '').trim(),
    phone: String(input.phone || '').trim(),
    line1: String(input.line1 || '').trim(),
    line2: String(input.line2 || '').trim(),
    city: String(input.city || '').trim(),
    state: String(input.state || '').trim(),
    postalCode: String(input.postalCode || '').trim(),
  };
  if (address.fullName.length < 2) throw new AppError('Enter the recipient name.');
  if (!/^[6-9]\d{9}$/.test(address.phone)) throw new AppError('Enter a 10-digit Indian mobile number.');
  if (address.line1.length < 4) throw new AppError('Enter a street address.');
  if (address.city.length < 2) throw new AppError('Enter a city.');
  if (!address.state) throw new AppError('Choose a state.');
  if (!/^\d{6}$/.test(address.postalCode)) throw new AppError('Enter a 6-digit PIN code.');
  return address;
}

router.post(
  '/quote',
  asyncHandler(async (req, res) => {
    const items = await resolveItems(req.body.items);
    const pricing = await priceOrder(items, req.body.couponCode);
    res.json({ items, pricing });
  })
);

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const items = await resolveItems(req.body.items);
    const pricing = await priceOrder(items, req.body.couponCode);
    const address = cleanAddress(req.body.shippingAddress);
    const paymentMethod = req.body.paymentMethod;
    if (!['UPI', 'Card', 'COD'].includes(paymentMethod)) {
      throw new AppError('Choose UPI, card, or cash on delivery.');
    }

    const isPaid = paymentMethod !== 'COD';
    const order = await Order.create({
      user: req.user._id,
      orderNumber: orderNumber(),
      items,
      shippingAddress: address,
      paymentMethod,
      ...pricing,
      couponCode: pricing.coupon?.code || '',
      isPaid,
      paidAt: isPaid ? new Date() : null,
      status: 'Placed',
    });

    for (const item of items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.qty } });
    }

    res.status(201).json({ order });
  })
);

router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  })
);

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);
    const owns = order.user.toString() === req.user._id.toString();
    if (!owns && req.user.role !== 'admin') throw new AppError('Order not found.', 404);
    res.json({ order });
  })
);

router.put(
  '/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      throw new AppError('Order not found.', 404);
    }
    if (!['Placed', 'Packed'].includes(order.status)) {
      throw new AppError('This order has already left the studio and cannot be cancelled.');
    }
    order.status = 'Cancelled';
    await order.save();
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } });
    }
    res.json({ order });
  })
);

export default router;
