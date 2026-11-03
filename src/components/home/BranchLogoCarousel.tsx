import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { MainTab } from '@/pages/HomePage';
import { SafeImage } from '@/components/ui/safe-image';

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchStartX - touchEndX;
      if (deltaX > 40) {
        handleNext();
      } else if (deltaX < -40) {
        handlePrev();
      }
      setTouchStartX(null);
    }
    setIsPaused(false);
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
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[270px] sm:h-[290px] lg:h-[310px] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-xl touch-pan-y"
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
              className={`absolute w-[64%] max-w-[240px] sm:max-w-[400px] sm:w-[76%] lg:w-[72%] aspect-[3/4] sm:aspect-[16/10] rounded-xl overflow-hidden transition-[transform,opacity,border-color] duration-300 ease-out cursor-pointer ${
                isActive
                  ? 'bg-[#18181b] border-2 border-amber-400/90 shadow-lg'
                  : 'bg-[#0d0d11]/95 border border-[#27272a] hover:border-zinc-600'
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
              <div className="relative h-full w-full flex flex-col items-center justify-between gap-1 sm:gap-2 p-3.5 sm:px-5 sm:pt-3.5 sm:pb-3">
                <div className="flex-1 w-full min-h-0 flex items-center justify-center p-0.5 sm:p-0 relative">
                  <SafeImage
                    src={logoSrc}
                    alt={branch.name}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-contain p-1 sm:p-0 transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
                    }`}
                  />
                </div>

                <div className="shrink-0 flex flex-col items-center gap-0.5 pb-0.5">
                  <h3
                    className={`font-heading font-extrabold text-sm sm:text-base lg:text-lg tracking-tight truncate max-w-full transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {branch.name}
                  </h3>
                  {isActive && (
                    <span className="text-xs font-tech text-zinc-400">
                      {branch.tag ? `${branch.tag} · ${branch.shortRegion}` : branch.shortRegion}
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
            type="button"
            onClick={handlePrev}
            aria-label="Previous branch"
            className="p-2 rounded-lg bg-[#18181b] hover:bg-zinc-200 hover:text-black text-zinc-400 border border-[#27272a] transition-colors focus-tactical flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next branch"
            className="p-2 rounded-lg bg-[#18181b] hover:bg-zinc-200 hover:text-black text-zinc-400 border border-[#27272a] transition-colors focus-tactical flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          {GUILD_BRANCHES.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              onClick={() => goTo(idx)}
              aria-label={`Go to ${b.name}`}
              aria-current={idx === activeIndex}
              className={`transition-all duration-200 rounded-full focus-tactical ${
                idx === activeIndex
                  ? 'w-6 h-2 bg-amber-400'
                  : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        <span className="text-xs font-tech text-zinc-400 font-semibold">
          0{activeIndex + 1} / 0{count}
        </span>
      </div>
    </div>
  );
};
