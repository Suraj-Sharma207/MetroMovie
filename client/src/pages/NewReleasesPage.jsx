import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Globe, Calendar, Clapperboard } from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useRegion } from '../context/RegionContext.jsx';
import MovieCard from '../components/movies/MovieCard.jsx';
import { MovieCardSkeleton } from '../components/common/Skeleton.jsx';
import { ErrorBanner } from '../components/common/EmptyState.jsx';

export default function NewReleasesPage() {
  const { currentRegion, isGlobal } = useRegion();

  // 1. Regional New Releases
  const {
    data: regionalReleases = [],
    isLoading: isRegionalLoading,
    isError: isRegionalError,
    error: regionalError,
    refetch: refetchRegional,
  } = useQuery({
    queryKey: ['movies', 'new-releases', currentRegion.code],
    queryFn: () => movieApi.getNewReleases(currentRegion.code),
  });

  // 2. Global New Releases
  const {
    data: globalReleases = [],
    isLoading: isGlobalLoading,
    isError: isGlobalError,
    error: globalError,
    refetch: refetchGlobal,
  } = useQuery({
    queryKey: ['movies', 'new-releases', 'GLOBAL'],
    queryFn: () => movieApi.getNewReleases('GLOBAL'),
  });

  // 3. Upcoming Movies
  const {
    data: upcomingMovies = [],
    isLoading: isUpcomingLoading,
    isError: isUpcomingError,
    error: upcomingError,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['movies', 'upcoming', currentRegion.code],
    queryFn: () => movieApi.getUpcoming(currentRegion.code),
  });

  // Limit each section to 10 cards (5x2 on desktop)
  const regionalCards = (regionalReleases || []).slice(0, 10);
  const globalCards = (globalReleases || []).slice(0, 10);
  const upcomingCards = (upcomingMovies || []).slice(0, 10);

  return (
    <div className="space-y-10 pb-8">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="space-y-1.5 border-b border-cinema-border/40 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cinema-accent to-red-600 flex items-center justify-center shadow-glow">
            <Clapperboard className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            New & Upcoming Releases
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-cinema-muted max-w-2xl">
          Discover the latest theatrical debuts, streaming releases, and highly anticipated movies coming soon.
        </p>
      </div>

      {/* ── SECTION 1: REGIONAL NEW RELEASES ─────────────────────────── */}
      {!isGlobal && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cinema-accent" />
                New Releases in {currentRegion.name}
              </h2>
              <p className="text-xs text-cinema-muted mt-0.5">
                Now playing in theatres and digital streaming across {currentRegion.name}
              </p>
            </div>
          </div>

          {isRegionalError ? (
            <ErrorBanner message={regionalError?.message} onRetry={refetchRegional} />
          ) : isRegionalLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {regionalCards.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 2: GLOBAL NEW RELEASES ──────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cinema-accent" />
              {isGlobal ? 'Worldwide New Releases' : 'Global New Releases'}
            </h2>
            <p className="text-xs text-cinema-muted mt-0.5">
              Top new movies premiering worldwide in theatres and streaming
            </p>
          </div>
        </div>

        {isGlobalError ? (
          <ErrorBanner message={globalError?.message} onRetry={refetchGlobal} />
        ) : isGlobalLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {globalCards.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 3: UPCOMING MOVIES ──────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cinema-accent" />
              Coming Soon / Upcoming Titles
            </h2>
            <p className="text-xs text-cinema-muted mt-0.5">
              Anticipated releases hitting theatres and screens in the coming weeks
            </p>
          </div>
        </div>

        {isUpcomingError ? (
          <ErrorBanner message={upcomingError?.message} onRetry={refetchUpcoming} />
        ) : isUpcomingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {upcomingCards.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
