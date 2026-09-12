import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Tv, ShoppingBag, Film } from 'lucide-react';
import { movieApi } from '../../services/movieApi.js';
import { Skeleton } from '../common/Skeleton.jsx';

export const SUPPORTED_REGIONS = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export default function WatchProvidersWidget({
  movieId,
  initialProviders = null,
}) {
  const [selectedCountry, setSelectedCountry] = useState('IN');

  // Dynamically fetch watch providers when user switches country
  const {
    data: providersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['watch-providers', movieId, selectedCountry],
    queryFn: () => movieApi.getWatchProviders(movieId, selectedCountry),
    initialData: selectedCountry === 'IN' ? initialProviders : undefined,
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const providers = providersData || initialProviders;
  const flatrate = providers?.flatrate || [];
  const rent = providers?.rent || [];
  const buy = providers?.buy || [];
  const hasAnyProviders = flatrate.length > 0 || rent.length > 0 || buy.length > 0;

  const currentRegion =
    SUPPORTED_REGIONS.find((r) => r.code === selectedCountry) ||
    SUPPORTED_REGIONS[0];

  return (
    <div className="rounded-2xl bg-cinema-card border border-cinema-border/60 p-6 space-y-5 shadow-card">
      {/* Header & Country Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cinema-border/50">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-cinema-accent" />
            Where to Watch
          </h3>
          <p className="text-xs text-cinema-muted mt-0.5">
            Streaming, rent, and purchase availability by region
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-cinema-muted">Region:</span>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-cinema-bg border border-cinema-border rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            {SUPPORTED_REGIONS.map((region) => (
              <option key={region.code} value={region.code}>
                {region.flag} {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-2">
          <Skeleton className="w-32 h-4" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-12 h-12 rounded-xl" />
            ))}
          </div>
        </div>
      ) : !hasAnyProviders ? (
        <div className="text-center py-6 px-4 bg-cinema-bg/50 rounded-xl border border-cinema-border/30">
          <Film className="w-8 h-8 text-cinema-muted/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-cinema-text">
            No streaming availability found for {currentRegion.flag}{' '}
            {currentRegion.name}
          </p>
          <p className="text-xs text-cinema-muted mt-1">
            Try switching to another country or check the verified link below.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stream Section */}
          {flatrate.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cinema-muted block mb-2.5">
                Stream (Subscription)
              </span>
              <div className="flex flex-wrap gap-3">
                {flatrate.map((provider) => (
                  <div
                    key={provider.providerId}
                    className="flex items-center gap-2.5 bg-cinema-bg border border-cinema-border/60 rounded-xl p-2 pr-3 hover:border-cinema-accent/50 transition-colors"
                  >
                    {provider.logoUrl ? (
                      <img
                        src={provider.logoUrl}
                        alt={provider.providerName}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cinema-border flex items-center justify-center text-[10px] font-bold">
                        {provider.providerName.slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-cinema-text">
                      {provider.providerName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rent Section */}
          {rent.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cinema-muted block mb-2.5">
                Rent
              </span>
              <div className="flex flex-wrap gap-3">
                {rent.map((provider) => (
                  <div
                    key={provider.providerId}
                    className="flex items-center gap-2.5 bg-cinema-bg border border-cinema-border/60 rounded-xl p-2 pr-3 hover:border-cinema-accent/50 transition-colors"
                  >
                    {provider.logoUrl ? (
                      <img
                        src={provider.logoUrl}
                        alt={provider.providerName}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cinema-border flex items-center justify-center text-[10px] font-bold">
                        {provider.providerName.slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-cinema-text">
                      {provider.providerName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy Section */}
          {buy.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cinema-muted block mb-2.5">
                Buy
              </span>
              <div className="flex flex-wrap gap-3">
                {buy.map((provider) => (
                  <div
                    key={provider.providerId}
                    className="flex items-center gap-2.5 bg-cinema-bg border border-cinema-border/60 rounded-xl p-2 pr-3 hover:border-cinema-accent/50 transition-colors"
                  >
                    {provider.logoUrl ? (
                      <img
                        src={provider.logoUrl}
                        alt={provider.providerName}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cinema-border flex items-center justify-center text-[10px] font-bold">
                        {provider.providerName.slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-cinema-text">
                      {provider.providerName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Link & Attribution */}
      <div className="pt-4 border-t border-cinema-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {providers?.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cinema-accent hover:text-cinema-accentHover font-semibold transition-colors"
          >
            <span>View all options & details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <div className="flex items-center gap-2 text-[11px] text-cinema-muted ml-auto">
          <span>Data by</span>
          <span className="font-bold text-cinema-gold">JustWatch</span>
          <span>via TMDB</span>
        </div>
      </div>
    </div>
  );
}
