import { tmdbClient } from '../tmdb/tmdbClient.js';
import { cacheService } from './cacheService.js';
import { CACHE_TTLS, DEFAULT_WATCH_REGION } from '../tmdb/tmdbConstants.js';
import {
  normalizeMovieSummary,
  normalizePaginatedMovies,
  normalizeMovieDetails,
  normalizeWatchProviders
} from '../tmdb/tmdbNormalizer.js';

class MovieService {
  /**
   * Fetch official movie genres list with 24h caching
   */
  async getGenres() {
    const cacheKey = 'tmdb:genres';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const response = await tmdbClient.get('/genre/movie/list', {
      params: { language: 'en-US' }
    });

    const genres = response.data?.genres || [];
    cacheService.set(cacheKey, genres, CACHE_TTLS.GENRES);
    return genres;
  }

  /**
   * Helper to get a fast genre ID -> Name mapping
   */
  async getGenreMap() {
    const genres = await this.getGenres();
    return genres.reduce((acc, g) => {
      acc[g.id] = g.name;
      return acc;
    }, {});
  }

  /**
   * Fetch daily trending movies for hero spotlight (supports regional or global)
   */
  async getTrendingMovies(region = 'GLOBAL') {
    const cleanRegion = (region || 'GLOBAL').toUpperCase();
    const cacheKey = `tmdb:trending:${cleanRegion}:day`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const genreMap = await this.getGenreMap();
    let movies = [];

    if (cleanRegion !== 'GLOBAL') {
      // Fetch trending in the specified region via discover
      const response = await tmdbClient.get('/discover/movie', {
        params: {
          region: cleanRegion,
          watch_region: cleanRegion,
          sort_by: 'popularity.desc',
          include_adult: false,
          'vote_count.gte': 10
        }
      });
      movies = (response.data?.results || [])
        .slice(0, 10)
        .map(m => normalizeMovieSummary(m, genreMap));
    } else {
      const response = await tmdbClient.get('/trending/movie/day');
      movies = (response.data?.results || [])
        .slice(0, 10)
        .map(m => normalizeMovieSummary(m, genreMap));
    }

    cacheService.set(cacheKey, movies, CACHE_TTLS.TRENDING);
    return movies;
  }

  /**
   * Discover movies with filters, sorting, and pagination
   */
  async discoverMovies({
    page = 1,
    sortBy = 'popularity.desc',
    genre,
    year,
    minRating,
    region
  } = {}) {
    const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
    const cleanRegion = region && region !== 'GLOBAL' ? region.toUpperCase() : undefined;
    const cacheKey = `tmdb:discover:${sanitizedPage}:${sortBy}:${genre || 'all'}:${year || 'all'}:${minRating || 'all'}:${cleanRegion || 'all'}`;

    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const params = {
      page: sanitizedPage,
      sort_by: sortBy,
      include_adult: false,
      'vote_count.gte': 50 // Avoid obscure noise with 1-2 votes
    };

    if (cleanRegion) {
      params.region = cleanRegion;
      params.watch_region = cleanRegion;
    }
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    if (minRating) params['vote_average.gte'] = minRating;

    const genreMap = await this.getGenreMap();
    const response = await tmdbClient.get('/discover/movie', { params });

    const normalized = normalizePaginatedMovies(response.data, genreMap);
    cacheService.set(cacheKey, normalized, CACHE_TTLS.DISCOVER);
    return normalized;
  }

  /**
   * Search movies by title with debounced query caching
   */
  async searchMovies(query, page = 1) {
    if (!query || !query.trim()) {
      return {
        page: 1,
        totalPages: 0,
        totalResults: 0,
        results: []
      };
    }

    const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
    const trimmedQuery = query.trim().toLowerCase();
    const cacheKey = `tmdb:search:${trimmedQuery}:${sanitizedPage}`;

    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const genreMap = await this.getGenreMap();
    const response = await tmdbClient.get('/search/movie', {
      params: {
        query: trimmedQuery,
        page: sanitizedPage,
        include_adult: false
      }
    });

    const normalized = normalizePaginatedMovies(response.data, genreMap);
    cacheService.set(cacheKey, normalized, CACHE_TTLS.SEARCH);
    return normalized;
  }

  /**
   * Fetch full composite movie details (details, credits, videos, recommendations, similar, watch providers)
   */
  async getMovieDetails(movieId, country = DEFAULT_WATCH_REGION) {
    const id = parseInt(movieId, 10);
    if (!id || isNaN(id)) {
      const error = new Error('Invalid movie ID. Must be a valid number.');
      error.statusCode = 400;
      throw error;
    }

    const cacheKey = `tmdb:movie:${id}:${country.toUpperCase()}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    // Single roundtrip composite request using append_to_response
    const response = await tmdbClient.get(`/movie/${id}`, {
      params: {
        append_to_response: 'credits,videos,recommendations,similar,watch/providers'
      }
    });

    const normalized = normalizeMovieDetails(response.data, country);
    cacheService.set(cacheKey, normalized, CACHE_TTLS.DETAILS);
    return normalized;
  }

  /**
   * Fetch watch providers dynamically for country switcher
   */
  async getWatchProviders(movieId, country = DEFAULT_WATCH_REGION) {
    const id = parseInt(movieId, 10);
    if (!id || isNaN(id)) {
      const error = new Error('Invalid movie ID');
      error.statusCode = 400;
      throw error;
    }

    const countryCode = (country || DEFAULT_WATCH_REGION).toUpperCase();
    const cacheKey = `tmdb:providers:${id}:${countryCode}`;

    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const response = await tmdbClient.get(`/movie/${id}/watch/providers`);
    const normalized = normalizeWatchProviders(response.data, countryCode);

    cacheService.set(cacheKey, normalized, CACHE_TTLS.WATCH_PROVIDERS);
    return normalized;
  }
}

export const movieService = new MovieService();
