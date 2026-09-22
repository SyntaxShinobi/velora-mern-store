import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, default: '' },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    details: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    justIn: { type: Boolean, default: false },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    tags: [{ type: String }],
    sku: { type: String, default: '' },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    qty: Number,
    size: String,
    color: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    shippingAddress: addressSchema,
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'COD'], required: true },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: Number,
    couponCode: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    status: {
      type: String,
      enum: ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  value: { type: Number, required: true },
  minSubtotal: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  label: { type: String, default: '' },
});

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Review = mongoose.model('Review', reviewSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Coupon = mongoose.model('Coupon', couponSchema);
export const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export function publicUser(user) {
  if (!user) return null;
  const obj = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    id: obj._id,
    name: obj.name,
    email: obj.email,
    role: obj.role,
    phone: obj.phone || '',
    addresses: obj.addresses || [],
    wishlist: (obj.wishlist || []).map((item) => {
      if (item && typeof item === 'object' && item.name) {
        return {
          id: item._id,
          name: item.name,
          price: item.price,
          images: item.images || [],
          slug: item.slug,
          stock: item.stock,
          category: item.category,
        };
      }
      return item;
    }),
  };
}
