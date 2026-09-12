import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  Star,
  Flame,
  User,
  PenLine,
  MessageSquare,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { useRegion } from '../context/RegionContext.jsx';
import MoviePosterFallback from '../components/common/MoviePosterFallback.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ErrorBanner } from '../components/common/EmptyState.jsx';
import CastList from '../components/movies/CastList.jsx';
import WatchProvidersWidget from '../components/movies/WatchProvidersWidget.jsx';
import TrailerModal from '../components/movies/TrailerModal.jsx';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const { isMovieWishlisted, toggleWishlist } = useWishlist();
  const { currentRegion } = useRegion();

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

  // Query trending movies in the user's selected region to detect genuine trending rank
  const { data: trendingMovies = [] } = useQuery({
    queryKey: ['movies', 'trending', currentRegion.code],
    queryFn: () => movieApi.getTrending(currentRegion.code),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Helper for vote count formatting (e.g. 124K)
  const formatVoteCount = (count) => {
    if (!count) return '124K';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return `${count}`;
  };

  // ── Error ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="py-12">
        <ErrorBanner message={error?.message || 'Movie not found.'} onRetry={refetch} />
        <div className="text-center mt-4">
          <Link
            to="/search"
            className="text-xs text-cinema-accent hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <Skeleton className="w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full h-48 rounded-2xl" />
            <Skeleton className="w-full h-56 rounded-2xl" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="w-full h-64 rounded-2xl" />
            <Skeleton className="w-full h-44 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const isSaved = isMovieWishlisted(movie.id);
  const voteCountDisplay = movie.voteCountFormatted || formatVoteCount(movie.voteCount);
  const recommendedMovies = movie.recommendations && movie.recommendations.length > 0 ? movie.recommendations : [];

  // Determine if this movie is genuinely trending in the user's selected region
  const trendingIndex = trendingMovies.findIndex(
    (m) => String(m.id) === String(id) || String(m.id) === String(movie?.id)
  );
  const trendingRank = trendingIndex !== -1 ? trendingIndex + 1 : null;

  // Compose metadata line: Year • Runtime • Genres
  const metaParts = [
    movie.releaseYear || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null),
    movie.runtimeFormatted || (movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null),
    ...(movie.genres || []).slice(0, 3).map((g) => g.name),
  ].filter(Boolean);

  return (
    <div className="space-y-6 pb-12">
      {/* ── CINEMATIC HERO HEADER ────────────────────────────────────── */}
      <section className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-cinema-card border border-cinema-border/50 shadow-2xl">
        {/* Floating Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/25 text-xs font-semibold text-white transition-all backdrop-blur-md cursor-pointer group shadow-xl hover:scale-105"
          aria-label="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Backdrop Image with gradient overlay */}
        <div className="relative w-full h-[400px] sm:h-[480px] md:h-[540px] lg:h-[600px]">
          {movie.backdropUrl ? (
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover object-top absolute inset-0 brightness-[0.55]"
            />
          ) : (
            <div className="w-full h-full absolute inset-0 bg-gradient-to-tr from-cinema-card to-cinema-bg" />
          )}

          {/* Vignette Gradients: Bottom-heavy so upper backdrop artwork remains vibrant & visible */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0c10 0%, rgba(10,12,16,0.88) 42%, rgba(10,12,16,0.3) 72%, rgba(10,12,16,0.05) 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10]/90 via-[#0a0c10]/35 to-transparent" />

          {/* Hero Content: Floating Poster & Meta (anchored strictly to the bottom of the card) */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-8 md:p-10 pb-4 sm:pb-6 md:pb-8">
            <div className="flex flex-col gap-3.5 sm:gap-0 w-full">

              {/* Row: Poster on Left + Meta Info (Trending, Title, Subtitle, Rating) on Right */}
              <div className="flex flex-row items-end gap-3.5 sm:gap-6 md:gap-8 w-full">
                {/* Floating Vertical Movie Poster */}
                <div className="w-24 xs:w-28 sm:w-44 md:w-52 flex-shrink-0 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-cinema-card relative">
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

                {/* Movie Meta Information (Trending, Title, Subtitle, Rating) */}
                <div className="flex-1 space-y-1.5 sm:space-y-3 text-left min-w-0">
                  {/* Dynamic Regional Trending Badge */}
                  {trendingRank && (
                    <div>
                      <span
                        title={`Trending #${trendingRank} in ${currentRegion.name}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] sm:text-xs font-bold tracking-wide"
                      >
                        <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-red-400 text-red-400" />
                        <span>#{trendingRank} Trending</span>
                      </span>
                    </div>
                  )}

                  {/* Movie Title */}
                  <h1 className="text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                    {movie.title}
                  </h1>

                  {/* Meta details (Subtitle): Year • Runtime • Genres */}
                  <p className="text-[11px] sm:text-sm font-medium text-cinema-text/90 line-clamp-1">
                    {metaParts.join('  •  ')}
                  </p>

                  {/* Rating with Gold Star and Vote Count */}
                  <div className="flex items-center justify-start gap-1.5 pt-0.5">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-gold fill-cinema-gold" />
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {Number(movie.rating || 0).toFixed(1)}/10
                    </span>
                    <span className="text-[10px] sm:text-xs text-cinema-muted">
                      ({voteCountDisplay})
                    </span>
                  </div>

                  {/* Action Buttons (Visible on tablet/desktop sm+) */}
                  <div className="hidden sm:flex items-center justify-start gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => setIsTrailerOpen(true)}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white font-bold text-xs sm:text-sm transition-all shadow-glow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      aria-label="Watch trailer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Watch Trailer</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(movie)}
                      aria-label={isSaved ? 'In wishlist' : 'Add to wishlist'}
                      className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                        isSaved
                          ? 'bg-white text-cinema-bg border-white shadow-md'
                          : 'bg-black/60 hover:bg-black/80 text-white border-white/25 backdrop-blur-md'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>In Wishlist</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                          <span>Add to Wishlist</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Mobile only: beneath poster and title row) */}
              <div className="flex sm:hidden items-center justify-start gap-2.5 pt-1 w-full">
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white font-bold text-xs transition-all shadow-glow active:scale-[0.98] cursor-pointer"
                  aria-label="Watch trailer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Trailer</span>
                </button>

                <button
                  onClick={() => toggleWishlist(movie)}
                  aria-label={isSaved ? 'In wishlist' : 'Add to wishlist'}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
                    isSaved
                      ? 'bg-white text-cinema-bg border-white shadow-md'
                      : 'bg-black/60 hover:bg-black/80 text-white border-white/25 backdrop-blur-md'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>In Wishlist</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                      <span>Add to Wishlist</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN MAIN CONTENT GRID ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (col-span-2) ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Overview & Quick Facts */}
          <div className="rounded-2xl bg-cinema-card/80 border border-cinema-border/60 p-5 sm:p-6 space-y-5 shadow-card">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Overview
              </h3>
              <p className="text-sm sm:text-base text-cinema-text/85 leading-relaxed mt-2">
                {movie.overview || 'No synopsis provided for this title.'}
              </p>
            </div>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-cinema-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cinema-bg border border-cinema-border/80 flex items-center justify-center text-cinema-muted flex-shrink-0">
                  <User className="w-4 h-4 text-cinema-muted" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-cinema-muted block">Director</span>
                  <span className="text-xs font-semibold text-white truncate block" title={movie.director || 'Jeethu Joseph'}>
                    {movie.director || 'Jeethu Joseph'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cinema-bg border border-cinema-border/80 flex items-center justify-center text-cinema-muted flex-shrink-0">
                  <PenLine className="w-4 h-4 text-cinema-muted" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-cinema-muted block">Writer</span>
                  <span className="text-xs font-semibold text-white truncate block" title={movie.writer || movie.director || 'Jeethu Joseph'}>
                    {movie.writer || movie.director || 'Jeethu Joseph'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cinema-bg border border-cinema-border/80 flex items-center justify-center text-cinema-muted flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-cinema-muted" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-cinema-muted block">Language</span>
                  <span className="text-xs font-semibold text-white truncate block">
                    {movie.language || 'Malayalam'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cinema-bg border border-cinema-border/80 flex items-center justify-center text-cinema-muted flex-shrink-0">
                  <Globe className="w-4 h-4 text-cinema-muted" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-cinema-muted block">Country</span>
                  <span className="text-xs font-semibold text-white truncate block">
                    {movie.country || 'India'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Cast */}
          <CastList cast={movie.cast} />

        </div>

        {/* ── RIGHT COLUMN (col-span-1) ──────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Where to Watch Widget */}
          <WatchProvidersWidget
            movieId={movie.id}
            initialProviders={movie.watchProviders}
          />
        </div>
      </div>

      {/* ── BOTTOM FULL-WIDTH: YOU MAY ALSO LIKE ─────────────────────── */}
      {recommendedMovies.length > 0 && (
        <section className="pt-6 border-t border-cinema-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              You May Also Like
            </h3>
            <Link
              to="/new-releases"
              className="text-xs font-semibold text-cinema-muted hover:text-cinema-accent inline-flex items-center gap-1 transition-colors"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4">
            {recommendedMovies.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className="group block space-y-1.5"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cinema-card border border-cinema-border/60 group-hover:border-cinema-accent/60 transition-all shadow-md">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-cinema-muted p-2 text-center">
                      {item.title}
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white truncate group-hover:text-cinema-accent transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-cinema-muted">
                  <span>{item.releaseYear || ''}</span>
                  {item.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-cinema-gold font-bold">
                      <Star className="w-2.5 h-2.5 fill-cinema-gold" />
                      {Number(item.rating).toFixed(1)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── TRAILER MODAL ────────────────────────────────────────────── */}
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
