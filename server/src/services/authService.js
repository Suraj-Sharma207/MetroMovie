import prisma from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { sessionService } from './sessionService.js';

// RFC 5322 compliant basic email validator regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthService {
  /**
   * Register a new user with normalized email, name, Argon2id password hash, and new session.
   */
  async register({ email, password, name }) {
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      const error = new Error('Please provide a valid email address.');
      error.statusCode = 400;
      throw error;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      const error = new Error('Password must be at least 8 characters long.');
      error.statusCode = 400;
      throw error;
    }

    if (password.length > 128) {
      const error = new Error('Password must not exceed 128 characters.');
      error.statusCode = 400;
      throw error;
    }

    const cleanName = name && typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
    if (cleanName && cleanName.length > 70) {
      const error = new Error('Name must not exceed 70 characters.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(password);

    // Persist user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: cleanName,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Create session (Session rotation)
    const { rawToken, session } = await sessionService.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      rawToken,
      session
    };
  }

  /**
   * Authenticate user, verify Argon2id hash, and create rotated session.
   * Employs generic error responses to prevent account enumeration.
   */
  async login({ email, password }) {
    const genericAuthError = new Error('Invalid email or password.');
    genericAuthError.statusCode = 401;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw genericAuthError;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Avoid timing attack by running a dummy verify or return immediately
      throw genericAuthError;
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      throw genericAuthError;
    }

    // Create brand-new session on login (prevents session fixation)
    const { rawToken, session } = await sessionService.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      rawToken,
      session
    };
  }

  /**
   * Revoke session on logout
   */
  async logout(rawToken) {
    if (!rawToken) return true;
    return await sessionService.revokeSession(rawToken);
  }
}

export const authService = new AuthService();
