import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Info, Film } from 'lucide-react';
import { movieApi } from '../../services/movieApi.js';
import { Skeleton } from '../common/Skeleton.jsx';
import { useRegion, SUPPORTED_REGIONS } from '../../context/RegionContext.jsx';

export default function WatchProvidersWidget({
  movieId,
  initialProviders = null,
}) {
  const { currentRegion: userRegion } = useRegion();
  const defaultCode = userRegion.code !== 'GLOBAL' ? userRegion.code : 'IN';
  const [selectedCountry, setSelectedCountry] = useState(defaultCode);
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'rent' | 'buy'

  // Fetch watch providers for selected country
  const {
    data: providersData,
    isLoading,
  } = useQuery({
    queryKey: ['watch-providers', movieId, selectedCountry],
    queryFn: () => movieApi.getWatchProviders(movieId, selectedCountry),
    initialData: selectedCountry === 'IN' ? initialProviders : undefined,
    staleTime: 1000 * 60 * 10,
  });

  const providers = providersData || initialProviders;
  const flatrate = providers?.flatrate || [];
  const rent = providers?.rent || [];
  const buy = providers?.buy || [];

  const currentRegion =
    SUPPORTED_REGIONS.find((r) => r.code === selectedCountry) ||
    SUPPORTED_REGIONS[0];

  const currentList =
    activeTab === 'stream' ? flatrate : activeTab === 'rent' ? rent : buy;

  const getSubLabel = (tab) => {
    if (tab === 'stream') return 'Subscription';
    if (tab === 'rent') return 'Rent';
    return 'Buy';
  };

  return (
    <div className="rounded-2xl bg-cinema-card/80 border border-cinema-border/60 p-5 sm:p-6 space-y-4 shadow-card">
      {/* Header: Title & Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
          Where to Watch
          <span title="Streaming availability data" className="text-cinema-muted cursor-help">
            <Info className="w-3.5 h-3.5" />
          </span>
        </h3>
      </div>

      {/* Available in Country Selector */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-cinema-muted font-medium">Available in</span>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="appearance-none bg-cinema-bg border border-cinema-border/80 hover:border-cinema-accent/60 rounded-xl pl-3 pr-7 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-cinema-accent cursor-pointer transition-colors"
          >
            {SUPPORTED_REGIONS.map((region) => (
              <option key={region.code} value={region.code} className="bg-cinema-card text-white">
                {region.flag} {region.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-cinema-muted">
            ▾
          </div>
        </div>
      </div>

      {/* Tabs: Stream | Rent | Buy */}
      <div className="flex border-b border-cinema-border/60 pt-1">
        {[
          { key: 'stream', label: 'Stream', count: flatrate.length },
          { key: 'rent', label: 'Rent', count: rent.length },
          { key: 'buy', label: 'Buy', count: buy.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 py-2.5 text-xs sm:text-sm font-bold text-center transition-colors ${
                isActive ? 'text-white' : 'text-cinema-muted hover:text-cinema-text'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-accent shadow-glow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Provider List / Content */}
      <div className="min-h-[140px] pt-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-28 h-3.5" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-6 px-3 bg-cinema-bg/40 rounded-xl border border-cinema-border/30 my-2">
            <Film className="w-7 h-7 text-cinema-muted/50 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-cinema-text">
              Not available for {activeTab} in {currentRegion.name}
            </p>
            <p className="text-[11px] text-cinema-muted mt-0.5">
              Switch regions or check other options.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentList.map((provider) => {
              const linkUrl = providers?.link || `https://www.google.com/search?q=watch+${encodeURIComponent(provider.providerName)}`;
              return (
                <a
                  key={provider.providerId}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-cinema-bg/50 hover:bg-cinema-bg border border-cinema-border/50 hover:border-cinema-border transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {provider.logoUrl ? (
                      <img
                        src={provider.logoUrl}
                        alt={provider.providerName}
                        className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-cinema-border flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {provider.providerName.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-cinema-accent transition-colors truncate">
                        {provider.providerName}
                      </h4>
                      <p className="text-[11px] text-cinema-muted capitalize">
                        {getSubLabel(activeTab)}
                      </p>
                    </div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-cinema-muted group-hover:text-white transition-colors flex-shrink-0 ml-2" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Attribution Note */}
      <div className="pt-3 border-t border-cinema-border/40 text-[11px] text-cinema-muted flex flex-col sm:flex-row items-center justify-between gap-1">
        <span>Availability may vary by region.</span>
        <div className="flex items-center gap-1 ml-auto">
          <span>Data provided by</span>
          {providers?.link ? (
            <a
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-500 hover:text-amber-400 inline-flex items-center gap-0.5 transition-colors"
            >
              JustWatch
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="font-bold text-amber-500">JustWatch</span>
          )}
        </div>
      </div>
    </div>
  );
}
