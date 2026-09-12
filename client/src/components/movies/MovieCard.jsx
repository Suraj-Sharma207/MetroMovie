import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import RatingBadge from '../common/RatingBadge.jsx';
import MoviePosterFallback from '../common/MoviePosterFallback.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

export default function MovieCard({ movie }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { isMovieWishlisted, toggleWishlist } = useWishlist();

  if (!movie) return null;

  const isSaved = isMovieWishlisted(movie.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(movie);
  };

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
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />
        </Link>

        {/* Rating Badge (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <RatingBadge rating={movie.rating} size="xs" />
        </div>

        {/* Wishlist Button (Top Left) */}
        <button
          onClick={handleWishlistClick}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 left-2.5 z-10 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
            isSaved
              ? 'bg-cinema-accent text-white shadow-glow'
              : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 transition-transform duration-200 ${
              isSaved ? 'fill-white scale-110' : ''
            }`}
          />
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
