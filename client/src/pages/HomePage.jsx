import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flame, Star, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useRegion } from '../context/RegionContext.jsx';
import TrendingHero from '../components/movies/TrendingHero.jsx';
import GenrePills from '../components/movies/GenrePills.jsx';
import MovieCard from '../components/movies/MovieCard.jsx';
import { MovieCardSkeleton } from '../components/common/Skeleton.jsx';
import { ErrorBanner } from '../components/common/EmptyState.jsx';

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const { currentRegion, isGlobal } = useRegion();

  // 1. Fetch Trending movies for Hero Spotlight (localized by region)
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

  // 2. Fetch Genres list
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => movieApi.getGenres(),
  });

  // 3. Fetch Popular / Discovery movies (filtered by selected genre and region)
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

  // 4. Fetch Top Rated movies
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

  const popularMovies = (popularData?.results || []).slice(0, 10);
  const topRatedMovies = (topRatedData?.results || []).slice(0, 10);

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Hero Spotlight Carousel */}
      {isTrendingError ? (
        <ErrorBanner message={trendingError?.message} onRetry={refetchTrending} />
      ) : (
        <TrendingHero
          movies={trendingMovies}
          isLoading={isTrendingLoading}
          region={currentRegion}
        />
      )}

      {/* 2. Genre Pills Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cinema-accent" />
            Browse by Genre
          </h2>
          <Link
            to="/discover"
            className="text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold flex items-center gap-0.5 transition-colors"
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

      {/* 3. Popular Movies Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-cinema-accent" />
              {selectedGenre
                ? `${genres.find((g) => String(g.id) === String(selectedGenre))?.name || 'Selected'} Movies`
                : isGlobal
                ? 'Popular Movies'
                : `Popular in ${currentRegion.name} ${currentRegion.flag}`}
            </h2>
            <p className="text-xs text-cinema-muted">
              {isGlobal
                ? 'Most watched and trending titles this week'
                : `Top trending and most watched titles in ${currentRegion.name}`}
            </p>
          </div>
          <Link
            to={`/discover${selectedGenre ? `?genre=${selectedGenre}` : ''}`}
            className="text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold flex items-center gap-1 transition-colors"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isPopularError ? (
          <ErrorBanner message={popularError?.message} onRetry={refetchPopular} />
        ) : isPopularLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {popularMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Top Rated Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-cinema-gold" />
              Critically Acclaimed
            </h2>
            <p className="text-xs text-cinema-muted">
              Highest rated masterpieces by audience votes
            </p>
          </div>
          <Link
            to="/discover?sort=vote_average.desc&rating=8.0"
            className="text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold flex items-center gap-1 transition-colors"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isTopRatedLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {topRatedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
