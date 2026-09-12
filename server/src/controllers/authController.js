import { authService } from '../services/authService.js';
import { config } from '../config/env.js';

const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  maxAge: config.sessionAbsoluteTimeoutDays * 24 * 60 * 60 * 1000,
  path: '/'
});

/**
 * Register a new user account and establish session
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const { user, rawToken } = await authService.register({ email, password, name });

    res.cookie(config.sessionCookieName, rawToken, getSessionCookieOptions());

    return res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate existing user and issue new rotated session
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, rawToken } = await authService.login({ email, password });

    res.cookie(config.sessionCookieName, rawToken, getSessionCookieOptions());

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke current session and clear cookie
 */
export async function logout(req, res, next) {
  try {
    const rawToken = req.cookies?.[config.sessionCookieName];
    if (rawToken) {
      await authService.logout(rawToken);
    }

    res.clearCookie(config.sessionCookieName, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get currently authenticated user status
 */
export async function getMe(req, res) {
  if (req.user && req.user.id) {
    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: req.user
    });
  }

  return res.status(200).json({
    success: true,
    isAuthenticated: false,
    user: null
  });
}
