import React from 'react';
import { GuildBranchConfig } from '@/services/imageUtils';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

export interface GuildCrestProps {
  branch?: Pick<GuildBranchConfig, 'name' | 'logo'>;
  src?: string;
  alt?: string;
  iconUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ringClass?: string;
  ringClassName?: string;
  className?: string;
  imgClassName?: string;
}

const SIZE_MAP = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-20 h-20 sm:w-24 sm:h-24',
} as const;

/**
 * Shared Guild Crest / Emblem display with standardized fallback.
 */
export const GuildCrest: React.FC<GuildCrestProps> = ({
  branch,
  src,
  alt,
  iconUrl,
  size = 'lg',
  ringClass,
  ringClassName,
  className,
  imgClassName,
}) => {
  const resolvedSrc = src || branch?.logo || iconUrl || '/logo.png';
  const resolvedAlt = alt || (branch ? `${branch.name} Crest` : 'Guild Crest');
  const resolvedRing = ringClassName || ringClass || 'border-[#27272a]';

  return (
    <div
      className={cn(
        'shrink-0 rounded-full border-2 flex items-center justify-center overflow-hidden bg-black/60',
        SIZE_MAP[size],
        resolvedRing,
        className
      )}
    >
      <SafeImage
        src={resolvedSrc}
        alt={resolvedAlt}
        className={cn('w-full h-full object-contain p-1.5 filter contrast-125', imgClassName)}
      />
    </div>
  );
};
