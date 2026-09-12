import axios from 'axios';

/**
 * Centralized Axios client targeting our Node.js backend.
 * Uses relative URL '/api' which Vite proxies to http://localhost:5000 in dev.
 * withCredentials: true ensures HttpOnly session cookies are transmitted securely.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for consistent client error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message =
      error.response?.data?.error?.message ||
      error.response?.data?.message;

    if (!message) {
      if (error.response?.status === 401) {
        message = 'Please sign in to continue.';
      } else if (error.response?.status === 503) {
        message = 'Movie information is temporarily unavailable. Please try again shortly.';
      } else if (error.response?.status === 429) {
        message = 'Too many requests right now. Please try again in a moment.';
      } else {
        message = 'Unable to connect. Please check your internet connection and try again.';
      }
    }

    const customError = new Error(message);
    customError.statusCode = error.response?.status || 500;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);
