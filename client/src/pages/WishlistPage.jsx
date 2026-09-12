import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Lock, LogIn, Sparkles } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist.js';
import { useAuth } from '../context/AuthContext.jsx';
import RatingBadge from '../components/common/RatingBadge.jsx';
import MoviePosterFallback from '../components/common/MoviePosterFallback.jsx';
import { MovieCardSkeleton } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorBanner } from '../components/common/EmptyState.jsx';

const getPosterUrl = (posterPath) => {
  if (!posterPath) return null;
  if (posterPath.startsWith('http')) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

export default function WishlistPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    wishlist = [],
    isLoading,
    isError,
    error,
    refetch,
    removeFromWishlist,
  } = useWishlist();

  // ── Guest state ─────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-cinema-card border border-cinema-border/70 flex items-center justify-center mx-auto shadow-glow">
          <Lock className="w-8 h-8 text-cinema-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-cinema-muted max-w-xs mx-auto leading-relaxed">
            Sign in to save movies for later and keep your personal collection in one place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal({ mode: 'login' })}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cinema-accent to-red-600 hover:from-cinema-accentHover hover:to-red-500 text-white font-semibold text-sm transition-all shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Continue
          </button>
          <button
            onClick={() => openAuthModal({ mode: 'register' })}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cinema-card hover:bg-cinema-cardHover text-white font-semibold text-sm border border-cinema-border/70 transition-all hover:scale-[1.02]"
          >
            Create Account
          </button>
        </div>
        <div className="pt-6 border-t border-cinema-border/40 text-xs text-cinema-muted flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-cinema-accent" />
          <span>Explore, search, and discover movies freely anytime.</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorBanner message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 pb-4">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cinema-border/50 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 md:w-6 md:h-6 text-cinema-accent fill-cinema-accent" />
            My Wishlist
          </h1>
          <p className="text-xs text-cinema-muted mt-1">
            Movies you've saved for later
          </p>
        </div>

        {wishlist.length > 0 && (
          <span className="text-xs text-cinema-muted bg-cinema-card border border-cinema-border/60 px-3 py-1.5 rounded-full self-start sm:self-auto whitespace-nowrap">
            {wishlist.length} {wishlist.length === 1 ? 'title' : 'titles'} saved
          </span>
        )}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      {isLoading ? (
        /* Responsive grid: 2 col mobile, 3 tablet, 4-5 desktop */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Your wishlist is empty"
          message="Explore movies and tap the bookmark icon to save titles you want to watch."
          actionLabel="Explore Movies"
          actionTo="/discover"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {wishlist.map((item) => {
            const posterUrl = getPosterUrl(item.posterPath);
            const releaseYear = item.releaseDate
              ? new Date(item.releaseDate).getFullYear()
              : null;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col transition-all duration-300"
              >
                {/* Poster Card */}
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-cinema-card border border-cinema-border/50 shadow-card transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-glow">
                  <Link to={`/movie/${item.movieId}`} className="block w-full h-full">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <MoviePosterFallback title={item.title} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />
                  </Link>

                  {/* Rating */}
                  <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                    <RatingBadge rating={item.rating} size="xs" />
                  </div>

                  {/* Remove from wishlist */}
                  <button
                    onClick={() => removeFromWishlist(item.movieId)}
                    aria-label={`Remove "${item.title}" from wishlist`}
                    className="absolute top-2.5 left-2.5 z-10 p-2 rounded-xl bg-black/60 hover:bg-red-600/90 text-white/80 hover:text-white backdrop-blur-md transition-all duration-200 hover:scale-110"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Meta */}
                <div className="mt-3 flex flex-col space-y-1">
                  <Link
                    to={`/movie/${item.movieId}`}
                    className="text-sm font-semibold text-cinema-text hover:text-cinema-accent transition-colors line-clamp-1"
                    title={item.title}
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs text-cinema-muted">
                    {releaseYear || 'TBA'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
