import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_REGIONS = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GLOBAL', name: 'Global', flag: '🌐' },
];

const STORAGE_KEY = 'moviesmetro_user_region';

function detectDefaultRegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta')) return 'IN';
    if (tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') || tz.startsWith('America/Los_Angeles') || tz.startsWith('America/Denver')) return 'US';
    if (tz.startsWith('Europe/London')) return 'GB';
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) return 'CA';
    if (tz.startsWith('Australia/')) return 'AU';
    if (tz.startsWith('Asia/Tokyo')) return 'JP';
    if (tz.startsWith('Asia/Seoul')) return 'KR';
    if (tz.startsWith('Europe/Berlin')) return 'DE';
    if (tz.startsWith('Europe/Paris')) return 'FR';
    if (tz.startsWith('Asia/')) return 'IN';
  } catch {
    // ignore
  }
  return 'IN';
}

const RegionContext = createContext(null);

export function RegionProvider({ children }) {
  const [regionCode, setRegionCode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('cinescope_user_region');
    if (saved && SUPPORTED_REGIONS.some((r) => r.code === saved)) {
      return saved;
    }
    return detectDefaultRegion();
  });

  const currentRegion =
    SUPPORTED_REGIONS.find((r) => r.code === regionCode) ||
    SUPPORTED_REGIONS[0];

  const setRegion = (code) => {
    if (SUPPORTED_REGIONS.some((r) => r.code === code)) {
      setRegionCode(code);
      localStorage.setItem(STORAGE_KEY, code);
    }
  };

  return (
    <RegionContext.Provider
      value={{
        currentRegion,
        setRegion,
        supportedRegions: SUPPORTED_REGIONS,
        isGlobal: currentRegion.code === 'GLOBAL',
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
