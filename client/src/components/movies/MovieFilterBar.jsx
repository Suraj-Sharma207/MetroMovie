import React from 'react';
import { Filter, ArrowUpDown, Calendar, Star, X } from 'lucide-react';

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Release Date (Newest)' },
  { value: 'primary_release_date.asc', label: 'Release Date (Oldest)' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '8.0', label: '★ 8.0 & Above' },
  { value: '7.0', label: '★ 7.0 & Above' },
  { value: '6.0', label: '★ 6.0 & Above' },
];

export default function MovieFilterBar({
  genres = [],
  selectedGenre = '',
  onGenreChange,
  selectedSort = 'popularity.desc',
  onSortChange,
  selectedRating = '',
  onRatingChange,
  selectedYear = '',
  onYearChange,
  onResetFilters,
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

  const hasActiveFilters = Boolean(
    selectedGenre ||
      selectedRating ||
      selectedYear ||
      selectedSort !== 'popularity.desc'
  );

  return (
    <div className="w-full bg-cinema-card/80 backdrop-blur-md border border-cinema-border/60 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="w-4 h-4 text-cinema-accent" />
          <span>Filters & Sort</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-cinema-muted hover:text-cinema-accent flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Genre Selector */}
        <div>
          <label className="block text-[11px] font-medium text-cinema-muted mb-1">
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full bg-cinema-bg border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-medium text-cinema-muted mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort By
          </label>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-cinema-bg border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-[11px] font-medium text-cinema-muted mb-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-cinema-gold" />
            Minimum Rating
          </label>
          <select
            value={selectedRating}
            onChange={(e) => onRatingChange(e.target.value)}
            className="w-full bg-cinema-bg border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Release Year */}
        <div>
          <label className="block text-[11px] font-medium text-cinema-muted mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Release Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full bg-cinema-bg border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            <option value="">Any Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
