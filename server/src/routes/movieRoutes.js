import { Router } from 'express';
import {
  getGenres,
  getTrendingMovies,
  discoverMovies,
  searchMovies,
  getMovieDetails,
  getWatchProviders
} from '../controllers/movieController.js';

const router = Router();

// Genre listing
router.get('/genres', getGenres);

// Trending daily movies for Hero Spotlight
router.get('/trending', getTrendingMovies);

// Discover / browse movies with filters & sorting
router.get('/', discoverMovies);

// Search movies by title with debounce support
router.get('/search', searchMovies);

// Movie details with appended cast, trailers, recommendations, watch providers
router.get('/:id', getMovieDetails);

// Dynamic watch providers for country switching
router.get('/:id/watch-providers', getWatchProviders);

export default router;
