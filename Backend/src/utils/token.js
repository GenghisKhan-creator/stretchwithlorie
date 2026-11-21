import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SECRET environment variable must be configured with at least 16 characters.');
  }
  return secret;
}

/**
 * Constant-time string comparison using SHA-256 digests to prevent timing side-channel attacks
 */
export function safeCompareStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const secret = getAdminSecret();
  const hashA = crypto.createHmac('sha256', secret).update(a).digest();
  const hashB = crypto.createHmac('sha256', secret).update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB) && a.length === b.length;
}

/**
 * Generate a cryptographically signed HMAC token for admin sessions
 */
export function createAdminToken(role = 'admin', expiresInDays = 7) {
  const secret = getAdminSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    role,
    name: 'Lorie',
    iat: Date.now(),
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify signed HMAC admin token in constant time
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || token.length > 1024) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    const secret = getAdminSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (!safeCompareStrings(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
