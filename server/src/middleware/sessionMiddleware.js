import { config } from '../config/env.js';
import { sessionService } from '../services/sessionService.js';

/**
 * Universal Session Middleware
 * Extracts the HttpOnly session cookie, validates the session against PostgreSQL,
 * and attaches req.user ({ id, email }) and req.session if valid.
 * 
 * If no session or session is expired/revoked, it sets req.user = null, req.session = null
 * and gracefully calls next() so public/guest endpoints can still function seamlessly.
 */
export async function sessionMiddleware(req, res, next) {
  req.user = null;
  req.session = null;

  try {
    const rawToken = req.cookies?.[config.sessionCookieName];

    if (!rawToken) {
      return next();
    }

    const sessionData = await sessionService.validateSession(rawToken);

    if (sessionData && sessionData.user) {
      req.user = sessionData.user;
      req.session = sessionData.session;
    } else {
      // Clear invalid/expired cookie from browser
      res.clearCookie(config.sessionCookieName, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        path: '/'
      });
    }
  } catch (err) {
    console.error('[Session Middleware Error]:', err.message);
  }

  next();
}
