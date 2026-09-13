import dotenv from 'dotenv';
dotenv.config();

const clean = (val) => (val ? val.replace(/^["']|["']$/g, '').trim() : '');

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  tmdbAccessToken: clean(process.env.TMDB_ACCESS_TOKEN),
  tmdbApiKey: clean(process.env.TMDB_API_KEY),
  databaseUrl: clean(process.env.DATABASE_URL),
  clientUrl: clean(process.env.CLIENT_URL) || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Authentication & Session Configuration
  sessionCookieName: clean(process.env.SESSION_COOKIE_NAME) || 'moviesmetro_session',
  sessionIdleTimeoutMinutes: parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES, 10) || 30,
  sessionAbsoluteTimeoutDays: parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_DAYS, 10) || 7,
  sessionActivityRefreshMinutes: parseInt(process.env.SESSION_ACTIVITY_REFRESH_MINUTES, 10) || 5
};
