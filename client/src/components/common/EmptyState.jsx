import React from 'react';
import { Film, Search, Bookmark, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon = 'film',
  title = 'No movies found',
  message = 'Try searching with different keywords or changing filters.',
  actionLabel,
  actionTo,
  onAction,
}) {
  const IconComponent =
    icon === 'search' ? Search : icon === 'bookmark' ? Bookmark : Film;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-cinema-card border border-cinema-border flex items-center justify-center text-cinema-muted mb-4 shadow-card">
        <IconComponent className="w-8 h-8 text-cinema-muted/80" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-cinema-muted mb-6">{message}</p>
      {actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cinema-accent hover:bg-cinema-accentHover text-white font-medium text-sm transition-all duration-200 shadow-glow"
        >
          {actionLabel}
        </Link>
      )}
      {onAction && !actionTo && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border text-white font-medium text-sm transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          {actionLabel || 'Try Again'}
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-red-950/30 border border-red-800/40 p-6 text-center max-w-lg mx-auto my-8">
      <h3 className="text-base font-semibold text-red-300 mb-1">
        Unable to load movies right now
      </h3>
      <p className="text-xs text-red-200/70 mb-4">{message || 'Please check your connection and try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-700/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
