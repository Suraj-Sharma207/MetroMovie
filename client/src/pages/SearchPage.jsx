import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedQuery = useDebounce(inputValue, 350);

  // Sync debounced search to URL
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    const newParams = new URLSearchParams(searchParams);

    if (trimmed) {
      if (newParams.get('q') !== trimmed) {
        newParams.set('q', trimmed);
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    } else {
      if (newParams.has('q')) {
        newParams.delete('q');
        newParams.delete('page');
        setSearchParams(newParams);
      }
    }
  }, [debouncedQuery]);

  // Sync back if URL changes externally (e.g. browser back button)
  useEffect(() => {
    if (urlQuery !== inputValue) {
      setInputValue(urlQuery);
    }
  }, [urlQuery]);

  // Query search endpoint with TanStack Query
  const {
    data: searchData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['movies', 'search', urlQuery, page],
    queryFn: () => movieApi.search(urlQuery, page),
    enabled: Boolean(urlQuery.trim()),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const handleClear = () => {
    setInputValue('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (searchData?.totalPages || 1)) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = searchData?.totalPages || 1;
  const totalResults = searchData?.totalResults || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Search Movies
        </h1>
        <p className="text-xs sm:text-sm text-cinema-muted">
          Find any title, blockbuster, or hidden gem across cinema history
        </p>

        {/* Large Debounced Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a movie title (e.g. Inception, Interstellar, Batman)..."
            className="w-full bg-cinema-card border border-cinema-border rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-cinema-text placeholder-cinema-muted focus:outline-none focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent shadow-card transition-all"
            autoFocus
          />
          <Search className="w-5 h-5 text-cinema-muted absolute left-4 top-1/2 -translate-y-1/2" />
          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-cinema-muted hover:text-white absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {!urlQuery.trim() ? (
        <EmptyState
          icon="search"
          title="Search for any movie"
          message="Enter a movie title in the search box above to browse real-time results."
        />
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-cinema-text">
              Results for <span className="text-cinema-accent">"{urlQuery}"</span>
            </h2>
            {totalResults > 0 && (
              <span className="text-xs text-cinema-muted">
                {totalResults.toLocaleString()} results found
              </span>
            )}
          </div>

          <MovieGrid
            movies={searchData?.results || []}
            isLoading={isLoading || isFetching}
            isError={isError}
            error={error}
            onRetry={refetch}
            skeletonCount={10}
            emptyTitle={`No movies found for "${urlQuery}"`}
            emptyMessage="Please check your spelling or try searching for another title."
          />

          {/* Pagination */}
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
      )}
    </div>
  );
}
