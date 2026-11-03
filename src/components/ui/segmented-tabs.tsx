import { Swords, Skull, Shield, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedTabsProps<T extends string> {
  options: readonly SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  fullWidthOnMobile?: boolean;
  activeVariant?: 'white' | 'amber';
  className?: string;
  ariaLabel?: string;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  fullWidthOnMobile = false,
  activeVariant = 'white',
  className,
  ariaLabel,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'overflow-x-auto no-scrollbar inline-flex items-center gap-1 bg-[#121215] p-1 rounded-xl border border-[#27272a]',
        fullWidth && 'w-full flex',
        fullWidthOnMobile && 'w-full sm:w-auto flex sm:inline-flex',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'justify-center whitespace-nowrap shrink-0 rounded-lg text-xs font-tech font-bold transition-all flex items-center space-x-1.5 focus-tactical cursor-pointer',
              size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5 sm:px-3.5 sm:py-2',
              fullWidth && 'flex-1',
              fullWidthOnMobile && 'flex-1 sm:flex-initial',
              isActive
                ? activeVariant === 'amber'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const REFERENCE_CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'warzone', label: 'Warzone', icon: Swords },
  { value: 'ppc', label: 'PPC', icon: Skull },
  { value: 'guild_challenge', label: 'Siege', icon: Shield },
] as const;

export const COMPETITIVE_MODE_OPTIONS = [
  { value: 'composite', label: 'All' },
  { value: 'warzone', label: 'Warzone', icon: Swords },
  { value: 'ppc', label: 'PPC', icon: Skull },
] as const;

export const SERVER_OPTIONS = [
  { value: 'ap', label: 'AP Server' },
  { value: 'na', label: 'NA Server' },
] as const;
