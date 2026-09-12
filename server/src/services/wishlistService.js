import prisma from '../lib/prisma.js';

class WishlistService {
  /**
   * Retrieve all saved wishlist items for a specific user (newest first)
   */
  async getAll(userId) {
    if (!userId) throw new Error('User ID is required.');
    try {
      return await prisma.wishlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (err) {
      console.error('[Wishlist Error] Failed to retrieve wishlist:', err.message);
      throw new Error('Database error while retrieving wishlist.');
    }
  }

  /**
   * Add a movie snapshot to a user's wishlist.
   * Uses upsert on composite unique key [userId, movieId] for idempotency.
   */
  async add(userId, movie) {
    if (!userId) throw new Error('User ID is required.');
    const movieId = parseInt(movie.movieId || movie.id, 10);
    if (!movieId || isNaN(movieId)) {
      const error = new Error('Valid movieId is required.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const wishlistItem = await prisma.wishlistItem.upsert({
        where: {
          userId_movieId: {
            userId,
            movieId
          }
        },
        update: {
          title: movie.title || 'Untitled',
          posterPath: movie.posterPath || null,
          backdropPath: movie.backdropPath || null,
          rating: movie.rating ? parseFloat(movie.rating) : null,
          releaseDate: movie.releaseDate || null,
          overview: movie.overview || null,
        },
        create: {
          userId,
          movieId,
          title: movie.title || 'Untitled',
          posterPath: movie.posterPath || null,
          backdropPath: movie.backdropPath || null,
          rating: movie.rating ? parseFloat(movie.rating) : null,
          releaseDate: movie.releaseDate || null,
          overview: movie.overview || null,
        }
      });

      return wishlistItem;
    } catch (err) {
      console.error('[Wishlist Error] Failed to add item:', err.message);
      throw new Error('Database error while saving to wishlist.');
    }
  }

  /**
   * Remove a movie from user's wishlist by movieId
   */
  async remove(userId, movieId) {
    if (!userId) throw new Error('User ID is required.');
    const id = parseInt(movieId, 10);
    if (!id || isNaN(id)) {
      const error = new Error('Valid movieId is required.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const existing = await prisma.wishlistItem.findUnique({
        where: {
          userId_movieId: {
            userId,
            movieId: id
          }
        }
      });

      if (!existing) {
        return { removed: false, message: 'Movie was not in wishlist.' };
      }

      await prisma.wishlistItem.delete({
        where: {
          userId_movieId: {
            userId,
            movieId: id
          }
        }
      });

      return { removed: true, message: 'Movie removed from wishlist.' };
    } catch (err) {
      console.error('[Wishlist Error] Failed to remove item:', err.message);
      throw new Error('Database error while removing from wishlist.');
    }
  }

  /**
   * Check if a movie is in user's wishlist
   */
  async check(userId, movieId) {
    if (!userId) return false;
    const id = parseInt(movieId, 10);
    if (!id || isNaN(id)) return false;

    try {
      const item = await prisma.wishlistItem.findUnique({
        where: {
          userId_movieId: {
            userId,
            movieId: id
          }
        },
        select: { id: true }
      });
      return Boolean(item);
    } catch (err) {
      console.warn('[Wishlist Check Warning] Database check failed:', err.message);
      return false;
    }
  }
}

export const wishlistService = new WishlistService();
