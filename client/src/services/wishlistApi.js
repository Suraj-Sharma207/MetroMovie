import { apiClient } from './apiClient.js';

export const wishlistApi = {
  /**
   * Get all persisted wishlist items
   */
  async getAll() {
    const res = await apiClient.get('/wishlist');
    return res.data.data;
  },

  /**
   * Add movie to wishlist (idempotent duplicate prevention)
   */
  async add(movie) {
    const res = await apiClient.post('/wishlist', {
      movieId: movie.id || movie.movieId,
      title: movie.title,
      posterPath: movie.posterPath,
      backdropPath: movie.backdropPath,
      rating: movie.rating,
      releaseDate: movie.releaseDate,
      overview: movie.overview,
    });
    return res.data.data;
  },

  /**
   * Remove movie from wishlist
   */
  async remove(movieId) {
    const res = await apiClient.delete(`/wishlist/${movieId}`);
    return res.data;
  },

  /**
   * Check if movie is wishlisted
   */
  async check(movieId) {
    const res = await apiClient.get(`/wishlist/${movieId}/check`);
    return res.data.isWishlisted;
  },
};
