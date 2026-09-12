import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Authentication Endpoints (Login & Register)
 * Limits brute-force credential stuffing attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 attempts per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});
