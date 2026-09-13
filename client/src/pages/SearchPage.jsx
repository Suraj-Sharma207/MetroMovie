import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ChevronLeft, ChevronRight, Film, Tv } from 'lucide-react';
import { movieApi } from '../services/movieApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useRegion } from '../context/RegionContext.jsx';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import MovieFilterBar from '../components/movies/MovieFilterBar.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

/**
 * Unified Browse + Search page.
 *
 * - Supports both Movies and TV Web Series via media type toggle
 * - When search query is EMPTY → Discover mode: filter-driven paginated grid
 * - When search query is TYPED → Search mode: debounced real-time results
 * - Filters remain accessible in both modes via the filter bar / drawer
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRegion } = useRegion();

  // ── URL param extraction ─────────────────────────────────────────────
  const urlQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'popularity.desc';
  const rating = searchParams.get('rating') || '';
  const year = searchParams.get('year') || '';
  const type = searchParams.get('type') || 'movie';

  // ── Local search input (debounced) ──────────────────────────────────
  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedQuery = useDebounce(inputValue, 350);

  // Sync debounced value → URL
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
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL → input (browser back/forward)
  useEffect(() => {
    if (urlQuery !== inputValue) setInputValue(urlQuery);
  }, [urlQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Genre list ───────────────────────────────────────────────────────
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => movieApi.getGenres(),
  });

  // ── SEARCH query (active when there is a query) ──────────────────────
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useQuery({
    queryKey: ['movies', 'search', urlQuery, page],
    queryFn: () => movieApi.search(urlQuery, page),
    enabled: Boolean(urlQuery.trim()),
    staleTime: 1000 * 60 * 5,
  });

  // ── DISCOVER query (active when no search query) ─────────────────────
  const {
    data: discoverData,
    isLoading: isDiscoverLoading,
    isError: isDiscoverError,
    error: discoverError,
    refetch: refetchDiscover,
  } = useQuery({
    queryKey: ['movies', 'discover', { page, genre, sort, rating, year, region: currentRegion.code, type }],
    queryFn: () =>
      movieApi.discover({
        page,
        sortBy: sort,
        genre: genre || undefined,
        minRating: rating || undefined,
        year: year || undefined,
        region: currentRegion.code,
        type,
      }),
    enabled: !urlQuery.trim(), // Only fetch when NOT searching
    keepPreviousData: true,
  });

  // ── Decide which mode we're in ───────────────────────────────────────
  const isSearchMode = Boolean(urlQuery.trim());

  const movies = isSearchMode
    ? searchData?.results || []
    : discoverData?.results || [];

  const isLoading = isSearchMode
    ? isSearchLoading || isSearchFetching
    : isDiscoverLoading;

  const isError = isSearchMode ? isSearchError : isDiscoverError;
  const error = isSearchMode ? searchError : discoverError;
  const refetch = isSearchMode ? refetchSearch : refetchDiscover;

  const totalPages = isSearchMode
    ? searchData?.totalPages || 1
    : discoverData?.totalPages || 1;

  const totalResults = isSearchMode
    ? searchData?.totalResults || 0
    : discoverData?.totalResults || 0;

  // ── Filter helpers ───────────────────────────────────────────────────
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    const newParams = new URLSearchParams();
    if (urlQuery) newParams.set('q', urlQuery);
    if (type && type !== 'movie') newParams.set('type', type);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    setInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // ── Dynamic page title based on active type, region & filters ───────
  const getPageHeading = () => {
    if (isSearchMode) {
      return (
        <>
          Results for <span className="text-cinema-accent">"{urlQuery}"</span>
        </>
      );
    }

    const genreName = genre ? genres.find((g) => String(g.id) === String(genre))?.name : null;
    const isTv = type === 'tv';
    const mediaLabel = isTv ? 'Web Series' : 'Movies';

    if (genreName) {
      return (
        <span>
          {genreName} {mediaLabel}
          {currentRegion.code !== 'GLOBAL' ? ` in ${currentRegion.name}` : ''}
        </span>
      );
    }

    if (isTv) {
      return (
        <span>
          {currentRegion.code !== 'GLOBAL' ? `Top Web Series in ${currentRegion.name}` : 'Top Web Series & Shows'}
        </span>
      );
    }

    if (sort === 'vote_average.desc' && rating) {
      return <span>Critically Acclaimed Movies</span>;
    }

    if (sort === 'popularity.desc') {
      return (
        <span>
          {currentRegion.code !== 'GLOBAL' ? `Popular Movies in ${currentRegion.name}` : 'Popular Movies'}
        </span>
      );
    }

    if (sort?.startsWith('primary_release_date')) {
      return <span>New & Recent Releases</span>;
    }

    return (
      <span className="text-cinema-muted">Browse all {mediaLabel.toLowerCase()}</span>
    );
  };

  // ── Scroll to top on page change ─────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="space-y-5 pb-4">

      {/* ── SEARCH INPUT (Mobile/Tablet only; Desktop uses top navbar search) ── */}
      <div className="relative w-full lg:hidden">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search movies, web series, titles..."
          className="w-full bg-cinema-card border border-cinema-border rounded-2xl pl-11 pr-10 py-3.5 text-sm text-cinema-text placeholder-cinema-muted focus:outline-none focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent shadow-card transition-all"
          autoComplete="off"
          aria-label="Search movies and shows"
        />
        <Search className="w-4.5 h-4.5 text-cinema-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        {inputValue && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-cinema-muted hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── MEDIA TYPE TOGGLE (Movies vs Web Series) ──────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-cinema-card/90 border border-cinema-border/80 rounded-xl shadow-card">
          <button
            type="button"
            onClick={() => updateParam('type', 'movie')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              type !== 'tv'
                ? 'bg-cinema-accent text-white shadow-glowSm'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies</span>
          </button>
          <button
            type="button"
            onClick={() => updateParam('type', 'tv')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              type === 'tv'
                ? 'bg-cinema-accent text-white shadow-glowSm'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Web Series</span>
          </button>
        </div>

        {totalResults > 0 && !isLoading && (
          <span className="text-xs text-cinema-muted">
            {totalResults.toLocaleString()} {type === 'tv' ? 'shows' : 'movies'}
          </span>
        )}
      </div>

      {/* ── FILTER BAR ────────────────────────────────────────────────── */}
      {/* Always visible — works in both search and browse modes */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
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
        </div>
      </div>

      {/* ── SECTION HEADING ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-bold text-cinema-text">
          {getPageHeading()}
        </h1>
      </div>

      {/* ── RESULTS GRID ──────────────────────────────────────────────── */}
      {isSearchMode && !urlQuery.trim() ? (
        <EmptyState
          icon="search"
          title={`Search for any ${type === 'tv' ? 'web series' : 'movie'}`}
          message="Type above to search, or browse using the filters."
        />
      ) : (
        <MovieGrid
          movies={movies}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          skeletonCount={12}
          emptyTitle={isSearchMode ? `No results for "${urlQuery}"` : `No ${type === 'tv' ? 'web series' : 'movies'} match your filters`}
          emptyMessage={
            isSearchMode
              ? 'Try different keywords or check your spelling.'
              : 'Try loosening your filters or selecting a different genre.'
          }
        />
      )}

      {/* ── PAGINATION ────────────────────────────────────────────────── */}
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
