import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Bookmark,
  Play,
  Share2,
  Sparkles,
} from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useWishlist } from '../hooks/useWishlist.js';
import RatingBadge from '../components/common/RatingBadge.jsx';
import MoviePosterFallback from '../components/common/MoviePosterFallback.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ErrorBanner } from '../components/common/EmptyState.jsx';
import CastList from '../components/movies/CastList.jsx';
import WatchProvidersWidget from '../components/movies/WatchProvidersWidget.jsx';
import TrailerModal from '../components/movies/TrailerModal.jsx';
import MovieCard from '../components/movies/MovieCard.jsx';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const { isMovieWishlisted, toggleWishlist } = useWishlist();

  // Fetch full composite movie details
  const {
    data: movie,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieApi.getDetails(id),
    staleTime: 1000 * 60 * 10,
  });

  // Scroll to top when opening a movie
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isError) {
    return (
      <div className="py-12">
        <ErrorBanner
          message={error?.message || 'Movie not found.'}
          onRetry={refetch}
        />
        <div className="text-center mt-4">
          <Link
            to="/discover"
            className="text-xs text-cinema-accent hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <Skeleton className="w-full h-[400px] md:h-[480px] rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="w-full h-80 rounded-2xl md:col-span-1" />
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="w-2/3 h-8" />
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-full h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const isSaved = isMovieWishlisted(movie.id);

  return (
    <div className="space-y-10 pb-16">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cinema-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Hero Header with Backdrop */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-cinema-card border border-cinema-border/50 shadow-2xl">
        {/* Backdrop Background */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px]">
          {movie.backdropUrl ? (
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover object-top brightness-[0.6]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-cinema-card to-cinema-bg" />
          )}

          {/* Gradients for seamless overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg/80 via-cinema-bg/30 to-transparent" />
        </div>

        {/* Content Container (Poster + Meta) */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-end md:items-center gap-6 p-6 sm:p-8 md:p-12 z-10">
          {/* Poster (Hidden on smallest mobile screens for cleaner space, visible on sm+) */}
          <div className="hidden sm:block w-36 sm:w-44 md:w-56 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-cinema-border/60 bg-cinema-card">
            {movie.posterUrl && !imageFailed ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <MoviePosterFallback title={movie.title} />
            )}
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-3 sm:space-y-4 max-w-3xl">
            {/* Badges row */}
            <div className="flex items-center gap-3 flex-wrap">
              <RatingBadge rating={movie.rating} size="md" />

              {movie.releaseYear && (
                <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-cinema-text/90">
                  <Calendar className="w-3.5 h-3.5 text-cinema-muted" />
                  {movie.releaseDate || movie.releaseYear}
                </span>
              )}

              {movie.runtimeFormatted && (
                <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-cinema-text/90">
                  <Clock className="w-3.5 h-3.5 text-cinema-muted" />
                  {movie.runtimeFormatted}
                </span>
              )}

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cinema-border/60 text-cinema-muted font-medium">
                {movie.status}
              </span>
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xs sm:text-sm italic text-cinema-muted mt-1 font-light">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {movie.trailer && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cinema-accent hover:bg-cinema-accentHover text-white font-semibold text-sm transition-all shadow-glow hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Trailer
                </button>
              )}

              <button
                onClick={() => toggleWishlist(movie)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border backdrop-blur-md text-sm font-semibold transition-all hover:scale-105 ${
                  isSaved
                    ? 'bg-white text-black border-white'
                    : 'bg-black/60 hover:bg-black/80 text-white border-cinema-border'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-black' : ''}`} />
                {isSaved ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Details + Where to Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Synopsis + Cast */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight">Overview</h3>
            <p className="text-sm sm:text-base text-cinema-text/90 leading-relaxed font-normal">
              {movie.overview || 'No synopsis provided for this title.'}
            </p>
          </section>

          {/* Cast */}
          <CastList cast={movie.cast} />
        </div>

        {/* Right 1 Col: Where to Watch Widget */}
        <div className="lg:col-span-1 space-y-6">
          <WatchProvidersWidget
            movieId={movie.id}
            initialProviders={movie.watchProviders}
          />
        </div>
      </div>

      {/* Recommendations / Similar Movies */}
      {movie.recommendations && movie.recommendations.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-cinema-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cinema-accent" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recommended Movies
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {movie.recommendations.slice(0, 4).map((rec) => (
              <MovieCard key={rec.id} movie={rec} />
            ))}
          </div>
        </section>
      )}

      {/* YouTube Trailer Modal */}
      {movie.trailer && (
        <TrailerModal
          trailer={movie.trailer}
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
        />
      )}
    </div>
  );
}
