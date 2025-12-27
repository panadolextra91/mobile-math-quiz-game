import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.ip || 'unknown';
  const now = Date.now();

  // Clean up old entries
  Object.keys(store).forEach((k) => {
    if (store[k].resetTime < now) {
      delete store[k];
    }
  });

  // Check or create rate limit entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    return next();
  }

  // Increment count
  store[key].count++;

  // Check if limit exceeded
  if (store[key].count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
    });
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - store[key].count);
  res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

  next();
};

