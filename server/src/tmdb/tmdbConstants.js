export const TMDB_BASE_URL = 'https://api.tmdb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const IMAGE_SIZES = {
  POSTER_THUMB: 'w342',
  POSTER_MEDIUM: 'w500',
  POSTER_ORIGINAL: 'original',
  BACKDROP_MEDIUM: 'w780',
  BACKDROP_LARGE: 'w1280',
  PROFILE: 'w185',
  LOGO: 'w154'
};

export const CACHE_TTLS = {
  GENRES: 24 * 60 * 60,       // 24 hours
  DETAILS: 6 * 60 * 60,       // 6 hours
  DISCOVER: 10 * 60,          // 10 minutes
  SEARCH: 10 * 60,            // 10 minutes
  TRENDING: 10 * 60,          // 10 minutes
  WATCH_PROVIDERS: 10 * 60    // 10 minutes
};

export const SUPPORTED_WATCH_REGIONS = ['IN', 'US', 'GB', 'CA', 'AU'];
export const DEFAULT_WATCH_REGION = 'IN';

export const getImageUrl = (path, size = IMAGE_SIZES.POSTER_MEDIUM) => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
