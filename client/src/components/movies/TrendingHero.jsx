import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info, Bookmark, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import RatingBadge from '../common/RatingBadge.jsx';
import { HeroSkeleton } from '../common/Skeleton.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

export default function TrendingHero({ movies = [], isLoading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isMovieWishlisted, toggleWishlist } = useWishlist();

  // Rotate hero spotlight every 7 seconds if multiple movies exist
  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 7000);
    return () => clearInterval(interval);
  }, [movies]);

  if (isLoading) return <HeroSkeleton />;
  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex] || movies[0];
  const isSaved = isMovieWishlisted(movie.id);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.min(movies.length - 1, 4) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
  };

  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-cinema-card border border-cinema-border/50 shadow-2xl group">
      {/* Background Backdrop Image */}
      <div className="relative w-full h-[460px] sm:h-[500px] md:h-[550px]">
        {movie.backdropUrl ? (
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center transition-all duration-700 brightness-[0.75]"
          />
        ) : movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top transition-all duration-700 brightness-[0.6]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-cinema-card to-cinema-bg" />
        )}

        {/* Dynamic Dark Gradients for perfect text contrast & cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/40 to-transparent" />
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12 z-10">
        <div className="max-w-2xl space-y-3 md:space-y-4">
          {/* Tag & Rating */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cinema-accent text-white shadow-glow">
              Trending # {currentIndex + 1}
            </span>
            <RatingBadge rating={movie.rating} size="sm" />
            {movie.releaseYear && (
              <span className="text-xs font-semibold text-cinema-text/90">
                {movie.releaseYear}
              </span>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <span className="text-xs text-cinema-muted">
                • {movie.genres.slice(0, 2).join(', ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {movie.title}
          </h1>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-cinema-text/80 line-clamp-2 sm:line-clamp-3 font-normal max-w-xl">
            {movie.overview || 'No synopsis available.'}
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cinema-accent hover:bg-cinema-accentHover text-white font-semibold text-sm transition-all duration-200 shadow-glow hover:scale-105"
            >
              <Info className="w-4 h-4" />
              View Details
            </Link>

            <button
              onClick={() => toggleWishlist(movie)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border backdrop-blur-md text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                isSaved
                  ? 'bg-white text-black border-white'
                  : 'bg-black/50 hover:bg-black/70 text-white border-cinema-border'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-black' : ''}`} />
              {isSaved ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        {movies.length > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {movies.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 bg-cinema-accent'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
