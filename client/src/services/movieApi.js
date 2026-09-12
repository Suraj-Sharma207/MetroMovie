import { apiClient } from './apiClient.js';

export const movieApi = {
  /**
   * Fetch all movie genres
   */
  async getGenres() {
    const res = await apiClient.get('/movies/genres');
    return res.data.data;
  },

  /**
   * Fetch trending daily movies for Hero Spotlight (supports region)
   */
  async getTrending(region) {
    const res = await apiClient.get('/movies/trending', {
      params: region ? { region } : undefined,
    });
    return res.data.data;
  },

  /**
   * Discover movies with filters and pagination
   */
  async discover(params = {}) {
    const res = await apiClient.get('/movies', { params });
    return res.data;
  },

  /**
   * Search movies by title
   */
  async search(query, page = 1) {
    const res = await apiClient.get('/movies/search', {
      params: { q: query, page },
    });
    return res.data;
  },

  /**
   * Get composite movie details
   */
  async getDetails(id, country = 'IN') {
    const res = await apiClient.get(`/movies/${id}`, {
      params: { country },
    });
    return res.data.data;
  },

  /**
   * Get dynamic watch providers for selected country
   */
  async getWatchProviders(id, country = 'IN') {
    const res = await apiClient.get(`/movies/${id}/watch-providers`, {
      params: { country },
    });
    return res.data.data;
  },
};
