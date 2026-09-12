import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import RatingBadge from '../common/RatingBadge.jsx';
import MoviePosterFallback from '../common/MoviePosterFallback.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

/**
 * MovieCard
 *
 * Props:
 *   movie   — movie object
 *   compact — boolean. When true, renders a narrower card for horizontal rows.
 *             When false (default), renders the standard grid card.
 */
export default function MovieCard({ movie, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { isMovieWishlisted, toggleWishlist } = useWishlist();

  if (!movie) return null;

  const isSaved = isMovieWishlisted(movie.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(movie);
  };

  // ── COMPACT VARIANT (horizontal scroll rows) ─────────────────────────
  if (compact) {
    return (
      <div className="group flex flex-col">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-cinema-card border border-cinema-border/40 shadow-card transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-glow group-hover:border-cinema-border/80">
          <Link to={`/movie/${movie.id}`} className="block w-full h-full" tabIndex={0}>
            {movie.posterUrl && !imageFailed ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <MoviePosterFallback title={movie.title} />
            )}
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-50 group-hover:opacity-75 transition-opacity" />
          </Link>

          {/* Rating — top right */}
          <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
            <RatingBadge rating={movie.rating} size="xs" />
          </div>

          {/* Wishlist — top left */}
          <button
            onClick={handleWishlistClick}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-1.5 left-1.5 z-10 p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 ${
              isSaved
                ? 'bg-cinema-accent text-white shadow-glow'
                : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Info */}
        <div className="mt-2 space-y-0.5 px-0.5">
          <Link
            to={`/movie/${movie.id}`}
            className="block text-xs font-semibold text-cinema-text hover:text-cinema-accent transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </Link>
          <p className="text-[10px] text-cinema-muted">
            {movie.releaseYear || 'TBA'}
          </p>
        </div>
      </div>
    );
  }

  // ── STANDARD VARIANT (grid layout) ───────────────────────────────────
  return (
    <div className="group relative flex flex-col transition-all duration-300">
      {/* Poster Card */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-cinema-card border border-cinema-border/50 shadow-card transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-glow group-hover:border-cinema-border">
        <Link to={`/movie/${movie.id}`} className="block w-full h-full">
          {movie.posterUrl && !imageFailed ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <MoviePosterFallback title={movie.title} />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />
        </Link>

        {/* Rating Badge — Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <RatingBadge rating={movie.rating} size="xs" />
        </div>

        {/* Wishlist Button — Top Left */}
        <button
          onClick={handleWishlistClick}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 left-2.5 z-10 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
            isSaved
              ? 'bg-cinema-accent text-white shadow-glow'
              : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
          }`}
        >
          <Bookmark className={`w-4 h-4 transition-transform duration-200 ${isSaved ? 'fill-white scale-110' : ''}`} />
        </button>
      </div>

      {/* Movie Info */}
      <div className="mt-3 flex flex-col space-y-1">
        <Link
          to={`/movie/${movie.id}`}
          className="text-sm font-semibold text-cinema-text hover:text-cinema-accent transition-colors line-clamp-1"
          title={movie.title}
        >
          {movie.title}
        </Link>
        <div className="flex items-center justify-between text-xs text-cinema-muted">
          <span>{movie.releaseYear || 'TBA'}</span>
          {movie.genres && movie.genres.length > 0 && (
            <span className="truncate max-w-[60%] text-right text-cinema-muted/80">
              {movie.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
