import React, { useState } from 'react';
import { Filter, ArrowUpDown, Calendar, Star, X, Check, SlidersHorizontal } from 'lucide-react';

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

const SelectField = ({ label, value, onChange, options, icon: Icon }) => (
  <div>
    <label className="flex items-center gap-1 text-[11px] font-semibold text-cinema-muted mb-1.5">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-cinema-bg border border-cinema-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cinema-accent cursor-pointer appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
          {opt.label ?? opt.name}
        </option>
      ))}
    </select>
  </div>
);

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const genreOptions = [{ value: '', label: 'All Genres' }, ...genres.map((g) => ({ value: String(g.id), label: g.name }))];
  const yearOptions = [{ value: '', label: 'Any Year' }, ...years];

  const activeFilterCount = [
    selectedGenre,
    selectedRating,
    selectedYear,
    selectedSort !== 'popularity.desc' ? selectedSort : '',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const filterContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SelectField
        label="Genre"
        value={selectedGenre}
        onChange={onGenreChange}
        options={genreOptions}
        icon={Filter}
      />
      <SelectField
        label="Sort By"
        value={selectedSort}
        onChange={onSortChange}
        options={SORT_OPTIONS}
        icon={ArrowUpDown}
      />
      <SelectField
        label="Minimum Rating"
        value={selectedRating}
        onChange={onRatingChange}
        options={RATING_OPTIONS}
        icon={Star}
      />
      <SelectField
        label="Release Year"
        value={selectedYear}
        onChange={onYearChange}
        options={yearOptions}
        icon={Calendar}
      />
    </div>
  );

  return (
    <>
      {/* ── MOBILE: Trigger button ──────────────────────────────────── */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label={`Open filters${activeFilterCount ? `, ${activeFilterCount} active` : ''}`}
          aria-expanded={drawerOpen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-card border border-cinema-border/70 hover:border-cinema-accent text-sm text-cinema-text font-medium transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-cinema-accent" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 bg-cinema-accent text-white text-[10px] font-bold rounded-full leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Mobile bottom-sheet drawer */}
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <div
              className="fixed bottom-0 left-0 right-0 z-[51] bg-cinema-card border-t border-cinema-border/70 rounded-t-3xl slide-up"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
              role="dialog"
              aria-modal="true"
              aria-label="Filter options"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-cinema-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-cinema-border/50">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <SlidersHorizontal className="w-4 h-4 text-cinema-accent" />
                  Filters
                </div>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={() => { onResetFilters(); }}
                      className="text-xs text-cinema-accent font-semibold hover:text-cinema-accentHover transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-xl text-cinema-muted hover:text-white transition-colors"
                    aria-label="Close filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter content */}
              <div className="px-5 py-4">
                {filterContent}
              </div>

              {/* Apply button */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-3 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white font-semibold text-sm transition-all shadow-glow flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Filters
                  {activeFilterCount > 0 && ` (${activeFilterCount})`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── TABLET / DESKTOP: Inline filter bar (Option 1) ─────────── */}
      <div className="hidden md:block w-full min-w-0 max-w-full bg-cinema-card/80 backdrop-blur-md border border-cinema-border/60 rounded-2xl p-5 shadow-card space-y-4">
        {/* Top Header: Title, Active badge & Reset button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
            <SlidersHorizontal className="w-4 h-4 text-cinema-accent" />
            <span>Filters & Sort</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cinema-accent/15 border border-cinema-accent/30 text-cinema-accent text-[11px] font-semibold">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-cinema-muted hover:text-cinema-accent flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-cinema-bg/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset all
            </button>
          )}
        </div>

        {/* 4-column balanced dropdowns: 2-col on tablet (md), 4-col on desktop (lg) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <SelectField
            label="Genre"
            value={selectedGenre}
            onChange={onGenreChange}
            options={genreOptions}
            icon={Filter}
          />
          <SelectField
            label="Sort By"
            value={selectedSort}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            icon={ArrowUpDown}
          />
          <SelectField
            label="Minimum Rating"
            value={selectedRating}
            onChange={onRatingChange}
            options={RATING_OPTIONS}
            icon={Star}
          />
          <SelectField
            label="Release Year"
            value={selectedYear}
            onChange={onYearChange}
            options={yearOptions}
            icon={Calendar}
          />
        </div>

        {/* Horizontal divider */}
        <div className="h-px bg-cinema-border/40" />

        {/* Quick Genre Pills (1-click quick filter) */}
        <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cinema-muted uppercase tracking-wider">
              Quick Genre Filter
            </span>
            {selectedGenre && (
              <span className="text-[11px] text-cinema-accent">
                Selected: {genres.find(g => String(g.id) === String(selectedGenre))?.name || 'Active'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5 min-w-0 max-w-full">
            <button
              onClick={() => onGenreChange('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                !selectedGenre
                  ? 'bg-cinema-accent text-white shadow-glow'
                  : 'bg-cinema-bg/80 text-cinema-muted hover:text-white hover:bg-cinema-bg border border-cinema-border/50'
              }`}
            >
              {!selectedGenre && <Check className="w-3 h-3" />}
              All
            </button>

            {genres.map((g) => {
              const isSelected = String(g.id) === String(selectedGenre);
              return (
                <button
                  key={g.id}
                  onClick={() => onGenreChange(isSelected ? '' : String(g.id))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cinema-accent text-white shadow-glow font-semibold'
                      : 'bg-cinema-bg/80 text-cinema-muted hover:text-white hover:bg-cinema-bg border border-cinema-border/50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
