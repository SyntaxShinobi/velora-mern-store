import { Coupon, Product } from './models.js';
import { AppError } from './middleware.js';

export const FREE_SHIPPING_OVER = 2999;
export const SHIPPING_FEE = 99;

export async function resolveItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError('Your bag is empty.');
  }

  const resolved = [];
  for (const line of rawItems) {
    const product = await Product.findById(line.product);
    if (!product) throw new AppError('A product in your bag is no longer available.');

    const qty = Number(line.qty) || 1;
    if (qty < 1) throw new AppError('Quantity must be at least 1.');
    if (qty > product.stock) {
      throw new AppError(
        product.stock === 0
          ? `${product.name} is sold out.`
          : `${product.name} has only ${product.stock} left in stock.`
      );
    }
    if (product.sizes?.length && line.size && !product.sizes.includes(line.size)) {
      throw new AppError(`${line.size} is not a valid size for ${product.name}.`);
    }
    if (product.colors?.length && line.color && !product.colors.includes(line.color)) {
      throw new AppError(`${line.color} is not available for ${product.name}.`);
    }

    resolved.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      qty,
      size: line.size || '',
      color: line.color || '',
    });
  }
  return resolved;
}

export async function priceOrder(items, couponCode) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let coupon = null;
  let discount = 0;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase(), active: true });
    if (!coupon) throw new AppError('That coupon code is not valid.');
    if (subtotal < coupon.minSubtotal) {
      throw new AppError(`Add ₹${coupon.minSubtotal - subtotal} more to use ${coupon.code}.`);
    }
    discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);
  }

  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  return {
    subtotal,
    discount,
    shipping,
    total,
    coupon: coupon
      ? { code: coupon.code, label: coupon.label || `${coupon.value}% off` }
      : null,
  };
}
