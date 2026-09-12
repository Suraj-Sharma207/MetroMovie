import React from 'react';

export default function GenrePills({
  genres = [],
  selectedGenre = '',
  onSelectGenre,
}) {
  if (!genres || genres.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onSelectGenre('')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            !selectedGenre
              ? 'bg-cinema-accent text-white shadow-glow'
              : 'bg-cinema-card hover:bg-cinema-cardHover text-cinema-muted hover:text-white border border-cinema-border/60'
          }`}
        >
          All Genres
        </button>

        {genres.map((genre) => {
          const isSelected = String(selectedGenre) === String(genre.id);
          return (
            <button
              key={genre.id}
              onClick={() => onSelectGenre(isSelected ? '' : String(genre.id))}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-cinema-accent text-white shadow-glow'
                  : 'bg-cinema-card hover:bg-cinema-cardHover text-cinema-muted hover:text-white border border-cinema-border/60'
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
