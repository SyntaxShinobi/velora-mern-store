import jwt from 'jsonwebtoken';
import { User } from './models.js';

const SECRET = () => process.env.JWT_SECRET || 'velora-demo-secret-change-before-deploy';

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, SECRET(), { expiresIn: '7d' });
}

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next(new AppError('Please sign in to continue.', 401));
    const decoded = jwt.verify(token, SECRET());
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new AppError('Account not found.', 401));
    req.user = user;
    next();
  } catch {
    next(new AppError('Session expired. Please sign in again.', 401));
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return next(new AppError('Admin access only.', 403));
  next();
}

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(400).json({ message: `That ${field} is already in use.` });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? 'Something went wrong on our side.' : err.message,
  });
}
