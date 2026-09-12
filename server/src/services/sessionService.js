import prisma from '../lib/prisma.js';
import { generateSessionToken, hashSessionToken } from '../utils/crypto.js';
import { config } from '../config/env.js';

class SessionService {
  /**
   * Create a new authenticated session in PostgreSQL.
   * Generates a raw token for the HttpOnly cookie, but stores only the SHA-256 hash.
   */
  async createSession(userId) {
    if (!userId) throw new Error('User ID is required to create a session.');

    const rawToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(rawToken);

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + config.sessionAbsoluteTimeoutDays * 24 * 60 * 60 * 1000
    );

    const session = await prisma.session.create({
      data: {
        userId,
        sessionTokenHash,
        expiresAt,
        lastActivityAt: now
      }
    });

    return { rawToken, session };
  }

  /**
   * Validate session token from incoming HttpOnly cookie.
   * Enforces both absolute timeout (7 days) and idle timeout (30 minutes).
   * Throttles lastActivityAt writes so database writes only occur if > 5 minutes have elapsed.
   */
  async validateSession(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') return null;

    let tokenHash;
    try {
      tokenHash = hashSessionToken(rawToken);
    } catch {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: tokenHash },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    if (!session || session.revokedAt || !session.user) {
      return null;
    }

    const now = new Date();

    // 1. Check Absolute Expiration
    if (now > session.expiresAt) {
      await this.revokeById(session.id);
      return null;
    }

    // 2. Check Idle Timeout (Inactivity)
    const idleMs = now.getTime() - new Date(session.lastActivityAt).getTime();
    const maxIdleMs = config.sessionIdleTimeoutMinutes * 60 * 1000;

    if (idleMs > maxIdleMs) {
      await this.revokeById(session.id);
      return null;
    }

    // 3. Database Write Optimization:
    // Only update lastActivityAt if more than sessionActivityRefreshMinutes (default: 5 min) has passed
    const refreshThresholdMs = config.sessionActivityRefreshMinutes * 60 * 1000;
    if (idleMs >= refreshThresholdMs) {
      prisma.session.update({
        where: { id: session.id },
        data: { lastActivityAt: now }
      }).catch(err => {
        console.warn('[Session Service] Non-critical background lastActivityAt update error:', err.message);
      });
    }

    return {
      user: session.user,
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt
      }
    };
  }

  /**
   * Revoke/delete a session by raw token (e.g. during logout)
   */
  async revokeSession(rawToken) {
    if (!rawToken) return false;
    try {
      const tokenHash = hashSessionToken(rawToken);
      await prisma.session.delete({
        where: { sessionTokenHash: tokenHash }
      });
      return true;
    } catch (err) {
      // Session may already be deleted or invalid
      return false;
    }
  }

  /**
   * Revoke by session ID helper
   */
  async revokeById(sessionId) {
    try {
      await prisma.session.delete({
        where: { id: sessionId }
      });
    } catch (_) {}
  }

  /**
   * Purge expired or long-idle sessions from PostgreSQL
   */
  async cleanupExpiredSessions() {
    const now = new Date();
    const idleCutoff = new Date(now.getTime() - config.sessionIdleTimeoutMinutes * 60 * 1000);

    try {
      const deleted = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { lastActivityAt: { lt: idleCutoff } },
            { revokedAt: { not: null } }
          ]
        }
      });
      return deleted.count;
    } catch (err) {
      console.warn('[Session Cleanup Error]:', err.message);
      return 0;
    }
  }
}

export const sessionService = new SessionService();
