import { movieService } from '../services/movieService.js';
import { DEFAULT_WATCH_REGION } from '../tmdb/tmdbConstants.js';

export const getGenres = async (req, res, next) => {
  try {
    const genres = await movieService.getGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (err) {
    next(err);
  }
};

export const getTrendingMovies = async (req, res, next) => {
  try {
    const { region, country } = req.query;
    const movies = await movieService.getTrendingMovies(region || country || 'GLOBAL');
    res.status(200).json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};

export const discoverMovies = async (req, res, next) => {
  try {
    const { page, sortBy, genre, year, minRating, region, country, type } = req.query;
    const data = await movieService.discoverMovies({
      page,
      sortBy,
      genre,
      year,
      minRating,
      region: region || country,
      type: type || 'movie'
    });
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const searchMovies = async (req, res, next) => {
  try {
    const { q, query, page } = req.query;
    const searchTerm = q || query || '';
    const data = await movieService.searchMovies(searchTerm, page);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getMovieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { country } = req.query;
    const movie = await movieService.getMovieDetails(id, country || DEFAULT_WATCH_REGION);
    res.status(200).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const getWatchProviders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { country } = req.query;
    const providers = await movieService.getWatchProviders(id, country || DEFAULT_WATCH_REGION);
    res.status(200).json({ success: true, data: providers });
  } catch (err) {
    next(err);
  }
};

export const getTopShows = async (req, res, next) => {
  try {
    const { region, country } = req.query;
    const shows = await movieService.getTopShows(region || country || 'GLOBAL');
    res.status(200).json({ success: true, data: shows });
  } catch (err) {
    next(err);
  }
};

export const getNewReleases = async (req, res, next) => {
  try {
    const { region, country } = req.query;
    const movies = await movieService.getNewReleases(region || country || 'GLOBAL');
    res.status(200).json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};

export const getUpcomingMovies = async (req, res, next) => {
  try {
    const { region, country } = req.query;
    const movies = await movieService.getUpcomingMovies(region || country || 'GLOBAL');
    res.status(200).json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};
