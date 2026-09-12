import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard.jsx';
import { MovieCardSkeleton } from '../common/Skeleton.jsx';

/**
 * MovieRow — Horizontal scrollable section used on Home and Details pages.
 *
 * Props:
 *   title        — Section heading text
 *   icon         — Optional Lucide icon element
 *   movies       — Array of movie objects
 *   isLoading    — Show skeleton placeholders
 *   seeAllTo     — Route for "See All" link (optional)
 *   skeletonCount — Number of skeleton cards during load (default 8)
 */
export default function MovieRow({
  title,
  icon: Icon,
  movies = [],
  isLoading = false,
  seeAllTo,
  skeletonCount = 8,
}) {
  return (
    <section className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-0">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-cinema-accent flex-shrink-0" />}
          {title}
        </h2>
        {seeAllTo && (
          <Link
            to={seeAllTo}
            className="flex items-center gap-0.5 text-xs text-cinema-accent hover:text-cinema-accentHover font-semibold transition-colors flex-shrink-0"
            aria-label={`See all ${title}`}
          >
            See All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
        role="list"
        aria-label={title}
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-36 sm:w-40 md:w-44" role="listitem">
                <MovieCardSkeleton compact />
              </div>
            ))
          : movies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-36 sm:w-40 md:w-44" role="listitem">
                <MovieCard movie={movie} compact />
              </div>
            ))}
      </div>
    </section>
  );
}
