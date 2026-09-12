import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useRegion } from '../context/RegionContext.jsx';
import MovieFilterBar from '../components/movies/MovieFilterBar.jsx';
import MovieGrid from '../components/movies/MovieGrid.jsx';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRegion, isGlobal } = useRegion();

  // Extract query parameters with defaults
  const page = parseInt(searchParams.get('page') || '1', 10);
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'popularity.desc';
  const rating = searchParams.get('rating') || '';
  const year = searchParams.get('year') || '';

  // Fetch Genres
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => movieApi.getGenres(),
  });

  // Fetch Discover results with TanStack Query (localized by region)
  const {
    data: discoverData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['movies', 'discover', { page, genre, sort, rating, year, region: currentRegion.code }],
    queryFn: () =>
      movieApi.discover({
        page,
        sortBy: sort,
        genre: genre || undefined,
        minRating: rating || undefined,
        year: year || undefined,
        region: currentRegion.code,
      }),
    keepPreviousData: true,
  });

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Update URL params helper
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Always reset to page 1 when changing filters
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (discoverData?.totalPages || 1)) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  const totalPages = discoverData?.totalPages || 1;
  const totalResults = discoverData?.totalResults || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-cinema-accent" />
            Discover Movies
          </h1>
          <p className="text-xs sm:text-sm text-cinema-muted mt-1">
            Browse through extensive movie catalogues with custom filters
          </p>
        </div>

        {totalResults > 0 && !isLoading && (
          <span className="text-xs text-cinema-muted bg-cinema-card border border-cinema-border/60 px-3 py-1.5 rounded-full self-start sm:self-auto">
            {totalResults.toLocaleString()} titles found
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <MovieFilterBar
        genres={genres}
        selectedGenre={genre}
        onGenreChange={(val) => updateParam('genre', val)}
        selectedSort={sort}
        onSortChange={(val) => updateParam('sort', val)}
        selectedRating={rating}
        onRatingChange={(val) => updateParam('rating', val)}
        selectedYear={year}
        onYearChange={(val) => updateParam('year', val)}
        onResetFilters={handleResetFilters}
      />

      {/* Movies Grid */}
      <MovieGrid
        movies={discoverData?.results || []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        skeletonCount={15}
        emptyTitle="No movies match your criteria"
        emptyMessage="Try loosening your filters or selecting a different genre/year."
      />

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-cinema-border/50">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cinema-card border border-cinema-border text-xs font-semibold text-cinema-text hover:bg-cinema-cardHover disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs font-medium text-cinema-muted">
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cinema-card border border-cinema-border text-xs font-semibold text-cinema-text hover:bg-cinema-cardHover disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
