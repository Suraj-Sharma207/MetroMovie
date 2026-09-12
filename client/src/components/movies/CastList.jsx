import React, { useState } from 'react';
import { User } from 'lucide-react';

function CastAvatar({ person }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex-shrink-0 w-24 sm:w-28 text-center space-y-2 group">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl overflow-hidden bg-cinema-card border border-cinema-border/60 shadow-md group-hover:border-cinema-accent/50 transition-all">
        {person.profileUrl && !imageFailed ? (
          <img
            src={person.profileUrl}
            alt={person.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cinema-card text-cinema-muted">
            <User className="w-8 h-8 opacity-40" />
          </div>
        )}
      </div>

      <div className="space-y-0.5 px-1">
        <h4 className="text-xs font-semibold text-cinema-text line-clamp-1 group-hover:text-cinema-accent transition-colors">
          {person.name}
        </h4>
        <p className="text-[11px] text-cinema-muted line-clamp-1">
          {person.character}
        </p>
      </div>
    </div>
  );
}

export default function CastList({ cast = [] }) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white tracking-tight">Top Cast</h3>
      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex items-start gap-4">
          {cast.map((person) => (
            <CastAvatar key={person.id + person.character} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
}
