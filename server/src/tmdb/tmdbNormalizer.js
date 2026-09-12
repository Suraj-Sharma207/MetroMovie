import { getImageUrl, IMAGE_SIZES, DEFAULT_WATCH_REGION } from './tmdbConstants.js';

/**
 * Format runtime in minutes to "Xh Ym"
 */
export const formatRuntime = (minutes) => {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Normalize a single movie summary item (used in lists, grids, carousels)
 */
export const normalizeMovieSummary = (movie, genreMap = {}) => {
  if (!movie || typeof movie !== 'object') return null;

  // Resolve genre names either from movie.genres object or from genre_ids map
  let genreNames = [];
  if (Array.isArray(movie.genres)) {
    genreNames = movie.genres.map(g => g.name || g).filter(Boolean);
  } else if (Array.isArray(movie.genre_ids)) {
    genreNames = movie.genre_ids.map(id => genreMap[id]).filter(Boolean);
  }

  const releaseDate = movie.release_date || movie.first_air_date || null;
  let releaseYear = null;
  if (releaseDate) {
    const parsedYear = new Date(releaseDate).getFullYear();
    if (!isNaN(parsedYear)) {
      releaseYear = parsedYear;
    }
  }

  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled Movie',
    overview: movie.overview || '',
    posterPath: movie.poster_path || null,
    posterUrl: getImageUrl(movie.poster_path, IMAGE_SIZES.POSTER_MEDIUM),
    backdropPath: movie.backdrop_path || null,
    backdropUrl: getImageUrl(movie.backdrop_path, IMAGE_SIZES.BACKDROP_LARGE),
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : 0,
    voteCount: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    releaseDate,
    releaseYear,
    genreIds: movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []),
    genres: genreNames
  };
};

/**
 * Normalize paginated list response
 */
export const normalizePaginatedMovies = (tmdbData, genreMap = {}) => {
  const rawResults = Array.isArray(tmdbData?.results) ? tmdbData.results : [];
  const normalizedResults = rawResults
    .map(m => normalizeMovieSummary(m, genreMap))
    .filter(Boolean);

  return {
    page: tmdbData?.page || 1,
    totalPages: Math.min(tmdbData?.total_pages || 1, 500), // TMDB caps maximum pages at 500
    totalResults: tmdbData?.total_results || 0,
    results: normalizedResults
  };
};

/**
 * Normalize Watch Providers data for a specific country or all regions
 */
export const normalizeWatchProviders = (providersData, countryCode = DEFAULT_WATCH_REGION) => {
  const allResults = providersData?.results || {};
  const countryData = allResults[countryCode.toUpperCase()] || null;

  const mapProvider = (p) => ({
    providerId: p.provider_id,
    providerName: p.provider_name,
    logoPath: p.logo_path,
    logoUrl: getImageUrl(p.logo_path, IMAGE_SIZES.LOGO),
    displayPriority: p.display_priority || 999
  });

  return {
    country: countryCode.toUpperCase(),
    hasAvailability: Boolean(countryData && (countryData.flatrate?.length || countryData.rent?.length || countryData.buy?.length)),
    link: countryData?.link || null, // Official TMDB / JustWatch page link
    flatrate: (countryData?.flatrate || []).map(mapProvider),
    rent: (countryData?.rent || []).map(mapProvider),
    buy: (countryData?.buy || []).map(mapProvider),
    availableCountries: Object.keys(allResults),
    attribution: {
      source: 'JustWatch',
      disclaimer: 'Streaming data powered by JustWatch via TMDB',
      tmdbDisclaimer: 'This product uses the TMDB API but is not endorsed or certified by TMDB.'
    }
  };
};

/**
 * Normalize full Movie Details including appended composite resources
 */
export const normalizeMovieDetails = (movie, selectedCountry = DEFAULT_WATCH_REGION) => {
  if (!movie || typeof movie !== 'object') return null;

  const summary = normalizeMovieSummary(movie);

  // Top 10 cast members
  const cast = (movie.credits?.cast || [])
    .slice(0, 10)
    .map(c => ({
      id: c.id,
      name: c.name,
      character: c.character || 'Unknown Role',
      profilePath: c.profile_path,
      profileUrl: getImageUrl(c.profile_path, IMAGE_SIZES.PROFILE)
    }));

  // Find official trailer (prefer YouTube Trailer)
  const videos = movie.videos?.results || [];
  const officialTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
    || videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
    || videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
    || null;

  const trailer = officialTrailer ? {
    id: officialTrailer.id,
    key: officialTrailer.key,
    name: officialTrailer.name,
    site: officialTrailer.site,
    type: officialTrailer.type,
    embedUrl: `https://www.youtube.com/embed/${officialTrailer.key}?autoplay=1`,
    youtubeUrl: `https://www.youtube.com/watch?v=${officialTrailer.key}`
  } : null;

  // Normalized watch providers for default or requested country
  const watchProviders = normalizeWatchProviders(movie['watch/providers'], selectedCountry);

  // Recommendations and Similar movies (top 6 each)
  const recommendations = (movie.recommendations?.results || [])
    .slice(0, 8)
    .map(m => normalizeMovieSummary(m));

  const similar = (movie.similar?.results || [])
    .slice(0, 8)
    .map(m => normalizeMovieSummary(m));

  // Extract Director & Writer from crew
  const crew = movie.credits?.crew || [];
  const directors = crew.filter(c => c.job === 'Director').map(c => c.name);
  const director = directors.length > 0 ? directors.slice(0, 2).join(', ') : null;

  const writers = crew.filter(c => ['Writer', 'Screenplay', 'Author', 'Story', 'Characters'].includes(c.job)).map(c => c.name);
  const uniqueWriters = [...new Set(writers)];
  const writer = uniqueWriters.length > 0 ? uniqueWriters.slice(0, 2).join(', ') : (director || null);

  // Language & Country
  const language = movie.spoken_languages?.[0]?.english_name 
    || movie.spoken_languages?.[0]?.name 
    || (movie.original_language ? movie.original_language.toUpperCase() : 'English');
  const country = movie.production_countries?.[0]?.name 
    || (Array.isArray(movie.origin_country) && movie.origin_country[0] ? movie.origin_country[0] : 'International');

  // Format vote count e.g. 124K
  const rawVoteCount = movie.vote_count || summary.voteCount || 0;
  let voteCountFormatted = `${rawVoteCount}`;
  if (rawVoteCount >= 1000000) {
    voteCountFormatted = `${(rawVoteCount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (rawVoteCount >= 1000) {
    voteCountFormatted = `${(rawVoteCount / 1000).toFixed(0)}K`;
  }

  return {
    ...summary,
    runtime: movie.runtime || null,
    runtimeFormatted: formatRuntime(movie.runtime),
    tagline: movie.tagline || '',
    status: movie.status || 'Released',
    budget: movie.budget || 0,
    revenue: movie.revenue || 0,
    genres: (movie.genres || []).map(g => ({ id: g.id, name: g.name })),
    cast,
    director,
    writer,
    language,
    country,
    voteCountFormatted,
    trailer,
    watchProviders,
    recommendations,
    similar
  };
};
