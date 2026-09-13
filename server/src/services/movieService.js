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
    const cacheKey = 'tmdb:genres:all';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const [movieRes, tvRes] = await Promise.all([
        tmdbClient.get('/genre/movie/list', { params: { language: 'en-US' } }),
        tmdbClient.get('/genre/tv/list', { params: { language: 'en-US' } })
      ]);

      const movieGenres = movieRes.data?.genres || [];
      const tvGenres = tvRes.data?.genres || [];

      // Merge unique genres
      const genreMap = new Map();
      movieGenres.forEach(g => genreMap.set(g.id, g));
      tvGenres.forEach(g => genreMap.set(g.id, g));
      const genres = Array.from(genreMap.values());

      cacheService.set(cacheKey, genres, CACHE_TTLS.GENRES);
      return genres;
    } catch {
      const response = await tmdbClient.get('/genre/movie/list', {
        params: { language: 'en-US' }
      });
      const genres = response.data?.genres || [];
      cacheService.set(cacheKey, genres, CACHE_TTLS.GENRES);
      return genres;
    }
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
      // Fetch trending in the specified region via discover with origin country
      const response = await tmdbClient.get('/discover/movie', {
        params: {
          sort_by: 'popularity.desc',
          with_origin_country: cleanRegion,
          include_adult: false,
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
   * Discover movies or TV web series with filters, sorting, and pagination
   */
  async discoverMovies({
    page = 1,
    sortBy = 'popularity.desc',
    genre,
    year,
    minRating,
    region,
    type = 'movie'
  } = {}) {
    const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
    const cleanRegion = region && region !== 'GLOBAL' ? region.toUpperCase() : undefined;
    const isTv = type === 'tv' || type === 'shows';
    const cacheKey = `tmdb:discover:${isTv ? 'tv' : 'movie'}:${sanitizedPage}:${sortBy}:${genre || 'all'}:${year || 'all'}:${minRating || 'all'}:${cleanRegion || 'all'}`;

    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const endpoint = isTv ? '/discover/tv' : '/discover/movie';
    const params = {
      page: sanitizedPage,
      sort_by: sortBy,
      include_adult: false,
    };

    if (isTv) {
      if (sortBy && sortBy.startsWith('primary_release_date')) {
        params.sort_by = sortBy.replace('primary_release_date', 'first_air_date');
      }
      if (cleanRegion === 'IN') {
        params.with_origin_country = 'IN';
        params.with_networks = '1024|213|2646|3919|2590|2806|4909|2595|2026|3758';
        params.without_genres = '10766,10764,10767,10763';
        params['vote_count.gte'] = 10;
      } else if (cleanRegion) {
        params.with_origin_country = cleanRegion;
        params.without_genres = '10766,10764,10767,10763';
        params['vote_count.gte'] = 10;
      } else {
        params.without_genres = '10766,10764,10767,10763';
        params['vote_count.gte'] = 20;
      }
      if (year) params.first_air_date_year = year;
    } else {
      if (cleanRegion) {
        params.with_origin_country = cleanRegion;
      } else {
        params['vote_count.gte'] = 50; // Avoid obscure noise with 1-2 votes on global
      }
      if (year) params.primary_release_year = year;
    }

    if (genre) params.with_genres = genre;
    if (minRating) params['vote_average.gte'] = minRating;

    const genreMap = await this.getGenreMap();
    const response = await tmdbClient.get(endpoint, { params });

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
    const response = await tmdbClient.get('/search/multi', {
      params: {
        query: trimmedQuery,
        page: sanitizedPage,
        include_adult: false
      }
    });

    // Filter out person records so only movies and TV shows are included in results
    const filteredResults = (response.data?.results || []).filter(
      item => item.media_type === 'movie' || item.media_type === 'tv'
    );

    const normalized = normalizePaginatedMovies({
      ...response.data,
      results: filteredResults
    }, genreMap);
    cacheService.set(cacheKey, normalized, CACHE_TTLS.SEARCH);
    return normalized;
  }

  /**
   * Fetch top trending TV / web series (supports regional or global)
   */
  async getTopShows(region = 'GLOBAL') {
    const cleanRegion = (region || 'GLOBAL').toUpperCase();
    const cacheKey = `tmdb:shows:${cleanRegion}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const genreMap = await this.getGenreMap();
    let shows = [];

    if (cleanRegion === 'IN') {
      // Major Indian OTT platforms streaming premium web series
      // Amazon Prime Video: 1024, Netflix: 213, SonyLIV: 2646, Disney+ Hotstar: 3919,
      // ZEE5: 2590, TVF: 2806, JioCinema: 4909, MX Player: 2595, Voot: 2026, Aha: 3758
      const ottNetworks = '1024|213|2646|3919|2590|2806|4909|2595|2026|3758';

      // Discover acclaimed web series across OTT networks with high audience ratings
      const [res1, res2] = await Promise.all([
        tmdbClient.get('/discover/tv', {
          params: {
            with_origin_country: 'IN',
            with_networks: ottNetworks,
            'vote_count.gte': 15,
            'vote_average.gte': 7.0,
            without_genres: '10766,10764,10767,10763', // Exclude Soap, Reality, Talk, News
            sort_by: 'vote_count.desc',
            page: 1,
          }
        }),
        tmdbClient.get('/discover/tv', {
          params: {
            with_origin_country: 'IN',
            with_networks: ottNetworks,
            'vote_count.gte': 15,
            'vote_average.gte': 7.0,
            without_genres: '10766,10764,10767,10763',
            sort_by: 'vote_count.desc',
            page: 2,
          }
        })
      ]);

      const rawShows = [...(res1.data?.results || []), ...(res2.data?.results || [])];

      // Broadcast TV channels that produce daily soaps (exclude broadcast serials)
      const broadcastNetworks = [
        'StarPlus',
        'Zee TV',
        'Colors',
        'Sony Entertainment Television',
        'Star Bharat',
        'SAB TV',
        'Star Jalsha',
        'Sun TV',
        'Colors TV',
      ];

      // Fetch show details in parallel to filter out broadcast TV daily serials with > 60 episodes
      const details = await Promise.all(
        rawShows.slice(0, 30).map(s =>
          tmdbClient.get(`/tv/${s.id}`)
            .then(r => r.data)
            .catch(() => null)
        )
      );

      const filteredShows = details.filter(d => {
        if (!d) return false;
        const hasBroadcast = d.networks?.some(n => broadcastNetworks.includes(n.name));
        const isOver60Episodes = (d.number_of_episodes || 0) > 60;
        return !hasBroadcast && !isOver60Episodes;
      });

      shows = (filteredShows.length > 0 ? filteredShows : rawShows)
        .slice(0, 10)
        .map(m => normalizeMovieSummary(m, genreMap));
    } else if (cleanRegion !== 'GLOBAL') {
      const response = await tmdbClient.get('/discover/tv', {
        params: {
          sort_by: 'popularity.desc',
          with_origin_country: cleanRegion,
          'vote_count.gte': 10,
          without_genres: '10766,10764,10767,10763',
          include_adult: false,
        }
      });
      shows = (response.data?.results || [])
        .slice(0, 10)
        .map(m => normalizeMovieSummary(m, genreMap));
    } else {
      const response = await tmdbClient.get('/trending/tv/week');
      shows = (response.data?.results || [])
        .slice(0, 10)
        .map(m => normalizeMovieSummary(m, genreMap));
    }

    cacheService.set(cacheKey, shows, CACHE_TTLS.TRENDING);
    return shows;
  }

  /**
   * Fetch new releases (now playing in theatres/digital, supports regional or global)
   */
  async getNewReleases(region = 'GLOBAL') {
    const cleanRegion = (region || 'GLOBAL').toUpperCase();
    const cacheKey = `tmdb:new_releases:${cleanRegion}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const genreMap = await this.getGenreMap();
    const params = { include_adult: false };
    if (cleanRegion !== 'GLOBAL') {
      params.region = cleanRegion;
    }

    const response = await tmdbClient.get('/movie/now_playing', { params });
    const movies = (response.data?.results || [])
      .slice(0, 20)
      .map(m => normalizeMovieSummary(m, genreMap));

    cacheService.set(cacheKey, movies, CACHE_TTLS.TRENDING);
    return movies;
  }

  /**
   * Fetch upcoming movies releasing soon (supports regional or global)
   */
  async getUpcomingMovies(region = 'GLOBAL') {
    const cleanRegion = (region || 'GLOBAL').toUpperCase();
    const cacheKey = `tmdb:upcoming:${cleanRegion}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const genreMap = await this.getGenreMap();
    const params = { include_adult: false };
    if (cleanRegion !== 'GLOBAL') {
      params.region = cleanRegion;
    }

    const response = await tmdbClient.get('/movie/upcoming', { params });
    const movies = (response.data?.results || [])
      .slice(0, 20)
      .map(m => normalizeMovieSummary(m, genreMap));

    cacheService.set(cacheKey, movies, CACHE_TTLS.TRENDING);
    return movies;
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

    const cacheKey = `tmdb:details:${id}:${country.toUpperCase()}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    // Single roundtrip composite request using append_to_response
    // Try /movie/:id first, fallback to /tv/:id if it's a TV show / web series
    let response;
    try {
      response = await tmdbClient.get(`/movie/${id}`, {
        params: {
          append_to_response: 'credits,videos,recommendations,similar,watch/providers'
        }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.response?.status === 404) {
        response = await tmdbClient.get(`/tv/${id}`, {
          params: {
            append_to_response: 'credits,videos,recommendations,similar,watch/providers'
          }
        });
      } else {
        throw err;
      }
    }

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

    let response;
    try {
      response = await tmdbClient.get(`/movie/${id}/watch/providers`);
    } catch (err) {
      if (err.statusCode === 404 || err.response?.status === 404) {
        response = await tmdbClient.get(`/tv/${id}/watch/providers`);
      } else {
        throw err;
      }
    }
    const normalized = normalizeWatchProviders(response.data, countryCode);

    cacheService.set(cacheKey, normalized, CACHE_TTLS.WATCH_PROVIDERS);
    return normalized;
  }
}

export const movieService = new MovieService();
