// Defensive Security Middleware: HTTP Security Headers, Rate Limiting (Anti-DDoS / Anti-Brute-Force), URL Validation, and Safe Logging

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

/**
 * Lightweight in-memory sliding-window IP Rate Limiter
 * Uses req.ip / req.socket.remoteAddress directly (never trusts raw unverified X-Forwarded-For headers)
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Too many requests from this IP, please try again later.'
} = {}) {
  const hits = new Map();

  // Periodic cleanup of expired windows so memory cannot grow unbounded
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now > entry.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.max(30000, windowMs));

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';

    const now = Date.now();
    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSecs = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    if (record.count > max) {
      res.setHeader('Retry-After', String(retryAfterSecs));
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: retryAfterSecs
      });
    }

    next();
  };
}

// Pre-configured limiters for specific threat models
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: 'Rate limit exceeded. Please wait a moment before making more requests.'
});

export const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  message: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
});

export const bookingWriteLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: 'Too many submissions from this connection. Please wait a minute and try again.'
});

export const promoValidateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 25,
  message: 'Too many code lookups. Please wait a few minutes before trying again.'
});

/**
 * Redact any sensitive query parameters from URLs before logging
 */
export function redactUrlForLogging(url = '') {
  return String(url).replace(
    /([?&](?:token|adminToken|password|secret|key|auth)=)[^&]+/gi,
    '$1[REDACTED]'
  );
}

/**
 * Validate media/image URLs to block javascript:, data:text/html, or other unsafe schemes
 */
export function isSafeMediaUrl(url) {
  if (url === null || url === undefined || url === '') return true;
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  // Allow data:image URLs up to 15MB for direct previews or uploads
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(trimmed)) {
    return trimmed.length <= 15 * 1024 * 1024;
  }
  // Standard hosted URLs and local relative paths up to 2048 characters
  if (trimmed.length > 2048) return false;
  if (trimmed.startsWith('/')) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return false;
}

/**
 * Mask PII (email and phone) for unauthenticated public lookup responses
 */
export function maskEmail(email = '') {
  const str = String(email).trim();
  const [user, domain] = str.split('@');
  if (!user || !domain) return '***';
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function maskPhone(phone = '') {
  const str = String(phone).trim();
  if (str.length <= 4) return '****';
  return `*** *** ${str.slice(-4)}`;
}
