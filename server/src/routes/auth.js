import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Product, Subscriber, User } from '../models.js';
import { AppError, asyncHandler, protect, signToken } from '../middleware.js';
import { publicUser } from '../models.js';

const router = Router();

const wishlistFields = 'name price images slug stock category';

async function loadUser(id) {
  return User.findById(id).select('-password').populate('wishlist', wishlistFields);
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2) throw new AppError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Enter a valid email address.');
    if (password.length < 6) throw new AppError('Password must be at least 6 characters.');

    const exists = await User.findOne({ email });
    if (exists) throw new AppError('An account with that email already exists.');

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'customer',
    });

    const fresh = await loadUser(user._id);
    res.status(201).json({ token: signToken(fresh), user: publicUser(fresh) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Email or password is incorrect.', 401);
    }
    const fresh = await loadUser(user._id);
    res.json({ token: signToken(fresh), user: publicUser(fresh) });
  })
);

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await loadUser(req.user._id);
    res.json({ user: publicUser(user) });
  })
);

router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = String(req.body.name).trim();
    if (req.body.phone !== undefined) user.phone = String(req.body.phone).trim();
    if (req.body.password) {
      if (String(req.body.password).length < 6) throw new AppError('Password must be at least 6 characters.');
      user.password = await bcrypt.hash(String(req.body.password), 10);
    }
    if (req.body.address) {
      const a = req.body.address;
      const address = {
        fullName: String(a.fullName || user.name).trim(),
        phone: String(a.phone || '').trim(),
        line1: String(a.line1 || '').trim(),
        line2: String(a.line2 || '').trim(),
        city: String(a.city || '').trim(),
        state: String(a.state || '').trim(),
        postalCode: String(a.postalCode || '').trim(),
      };
      if (!address.line1 || !address.city || !address.postalCode) {
        throw new AppError('Address needs a street, city, and PIN code.');
      }
      user.addresses = [address, ...user.addresses.filter((item) => item.line1 !== address.line1)].slice(0, 3);
    }
    await user.save();
    const fresh = await loadUser(user._id);
    res.json({ user: publicUser(fresh) });
  })
);

router.post(
  '/wishlist/:productId',
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);
    if (!product) throw new AppError('Product not found.', 404);
    const user = await User.findById(req.user._id);
    const id = product._id.toString();
    const has = user.wishlist.some((item) => item.toString() === id);
    user.wishlist = has ? user.wishlist.filter((item) => item.toString() !== id) : [...user.wishlist, product._id];
    await user.save();
    const fresh = await loadUser(user._id);
    res.json({ user: publicUser(fresh), added: !has });
  })
);

router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Enter a valid email address.');
    await Subscriber.updateOne({ email }, { email }, { upsert: true });
    res.json({ message: 'You are on the list. This demo does not send mail.' });
  })
);

export default router;
