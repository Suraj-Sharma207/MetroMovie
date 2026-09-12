import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Play, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { HeroSkeleton } from '../common/Skeleton.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

const MAX_SLIDES = 5;

export default function TrendingHero({ movies = [], isLoading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isMovieWishlisted, toggleWishlist } = useWishlist();

  // Touch / swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);

  const slides = movies.slice(0, MAX_SLIDES);
  const count = slides.length;

  // ── Auto-advance ─────────────────────────────────────────────────────
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => goTo((prev) => (prev + 1) % count), 7000);
    return () => clearInterval(timer);
  }, [count]);

  const goTo = useCallback((indexOrUpdater) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(indexOrUpdater);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [isTransitioning]);

  const handlePrev = () => goTo((i) => (i === 0 ? count - 1 : i - 1));
  const handleNext = () => goTo((i) => (i + 1) % count);

  // ── Touch swipe handlers ──────────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only mark as horizontal drag if horizontal motion dominates
    if (Math.abs(dx) > Math.abs(dy) + 8) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !isDragging.current) {
      touchStartX.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) handleNext();
    else if (dx > 40) handlePrev();
    touchStartX.current = null;
    isDragging.current = false;
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (isLoading) return <HeroSkeleton />;
  if (!count) return null;

  const movie = slides[currentIndex];
  const isSaved = isMovieWishlisted(movie.id);

  // Concise metadata line: ⭐ 7.8 · 2024 · Genre
  const metaParts = [
    movie.rating ? `⭐ ${Number(movie.rating).toFixed(1)}` : null,
    movie.releaseYear ? String(movie.releaseYear) : null,
    movie.genres?.length ? movie.genres.slice(0, 2).join(' · ') : null,
  ].filter(Boolean);

  return (
    <section
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-cinema-card border border-cinema-border/40 shadow-2xl select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label={`Trending movies carousel, ${currentIndex + 1} of ${count}`}
    >
      {/* ── BACKDROP ─────────────────────────────────────────────────── */}
      {/* Heights: mobile short enough to reveal content below, grows on larger screens */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[500px] lg:h-[560px] overflow-hidden">
        {movie.backdropUrl ? (
          <img
            key={movie.id}
            src={movie.backdropUrl}
            alt={movie.title}
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
              isTransitioning ? 'opacity-70' : 'opacity-100'
            }`}
            style={{ filter: 'brightness(0.82)' }}
          />
        ) : movie.posterUrl ? (
          <img
            key={`poster-${movie.id}`}
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
            style={{ filter: 'brightness(0.75)' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-cinema-card to-cinema-bg" />
        )}

        {/* Gradient — bottom-focused to preserve artwork visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/70 to-transparent" style={{ background: 'linear-gradient(to top, #0a0c10 0%, rgba(10,12,16,0.65) 45%, rgba(10,12,16,0.0) 100%)' }} />
        {/* Subtle left vignette for text area */}
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg/70 via-transparent to-transparent" />
      </div>

      {/* ── CONTENT OVERLAY ─────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-end z-10">
        <div className="px-4 sm:px-6 md:px-10 pb-4 sm:pb-5 md:pb-8 space-y-2.5 md:space-y-3.5 max-w-2xl">

          {/* Trending badge */}
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cinema-accent text-white shadow-glow">
              Trending #{currentIndex + 1}
            </span>
          </div>

          {/* Movie title */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md line-clamp-2">
            {movie.title}
          </h1>

          {/* Metadata line */}
          {metaParts.length > 0 && (
            <p className="text-xs sm:text-sm text-cinema-text/80 font-medium">
              {metaParts.join(' · ')}
            </p>
          )}

          {/* Overview — clamped to prevent overflow */}
          {movie.overview && (
            <p className="text-xs sm:text-sm text-cinema-text/70 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-lg hidden xs:block">
              {movie.overview}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-cinema-accent hover:bg-cinema-accentHover text-white font-semibold text-xs sm:text-sm transition-all shadow-glow hover:scale-[1.03] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              View Details
            </Link>

            <button
              onClick={() => toggleWishlist(movie)}
              aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98] ${
                isSaved
                  ? 'bg-white text-cinema-bg border-white'
                  : 'bg-black/50 hover:bg-black/70 text-white border-white/25 backdrop-blur-sm'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-cinema-bg' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* ── CAROUSEL CONTROLS ──────────────────────────────────────── */}
        {count > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-4 border-t border-white/8">
            {/* Dot indicators */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 h-1.5 bg-cinema-accent'
                      : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next — visible only on md+ (mobile uses swipe) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous movie"
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/15 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next movie"
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/15 transition-colors"
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
