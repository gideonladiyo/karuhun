import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { MainTab } from '@/pages/HomePage';

interface BranchLogoCarouselProps {
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

const AUTOROTATE_MS = 5000;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const BranchLogoCarousel: React.FC<BranchLogoCarouselProps> = ({
  selectedIndex,
  onSelectIndex,
  onNavigate,
}) => {
  const count = GUILD_BRANCHES.length;
  const [activeIndex, setActiveIndex] = useState<number>(selectedIndex);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  const goTo = useCallback((index: number) => {
    const wrapped = ((index % count) + count) % count;
    setActiveIndex(wrapped);
    onSelectIndex(wrapped);
  }, [count, onSelectIndex]);

  const handlePrev = () => goTo(activeIndex - 1);
  const handleNext = () => goTo(activeIndex + 1);

  // Optional auto-rotation: stops on hover, focus, and reduced-motion preference
  useEffect(() => {
    if (isPaused || prefersReducedMotion()) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % count;
        onSelectIndex(next);
        return next;
      });
    }, AUTOROTATE_MS);
    return () => clearInterval(interval);
  }, [isPaused, count, onSelectIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(activeIndex + 1);
    }
  };

  const relativeOffset = (index: number): number => {
    let rel = index - activeIndex;
    if (rel > count / 2) rel -= count;
    if (rel < -count / 2) rel += count;
    return rel;
  };

  return (
    <div
      className="w-full flex flex-col items-center select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Karuhun guild branches"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Landscape Slide Stage */}
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative w-full h-[210px] sm:h-[240px] lg:h-[260px] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-2xl"
        aria-live="polite"
      >
        {GUILD_BRANCHES.map((branch, index) => {
          const rel = relativeOffset(index);
          const dist = Math.abs(rel);
          const isActive = rel === 0;
          const isVisible = dist <= 1;

          if (!isVisible) return null;

          const offsetPct = rel * 62;
          const scale = 1 - Math.min(dist, 1) * 0.18;
          const opacity = 1 - Math.min(dist, 1) * 0.55;
          const logoSrc = branch.logo || '/logo.png';

          return (
            <div
              key={branch.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${branch.name}`}
              aria-hidden={!isActive}
              className={`absolute w-[78%] sm:w-[72%] lg:w-[68%] aspect-[16/9] rounded-2xl overflow-hidden transition-[transform,opacity,box-shadow,border-color] duration-500 ease-out ${
                isActive ? 'cursor-pointer' : 'pointer-events-none'
              } ${
                isActive
                  ? 'bg-gradient-to-br from-[#1e1a12] via-[#141418] to-[#09090b] border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
                  : 'bg-[#0d0d11]/95 border border-[#27272a]'
              }`}
              style={{
                transform: `translateX(${offsetPct}%) scale(${scale})`,
                opacity,
                zIndex: 10 - dist,
              }}
              onClick={() => {
                if (isActive) {
                  onNavigate('hub', branch.id);
                } else {
                  goTo(index);
                }
              }}
            >
              <div className="relative h-full w-full flex flex-col items-center justify-center gap-2 px-6 py-4">
                {/* Crest Plate */}
                <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                  <img
                    src={logoSrc}
                    alt={branch.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      if (el.src.endsWith('/logo.png')) return;
                      el.src = '/logo.png';
                    }}
                    className={`w-full h-full object-contain p-3 transition-opacity duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-60'
                    }`}
                  />
                </div>

                {/* Temporary Caption: PRD R3 fallback until name-bearing landscape assets land */}
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <h3
                    className={`font-heading font-black text-base sm:text-lg tracking-tight truncate max-w-full transition-colors duration-500 ${
                      isActive ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {branch.name}
                  </h3>
                  {isActive && (
                    <span className="text-[9px] font-tech uppercase tracking-widest text-zinc-600">
                      Temporary caption
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full max-w-[420px] px-2 mt-3 pt-3 border-t border-[#27272a]/50">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePrev}
            aria-label="Previous branch"
            className="p-2 rounded-xl bg-[#18181b] hover:bg-white hover:text-black text-zinc-400 border border-[#27272a] hover:border-white transition-all shadow-md active:scale-90 focus-tactical flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next branch"
            className="p-2 rounded-xl bg-[#18181b] hover:bg-white hover:text-black text-zinc-400 border border-[#27272a] hover:border-white transition-all shadow-md active:scale-90 focus-tactical flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          {GUILD_BRANCHES.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => goTo(idx)}
              aria-label={`Go to ${b.name}`}
              aria-current={idx === activeIndex}
              className={`transition-all duration-300 rounded-full focus-tactical ${
                idx === activeIndex
                  ? 'w-7 h-2 bg-amber-400 shadow-sm shadow-amber-400/50'
                  : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-wider font-bold">
          0{activeIndex + 1} / 0{count}
        </span>
      </div>
    </div>
  );
};