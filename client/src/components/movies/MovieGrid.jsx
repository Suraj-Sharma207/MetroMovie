import React from 'react';
import MovieCard from './MovieCard.jsx';
import { MovieCardSkeleton } from '../common/Skeleton.jsx';
import { EmptyState, ErrorBanner } from '../common/EmptyState.jsx';

export default function MovieGrid({
  movies = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  skeletonCount = 10,
  emptyTitle = 'No movies found',
  emptyMessage = 'Try adjusting your filters or search query.',
}) {
  if (isError) {
    return <ErrorBanner message={error?.message} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
