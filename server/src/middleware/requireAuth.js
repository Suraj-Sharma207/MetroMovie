/**
 * Authorization Guard Middleware
 * Restricts access to authenticated users only.
 * Must be preceded by sessionMiddleware.
 */
export function requireAuth(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required. Please log in to continue.',
        code: 'UNAUTHORIZED'
      }
    });
  }
  next();
}
