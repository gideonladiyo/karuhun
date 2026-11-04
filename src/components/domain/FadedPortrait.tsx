import React from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

const FADE_MASK = 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)';

interface FadedPortraitProps {
  src: string;
  /** Positioning/size of the layer, e.g. "inset-y-0 right-0 w-3/5". */
  className?: string;
  /** Opacity, hover states, etc. for the image itself. */
  imgClassName?: string;
  /**
   * CSS object-position, e.g. "50% 25%". Applied inline so it always wins over the
   * default `object-right` (the project's `cn` does not merge conflicting classes).
   */
  position?: string;
  /** Load immediately; use for above-the-fold heroes. */
  eager?: boolean;
}

/**
 * Decorative portrait that fades out toward the left edge (same treatment as the
 * leaderboard score modal). Place inside a `relative overflow-hidden` container.
 */
export const FadedPortrait: React.FC<FadedPortraitProps> = ({ src, className, imgClassName, position, eager }) => {
  if (!src) return null;
  return (
    <div
      aria-hidden
      className={cn('absolute pointer-events-none overflow-hidden', className)}
      style={{ WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
    >
      <SafeImage
        src={src}
        alt=""
        hideOnError
        loading={eager ? 'eager' : 'lazy'}
        style={position ? { objectPosition: position } : undefined}
        className={cn(
          'h-full w-full object-cover object-right scale-[1.05] opacity-30 contrast-125 saturate-125 transition-opacity duration-300',
          imgClassName
        )}
      />
    </div>
  );
};
