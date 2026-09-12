import { apiClient } from './apiClient.js';

export const authApi = {
  /**
   * Check current session status.
   * Returns { success: true, isAuthenticated: boolean, user: { id, email } | null }
   */
  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  /**
   * Log in with email and password.
   * The server sets the HttpOnly session cookie.
   */
  async login({ email, password }) {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  /**
   * Register a new user account.
   * The server sets the HttpOnly session cookie.
   */
  async register({ email, password, name }) {
    const res = await apiClient.post('/auth/register', { email, password, name });
    return res.data;
  },

  /**
   * Log out current session.
   * Clears the server session and HttpOnly cookie.
   */
  async logout() {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};
