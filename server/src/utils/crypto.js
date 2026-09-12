import crypto from 'node:crypto';
import argon2 from 'argon2';

/**
 * Generate a cryptographically secure random session identifier.
 * Uses 32 random bytes (256 bits of entropy) resulting in a 64-character hex string.
 * Never uses Math.random().
 */
export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Compute SHA-256 hash of a raw session token.
 * Only this hash is persisted in PostgreSQL to protect active sessions at rest.
 */
export const hashSessionToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error('Invalid session token provided for hashing.');
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Hash plaintext password using Argon2id.
 * Argon2id is the memory-hard winner of the Password Hashing Competition.
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Valid password string is required.');
  }
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,       // 3 iterations
    parallelism: 4
  });
};

/**
 * Verify a candidate password against an Argon2id hash.
 * Returns true if match, false otherwise.
 * Never throws on mismatch.
 */
export const verifyPassword = async (hash, password) => {
  if (!hash || !password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
};
