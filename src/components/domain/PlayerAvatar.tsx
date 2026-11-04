import React from 'react';
import { getHuaxuImageUrl } from '@/services/imageUtils';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

export interface PlayerAvatarProps {
  portrait?: string;
  frame?: string;
  name?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-9 h-9 sm:w-10 sm:h-10',
  md: 'w-10 h-10 sm:w-11 sm:h-11',
  lg: 'w-12 h-12 sm:w-14 sm:h-14',
  xl: 'w-20 h-20 sm:w-24 sm:h-24',
} as const;

/**
 * Unified player avatar component rendering Huaxu portrait + optional headframe overlay.
 */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  portrait,
  frame,
  name,
  alt,
  size = 'md',
  shape = 'rounded',
  className,
}) => {
  const displayAlt = name || alt || 'Player avatar';
  const hasCustomFrame = Boolean(frame && frame.trim() !== '');
  const avatarSrc = getHuaxuImageUrl(portrait);
  const frameSrc = hasCustomFrame ? getHuaxuImageUrl(frame) : '';

  return (
    <div
      className={cn(
        'relative flex-shrink-0 flex items-center justify-center',
        SIZE_MAP[size],
        className
      )}
    >
      {hasCustomFrame && (
        <SafeImage
          src={frameSrc}
          alt={`${displayAlt} frame`}
          hideOnError
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 scale-125"
        />
      )}

      <SafeImage
        src={avatarSrc}
        alt={displayAlt}
        className={cn(
          'w-full h-full object-cover z-0 filter contrast-105 transition-transform',
          shape === 'circle' || hasCustomFrame ? 'rounded-full' : 'rounded-xl',
          hasCustomFrame && shape !== 'circle' && 'scale-95'
        )}
      />
    </div>
  );
};
