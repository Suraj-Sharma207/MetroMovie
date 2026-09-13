import axios from 'axios';
import { config } from '../config/env.js';
import { TMDB_BASE_URL } from './tmdbConstants.js';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MoviesMetro/1.0',
};

// Use Bearer token authorization if available
if (config.tmdbAccessToken) {
  headers['Authorization'] = `Bearer ${config.tmdbAccessToken}`;
}

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
  headers,
});

// Fallback to query param api_key ONLY if Bearer token is not present
tmdbClient.interceptors.request.use((reqConfig) => {
  if (!config.tmdbAccessToken && config.tmdbApiKey) {
    reqConfig.params = {
      ...reqConfig.params,
      api_key: config.tmdbApiKey,
    };
  }
  return reqConfig;
});

// Response interceptor to handle errors gracefully
tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let statusCode = 500;
    let message = 'An error occurred while contacting the movie service.';

    if (error.response) {
      statusCode = error.response.status;
      const tmdbMsg = error.response.data?.status_message;

      if (statusCode === 401) {
        message = 'Invalid or missing TMDB API credentials. Please verify your TMDB_ACCESS_TOKEN or TMDB_API_KEY.';
      } else if (statusCode === 404) {
        message = 'The requested movie or resource was not found on TMDB.';
      } else if (statusCode === 429) {
        message = 'TMDB API rate limit exceeded. Please try again shortly.';
      } else if (tmdbMsg) {
        message = tmdbMsg;
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      statusCode = 504;
      message = 'Request to TMDB timed out.';
    } else if (error.request) {
      statusCode = 503;
      message = 'Unable to reach TMDB API. Network or connection failure.';
    }

    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.originalError = error.message;

    return Promise.reject(customError);
  }
);
