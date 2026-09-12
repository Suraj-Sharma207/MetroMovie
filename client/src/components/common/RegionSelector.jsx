import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useRegion } from '../../context/RegionContext.jsx';

export default function RegionSelector({ compact = false }) {
  const { currentRegion, setRegion, supportedRegions } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setRegion(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cinema-card/80 hover:bg-cinema-card border border-cinema-border/60 hover:border-cinema-accent/50 text-white text-xs font-medium transition-all shadow-sm group focus:outline-none focus:ring-1 focus:ring-cinema-accent"
        aria-label="Select Region"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentRegion.flag}</span>
        <span className="hidden sm:inline text-zinc-200 group-hover:text-white font-medium">
          {compact ? currentRegion.code : currentRegion.name}
        </span>
        <span className="sm:hidden text-zinc-200 font-semibold text-[11px]">
          {currentRegion.code}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-cinema-muted group-hover:text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cinema-accent' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-cinema-card/95 backdrop-blur-md border border-cinema-border shadow-2xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-cinema-border/50 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-cinema-muted">
              Discovery Region
            </span>
            <Globe className="w-3.5 h-3.5 text-cinema-accent" />
          </div>

          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-cinema-border">
            {supportedRegions.map((region) => {
              const isSelected = region.code === currentRegion.code;
              return (
                <button
                  key={region.code}
                  type="button"
                  onClick={() => handleSelect(region.code)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-cinema-bg/80 transition-colors ${
                    isSelected
                      ? 'text-cinema-accent font-semibold bg-cinema-accent/10'
                      : 'text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{region.flag}</span>
                    <span>{region.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cinema-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
