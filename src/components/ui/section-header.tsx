import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  level?: 'primary' | 'secondary';
  className?: string;
}

/**
 * Shared section header with two distinct visual tiers:
 * - `primary`: bold display hierarchy for lead sections (References, Guild Ranking)
 * - `secondary`: calmer sentence-case hierarchy for supporting tools & info blocks
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  actions,
  level = 'primary',
  className,
}) => {
  const isPrimary = level === 'primary';

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4',
        isPrimary
          ? 'mb-6 sm:mb-8 pb-4 border-b border-[#27272a]'
          : 'mb-5 sm:mb-6 pb-3 border-b border-[#27272a]/70',
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <div className="text-xs font-tech font-semibold text-zinc-400">
            {eyebrow}
          </div>
        )}
        <h2
          className={cn(
            'font-heading text-white tracking-tight',
            isPrimary
              ? 'font-black text-2xl sm:text-3xl lg:text-4xl'
              : 'font-bold text-xl sm:text-2xl'
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
