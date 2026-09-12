import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flame, Star, Sparkles, ChevronRight, Compass, TrendingUp, Tv } from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useRegion } from '../context/RegionContext.jsx';
import TrendingHero from '../components/movies/TrendingHero.jsx';
import GenrePills from '../components/movies/GenrePills.jsx';
import MovieCard from '../components/movies/MovieCard.jsx';
import MovieRow from '../components/movies/MovieRow.jsx';
import { MovieCardSkeleton } from '../components/common/Skeleton.jsx';
import { ErrorBanner } from '../components/common/EmptyState.jsx';

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const { currentRegion, isGlobal } = useRegion();

  // 1. Trending movies for Hero + Trending row
  const {
    data: trendingMovies = [],
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ['movies', 'trending', currentRegion.code],
    queryFn: () => movieApi.getTrending(currentRegion.code),
  });

  // 2. Genres
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => movieApi.getGenres(),
  });

  // 3. Popular movies
  const {
    data: popularData,
    isLoading: isPopularLoading,
    isError: isPopularError,
    error: popularError,
    refetch: refetchPopular,
  } = useQuery({
    queryKey: ['movies', 'popular', currentRegion.code, selectedGenre],
    queryFn: () =>
      movieApi.discover({
        page: 1,
        sortBy: 'popularity.desc',
        genre: selectedGenre || undefined,
        region: currentRegion.code,
      }),
  });

  // 4. Top Shows (Web Series) - regional
  const {
    data: showsData = [],
    isLoading: isShowsLoading,
    isError: isShowsError,
    error: showsError,
    refetch: refetchShows,
  } = useQuery({
    queryKey: ['shows', 'top', currentRegion.code],
    queryFn: () => movieApi.getShows(currentRegion.code),
  });

  // 5. Top Rated
  const {
    data: topRatedData,
    isLoading: isTopRatedLoading,
  } = useQuery({
    queryKey: ['movies', 'topRated'],
    queryFn: () =>
      movieApi.discover({
        page: 1,
        sortBy: 'vote_average.desc',
        minRating: 8.0,
      }),
  });

  // Sliced to exactly 10 cards (5 per row x 2 rows on desktop)
  const popularMovies = (popularData?.results || []).slice(0, 10);
  const topShows = (showsData || []).slice(0, 10);
  const topRatedMovies = (topRatedData?.results || []).slice(0, 10);
  const trendingRowMovies = trendingMovies.slice(0, 10);

  // Popular section title changes if a genre is selected
  const popularTitle = selectedGenre
    ? `${genres.find((g) => String(g.id) === String(selectedGenre))?.name || 'Selected'} Movies`
    : isGlobal
    ? 'Popular Movies'
    : `Popular in ${currentRegion.name}`;

  const showsTitle = isGlobal
    ? 'Top Shows & Web Series'
    : `Top Shows in ${currentRegion.name}`;

  return (
    <div className="space-y-8 pb-4">

      {/* ── HERO CAROUSEL ─────────────────────────────────────────────── */}
      {isTrendingError ? (
        <ErrorBanner message={trendingError?.message} onRetry={refetchTrending} />
      ) : (
        <TrendingHero movies={trendingMovies} isLoading={isTrendingLoading} />
      )}

      {/* ── GENRES ROW ────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cinema-accent flex-shrink-0" />
            Browse by Genre
          </h2>
          <Link
            to="/search"
            className="flex items-center gap-0.5 text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold transition-colors"
          >
            All Genres <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <GenrePills
          genres={genres}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
        />
      </section>

      {/* ── TRENDING THIS WEEK ────────────────────────────────────────── */}
      {/* Mobile / Tablet: horizontal row */}
      <div className="md:hidden">
        <MovieRow
          title="Trending This Week"
          icon={TrendingUp}
          movies={trendingRowMovies}
          isLoading={isTrendingLoading}
          seeAllTo="/search?sort=popularity.desc"
        />
      </div>

      {/* ── POPULAR MOVIES ────────────────────────────────────────────── */}
      {isPopularError ? (
        <ErrorBanner message={popularError?.message} onRetry={refetchPopular} />
      ) : (
        <>
          {/* Mobile / Tablet → horizontal row */}
          <div className="md:hidden">
            <MovieRow
              title={popularTitle}
              icon={Flame}
              movies={popularMovies}
              isLoading={isPopularLoading}
              seeAllTo={`/search${selectedGenre ? `?genre=${selectedGenre}` : ''}`}
            />
          </div>

          {/* Desktop → grid (10 cards: 5x2) */}
          <section className="hidden md:block space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-cinema-accent" />
                  {popularTitle}
                </h2>
                <p className="text-xs text-cinema-muted mt-0.5">
                  {isGlobal
                    ? 'Most watched and trending titles this week'
                    : `Top trending and most watched titles in ${currentRegion.name}`}
                </p>
              </div>
              <Link
                to={`/search${selectedGenre ? `?genre=${selectedGenre}` : ''}`}
                className="text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold flex items-center gap-1 transition-colors"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {isPopularLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {popularMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── TOP SHOWS (WEB SERIES) ────────────────────────────────────── */}
      {isShowsError ? (
        <ErrorBanner message={showsError?.message} onRetry={refetchShows} />
      ) : (
        <>
          {/* Mobile / Tablet → horizontal row */}
          <div className="md:hidden">
            <MovieRow
              title={showsTitle}
              icon={Tv}
              movies={topShows}
              isLoading={isShowsLoading}
              seeAllTo="/search"
            />
          </div>

          {/* Desktop → grid (10 cards: 5x2) */}
          <section className="hidden md:block space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-cinema-accent" />
                  {showsTitle}
                </h2>
                <p className="text-xs text-cinema-muted mt-0.5">
                  {isGlobal
                    ? 'Binge-worthy and trending series worldwide'
                    : `Most popular web series and TV shows in ${currentRegion.name}`}
                </p>
              </div>
              <Link
                to="/search"
                className="text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold flex items-center gap-1 transition-colors"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {isShowsLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {topShows.map((show) => (
                  <MovieCard key={show.id} movie={show} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── TOP RATED ─────────────────────────────────────────────────── */}
      <>
        {/* Mobile / Tablet → horizontal row */}
        <div className="md:hidden">
          <MovieRow
            title="Top Rated"
            icon={Star}
            movies={topRatedMovies}
            isLoading={isTopRatedLoading}
            seeAllTo="/search?sort=vote_average.desc&rating=8.0"
          />
        </div>

        {/* Desktop → grid (10 cards: 5x2) */}
        <section className="hidden md:block space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-cinema-gold" />
                Critically Acclaimed
              </h2>
              <p className="text-xs text-cinema-muted mt-0.5">
                Highest rated masterpieces by audience votes
              </p>
            </div>
            <Link
              to="/search?sort=vote_average.desc&rating=8.0"
              className="text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold flex items-center gap-1 transition-colors"
            >
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isTopRatedLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {topRatedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </>

    </div>
  );
}
